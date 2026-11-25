import { useTranslation } from 'react-i18next';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import {
  ArrowLeft,
  Check,
  LocateFixed,
  MapPinPlus,
  Pause,
  Play,
  Trash2,
  Undo2,
} from 'lucide-react-native';

import requestLocationPermission from '../../utils/locationPermission';
import { mapEngineHead, mapEngineScript } from '../../utils/mapEngineHtml';
import { useLocation } from '../../context/LocationContext';
import {
  areaSquareMeters,
  distanceMeters,
  perimeterMeters,
  SQ_METERS_PER_ACRE,
  SQ_METERS_PER_HECTARE,
} from '../../utils/farmGeometry';

const { width, height } = Dimensions.get('window');
const GREEN = '#16883E';
const LIGHT_GREEN = '#22C55E';
const DARK = '#111827';
const MUTED = '#64748B';
const ORANGE = '#F97316';
const RED = '#DC2626';
const isShort = height < 700;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const MIN_POINTS = 3;
// Accuracy (meters) above which a point needs confirmation / is skipped in auto mode.
const GOOD_ACCURACY_M = 10;
const MAX_ACCURACY_M = 20;
// Auto trace spacing, and the minimum gap between manually added points.
const AUTO_SPACING_M = 5;
const MIN_MANUAL_GAP_M = 2;

const accuracyLevel = acc => {
  if (!Number.isFinite(acc)) {
    return 'none';
  }
  if (acc <= GOOD_ACCURACY_M) {
    return 'good';
  }
  if (acc <= MAX_ACCURACY_M) {
    return 'fair';
  }
  return 'weak';
};

const LEVEL_COLOR = {
  none: '#94A3B8',
  good: LIGHT_GREEN,
  fair: '#EAB308',
  weak: RED,
};

