import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  LocateFixed,
  Layers,
  Plus,
  Minus,
  MapPin,
  X,
} from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const GREEN = '#159447';
const DARK = '#111827';
const isSmall = width < 360;
const isShort = height < 700;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 3, Math.min(size * scale, size + 2));
};
export default function MapYourFarmScreen({ navigation }) {
  const webRef = useRef(null);
  const drawerAnim = useRef(new Animated.Value(height)).current;
  const [points, setPoints] = useState([]);
  const [area, setArea] = useState(0);
  const [perimeter, setPerimeter] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const html = useMemo(() => createLeafletHtml(), []);
  const sendToMap = action => {
    webRef.current?.postMessage(
      JSON.stringify({
        action,
      }),
    );
  };
  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.spring(drawerAnim, {
      toValue: 0,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: height,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };
  const onMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'boundary_update') {
        setPoints(data.points || []);
        setArea(data.areaHectares || 0);
        setPerimeter(data.perimeterMeters || 0);
      }
    } catch (e) {}
  };
  const canSave = points.length >= 3;
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={isSmall ? 23 : 26} color={DARK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Map Your Farm
        </Text>

        <View style={styles.pointBadge}>
          <Text style={styles.pointBadgeText}>{points.length} Points</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <WebView
          ref={webRef}
          source={{
            html,
          }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
          originWhitelist={['*']}
          onMessage={onMessage}
          allowsInlineMediaPlayback
          setSupportMultipleWindows={false}
        />

        {showTip && (
          <View style={styles.tipBox}>
            <MapPin size={20} color="#EF4444" fill="#EF4444" />
            <Text style={styles.tipText}>
              Tap on farm corners to mark your boundary.
            </Text>
            <TouchableOpacity onPress={() => setShowTip(false)}>
              <X size={21} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => sendToMap('locate')}
          >
            <LocateFixed size={21} color={GREEN} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => sendToMap('toggleLayer')}
          >
            <Layers size={21} color={GREEN} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => sendToMap('zoomIn')}
          >
            <Plus size={23} color={GREEN} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => sendToMap('zoomOut')}
          >
            <Minus size={23} color={GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      {!drawerVisible && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.undoMini}
            onPress={() => sendToMap('undo')}
          >
            <RotateCcw size={20} color={DARK} />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canSave}
            activeOpacity={0.9}
            onPress={openDrawer}
            style={styles.saveTouch}
          >
            <LinearGradient
              colors={canSave ? ['#12833B', '#2ECC71'] : ['#B8C2CC', '#D1D5DB']}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={styles.saveBtn}
            >
              <Check size={23} color="#FFFFFF" />
              <Text style={styles.saveText}>
                {canSave ? 'Save Boundary' : 'Mark 3 Points'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {drawerVisible && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            onPress={closeDrawer}
          />

          <Animated.View
            style={[
              styles.summarySheet,
              {
                transform: [
                  {
                    translateY: drawerAnim,
                  },
                ],
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.summaryTitle}>FIELD SUMMARY</Text>

            <View style={styles.summaryRow}>
              <SummaryCard
                label="Area"
                value={area.toFixed(2)}
                unit="Hectares"
              />
              <SummaryCard
                label="Points"
                value={String(points.length)}
                unit="Boundary"
              />
              <SummaryCard
                label="Perimeter"
                value={`~${Math.round(perimeter)}`}
                unit="Meters"
              />
            </View>

            <View style={styles.minRow}>
              <Text style={styles.minText}>Boundary successfully created</Text>
              <Text style={styles.minCountOk}>{points.length} / 3+ ✓</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.undoBtn}
              onPress={() => {
                closeDrawer();
                sendToMap('undo');
              }}
            >
              <RotateCcw size={21} color={DARK} />
              <Text style={styles.undoText}>Edit / Undo Last Point</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('Farmsuccess', {
                  farmBoundary: points,
                  areaHectares: area,
                  perimeterMeters: perimeter,
                })
              }
            >
              <LinearGradient
                colors={['#12833B', '#2ECC71']}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={styles.completeBtn}
              >
                <Check size={25} color="#FFFFFF" />
                <Text style={styles.completeText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}
function SummaryCard({ label, value, unit }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryUnit}>{unit}</Text>
    </View>
  );
}
function createLeafletHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
html, body, #map { height:100%; margin:0; padding:0; }
.leaflet-control-container { display:none; }
.point-marker {
  width:16px;
  height:16px;
  background:#159447;
  border:3px solid white;
  border-radius:50%;
  box-shadow:0 2px 8px rgba(0,0,0,.25);
}
</style>
</head>
<body>
<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/@turf/turf@6/turf.min.js"></script>

<script>
let map;
let currentLayer = 'satellite';
let points = [];
let markers = [];
let polygon = null;
let polyline = null;
let userMarker = null;
let userCircle = null;
let watchId = null;

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 20 }
);

const street = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom: 20 }
);

function send(data) {
  window.ReactNativeWebView.postMessage(JSON.stringify(data));
}

function initMap(lat = 19.076, lng = 72.8777) {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([lat, lng], 18);

  satellite.addTo(map);

  map.on('click', function(e) {
    addPoint(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(locateUser, 800);
}

function locateUser() {
  if (!navigator.geolocation) {
    return;
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 25;

      map.setView([lat, lng], 19, {animate:true});

      if (userMarker) map.removeLayer(userMarker);
      if (userCircle) map.removeLayer(userCircle);

      userCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#2563EB',
        weight: 1,
        fillColor: '#2563EB',
        fillOpacity: 0.12
      }).addTo(map);

      userMarker = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: '#2563EB',
        fillOpacity: 1
      }).addTo(map);

      if (accuracy < 35 && watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    },
    () => {},
    {
      enableHighAccuracy:true,
      timeout:25000,
      maximumAge:0
    }
  );
}

