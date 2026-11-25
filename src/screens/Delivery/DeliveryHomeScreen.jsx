import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {
  ArrowRight,
  ArrowUpDown,
  BookUser,
  Check,
  LayoutGrid,
  LocateFixed,
  MapPin,
  Package,
  Pencil,
  Search,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

import {useLocation} from '../../context/LocationContext';
import MarketHero, {GlassButton, TopInset} from '../../components/market/MarketHero';
import {EmptyState, LoadingState, SegmentTabs} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
  MARKET_SHADOW_STRONG,
} from '../../components/market/theme';
import PartnerCard from '../../components/delivery/PartnerCard';
import RouteStops from '../../components/delivery/RouteStops';
import {
  VEHICLE_IMAGE,
  vehicleLabel,
  vehicleStyle,
} from '../../components/delivery/vehicles';
import useDeliveryMeta from '../../components/delivery/useDeliveryMeta';
import VoiceActionButton from '../../components/voice/VoiceActionButton';
import VoiceFlowOverlay from '../../components/voice/VoiceFlowOverlay';
import useDeliveryVoiceFlow from '../../components/voice/flows/useDeliveryVoiceFlow';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {
  fetchDeliveryPartners,
  fetchMyDeliveries,
  fetchMyDeliveryPartner,
} from '../../redux/slices/deliverySlice';
import {
  TRIP_STATUS_META,
  describeTripState,
  formatWeight,
} from '../../utils/deliveryFormat';
import {formatRupees} from '../../utils/marketFormat';
import {StatusPill} from '../../components/market/MarketBits';

const SORTS = ['recommended', 'rating', 'price', 'capacity'];

const TRUST_POINTS = [
  {icon: ShieldCheck, key: 'trustOtp'},
  {icon: Wallet, key: 'trustPay'},
  {icon: Zap, key: 'trustFast'},
];

const PAGE_SIZE = 20;

