import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Stethoscope, X } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareChips,
  CareEmpty,
  CareLoading,
} from '../../components/doctor/CareBits';
import { CARE as C, CARE_SHADOW } from '../../components/doctor/careTheme';
import DoctorCard from '../../components/doctor/DoctorCard';
import useDoctorMeta from '../../components/doctor/useDoctorMeta';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { fetchDoctors } from '../../redux/slices/doctorSlice';

const TYPES = [
  { key: '', label: 'All doctors' },
  { key: 'veterinarian', label: 'Vets' },
  { key: 'agriculturalDoctor', label: 'Crop doctors' },
];

const SORTS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'experience', label: 'Most consultations' },
  { key: 'fee_asc', label: 'Lowest fee' },
  { key: 'newest', label: 'Newest' },
];

const HERO = {
  '': {
    gradient: 'care',
    title: 'Find a doctor',
    subtitle: 'Vets and crop experts who take consultations',
  },
  veterinarian: {
    gradient: 'vet',
    title: 'Veterinarians',
    subtitle: 'For cows, buffaloes, goats, poultry and pets',
  },
  agriculturalDoctor: {
    gradient: 'crop',
    title: 'Crop doctors',
    subtitle: 'For pests, leaf disease, soil and nutrients',
  },
};

const PAGE_SIZE = 20;

export default function DoctorListScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const meta = useDoctorMeta();
  const initial = route.params || {};

  const user = useSelector(state => state.auth.user);
  const { list, pagination, listLoading, listLoadingMore, listError } =
    useSelector(state => state.doctor);

  const [doctorType, setDoctorType] = useState(initial.doctorType || '');
  const [specialization, setSpecialization] = useState(
    initial.specialization || '',
  );
  const [searchText, setSearchText] = useState(initial.search || '');
  const [search, setSearch] = useState(initial.search || '');
  const [sort, setSort] = useState('rating');
  const [language, setLanguage] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const params = useMemo(
    () => ({
      doctorType,
      specialization,
      search,
      sort,
      language,
      freeOnly: freeOnly ? 'true' : '',
      district: nearMe ? user?.district : '',
      limit: PAGE_SIZE,
    }),
    [
      doctorType,
      specialization,
      search,
      sort,
      language,
      freeOnly,
      nearMe,
      user?.district,
    ],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchDoctors({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (
      listLoading ||
      listLoadingMore ||
      pagination.page >= pagination.totalPages
    ) {
      return;
    }

    dispatch(
      fetchDoctors({
        params: { ...params, page: pagination.page + 1 },
        append: true,
      }),
    );
  };

  const changeType = key => {
    setDoctorType(key);
    setSpecialization('');
  };

  const specialityOptions = doctorType
    ? meta.specializations?.[doctorType] || []
    : [];
  const hero = HERO[doctorType] || HERO[''];

  const filterOptions = [
    {
      key: 'free',
      label: 'Free only',
      active: freeOnly,
      toggle: () => setFreeOnly(v => !v),
    },
    ...(user?.district
      ? [
          {
            key: 'near',
            label: `Near ${user.district}`,
            active: nearMe,
            toggle: () => setNearMe(v => !v),
          },
        ]
      : []),
  ];

  const header = (
    <View style={styles.header}>
      <CareHero
        gradient={hero.gradient}
        eyebrow={
          listLoading ? 'Searching…' : `${pagination.total} doctors found`
        }
        title={hero.title}
        subtitle={hero.subtitle}
        onBack={() => navigation.goBack()}
        compact
      />

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Search size={18} color={C.teal} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Name, speciality, qualification..."
            placeholderTextColor={C.placeholder}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {!!searchText && (
            <TouchableOpacity hitSlop={10} onPress={() => setSearchText('')}>
              <X size={17} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.segment}>
          {TYPES.map(type => {
            const selected = type.key === doctorType;

            return (
              <TouchableOpacity
                key={type.key || 'all'}
                activeOpacity={0.85}
                onPress={() => changeType(type.key)}
                style={[styles.segmentItem, selected && styles.segmentSelected]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected && styles.segmentTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {specialityOptions.length > 0 && (
          <CareChips
            scroll
            options={[
              { key: '', label: 'Any speciality' },
              ...specialityOptions,
            ]}
            value={specialization}
            onChange={setSpecialization}
            style={styles.chipRow}
          />
        )}

        <CareChips
          scroll
          options={SORTS}
          value={sort}
          onChange={setSort}
          style={styles.chipRow}
        />

        <View style={styles.toggleRow}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.8}
              onPress={option.toggle}
              style={[styles.toggle, option.active && styles.toggleActive]}
            >
              <Text
                style={[
                  styles.toggleText,
                  option.active && styles.toggleTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          {(meta.languages || []).slice(0, 4).map(item => {
            const active = language === item;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => setLanguage(active ? '' : item)}
                style={[styles.toggle, active && styles.toggleActive]}
              >
                <Text
                  style={[styles.toggleText, active && styles.toggleTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={listLoading && !refreshing ? [] : list}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <DoctorCard
              doctor={item}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.PROFILE, {
                  doctorId: item._id,
                })
              }
            />
          </View>
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
        ListEmptyComponent={
          listLoading ? (
            <CareLoading />
          ) : listError ? (
            <CareEmpty
              icon={<Stethoscope size={30} color={C.teal} />}
              title="Couldn't load doctors"
              message={listError}
              actionLabel="Try Again"
              onAction={loadFirstPage}
            />
          ) : (
            <CareEmpty
              icon={<Stethoscope size={30} color={C.teal} />}
              title="No doctors match"
              message="Try another speciality or language, or remove a filter."
            />
          )
        }
        ListFooterComponent={
          listLoadingMore ? (
            <ActivityIndicator color={C.teal} style={styles.footerLoader} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  header: { marginBottom: 14 },
  item: { paddingHorizontal: 16 },

  searchBox: {
    marginBottom: 12,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    ...CARE_SHADOW,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
    paddingVertical: 0,
    fontWeight: '600',
  },

  filters: { paddingHorizontal: 16, marginTop: 16 },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#E4EEED',
    borderRadius: 24,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: C.white },
  segmentText: { fontSize: 12.5, fontWeight: '800', color: C.muted },
  segmentTextSelected: { color: C.tealDark, fontWeight: '900' },
  chipRow: { marginTop: 12 },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9C9C7',
  },
  toggleActive: {
    borderStyle: 'solid',
    borderColor: C.teal,
    backgroundColor: C.tealSoft,
  },
  toggleText: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  toggleTextActive: { color: C.tealDark },
  footerLoader: { marginVertical: 16 },
});