export default function WalkAroundTrackingScreen({ navigation }) {
  const { t } = useTranslation();
  const { location } = useLocation();
  const webRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [current, setCurrent] = useState(null); // {lat, lng, accuracy}
  const [gpsError, setGpsError] = useState(null);
  const [points, setPoints] = useState([]); // [{lat, lng, accuracy}]
  const [mode, setMode] = useState('manual'); // 'manual' | 'auto'
  const [paused, setPaused] = useState(false);

  // Refs so the GPS watch callback always sees fresh state.
  const modeRef = useRef(mode);
  const pausedRef = useRef(paused);
  const pointsRef = useRef(points);
  const allowLeaveRef = useRef(false);
  modeRef.current = mode;
  pausedRef.current = paused;
  pointsRef.current = points;

  const html = useMemo(() => createMapHtml(), []);

  const post = useCallback(msg => {
    webRef.current?.postMessage(JSON.stringify(msg));
  }, []);

  /*
   * GPS watch
   */
  useEffect(() => {
    let watchId = null;
    let cancelled = false;

    (async () => {
      const ok = await requestLocationPermission();
      if (cancelled) {
        return;
      }
      if (!ok) {
        setGpsError('permission');
        return;
      }
      watchId = Geolocation.watchPosition(
        pos => {
          const fix = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Number.isFinite(pos.coords.accuracy)
              ? pos.coords.accuracy
              : null,
          };
          setGpsError(null);
          setCurrent(fix);

          // Auto trace: append a point every AUTO_SPACING_M with a decent fix.
          if (modeRef.current !== 'auto' || pausedRef.current) {
            return;
          }
          if (fix.accuracy == null || fix.accuracy > MAX_ACCURACY_M) {
            return;
          }
          const prev = pointsRef.current;
          const last = prev[prev.length - 1];
          if (!last || distanceMeters(last, fix) >= AUTO_SPACING_M) {
            setPoints([...prev, fix]);
          }
        },
        err => {
          console.log('[WalkTracking] GPS error:', err);
          setGpsError(err?.code === 1 ? 'permission' : 'unavailable');
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 1,
          interval: 2000,
          fastestInterval: 1000,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    })();

    return () => {
      cancelled = true;
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  /*
   * Sync to map
   */
  useEffect(() => {
    if (mapReady && current) {
      post({ action: 'setUser', ...current });
    }
  }, [mapReady, current, post]);

  useEffect(() => {
    if (mapReady) {
      post({ action: 'setPoints', points });
    }
  }, [mapReady, points, post]);

  /*
   * Confirm before leaving with unsaved points
   */
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', e => {
      if (allowLeaveRef.current || pointsRef.current.length === 0) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        t('walk.discard_title'),
        t('walk.discard_body', { n: pointsRef.current.length }),
        [
          { text: t('walk.keep_mapping'), style: 'cancel' },
          {
            text: t('walk.discard'),
            style: 'destructive',
            onPress: () => {
              allowLeaveRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });
    return unsub;
  }, [navigation, t]);

  /*
   * Actions
   */
  const appendPoint = fix => setPoints(prev => [...prev, fix]);

  const addPointHere = () => {
    if (!current || paused) {
      return;
    }
    const fix = { ...current };
    const last = points[points.length - 1];
    if (last && distanceMeters(last, fix) < MIN_MANUAL_GAP_M) {
      Alert.alert(t('walk.too_close_title'), t('walk.too_close_body'));
      return;
    }
    if (fix.accuracy == null || fix.accuracy > MAX_ACCURACY_M) {
      Alert.alert(
        t('walk.weak_title'),
        t('walk.weak_body', {
          n: fix.accuracy == null ? '?' : Math.round(fix.accuracy),
        }),
        [
          { text: t('walk.wait'), style: 'cancel' },
          { text: t('walk.add_anyway'), onPress: () => appendPoint(fix) },
        ],
      );
      return;
    }
    appendPoint(fix);
  };

  const undoPoint = () => setPoints(prev => prev.slice(0, -1));

  const clearPoints = () => {
    if (points.length === 0) {
      return;
    }
    Alert.alert(t('walk.clear_title'), t('walk.clear_body'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('walk.clear'), style: 'destructive', onPress: () => setPoints([]) },
    ]);
  };

  const recenter = () => post({ action: 'recenter' });

  const areaSqM = useMemo(() => areaSquareMeters(points), [points]);
  const perimeterM = useMemo(() => perimeterMeters(points), [points]);
  const acres = areaSqM / SQ_METERS_PER_ACRE;
  const fromStart =
    points.length >= 2 && current ? distanceMeters(points[0], current) : null;
  const canFinish = points.length >= MIN_POINTS && areaSqM > 0;

  const finish = () => {
    if (!canFinish) {
      return;
    }
    allowLeaveRef.current = true;
    navigation.navigate('FarmDetails', {
      farmBoundary: points.map(p => ({ lat: p.lat, lng: p.lng })),
      areaHectares: Number((areaSqM / SQ_METERS_PER_HECTARE).toFixed(4)),
      areaAcres: Number(acres.toFixed(4)),
      perimeterMeters: Number(perimeterM.toFixed(2)),
      location: {
        latitude: points[0].lat,
        longitude: points[0].lng,
        accuracy: Number(points[0].accuracy || 0),
        city: location?.city || null,
        district: location?.district || null,
        state: location?.state || null,
      },
    });
  };

  // After Finish, later screens may reset the stack; only guard again once the user is back here.
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        allowLeaveRef.current = false;
      }),
    [navigation],
  );

  /*
   * Render
   */
  const level = accuracyLevel(current?.accuracy);
  const gpsLabel = gpsError
    ? t(gpsError === 'permission' ? 'walk.permission_denied' : 'walk.gps_error')
    : !current
    ? t('walk.gps_searching')
    : t(`walk.gps_${level}`);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      <View style={styles.mapWrap}>
        <WebView
          ref={webRef}
          source={{ html }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          scrollEnabled={false}
          bounces={false}
          setSupportMultipleWindows={false}
          onMessage={e => {
            try {
              const data = JSON.parse(e.nativeEvent.data);
              if (data.type === 'MAP_READY') {
                setMapReady(true);
              }
            } catch (err) {}
          }}
        />

        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.roundBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.gpsPill}>
            <View
              style={[
                styles.gpsDot,
                { backgroundColor: gpsError ? RED : LEVEL_COLOR[level] },
              ]}
            />
            <Text style={styles.gpsText} numberOfLines={1}>
              {gpsLabel}
            </Text>
            {current?.accuracy != null && !gpsError ? (
              <Text style={styles.gpsAcc}>
                {t('walk.accuracy_m', { n: current.accuracy.toFixed(1) })}
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.recenterBtn}
          onPress={recenter}
        >
          <LocateFixed size={22} color={GREEN} strokeWidth={2.5} />
        </TouchableOpacity>

        {paused ? (
          <View style={styles.pausedPill}>
            <Pause size={14} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.pausedText}>{t('walk.paused')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.sheet}>
        <View style={styles.modeRow}>
          {['manual', 'auto'].map(m => (
            <TouchableOpacity
              key={m}
              activeOpacity={0.85}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
                {t(m === 'manual' ? 'walk.mode_manual' : 'walk.mode_auto')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>
          {mode === 'manual'
            ? t('walk.hint_manual')
            : t('walk.hint_auto', { n: AUTO_SPACING_M })}
        </Text>

        <View style={styles.statsRow}>
          <Stat label={t('walk.points_label')} value={String(points.length)} />
          <Stat
            label={t('walk.area_label')}
            value={t('walk.acres_short', { n: acres.toFixed(2) })}
          />
          <Stat
            label={t('walk.perimeter_label')}
            value={t('walk.meters_short', { n: Math.round(perimeterM) })}
          />
        </View>

        {fromStart != null ? (
          <Text style={styles.fromStart}>
            {t('walk.from_start', { n: Math.round(fromStart) })}
          </Text>
        ) : null}

        {mode === 'manual' ? (
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!current || paused}
            style={[styles.addBtn, (!current || paused) && styles.disabled]}
            onPress={addPointHere}
          >
            {!current && !gpsError ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <MapPinPlus size={24} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.addText}>{t('walk.add_point')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.toolRow}>
          <ToolBtn
            Icon={Undo2}
            label={t('walk.undo')}
            disabled={points.length === 0}
            onPress={undoPoint}
          />
          <ToolBtn
            Icon={paused ? Play : Pause}
            label={paused ? t('walk.resume') : t('walk.pause')}
            onPress={() => setPaused(p => !p)}
          />
          <ToolBtn
            Icon={Trash2}
            label={t('walk.clear')}
            disabled={points.length === 0}
            onPress={clearPoints}
            danger
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!canFinish}
          style={[styles.finishBtn, !canFinish && styles.disabled]}
          onPress={finish}
        >
          <Check size={22} color="#FFFFFF" strokeWidth={3} />
          <Text style={styles.finishText}>
            {canFinish
              ? t('walk.finish')
              : t('walk.need_points', { n: MIN_POINTS - points.length || 1 })}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ToolBtn = ({ Icon, label, onPress, disabled, danger }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    disabled={disabled}
    onPress={onPress}
    style={[styles.toolBtn, disabled && styles.disabled]}
  >
    <Icon size={20} color={danger ? RED : DARK} strokeWidth={2.4} />
    <Text style={[styles.toolText, danger && { color: RED }]}>{label}</Text>
  </TouchableOpacity>
);

/*
 * Leaflet satellite map: live user dot + accuracy circle and the boundary
 * polygon with numbered vertices.
 */
function createMapHtml() {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
${mapEngineHead()}
<style>
  html,body,#map{background:#10230B;}
  .vtx{width:22px;height:22px;border-radius:11px;background:${LIGHT_GREEN};border:2px solid #fff;
       color:#fff;font:700 11px sans-serif;display:flex;align-items:center;justify-content:center;
       box-sizing:border-box;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  .vtx.start{background:${ORANGE};}
  .me{width:18px;height:18px;border-radius:9px;background:#2563EB;border:3px solid #fff;
      box-sizing:border-box;box-shadow:0 0 0 6px rgba(37,99,235,.25);}
</style>
</head><body>
<div id="map"></div>
<script>
${mapEngineScript()}

  var follow = true, firstFix = true, last = null, acc = 0, ll = [];
  var me = null, meCircle = null, poly = null, closing = null, vtx = [];

  function send(d){ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(d)); }
  function rm(h){ if(h){ try{ h.remove(); }catch(e){} } return null; }

  function drawUser(){
    if(!KM.isReady() || !last) return;
    if(!me){
      me = KM.marker(last,{html:'<div class="me"></div>',size:18,z:1000});
      meCircle = KM.circle(last, acc, {color:'#2563EB',weight:1,fillOpacity:0.12});
    } else {
      me.setLatLng(last); meCircle.setLatLng(last); meCircle.setRadius(acc);
    }
    drawClosing();
  }

  // Dashed line from the last marked point to where the user is now.
  function drawClosing(){
    closing = rm(closing);
    if(KM.isReady() && ll.length >= 1 && last){
      closing = KM.polyline([ll[ll.length-1], last],{color:'#ffffff',weight:2,dashed:true,opacity:0.85});
    }
  }

  function drawPoints(){
    if(!KM.isReady()) return;
    vtx.forEach(rm); vtx = [];
    poly = rm(poly);
    if(ll.length >= 3){
      poly = KM.polygon(ll,{color:'${LIGHT_GREEN}',weight:3,fillOpacity:0.18});
    } else if(ll.length === 2){
      poly = KM.polyline(ll,{color:'${LIGHT_GREEN}',weight:3});
    }
    drawClosing();
    var showLabels = ll.length <= 60;
    ll.forEach(function(p,i){
      var cls = 'vtx' + (i===0 ? ' start' : '');
      var size = showLabels ? 22 : 10;
      vtx.push(KM.marker(p,{size:size,z:500,
        html:'<div class="'+cls+'" style="width:'+size+'px;height:'+size+'px">'+(showLabels ? (i+1) : '')+'</div>'}));
    });
  }

  function redrawAll(){
    me = null; meCircle = null; poly = null; closing = null; vtx = [];
    drawPoints(); drawUser();
  }

  function setUser(m){
    last = [m.lat, m.lng];
    acc = m.accuracy || 0;
    if(!KM.isReady()) return;
    if(firstFix){ KM.setView(last,19,false); firstFix = false; }
    else if(follow){ KM.panTo(last); }
    drawUser();
  }

  function handle(raw){
    try{
      var m = JSON.parse(raw);
      if(m.action==='setUser') setUser(m);
      else if(m.action==='setPoints'){ ll = (m.points||[]).map(function(p){ return [p.lat,p.lng]; }); drawPoints(); }
      else if(m.action==='recenter'){ follow = true; if(last && KM.isReady()) KM.setView(last, Math.max(KM.getZoom(),18), true); }
    }catch(e){}
  }
  document.addEventListener('message', function(e){ handle(e.data); });
  window.addEventListener('message', function(e){ handle(e.data); });

  KM.init({
    center:[20.5937,78.9629], zoom:5,
    onDragStart: function(){ follow = false; },
    onReady: function(){
      if(last){ KM.setView(last,19,false); firstFix = false; }
      redrawAll();
      send({type:'MAP_READY'});
    }
  });
</script>
</body></html>`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK },
  mapWrap: { flex: 1, backgroundColor: '#10230B' },
  webview: { flex: 1, backgroundColor: '#10230B' },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 60,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15,23,42,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsPill: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15,23,42,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  gpsDot: { width: 10, height: 10, borderRadius: 5 },
  gpsText: { flex: 1, color: '#FFFFFF', fontSize: rf(13), fontWeight: '800' },
  gpsAcc: { color: '#FFFFFF', fontSize: rf(12), fontWeight: '900' },
  recenterBtn: {
    position: 'absolute',
    right: 14,
    bottom: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pausedPill: {
    position: 'absolute',
    top: 64,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: ORANGE,
  },
  pausedText: { color: '#FFFFFF', fontWeight: '900', fontSize: rf(12) },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  modeText: { fontSize: rf(14), fontWeight: '800', color: MUTED },
  modeTextActive: { color: GREEN },
  hint: {
    marginTop: 10,
    fontSize: rf(13),
    lineHeight: rf(19),
    color: MUTED,
    fontWeight: '600',
  },
  statsRow: {
    marginTop: isShort ? 10 : 14,
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: rf(17), fontWeight: '900', color: DARK },
  statLabel: { marginTop: 2, fontSize: rf(11), fontWeight: '700', color: MUTED },
  fromStart: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: rf(12),
    fontWeight: '700',
    color: ORANGE,
  },
  addBtn: {
    marginTop: isShort ? 10 : 14,
    height: 58,
    borderRadius: 15,
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addText: { color: '#FFFFFF', fontSize: rf(18), fontWeight: '900' },
  toolRow: { marginTop: 10, flexDirection: 'row', gap: 10 },
  toolBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toolText: { fontSize: rf(13), fontWeight: '800', color: DARK },
  finishBtn: {
    marginTop: 10,
    height: 56,
    borderRadius: 15,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  finishText: { color: '#FFFFFF', fontSize: rf(17), fontWeight: '900' },
  disabled: { opacity: 0.45 },
});