export default function DeliveryHomeScreen({navigation}) {
  const {t} = useTranslation();
  const {width: screenWidth} = useWindowDimensions();
  // 3 tiles per row inside the 16px side padding, 10px gaps.
  const tileWidth = Math.floor((screenWidth - 32 - 20) / 3);
  const dispatch = useDispatch();
  const {vehicleTypes} = useDeliveryMeta();

  const {location: live} = useLocation();
  const liveDistrict = live?.district || '';
  const origin =
    live?.latitude && live?.longitude
      ? {lat: live.latitude, lng: live.longitude}
      : null;

  const {
    partners,
    partnersDistrict,
    partnerStats,
    pagination,
    listLoading,
    listLoadingMore,
    listError,
    myPartner,
    myPartnerStatus,
    myDeliveries,
  } = useSelector(state => state.delivery);
  const user = useSelector(state => state.auth.user);

  // The pickup district decides which drivers can be booked.
  const [districtOverride, setDistrictOverride] = useState('');
  const [editingDistrict, setEditingDistrict] = useState(false);
  const [districtDraft, setDistrictDraft] = useState('');
  const pickupDistrict = districtOverride || liveDistrict || user?.district || '';

  const [scope, setScope] = useState('district');
  const [vehicleType, setVehicleType] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const voiceFlow = useDeliveryVoiceFlow(navigation);

  // Jump down to the drivers list (category tap / quick actions).
  const listRef = useRef(null);
  const resultsY = useRef(0);
  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: Math.max(0, resultsY.current - 8),
        animated: true,
      });
    }, 60);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const params = useMemo(
    () => ({
      district: pickupDistrict,
      scope,
      vehicleType,
      onlineOnly: onlineOnly ? 'true' : undefined,
      sort: SORTS[sortIndex],
      search,
      lat: origin?.lat,
      lng: origin?.lng,
      limit: PAGE_SIZE,
    }),
    [pickupDistrict, scope, vehicleType, onlineOnly, sortIndex, search, origin?.lat, origin?.lng],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchDeliveryPartners({params: {...params, page: 1}})),
    [dispatch, params],
  );

  const loadSide = useCallback(() => {
    dispatch(fetchMyDeliveryPartner());
    dispatch(fetchMyDeliveries({params: {status: 'active', limit: 5}}));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadFirstPage();
    }, [loadFirstPage]),
  );

  useFocusEffect(loadSide);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFirstPage(), loadSide()]);
    setRefreshing(false);
  }, [loadFirstPage, loadSide]);

  const handleLoadMore = useCallback(() => {
    if (listLoading || listLoadingMore || pagination.page >= pagination.totalPages) {
      return;
    }
    dispatch(
      fetchDeliveryPartners({
        params: {...params, page: pagination.page + 1},
        append: true,
      }),
    );
  }, [dispatch, params, pagination, listLoading, listLoadingMore]);

  const isDriver = myPartnerStatus === 'loaded' && !!myPartner;
  const driverBadge = (myPartner?.pendingRequests || 0) + (myPartner?.currentTripId ? 1 : 0);
  const activeTrip = myDeliveries.items.find(item =>
    ['requested', 'accepted', 'arrived', 'picked_up'].includes(item.status),
  );

  const openPartner = useCallback(
    partner =>
      navigation.navigate(DELIVERY_ROUTES.PARTNER_DETAILS, {
        partnerId: partner._id,
        pickupDistrict,
      }),
    [navigation, pickupDistrict],
  );

  const renderItem = useCallback(
    ({item}) => (
      <View style={styles.item}>
        <PartnerCard
          partner={item}
          onPress={() => openPartner(item)}
          onBook={() =>
            item.canBook
              ? navigation.navigate(DELIVERY_ROUTES.BOOK, {
                  partner: item,
                  pickupDistrict,
                })
              : openPartner(item)
          }
        />
      </View>
    ),
    [navigation, openPartner, pickupDistrict],
  );

  const saveDistrict = () => {
    setDistrictOverride(districtDraft.trim());
    setEditingDistrict(false);
  };

  const header = (
    <View>
      <MarketHero
        gradient="steel"
        onBack={() => navigation.goBack()}
        eyebrow={t('delivery.home.eyebrow')}
        title={t('delivery.home.title')}
        subtitle={t('delivery.home.subtitle')}
        right={
          <>
            <GlassButton onPress={() => navigation.navigate(DELIVERY_ROUTES.MY_DELIVERIES)}>
              <Package size={19} color={C.white} />
            </GlassButton>
            <GlassButton
              badge={driverBadge}
              onPress={() =>
                navigation.navigate(
                  isDriver ? DELIVERY_ROUTES.DRIVER_DASHBOARD : DELIVERY_ROUTES.DRIVER_FORM,
                )
              }>
              <Truck size={19} color={C.white} />
            </GlassButton>
          </>
        }>
        <View style={styles.trustRow}>
          {TRUST_POINTS.map(({icon: Icon, key}) => (
            <View key={key} style={styles.trustPill}>
              <Icon size={12} color="#BFE3FF" />
              <Text style={styles.trustText}>{t(`delivery.home.${key}`)}</Text>
            </View>
          ))}
        </View>
      </MarketHero>

      {/* PICKUP DISTRICT CARD */}
      <View style={styles.section}>
        <View style={styles.districtCard}>
          <View style={styles.districtIcon}>
            <LocateFixed size={19} color={C.blue} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.districtLabel}>{t('delivery.home.pickupDistrict')}</Text>
            {editingDistrict ? (
              <TextInput
                value={districtDraft}
                onChangeText={setDistrictDraft}
                autoFocus
                placeholder={t('delivery.home.enterDistrict')}
                placeholderTextColor={C.placeholder}
                style={styles.districtInput}
                returnKeyType="done"
                onSubmitEditing={saveDistrict}
              />
            ) : (
              <Text style={styles.districtValue} numberOfLines={1}>
                {pickupDistrict || t('delivery.home.districtUnknown')}
              </Text>
            )}
            <Text style={styles.districtHint} numberOfLines={2}>
              {pickupDistrict
                ? t('delivery.home.statsLine', {
                    inDistrict: partnerStats.inDistrict,
                    online: partnerStats.onlineInDistrict,
                    total: partnerStats.total,
                  })
                : t('delivery.home.setDistrictHint')}
            </Text>
          </View>
          <TouchableOpacity
            hitSlop={10}
            style={styles.districtEdit}
            onPress={() => {
              if (editingDistrict) {
                saveDistrict();
              } else {
                setDistrictDraft(pickupDistrict);
                setEditingDistrict(true);
              }
            }}>
            {editingDistrict ? (
              <Text style={styles.districtSave}>{t('common.ok')}</Text>
            ) : (
              <Pencil size={16} color={C.blue} />
            )}
          </TouchableOpacity>
        </View>

        {/* ACTIVE TRIP */}
        {!!activeTrip && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate(DELIVERY_ROUTES.TRIP, {bookingId: activeTrip._id})
            }>
            <LinearGradient
              colors={['#0F2A43', '#1B4F76']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.activeTrip}>
              <View style={styles.activeTop}>
                <Text style={styles.activeTitle}>{t('delivery.home.activeTrip')}</Text>
                <StatusPill meta={TRIP_STATUS_META[activeTrip.status]} />
              </View>
              <View style={styles.activeRoute}>
                <RouteStops pickup={activeTrip.pickup} drop={activeTrip.drop} />
              </View>
              <View style={styles.activeBottom}>
                <Text style={styles.activeState} numberOfLines={2}>
                  {describeTripState(activeTrip)}
                </Text>
                <View style={styles.trackPill}>
                  <Text style={styles.trackText}>{t('delivery.home.track')}</Text>
                  <ArrowRight size={13} color={C.dark} strokeWidth={2.8} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* QUICK ACTIONS */}
        <View style={styles.ctaGrid}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => {
              setScope('district');
              scrollToResults();
            }}>
            <View style={[styles.shortcutIcon, {backgroundColor: C.lightGreen}]}>
              <BookUser size={19} color={C.green} />
            </View>
            <Text style={styles.shortcutTitle}>{t('delivery.home.bookDelivery')}</Text>
            <Text style={styles.shortcutText}>{t('delivery.home.browseDrivers')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => navigation.navigate(DELIVERY_ROUTES.MY_DELIVERIES)}>
            <View style={[styles.shortcutIcon, {backgroundColor: C.lightBlue}]}>
              <Package size={19} color={C.blue} />
            </View>
            <Text style={styles.shortcutTitle}>{t('delivery.home.myDeliveries')}</Text>
            <Text style={styles.shortcutText}>{t('delivery.home.myDeliveriesSub')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => {
              setScope('district');
              setOnlineOnly(true);
              scrollToResults();
            }}>
            <View style={[styles.shortcutIcon, {backgroundColor: '#FDECEC'}]}>
              <MapPin size={19} color="#DC2626" />
            </View>
            <Text style={styles.shortcutTitle}>{t('delivery.home.driversNearYou')}</Text>
            <Text style={styles.shortcutText} numberOfLines={1}>
              {pickupDistrict
                ? t('delivery.home.onlineInDistrict', {district: pickupDistrict})
                : t('delivery.home.onlineNearYou')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.driverCtaWrap}
            onPress={() =>
              navigation.navigate(
                isDriver ? DELIVERY_ROUTES.DRIVER_DASHBOARD : DELIVERY_ROUTES.DRIVER_FORM,
              )
            }>
            <LinearGradient
              colors={['#F7B733', '#E8890C']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.driverCta}>
              <View style={styles.driverIcon}>
                <Truck size={19} color="#A25200" />
              </View>
              <Text style={styles.driverTitle}>
                {isDriver ? t('delivery.home.driverMode') : t('delivery.home.becomeDriver')}
              </Text>
              <View style={styles.driverLink}>
                <Text style={styles.driverLinkText}>
                  {isDriver
                    ? myPartner?.pendingRequests
                      ? t('delivery.home.newRequests', {count: myPartner.pendingRequests})
                      : myPartner?.isOnline
                      ? t('delivery.home.youAreOnline')
                      : t('delivery.home.youAreOffline')
                    : t('delivery.home.earnWithVehicle')}
                </Text>
                <ArrowRight size={13} color="#3A2400" strokeWidth={2.8} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <VoiceActionButton
          label={t('voiceFlow.button.delivery')}
          onPress={() => setVoiceOpen(true)}
        />

        <View style={styles.typeHeader}>
          <Text style={[styles.sectionTitle, styles.typeHeaderTitle]}>
            {t('delivery.home.chooseVehicle')}
          </Text>
          {!!vehicleType && (
            <TouchableOpacity
              activeOpacity={0.85}
              hitSlop={8}
              onPress={() => setVehicleType('')}
              style={styles.typeAllChip}>
              <LayoutGrid size={13} color={C.green} strokeWidth={2.6} />
              <Text style={styles.typeAllText}>{t('delivery.home.allVehicles')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* VEHICLE TYPES: every type visible at once, 3 per row */}
        <View style={styles.typeGrid}>
          {vehicleTypes.map(vehicle => {
            const selected = vehicleType === vehicle.key;
            const {icon: VehicleIcon, color, bg} = vehicleStyle(vehicle.key);
            const image = VEHICLE_IMAGE[vehicle.key];
            return (
              <TouchableOpacity
                key={vehicle.key}
                activeOpacity={0.88}
                onPress={() => {
                  setVehicleType(selected ? '' : vehicle.key);
                  if (!selected) scrollToResults();
                }}
                style={[styles.typeTile, {width: tileWidth}, selected && styles.typeTileSelected]}>
                <View style={[styles.typeArt, {backgroundColor: bg}]}>
                  {image ? (
                    <Image source={image} style={styles.typeImage} resizeMode="contain" />
                  ) : (
                    <VehicleIcon size={34} color={color} strokeWidth={1.9} />
                  )}
                  {selected && (
                    <View style={styles.typeCheck}>
                      <Check size={11} color={C.white} strokeWidth={3.5} />
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.typeLabel, selected && styles.typeLabelSelected]}
                  numberOfLines={2}>
                  {vehicleLabel(vehicle.key)}
                </Text>
                <Text style={styles.typeSub} numberOfLines={1}>
                  {t('delivery.home.upTo', {weight: formatWeight(vehicle.capacityKg)})}
                </Text>
                <Text style={styles.typeFrom} numberOfLines={1}>
                  {t('delivery.home.from', {amount: formatRupees(vehicle.minFare)})}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View
        style={styles.section}
        onLayout={event => {
          resultsY.current = event.nativeEvent.layout.y;
        }}>
        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Search size={18} color={C.green} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('delivery.home.search')}
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

        <View style={styles.tabs}>
          <SegmentTabs
            value={scope}
            onChange={setScope}
            options={[
              {
                key: 'district',
                label: t('delivery.home.tabDistrict', {count: partnerStats.inDistrict}),
              },
              {key: 'all', label: t('delivery.home.tabAll', {count: partnerStats.total})},
            ]}
          />
        </View>

        {scope === 'all' && (
          <Text style={styles.ruleNote}>
            {t('delivery.home.allRule', {district: partnersDistrict || pickupDistrict || '—'})}
          </Text>
        )}

        <View style={styles.resultsHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setOnlineOnly(value => !value)}
            style={[styles.toggleChip, onlineOnly && styles.toggleChipActive]}>
            <View style={[styles.onlineDot, onlineOnly && styles.onlineDotActive]} />
            <Text style={[styles.toggleText, onlineOnly && styles.toggleTextActive]}>
              {t('delivery.home.onlineNow')}
            </Text>
          </TouchableOpacity>
          <View style={styles.flex}>
            <Text style={styles.resultCount}>
              {listLoading
                ? t('delivery.home.searching')
                : t('delivery.home.driversFound', {count: pagination.total})}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.sortButton}
            onPress={() => setSortIndex(index => (index + 1) % SORTS.length)}>
            <ArrowUpDown size={14} color={C.green} />
            <Text style={styles.sortText}>
              {i18n.t(`delivery.sort.${SORTS[sortIndex]}`)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        ref={listRef}
        data={listLoading && !refreshing ? [] : partners}
        keyExtractor={item => item._id}
        renderItem={renderItem}
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
            colors={[C.green]}
            tintColor={C.white}
          />
        }
        ListEmptyComponent={
          listLoading ? (
            <LoadingState />
          ) : listError ? (
            <EmptyState
              icon={<Truck size={30} color={C.green} />}
              title={t('delivery.home.loadFailed')}
              message={listError}
              actionLabel={t('delivery.tryAgain')}
              onAction={loadFirstPage}
            />
          ) : (
            <EmptyState
              icon={<Users size={30} color={C.green} />}
              title={
                scope === 'district'
                  ? t('delivery.home.noneInDistrict', {district: pickupDistrict || '—'})
                  : t('delivery.home.noneFound')
              }
              message={
                scope === 'district'
                  ? t('delivery.home.noneInDistrictSub')
                  : t('delivery.home.noneFoundSub')
              }
              actionLabel={scope === 'district' ? t('delivery.home.seeAll') : undefined}
              onAction={() => setScope('all')}
            />
          )
        }
        ListFooterComponent={
          listLoadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />

      <VoiceFlowOverlay
        visible={voiceOpen}
        flow={voiceFlow}
        onClose={() => setVoiceOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  listContent: {paddingBottom: 40},
  section: {paddingHorizontal: 16},
  item: {paddingHorizontal: 16},
  flex: {flex: 1},

  trustRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14},
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  trustText: {color: C.white, fontSize: 10.5, fontWeight: '800'},

  districtCard: {
    marginTop: -22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.white,
    ...MARKET_SHADOW_STRONG,
  },
  districtIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  districtLabel: {fontSize: 10.5, fontWeight: '800', color: C.muted, letterSpacing: 0.3},
  districtValue: {fontSize: 16, fontWeight: '900', color: C.dark, marginTop: 1},
  districtInput: {
    fontSize: 15,
    fontWeight: '800',
    color: C.dark,
    paddingVertical: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: C.blue,
  },
  districtHint: {fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2},
  districtEdit: {
    minWidth: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  districtSave: {fontSize: 12, fontWeight: '900', color: C.blue},

  activeTrip: {marginTop: 14, borderRadius: 22, padding: 14},
  activeTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  activeTitle: {fontSize: 14, fontWeight: '900', color: C.white},
  activeRoute: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.white,
  },
  activeBottom: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10},
  activeState: {flex: 1, fontSize: 11.5, fontWeight: '700', color: '#DCEBFA'},
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#BFE3FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  trackText: {fontSize: 12, fontWeight: '900', color: C.dark},

  ctaGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14},
  shortcut: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: 22,
    backgroundColor: C.white,
    padding: 15,
    minHeight: 124,
    ...MARKET_SHADOW,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {marginTop: 'auto', fontSize: 15, fontWeight: '900', color: C.dark},
  shortcutText: {fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2},
  driverCtaWrap: {width: '47.8%', flexGrow: 1, borderRadius: 22, ...MARKET_SHADOW},
  driverCta: {flex: 1, borderRadius: 22, padding: 15, minHeight: 124},
  driverIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverTitle: {marginTop: 'auto', color: '#2E1C00', fontSize: 15, fontWeight: '900'},
  driverLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  driverLinkText: {color: '#3A2400', fontSize: 11, fontWeight: '900'},

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.4,
  },

  typeHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  typeHeaderTitle: {flexShrink: 1},
  typeAllChip: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
  },
  typeAllText: {fontSize: 12, fontWeight: '900', color: C.green},
  typeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 6},
  typeTile: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 8,
    paddingBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    ...MARKET_SHADOW,
  },
  typeTileSelected: {borderColor: C.green, backgroundColor: C.lightGreen},
  typeArt: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  typeImage: {width: '88%', height: '88%'},
  typeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    marginTop: 8,
    minHeight: 30,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
    color: C.dark,
    textAlign: 'center',
  },
  typeLabelSelected: {color: C.green},
  typeSub: {fontSize: 10, fontWeight: '700', color: C.muted, marginTop: 1},
  typeFrom: {fontSize: 10, fontWeight: '900', color: C.green, marginTop: 1},

  searchBox: {
    marginTop: 18,
    height: 50,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {flex: 1, fontSize: 14, color: C.dark, paddingVertical: 0, fontWeight: '600'},
  tabs: {marginTop: 14},
  ruleNote: {
    marginTop: 10,
    fontSize: 11.5,
    fontWeight: '700',
    color: C.amber,
    backgroundColor: C.lightAmber,
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
    lineHeight: 16,
  },

  resultsHeader: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultCount: {fontSize: 11.5, fontWeight: '700', color: C.muted},
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
  },
  sortText: {fontSize: 11, fontWeight: '900', color: C.green},
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C3CDC7',
    backgroundColor: C.white,
  },
  toggleChipActive: {borderColor: C.green, backgroundColor: C.lightGreen},
  onlineDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#C3CDC7'},
  onlineDotActive: {backgroundColor: C.green},
  toggleText: {fontSize: 11, fontWeight: '800', color: C.muted},
  toggleTextActive: {color: C.green},
  footerLoader: {marginVertical: 16},
});
