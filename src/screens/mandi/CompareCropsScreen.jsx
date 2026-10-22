import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Trophy,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  TopInset,
} from '../../components/market/MarketHero';
import { SegmentTabs } from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import useMandiSetup from '../../components/mandi/useMandiSetup';
import CropPhoto from '../../components/mandi/CropPhoto';
import { MANDI_BANNER } from '../../components/mandi/cropVisuals';
import { MANDI_ROUTES } from '../../constants/mandiRoutes';
import { fetchMandiSummary } from '../../redux/slices/mandiSlice';
import {
  formatPerKg,
  formatQuintal,
  scopeLabel,
  scopeParams,
  searchCrops,
  summaryKey,
} from '../../utils/mandiFormat';

const MAX_CROPS = 4;
const DEFAULT_CROPS = ['onion', 'tomato', 'potato'];

export default function CompareCropsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { crops, location } = useMandiSetup();
  const { summaries, recentCrops } = useSelector(state => state.mandi);

  const [picked, setPicked] = useState(() => {
    const start = route.params?.cropId;
    const ids = [
      ...(start ? [start] : []),
      ...recentCrops.map(item => item.id),
      ...DEFAULT_CROPS,
    ];
    return [...new Set(ids)].slice(0, 3);
  });
  const [scope, setScope] = useState(location?.state ? 'state' : 'india');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  const place = scopeParams(scope, location);
  const placeName = scopeLabel(scope, location);

  // one at a time: each crop is a fresh data.gov.in query on the server
  const load = force => {
    let cancelled = false;

    (async () => {
      for (const id of picked) {
        if (cancelled) return;
        await dispatch(fetchMandiSummary({ crop: id, ...place, force }));
      }
    })();

    return () => {
      cancelled = true;
    };
  };

  useEffect(
    () => load(false),
    // place values are the real dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [picked, place.state, place.district],
  );

  const byId = useMemo(
    () => new Map(crops.map(crop => [crop.id, crop])),
    [crops],
  );

  const rows = picked.map(id => {
    const entry = summaries[summaryKey({ crop: id, ...place })] || {};
    const crop = byId.get(id);

    return {
      id,
      name: crop?.name || id,
      category: crop?.category,
      loading: !entry.status || entry.status === 'loading',
      error: entry.status === 'error' ? entry.error : null,
      average: entry.summary?.averageModalPrice ?? null,
      summary: entry.summary,
    };
  });

  const ranked = rows
    .filter(row => row.average)
    .sort((a, b) => b.average - a.average);
  const top = ranked[0]?.average || 1;
  const winner = ranked.length > 1 ? ranked[0] : null;
  const ordered = [...ranked, ...rows.filter(row => !row.average)];

  const remove = id =>
    setPicked(previous => previous.filter(item => item !== id));

  const add = id => {
    setPicked(previous =>
      previous.includes(id) || previous.length >= MAX_CROPS
        ? previous
        : [...previous, id],
    );
    setAdding(false);
    setSearch('');
  };

  const choices = searchCrops(crops, search).filter(
    crop => !picked.includes(crop.id),
  );

  const scopeOptions = [
    ...(location?.district
      ? [{ key: 'district', label: location.district }]
      : []),
    ...(location?.state ? [{ key: 'state', label: location.state }] : []),
    { key: 'india', label: 'All India' },
  ];

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
          eyebrow={`Compare · ${placeName}`}
          title="Which crop pays more?"
          subtitle="Today's average mandi price of your crops, side by side."
          right={
            <GlassButton onPress={() => load(true)}>
              <RefreshCw size={18} color={C.white} />
            </GlassButton>
          }
        />

        <View style={styles.body}>
          {scopeOptions.length > 1 && (
            <View style={styles.scope}>
              <SegmentTabs
                options={scopeOptions}
                value={scope}
                onChange={setScope}
              />
            </View>
          )}

          {/* PICKED */}
          <Text style={styles.label}>
            Your crops ({picked.length}/{MAX_CROPS})
          </Text>
          <View style={styles.pickedRow}>
            {rows.map(row => (
              <View key={row.id} style={styles.pickedChip}>
                <CropPhoto
                  cropId={row.id}
                  category={row.category}
                  style={styles.pickedPhoto}
                  iconSize={14}
                />
                <Text style={styles.pickedText} numberOfLines={1}>
                  {row.name}
                </Text>
                {picked.length > 1 && (
                  <TouchableOpacity hitSlop={8} onPress={() => remove(row.id)}>
                    <X size={15} color={C.muted} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {picked.length < MAX_CROPS && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addChip}
                onPress={() => setAdding(value => !value)}
              >
                <Plus size={15} color={C.green} />
                <Text style={styles.addText}>Add crop</Text>
              </TouchableOpacity>
            )}
          </View>

          {adding && (
            <View style={styles.picker}>
              <View style={styles.searchBox}>
                <Search size={16} color={C.muted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search crop"
                  placeholderTextColor={C.placeholder}
                  style={styles.searchInput}
                  autoFocus
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.choiceList}
                keyboardShouldPersistTaps="handled"
              >
                {choices.slice(0, 20).map(crop => (
                  <TouchableOpacity
                    key={crop.id}
                    activeOpacity={0.85}
                    style={styles.choice}
                    onPress={() => add(crop.id)}
                  >
                    <CropPhoto
                      cropId={crop.id}
                      category={crop.category}
                      style={styles.choicePhoto}
                    />
                    <Text style={styles.choiceText} numberOfLines={1}>
                      {crop.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* WINNER */}
          {!!winner && (
            <View style={styles.winner}>
              <Trophy size={24} color={C.amber} />
              <View style={styles.flex}>
                <Text style={styles.winnerTitle}>
                  {winner.name} has the highest price
                </Text>
                <Text style={styles.winnerText}>
                  {formatQuintal(winner.average)} per quintal (
                  {formatPerKg(winner.average)}) in {placeName}
                </Text>
              </View>
            </View>
          )}

          {/* CROP CARDS */}
          {ordered.map((row, index) => {
            const isWinner = winner && row.id === winner.id;

            return (
              <TouchableOpacity
                key={row.id}
                activeOpacity={0.9}
                style={[styles.cropCard, isWinner && styles.cropCardWinner]}
                onPress={() =>
                  navigation.navigate(MANDI_ROUTES.CROP, {
                    cropId: row.id,
                    cropName: row.name,
                  })
                }
              >
                <View style={styles.cropTop}>
                  <CropPhoto
                    cropId={row.id}
                    category={row.category}
                    style={styles.cropPhoto}
                  />
                  <View style={styles.flex}>
                    <Text style={styles.cropName} numberOfLines={1}>
                      {row.average ? `${index + 1}. ` : ''}
                      {row.name}
                    </Text>
                    {row.loading ? (
                      <ActivityIndicator
                        color={C.green}
                        style={styles.cropLoader}
                      />
                    ) : row.average ? (
                      <>
                        <Text
                          style={[styles.cropPrice, isWinner && styles.green]}
                        >
                          {formatQuintal(row.average)}
                          <Text style={styles.cropUnit}> per quintal</Text>
                        </Text>
                        <Text style={styles.cropKg}>
                          {formatPerKg(row.average)} · {row.summary?.markets}{' '}
                          mandis
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.cropNone}>
                        {row.error || `No price in ${placeName}`}
                      </Text>
                    )}
                  </View>
                  <ChevronRight size={18} color={C.muted} />
                </View>

                {!!row.average && (
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${(row.average / top) * 100}%` },
                        isWinner && styles.barWinner,
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <Text style={styles.note}>
            Average of all mandis in {placeName}. Tap a crop to see each mandi's
            price.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 40 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  green: { color: C.green },
  scope: { marginTop: 16 },

  label: {
    fontSize: 13,
    fontWeight: '900',
    color: C.muted,
    marginTop: 18,
    marginBottom: 10,
  },
  pickedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    maxWidth: '48%',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  pickedPhoto: { width: 30, height: 30, borderRadius: 15 },
  pickedText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
    color: C.dark,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    backgroundColor: C.lightGreen,
  },
  addText: { fontSize: 13, fontWeight: '900', color: C.green },

  picker: {
    marginTop: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: C.white,
    ...MARKET_SHADOW,
  },
  searchBox: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.dark, paddingVertical: 0 },
  choiceList: { gap: 10, paddingTop: 12 },
  choice: { width: 74, alignItems: 'center' },
  choicePhoto: { width: 64, height: 64, borderRadius: 16 },
  choiceText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.text,
    marginTop: 5,
  },

  winner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.lightAmber,
    marginTop: 18,
  },
  winnerTitle: { fontSize: 15, fontWeight: '900', color: '#4A2E00' },
  winnerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6B4A00',
    marginTop: 2,
  },

  cropCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  cropCardWinner: { borderColor: '#BFE3CC' },
  cropTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cropPhoto: { width: 70, height: 70, borderRadius: 18 },
  cropName: { fontSize: 15.5, fontWeight: '900', color: C.dark },
  cropLoader: { alignSelf: 'flex-start', marginTop: 8 },
  cropPrice: {
    fontSize: 21,
    fontWeight: '900',
    color: C.dark,
    marginTop: 2,
    letterSpacing: -0.4,
  },
  cropUnit: { fontSize: 11.5, fontWeight: '700', color: C.muted },
  cropKg: { fontSize: 12, fontWeight: '700', color: C.muted, marginTop: 1 },
  cropNone: { fontSize: 12, fontWeight: '700', color: C.muted, marginTop: 4 },
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EEF2EF',
    marginTop: 12,
    overflow: 'hidden',
  },
  bar: { height: 12, borderRadius: 6, backgroundColor: '#9ED4B2' },
  barWinner: { backgroundColor: C.green },
  note: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 17,
  },
});
