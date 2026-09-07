import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import {
  ArrowLeft,
  Tractor,
  MapPin,
  Clock,
  CalendarDays,
  Fuel,
  Settings2,
  Gauge,
  Check,
  User,
  FileText,
  Wrench,
  ShieldCheck,
  CircleCheck,
  X,
  ChevronRight,
  Store,
} from 'lucide-react-native';

import { getMyMachinery } from '../../redux/slices/machinerySlice';

const { width } = Dimensions.get('window');

const rf = s =>
  Math.max(s - 2, Math.min((s * width) / 390, s + 2));

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1595107144955-ccff0db9ffbc?auto=format&fit=crop&q=80&w=600';

export default function MachineryRentalProfileScreen({
  navigation,
  route,
}) {
  const dispatch = useDispatch();

  const routeList = route?.params?.machineryList;

  const machineryState = useSelector(
    state => state.machinery || state.machineries || {},
  );

  const storeMachinery = Array.isArray(machineryState.myMachinery)
    ? machineryState.myMachinery
    : [];

  // Prefer store data (always fresh), fallback to route params
  const machineryList =
    storeMachinery.length > 0 ? storeMachinery : routeList || [];

  const isLoading = Boolean(
    machineryState.isLoadingMyMachinery || machineryState.loading,
  );

  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadMachinery = useCallback(() => {
    dispatch(getMyMachinery());
  }, [dispatch]);

  useEffect(() => {
    loadMachinery();
  }, [loadMachinery]);

  useFocusEffect(
    useCallback(() => {
      loadMachinery();
    }, [loadMachinery]),
  );

  const openMachine = machine => {
    setSelectedMachine(machine);
    setModalVisible(true);
  };

  const closeMachine = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedMachine(null), 300);
  };

  const totalActive = machineryList.filter(
    m => m.availability === 'available' && m.isActive !== false,
  ).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <ArrowLeft size={20} color="#111" strokeWidth={2.2} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Rental Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadMachinery}
            colors={['#1B7A2E']}
            tintColor="#1B7A2E"
          />
        }>
        {/* PROFILE HERO */}
        <View style={styles.profileHero}>
          <View style={styles.profileIcon}>
            <Store size={40} color="#1B7A2E" strokeWidth={1.8} />
          </View>

          <Text style={styles.profileTitle}>My Rental Profile</Text>
          <Text style={styles.profileSub}>
            Manage all your listed machinery
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{machineryList.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalActive}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {machineryList.length - totalActive}
              </Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>
        </View>

        {/* LISTED MACHINERIES */}
        <SectionHeader icon={Tractor} title="Your Listed Machinery" />

        {machineryList.length === 0 ? (
          <View style={styles.emptyState}>
            <Tractor size={40} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Machinery Yet</Text>
            <Text style={styles.emptySub}>
              Add your first machinery to start receiving rental requests
            </Text>
          </View>
        ) : (
          machineryList.map((item, index) => {
            const imageUri =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : FALLBACK_IMG;

            const isAvailable =
              item.availability === 'available' && item.isActive !== false;

            return (
              <TouchableOpacity
                key={item._id || item.id || String(index)}
                activeOpacity={0.85}
                style={styles.listCard}
                onPress={() => openMachine(item)}>
                <Image source={{ uri: imageUri }} style={styles.listImg} />

                <View style={styles.listBody}>
                  <View style={styles.listTopRow}>
                    <Text style={styles.listCategory}>
                      {item.category || 'Machinery'}
                    </Text>
                    <View
                      style={[
                        styles.miniBadge,
                        isAvailable ? styles.miniBadgeOn : styles.miniBadgeOff,
                      ]}>
                      <View
                        style={[
                          styles.miniDot,
                          isAvailable
                            ? styles.miniDotOn
                            : styles.miniDotOff,
                        ]}
                      />
                      <Text
                        style={[
                          styles.miniBadgeText,
                          isAvailable
                            ? styles.miniBadgeTextOn
                            : styles.miniBadgeTextOff,
                        ]}>
                        {isAvailable ? 'Live' : 'Off'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.listName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  {[item.brand, item.model].filter(Boolean).length > 0 && (
                    <Text style={styles.listMeta} numberOfLines={1}>
                      {[item.brand, item.model].filter(Boolean).join(' • ')}
                    </Text>
                  )}

                  <View style={styles.listPricingRow}>
                    {Number(item.pricing?.hourly) > 0 && (
                      <Text style={styles.listPrice}>
                        ₹{item.pricing.hourly}
                        <Text style={styles.listPriceUnit}>/hr</Text>
                      </Text>
                    )}
                    {Number(item.pricing?.hourly) > 0 &&
                      Number(item.pricing?.daily) > 0 && (
                        <View style={styles.smallDot} />
                      )}
                    {Number(item.pricing?.daily) > 0 && (
                      <Text style={styles.listPrice}>
                        ₹{item.pricing.daily}
                        <Text style={styles.listPriceUnit}>/day</Text>
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.chevronWrap}>
                  <ChevronRight size={18} color="#1B7A2E" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* TRUST CARD */}
        <View style={styles.trustCard}>
          <View style={styles.trustIcon}>
            <ShieldCheck size={22} color="#1B7A2E" />
          </View>
          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>Machinery Rental Service</Text>
            <Text style={styles.trustText}>
              Farmers can contact you to enquire about availability and rental
              pricing.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MACHINERY DETAILS MODAL */}
      {selectedMachine && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeMachine}>
          <MachineryDetailsModal
            machinery={selectedMachine}
            onClose={closeMachine}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| MACHINERY DETAILS MODAL
|--------------------------------------------------------------------------
*/

const MachineryDetailsModal = ({ machinery, onClose }) => {
  const name = machinery.name || 'Machinery';
  const category = machinery.category || 'Machinery';
  const brand = machinery.brand || '';
  const model = machinery.model || '';
  const modelYear = machinery.modelYear || machinery.year || '';
  const ownerName = machinery.ownerName || 'Owner';
  const description = machinery.description || '';
  const enginePower = machinery.enginePower || {};
  const fuelType = machinery.fuelType || '';
  const driveType = machinery.driveType || '';
  const supportsImplements = machinery.supportsImplements || false;
  const supportedImplements = Array.isArray(machinery.supportedImplements)
    ? machinery.supportedImplements
    : [];
  const availability = machinery.availability || 'available';
  const pricing = machinery.pricing || {};
  const customPricing = Array.isArray(pricing.custom) ? pricing.custom : [];
  const state = machinery.state || '';
  const district = machinery.district || '';
  const village = machinery.village || '';
  const address = machinery.address || '';
  const ownerNotes = machinery.ownerNotes || '';

  const location = [village, district, state].filter(Boolean).join(', ');

  const imageUri =
    Array.isArray(machinery.images) && machinery.images.length > 0
      ? machinery.images[0]
      : null;

  const getFuelLabel = value => {
    const map = {
      diesel: 'Diesel',
      petrol: 'Petrol',
      electric: 'Electric',
      other: 'Other',
    };
    return map[value] || value;
  };

  const availabilityLabel =
    availability === 'available'
      ? 'Available'
      : availability === 'busy'
      ? 'Currently Busy'
      : 'Unavailable';

  const availabilityActive = availability === 'available';

  return (
    <SafeAreaView style={ms.container} edges={['bottom']}>
      <View style={ms.handleWrap}>
        <View style={ms.handle} />
      </View>

      {/* Header */}
      <View style={ms.header}>
        <Text style={ms.headerTitle}>Machinery Details</Text>
        <TouchableOpacity onPress={onClose} style={ms.closeBtn}>
          <X size={18} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ms.content}>
        {/* HERO */}
        <View style={ms.heroCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={ms.heroImg} />
          ) : (
            <View style={ms.heroIcon}>
              <Tractor size={44} color="#1B7A2E" strokeWidth={1.8} />
            </View>
          )}

          <Text style={ms.category}>{category}</Text>
          <Text style={ms.name}>{name}</Text>

          {(brand || model || modelYear) && (
            <Text style={ms.machineMeta}>
              {[brand, model, modelYear].filter(Boolean).join(' • ')}
            </Text>
          )}

          <View
            style={[
              ms.availabilityBadge,
              availabilityActive ? ms.availableBadge : ms.otherBadge,
            ]}>
            <CircleCheck
              size={14}
              color={availabilityActive ? '#1B7A2E' : '#6B7280'}
            />
            <Text
              style={[
                ms.availabilityText,
                availabilityActive ? ms.availableText : ms.otherText,
              ]}>
              {availabilityLabel}
            </Text>
          </View>
        </View>

        {/* PRICING */}
        <ModalSectionHeader icon={CalendarDays} title="Rental Pricing" />

        <View style={ms.pricingGrid}>
          {Number(pricing.hourly) > 0 && (
            <ModalPriceCard
              icon={Clock}
              title="Per Hour"
              amount={pricing.hourly}
              unit="hour"
            />
          )}

          {Number(pricing.daily) > 0 && (
            <ModalPriceCard
              icon={CalendarDays}
              title="Per Day"
              amount={pricing.daily}
              unit="day"
            />
          )}
        </View>

        {customPricing.length > 0 && (
          <View style={ms.customPricingCard}>
            <Text style={ms.cardTitle}>Additional Pricing</Text>
            {customPricing.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                style={ms.customPriceRow}>
                <View style={ms.customPriceLeft}>
                  <View style={ms.smallGreenIcon}>
                    <Check size={14} color="#1B7A2E" strokeWidth={2.5} />
                  </View>
                  <Text style={ms.customPriceName}>{item.name}</Text>
                </View>
                <Text style={ms.customPriceAmount}>
                  ₹{item.amount}
                  {item.unit ? ` / ${item.unit}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* BASIC DETAILS */}
        <ModalSectionHeader icon={FileText} title="Machinery Details" />

        <View style={ms.detailsCard}>
          <ModalDetailRow icon={Tractor} label="Category" value={category} />
          {brand ? (
            <ModalDetailRow icon={Wrench} label="Brand" value={brand} />
          ) : null}
          {model ? (
            <ModalDetailRow icon={Settings2} label="Model" value={model} />
          ) : null}
          {modelYear ? (
            <ModalDetailRow
              icon={CalendarDays}
              label="Model Year"
              value={String(modelYear)}
            />
          ) : null}
          {enginePower?.value ? (
            <ModalDetailRow
              icon={Gauge}
              label="Engine Power"
              value={`${enginePower.value} ${enginePower.unit || 'HP'}`}
            />
          ) : null}
          {fuelType ? (
            <ModalDetailRow
              icon={Fuel}
              label="Fuel Type"
              value={getFuelLabel(fuelType)}
            />
          ) : null}
          {driveType ? (
            <ModalDetailRow
              icon={Settings2}
              label="Drive Type"
              value={driveType}
            />
          ) : null}
        </View>

        {/* IMPLEMENTS */}
        {supportsImplements && supportedImplements.length > 0 && (
          <>
            <ModalSectionHeader icon={Wrench} title="Supported Implements" />
            <View style={ms.implementsCard}>
              {supportedImplements.map(implement => (
                <View key={implement} style={ms.implementChip}>
                  <Check size={13} color="#1B7A2E" strokeWidth={2.8} />
                  <Text style={ms.implementText}>{implement}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* DESCRIPTION */}
        {description ? (
          <>
            <ModalSectionHeader icon={FileText} title="Description" />
            <View style={ms.textCard}>
              <Text style={ms.description}>{description}</Text>
            </View>
          </>
        ) : null}

        {/* LOCATION */}
        {(location || address) && (
          <>
            <ModalSectionHeader icon={MapPin} title="Machinery Location" />
            <View style={ms.locationCard}>
              <View style={ms.locationIcon}>
                <MapPin size={20} color="#1B7A2E" />
              </View>
              <View style={ms.locationInfo}>
                {location ? (
                  <Text style={ms.locationText}>{location}</Text>
                ) : null}
                {address ? (
                  <Text style={ms.addressText}>{address}</Text>
                ) : null}
              </View>
            </View>
          </>
        )}

        {/* OWNER */}
        <ModalSectionHeader icon={User} title="Owner" />
        <View style={ms.ownerCard}>
          <View style={ms.ownerAvatar}>
            <User size={22} color="#1B7A2E" />
          </View>
          <View style={ms.ownerInfo}>
            <Text style={ms.ownerName}>{ownerName}</Text>
            <Text style={ms.ownerSub}>Machinery Owner</Text>
          </View>
        </View>

        {/* OWNER NOTES */}
        {ownerNotes ? (
          <>
            <ModalSectionHeader icon={FileText} title="Owner Notes" />
            <View style={ms.textCard}>
              <Text style={ms.description}>{ownerNotes}</Text>
            </View>
          </>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/*
|--------------------------------------------------------------------------
| REUSABLE COMPONENTS
|--------------------------------------------------------------------------
*/

const SectionHeader = ({ icon: Icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Icon size={16} color="#1B7A2E" strokeWidth={2.2} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const ModalSectionHeader = ({ icon: Icon, title }) => (
  <View style={ms.sectionHeader}>
    <View style={ms.sectionIcon}>
      <Icon size={16} color="#1B7A2E" strokeWidth={2.2} />
    </View>
    <Text style={ms.sectionTitle}>{title}</Text>
  </View>
);

const ModalPriceCard = ({ icon: Icon, title, amount, unit }) => (
  <View style={ms.priceCard}>
    <View style={ms.priceIcon}>
      <Icon size={18} color="#1B7A2E" strokeWidth={2} />
    </View>
    <Text style={ms.priceTitle}>{title}</Text>
    <Text style={ms.priceAmount}>₹{amount}</Text>
    <Text style={ms.priceUnit}>/ {unit}</Text>
  </View>
);

const ModalDetailRow = ({ icon: Icon, label, value }) => (
  <View style={ms.detailRow}>
    <View style={ms.detailIcon}>
      <Icon size={16} color="#6B7280" strokeWidth={2} />
    </View>
    <Text style={ms.detailLabel}>{label}</Text>
    <Text style={ms.detailValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

/*
|--------------------------------------------------------------------------
| MAIN STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#111',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  /* Profile Hero */
  profileHero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  profileIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: rf(22),
    fontWeight: '900',
    color: '#111',
    marginTop: 14,
  },
  profileSub: {
    fontSize: rf(12),
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#1B7A2E',
  },
  statLabel: {
    fontSize: rf(11),
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 11,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#111',
  },

  /* List Card */
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F1F1',
  },
  listImg: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#EAF6E8',
  },
  listBody: {
    flex: 1,
  },
  listTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  listCategory: {
    fontSize: rf(10),
    color: '#1B7A2E',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  listName: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111',
    marginTop: 4,
  },
  listMeta: {
    fontSize: rf(11),
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  listPricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  listPrice: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#111',
  },
  listPriceUnit: {
    fontSize: rf(10),
    color: '#6B7280',
    fontWeight: '600',
  },
  smallDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  miniBadgeOn: {
    backgroundColor: '#EAF6E8',
  },
  miniBadgeOff: {
    backgroundColor: '#F3F4F6',
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  miniDotOn: {
    backgroundColor: '#1B7A2E',
  },
  miniDotOff: {
    backgroundColor: '#9CA3AF',
  },
  miniBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  miniBadgeTextOn: {
    color: '#1B7A2E',
  },
  miniBadgeTextOff: {
    color: '#6B7280',
  },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111',
    marginTop: 12,
  },
  emptySub: {
    fontSize: rf(12),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  /* Trust Card */
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#F6FBF3',
    borderWidth: 1,
    borderColor: '#DCEED8',
  },
  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DFF1D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  trustContent: {
    flex: 1,
  },
  trustTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#111',
  },
  trustText: {
    fontSize: rf(10),
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 3,
  },
});

/*
|--------------------------------------------------------------------------
| MODAL STYLES (preserves your beautiful profile screen UI)
|--------------------------------------------------------------------------
*/

const ms = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#111',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  heroCard: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  heroImg: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: '#EAF6E8',
  },
  heroIcon: {
    width: 92,
    height: 92,
    borderRadius: 25,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: rf(11),
    color: '#1B7A2E',
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 14,
  },
  name: {
    fontSize: rf(24),
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginTop: 4,
  },
  machineMeta: {
    fontSize: rf(12),
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },
  availableBadge: {
    backgroundColor: '#EAF6E8',
  },
  otherBadge: {
    backgroundColor: '#F3F4F6',
  },
  availabilityText: {
    fontSize: rf(11),
    fontWeight: '800',
  },
  availableText: {
    color: '#1B7A2E',
  },
  otherText: {
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 11,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#111',
  },
  pricingGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  priceCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    padding: 14,
    backgroundColor: '#fff',
  },
  priceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceTitle: {
    fontSize: rf(11),
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 10,
  },
  priceAmount: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#111',
    marginTop: 2,
  },
  priceUnit: {
    fontSize: rf(10),
    color: '#9CA3AF',
    marginTop: 1,
  },
  customPricingCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    marginTop: 10,
    padding: 14,
  },
  cardTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#111',
    marginBottom: 10,
  },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  customPriceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  smallGreenIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customPriceName: {
    fontSize: rf(12),
    color: '#374151',
    fontWeight: '700',
    flex: 1,
  },
  customPriceAmount: {
    fontSize: rf(12),
    color: '#111',
    fontWeight: '900',
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  detailRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  detailLabel: {
    fontSize: rf(12),
    color: '#6B7280',
    fontWeight: '600',
    width: 105,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: rf(12),
    color: '#111',
    fontWeight: '800',
  },
  implementsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  implementChip: {
    minHeight: 37,
    paddingHorizontal: 12,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#DCEED8',
    backgroundColor: '#F6FBF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  implementText: {
    fontSize: rf(11),
    color: '#1B7A2E',
    fontWeight: '700',
  },
  textCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    padding: 14,
    backgroundColor: '#fff',
  },
  description: {
    fontSize: rf(12),
    color: '#4B5563',
    lineHeight: 19,
  },
  locationCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    padding: 14,
    backgroundColor: '#fff',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: rf(13),
    fontWeight: '800',
    color: '#111',
    lineHeight: 19,
  },
  addressText: {
    fontSize: rf(11),
    color: '#6B7280',
    lineHeight: 17,
    marginTop: 4,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    padding: 14,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#111',
  },
  ownerSub: {
    fontSize: rf(11),
    color: '#6B7280',
    marginTop: 3,
  },
});