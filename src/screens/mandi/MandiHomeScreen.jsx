import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowRight,
  ChartColumn,
  ChevronDown,
  Info,
  MapPin,
  Search,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  TopInset,
} from '../../components/market/MarketHero';
import { EmptyState, LoadingState } from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import LocationSheet from '../../components/mandi/LocationSheet';
import useMandiSetup from '../../components/mandi/useMandiSetup';
import CropPhoto from '../../components/mandi/CropPhoto';
import { MANDI_BANNER } from '../../components/mandi/cropVisuals';
import { CROP_PHOTO_CREDITS } from '../../components/mandi/cropImages';
import { MANDI_ROUTES } from '../../constants/mandiRoutes';
import {
  fetchMandiCrops,
  fetchMandiSummary,
} from '../../redux/slices/mandiSlice';
import {
  formatPerKg,
  formatQuintal,
  groupCrops,
  scopeParams,
  searchCrops,
  summaryKey,
} from '../../utils/mandiFormat';

const POPULAR = ['onion', 'tomato', 'potato', 'soybean', 'cotton', 'wheat'];

// 4 equal columns: screen width minus the 16px gutters and 3 gaps of 10
const GRID_COLUMNS = 4;
const GRID_GAP = 10;
const TILE_WIDTH = Math.floor(
  (Dimensions.get('window').width - 32 - GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS,
);

export default function MandiHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { crops, cropsStatus, cropsError, location } = useMandiSetup();
  const { recentCrops, summaries } = useSelector(state => state.mandi);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [locationOpen, setLocationOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  const place = scopeParams(
    location?.district ? 'district' : 'state',
    location,
  );
  const placeLabel = location?.state
    ? [location.district, location.state].filter(Boolean).join(', ')
    : 'All India';

  // quick price cards: recent crops, else popular ones
  const quickCrops = useMemo(() => {
    const byId = new Map(crops.map(crop => [crop.id, crop]));
    const recent = recentCrops.map(item => byId.get(item.id)).filter(Boolean);
    const list = recent.length
      ? recent
      : POPULAR.map(id => byId.get(id)).filter(Boolean);
    return list.slice(0, 6);
  }, [crops, recentCrops]);

  // one at a time: each crop is a fresh data.gov.in query on the server
  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const crop of quickCrops) {
        if (cancelled) return;
        await dispatch(fetchMandiSummary({ crop: crop.id, ...place }));
      }
    })();

    return () => {
      cancelled = true;
    };
    // place is rebuilt each render; its values are the real dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, quickCrops, place.state, place.district]);

  const openCrop = crop =>
    navigation.navigate(MANDI_ROUTES.CROP, {
      cropId: crop.id,
      cropName: crop.name,
    });

  const typed = search.trim();
  const results = searchCrops(crops, search);
  const allGroups = groupCrops(results);
  const categories = ['All', ...groupCrops(crops).map(group => group.category)];
  const groups =
    category === 'All' || typed
      ? allGroups
      : allGroups.filter(group => group.category === category);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <MarketHero
          banner={MANDI_BANNER}
          onBack={() => navigation.goBack()}
          eyebrow="Mandi Bhav"
          title="Today's Crop Prices"
          subtitle="Live prices from mandis near you. Find where you get the best rate."
          right={
            <GlassButton
              onPress={() => navigation.navigate(MANDI_ROUTES.COMPARE)}
            >
              <ChartColumn size={19} color={C.white} />
            </GlassButton>
          }
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.locationPill}
            onPress={() => setLocationOpen(true)}
          >
            <MapPin size={15} color={C.white} />
            <Text style={styles.locationText} numberOfLines={1}>
              {placeLabel}
            </Text>
            <Text style={styles.locationChange}>Change</Text>
            <ChevronDown size={15} color={C.white} />
          </TouchableOpacity>
        </MarketHero>

        <View style={styles.body}>
          <View style={styles.searchBox}>
            <Search size={19} color={C.green} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search crop: onion, kanda, tur, kapas..."
              placeholderTextColor={C.placeholder}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {!!search && (
              <TouchableOpacity hitSlop={10} onPress={() => setSearch('')}>
                <X size={17} color={C.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* QUICK PRICES */}
          {!typed && quickCrops.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>
                  {recentCrops.length ? 'Your crops today' : 'Popular today'}
                </Text>
                <Text style={styles.sectionHint} numberOfLines={1}>
                  {location?.district || location?.state || 'All India'}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickList}
              >
                {quickCrops.map(crop => {
                  const entry =
                    summaries[summaryKey({ crop: crop.id, ...place })] || {};
                  const average = entry.summary?.averageModalPrice;

                  return (
                    <TouchableOpacity
                      key={crop.id}
                      activeOpacity={0.9}
                      style={styles.quickCard}
                      onPress={() => openCrop(crop)}
                    >
                      <CropPhoto
                        cropId={crop.id}
                        category={crop.category}
                        style={styles.quickPhoto}
                      />
                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.78)']}
                        style={styles.quickShade}
                      />
                      <View style={styles.quickInfo}>
                        <Text style={styles.quickName} numberOfLines={1}>
                          {crop.name}
                        </Text>
                        {!entry.status || entry.status === 'loading' ? (
                          <View style={styles.skeleton} />
                        ) : average ? (
                          <>
                            <Text style={styles.quickPrice}>
                              {formatQuintal(average)}
                              <Text style={styles.quickUnit}> /qtl</Text>
                            </Text>
                            <Text style={styles.quickKg}>
                              {formatPerKg(average)}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.quickNone}>No price today</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* COMPARE CTA */}
          {!typed && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(MANDI_ROUTES.COMPARE)}
            >
              <LinearGradient
                colors={['#F7B733', '#E8890C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.compareCta}
              >
                <View style={styles.compareIcon}>
                  <ChartColumn size={22} color="#A25200" />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.compareTitle}>Which crop pays more?</Text>
                  <Text style={styles.compareText}>
                    Compare prices of up to 4 crops
                  </Text>
                </View>
                <ArrowRight size={20} color="#3A2400" strokeWidth={2.6} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ALL CROPS */}
          <Text style={styles.allTitle}>
            {typed ? 'Matching crops' : 'Choose your crop'}
          </Text>
          {!typed && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {categories.map(item => {
                const selected = item === category;

                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.85}
                    onPress={() => setCategory(item)}
                    style={[styles.categoryChip, selected && styles.categoryOn]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextOn,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {cropsStatus === 'loading' ? (
            <LoadingState />
          ) : cropsStatus === 'error' ? (
            <EmptyState
              title="Couldn't load crops"
              message={cropsError}
              actionLabel="Try Again"
              onAction={() => dispatch(fetchMandiCrops())}
            />
          ) : (
            <>
              {groups.map(group => (
                <View key={group.category}>
                  {(category === 'All' || typed) && (
                    <Text style={styles.groupTitle}>{group.category}</Text>
                  )}
                  <View style={styles.grid}>
                    {group.crops.map(crop => (
                      <TouchableOpacity
                        key={crop.id}
                        activeOpacity={0.9}
                        style={styles.tile}
                        onPress={() => openCrop(crop)}
                      >
                        <CropPhoto
                          cropId={crop.id}
                          category={crop.category}
                          style={styles.tilePhoto}
                        />
                        <View style={styles.tileBody}>
                          <Text style={styles.tileName} numberOfLines={2}>
                            {crop.name}
                          </Text>
                          {!!crop.aliases?.[0] && (
                            <Text style={styles.tileAlias} numberOfLines={1}>
                              {crop.aliases[0]}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              {/* any crop name can be searched as typed */}
              {!!typed && (
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.typedCard}
                  onPress={() =>
                    navigation.navigate(MANDI_ROUTES.CROP, {
                      cropId: typed,
                      cropName: typed,
                    })
                  }
                >
                  <Search size={18} color={C.green} />
                  <Text style={styles.typedText}>
                    {results.length ? 'Not listed? ' : ''}Check prices for "
                    {typed}"
                  </Text>
                  <ArrowRight size={17} color={C.green} />
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.sourceRow}
            onPress={() => setCreditsOpen(true)}
          >
            <Info size={13} color={C.muted} />
            <Text style={styles.sourceText}>
              Prices: Agmarknet (data.gov.in), ₹ per quintal = 100 kg ·{' '}
              <Text style={styles.sourceLink}>Photo credits</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LocationSheet
        visible={locationOpen}
        onClose={() => setLocationOpen(false)}
      />

      <Modal
        visible={creditsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCreditsOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setCreditsOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Crop photo credits</Text>
              <Pressable hitSlop={10} onPress={() => setCreditsOpen(false)}>
                <X size={20} color={C.muted} />
              </Pressable>
            </View>
            <Text style={styles.sheetText}>
              Photos from Wikimedia Commons, cropped to squares.
            </Text>
            <ScrollView>
              {CROP_PHOTO_CREDITS.map(item => (
                <TouchableOpacity
                  key={item.crop}
                  activeOpacity={0.8}
                  style={styles.creditRow}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={styles.creditCrop}>{item.crop}</Text>
                  <Text style={styles.creditText} numberOfLines={2}>
                    {item.author} · {item.license}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 40 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },

  locationPill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  locationText: {
    flexShrink: 1,
    color: C.white,
    fontSize: 13.5,
    fontWeight: '900',
  },
  locationChange: {
    color: '#BFF0D2',
    fontSize: 11.5,
    fontWeight: '900',
    marginLeft: 4,
  },

  searchBox: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...MARKET_SHADOW,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.dark,
    paddingVertical: 0,
    fontWeight: '600',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
  },
  sectionHint: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    color: C.green,
  },

  quickList: { gap: 12, paddingRight: 4, paddingBottom: 4 },
  quickCard: {
    width: 140,
    height: 150,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: C.white,
    ...MARKET_SHADOW,
  },
  quickPhoto: { ...StyleSheet.absoluteFillObject, width: 140, height: 150 },
  quickShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  quickInfo: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  quickName: { color: C.white, fontSize: 14, fontWeight: '900' },
  quickPrice: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  quickUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  quickKg: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 11,
    fontWeight: '900',
    color: '#0A3D20',
    backgroundColor: '#BFF0D2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quickNone: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 4,
  },
  skeleton: {
    height: 18,
    width: '70%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: 6,
  },

  compareCta: {
    marginTop: 18,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compareIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareTitle: { color: '#2E1C00', fontSize: 15.5, fontWeight: '900' },
  compareText: {
    color: '#5C3B00',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  allTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
    marginTop: 24,
    marginBottom: 12,
  },
  categoryList: { gap: 8, paddingBottom: 4 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  categoryOn: { backgroundColor: C.green, borderColor: C.green },
  categoryText: { fontSize: 12.5, fontWeight: '800', color: C.text },
  categoryTextOn: { color: C.white },
  groupTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.muted,
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginTop: 4,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH + 52,
    alignItems: 'center',
    paddingTop: 6,
    backgroundColor: C.white,
    borderRadius: 18,
    ...MARKET_SHADOW,
  },
  tilePhoto: {
    width: TILE_WIDTH - 12,
    height: TILE_WIDTH - 12,
    borderRadius: 14,
  },
  tileBody: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tileName: {
    fontSize: 11.5,
    fontWeight: '900',
    color: C.dark,
    textAlign: 'center',
    lineHeight: 14,
  },
  tileAlias: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  typedCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    backgroundColor: C.lightGreen,
  },
  typedText: { flex: 1, fontSize: 13, fontWeight: '800', color: C.green },

  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 26,
  },
  sourceText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
  },
  sourceLink: { color: C.green, fontWeight: '900' },

  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    paddingBottom: 30,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { fontSize: 17, fontWeight: '900', color: C.dark },
  sheetText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 4,
    marginBottom: 8,
  },
  creditRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
  },
  creditCrop: {
    fontSize: 13,
    fontWeight: '900',
    color: C.dark,
    textTransform: 'capitalize',
  },
  creditText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 1,
  },
});