function addPoint(lat, lng) {
  points.push([lng, lat]);

  const marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: '<div class="point-marker"></div>',
      iconSize: [18,18],
      iconAnchor: [9,9]
    })
  }).addTo(map);

  markers.push(marker);
  drawShape();
}

function drawShape() {
  if (polygon) map.removeLayer(polygon);
  if (polyline) map.removeLayer(polyline);

  const latLngs = points.map(p => [p[1], p[0]]);

  if (points.length >= 3) {
    polygon = L.polygon(latLngs, {
      color: '#ffffff',
      weight: 2,
      dashArray: '5,6',
      fillColor: '#159447',
      fillOpacity: 0.45
    }).addTo(map);
  } else if (points.length >= 2) {
    polyline = L.polyline(latLngs, {
      color: '#ffffff',
      weight: 2,
      dashArray: '5,6'
    }).addTo(map);
  }

  calculate();
}

function calculate() {
  let areaHectares = 0;
  let perimeterMeters = 0;

  if (points.length >= 3) {
    const closed = [...points, points[0]];
    const polygonFeature = turf.polygon([closed]);
    areaHectares = turf.area(polygonFeature) / 10000;

    const lineFeature = turf.lineString(closed);
    perimeterMeters = turf.length(lineFeature, {units:'kilometers'}) * 1000;
  }

  send({
    type:'boundary_update',
    points,
    areaHectares,
    perimeterMeters
  });
}

function undo() {
  if (!points.length) return;

  points.pop();

  const last = markers.pop();
  if (last) map.removeLayer(last);

  drawShape();
}

function toggleLayer() {
  if (currentLayer === 'satellite') {
    map.removeLayer(satellite);
    street.addTo(map);
    currentLayer = 'street';
  } else {
    map.removeLayer(street);
    satellite.addTo(map);
    currentLayer = 'satellite';
  }
}

document.addEventListener('message', handleMessage);
window.addEventListener('message', handleMessage);

function handleMessage(event) {
  try {
    const data = JSON.parse(event.data);

    if (data.action === 'undo') undo();
    if (data.action === 'locate') locateUser();
    if (data.action === 'zoomIn') map.zoomIn();
    if (data.action === 'zoomOut') map.zoomOut();
    if (data.action === 'toggleLayer') toggleLayer();
  } catch(e) {}
}

initMap();
</script>
</body>
</html>
`;
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: isSmall ? 66 : 74,
    paddingHorizontal: isSmall ? 12 : 18,
    backgroundColor: 'rgba(248,250,248,0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  backBtn: {
    width: isSmall ? 46 : 52,
    height: isSmall ? 46 : 52,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 10,
    textAlign: 'center',
    fontSize: rf(21),
    color: DARK,
    fontWeight: '900',
  },
  pointBadge: {
    height: isSmall ? 32 : 36,
    paddingHorizontal: isSmall ? 10 : 14,
    borderRadius: 20,
    backgroundColor: '#40a53e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBadgeText: {
    fontSize: rf(13),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  mapWrap: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#DCEFD8',
  },
  tipBox: {
    position: 'absolute',
    top: isSmall ? 10 : 14,
    left: isSmall ? 12 : 18,
    right: isSmall ? 12 : 18,
    minHeight: isSmall ? 62 : 70,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmall ? 12 : 16,
    gap: 10,
    elevation: 8,
  },
  tipText: {
    flex: 1,
    fontSize: rf(14),
    lineHeight: rf(20),
    color: '#374151',
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    right: isSmall ? 12 : 18,
    top: height * 0.23,
    gap: 12,
  },
  mapBtn: {
    width: isSmall ? 44 : 48,
    height: isSmall ? 44 : 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
  },
  bottomAction: {
    position: 'absolute',
    left: isSmall ? 12 : 18,
    right: isSmall ? 12 : 18,
    bottom: Platform.OS === 'ios' ? 28 : 20,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  undoMini: {
    width: isSmall ? 54 : 58,
    height: isSmall ? 54 : 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  saveTouch: {
    flex: 1,
  },
  saveBtn: {
    height: isSmall ? 54 : 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  saveText: {
    fontSize: rf(17),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.18)',
  },
  summarySheet: {
    minHeight: isShort ? height * 0.48 : height * 0.44,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isSmall ? 16 : 22,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 58,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginBottom: 22,
  },
  summaryTitle: {
    fontSize: rf(13),
    color: '#9CA3AF',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  summaryRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minHeight: isSmall ? 96 : 108,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    backgroundColor: '#FAFBFC',
    padding: isSmall ? 10 : 12,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: rf(11),
    color: '#6B7280',
    fontWeight: '700',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
  },
  summaryUnit: {
    marginTop: 5,
    fontSize: rf(11),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  minRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  minText: {
    flex: 1,
    fontSize: rf(13),
    color: '#9CA3AF',
    fontWeight: '700',
  },
  minCountOk: {
    fontSize: rf(14),
    color: GREEN,
    fontWeight: '900',
  },
  progressTrack: {
    marginTop: 10,
    height: 9,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: GREEN,
  },
  undoBtn: {
    marginTop: 22,
    height: isSmall ? 56 : 62,
    borderRadius: 16,
    backgroundColor: '#F2F3F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  undoText: {
    fontSize: rf(16.5),
    color: DARK,
    fontWeight: '900',
  },
  completeBtn: {
    marginTop: 12,
    height: isSmall ? 56 : 62,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  completeText: {
    fontSize: rf(19),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
