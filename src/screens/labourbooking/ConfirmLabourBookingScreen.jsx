import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BadgeCheck,
  Star,
  CalendarDays,
  Clock3,
  Users,
  Sprout,
  MapPin,
  Smartphone,
  CreditCard,
  Wallet,
  Banknote,
  Check,
  Info,
} from 'lucide-react-native';
import { createLabourBookingApi } from '../../api/labourBookingApi';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const ORANGE = '#F97316';
const PAYMENT_METHODS = [
  {
    id: 'cod',
    title: 'Cash on Work Completion',
    subtitle: 'Pay after work is done',
    Icon: Banknote,
    default: true,
  },
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'GPay, PhonePe, Paytm',
    Icon: Smartphone,
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    Icon: CreditCard,
  },
  {
    id: 'wallet',
    title: 'Wallet',
    subtitle: 'KhetiMaster Wallet',
    Icon: Wallet,
  },
];
const formatINR = value => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString('en-IN')}`;
};
const firstValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
};
const formatBookingDate = value => {
  if (!value) {
    return 'Date not specified';
  }
  if (
    typeof value === 'string' &&
    !/^\d{4}-\d{2}-\d{2}/.test(value) &&
    !value.includes('T')
  ) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
const getWorkingHours = params => {
  const directTime = firstValue(
    params.workingHours,
    params.workHours,
    params.timeRange,
  );
  if (directTime) {
    return String(directTime);
  }
  const startTime = firstValue(params.startTime, params.fromTime, params.start);
  const endTime = firstValue(params.endTime, params.toTime, params.end);
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }
  if (startTime) {
    return String(startTime);
  }
  return 'Time not specified';
};
export default function LabourBookingDetailsScreen({ navigation, route }) {
  const params = route?.params || {};
  const rawWorker =
    params.worker ||
    params.labourer ||
    params.selectedWorker ||
    params.selectedLabourer ||
    {};
  const worker = useMemo(() => {
    const imageValue = firstValue(
      rawWorker.profileImage,
      rawWorker.image,
      rawWorker.photo,
      rawWorker.avatar,
      params.workerImage,
      params.profileImage,
    );
    return {
      id: firstValue(
        rawWorker._id,
        rawWorker.id,
        rawWorker.labourerId,
        params.workerId,
        params.labourerId,
      ),
      name:
        firstValue(
          rawWorker.fullName,
          rawWorker.name,
          rawWorker.workerName,
          rawWorker.labourerName,
          params.workerName,
          params.labourerName,
        ) || 'Selected Labour',
      rating:
        firstValue(
          rawWorker.rating,
          rawWorker.averageRating,
          rawWorker.ratings,
          params.rating,
        ) ?? 0,
      reviews:
        firstValue(
          rawWorker.totalReviews,
          rawWorker.reviewCount,
          rawWorker.reviews,
          params.reviews,
        ) ?? 0,
      experience:
        firstValue(
          rawWorker.experience,
          rawWorker.experienceYears,
          rawWorker.workExperience,
          params.experience,
        ) ?? 0,
      experienceUnit:
        firstValue(rawWorker.experienceUnit, params.experienceUnit) || 'years',
      dailyWage: Number(
        firstValue(
          rawWorker.expectedWage,
          rawWorker.dailyWage,
          rawWorker.wage,
          rawWorker.amountPerDay,
          rawWorker.pricePerDay,
          params.dailyWage,
          params.expectedWage,
          params.wage,
        ) || 0,
      ),
      labourType:
        firstValue(
          rawWorker.labourType,
          rawWorker.workType,
          rawWorker.category,
          params.labourType,
          params.workType,
        ) || 'Farm Labour',
      village: firstValue(rawWorker.village, params.village) || '',
      district: firstValue(rawWorker.district, params.district) || '',
      state: firstValue(rawWorker.state, params.state) || '',
      image: imageValue
        ? typeof imageValue === 'string'
          ? {
              uri: imageValue,
            }
          : imageValue
        : null,
    };
  }, [
    rawWorker,
    params.workerImage,
    params.profileImage,
    params.workerId,
    params.labourerId,
    params.workerName,
    params.labourerName,
    params.rating,
    params.reviews,
    params.experience,
    params.experienceUnit,
    params.dailyWage,
    params.expectedWage,
    params.wage,
    params.labourType,
    params.workType,
    params.village,
    params.district,
    params.state,
  ]);
  const workerCount = Number(
    firstValue(
      params.workerCount,
      params.workers,
      params.numberOfWorkers,
      params.numberOfLabourers,
      1,
    ),
  );
  const activity =
    firstValue(
      params.activity,
      params.workType,
      params.selectedActivity,
      params.labourType,
    ) || 'Farm Work';
  const rawBookingDate = firstValue(
    params.bookingDate,
    params.date,
    params.selectedDate,
    params.workDate,
  );
  const bookingDate = formatBookingDate(rawBookingDate);
  const workingHours = getWorkingHours(params);
  const farm = params.farm || {};
  const farmName =
    firstValue(params.farmName, farm.name, farm.farmName) || 'My Farm';
  const farmLocation =
    firstValue(
      params.farmLocation,
      params.location,
      farm.location,
      farm.address,
      params.village,
    ) || 'Location not specified';
  const distance = firstValue(params.distance, farm.distance) || '';
  const farmSize =
    firstValue(
      params.farmSize,
      params.acres,
      params.area,
      farm.size,
      farm.acres,
    ) || 'Not specified';
  const crop =
    firstValue(params.crop, params.cropName, farm.crop) || 'Crop not specified';
  const calculatedLabourCost = useMemo(() => {
    const suppliedCost = firstValue(
      params.labourCost,
      params.totalLabourCost,
      params.totalAmount,
    );
    if (suppliedCost !== null && suppliedCost !== undefined) {
      const amount = Number(suppliedCost);
      if (!Number.isNaN(amount)) {
        return amount;
      }
    }
    return Number(worker.dailyWage || 0) * Number(workerCount || 1);
  }, [
    params.labourCost,
    params.totalLabourCost,
    params.totalAmount,
    worker.dailyWage,
    workerCount,
  ]);
  const platformFee = Number(firstValue(params.platformFee, 200));
  const taxes = Number(
    firstValue(params.taxes, Math.round(calculatedLabourCost * 0.033)),
  );
  const grandTotal = Number(
    firstValue(params.grandTotal, calculatedLabourCost + platformFee + taxes),
  );
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }
    if (!termsAccepted) {
      Alert.alert(
        'Accept Terms',
        'Please accept the booking terms before confirming.',
      );
      return;
    }
    if (!worker.id) {
      Alert.alert(
        'Labourer Missing',
        'The selected labourer information is missing. Please go back and select a labourer again.',
      );
      return;
    }
    if (!rawBookingDate) {
      Alert.alert(
        'Booking Date Missing',
        'Please select a booking date before confirming.',
      );
      return;
    }
    if (
      !params.workingHours &&
      !params.workHours &&
      !params.timeRange &&
      !params.startTime &&
      !params.fromTime
    ) {
      Alert.alert(
        'Working Time Missing',
        'Please select the working time before confirming.',
      );
      return;
    }
    try {
      setIsSubmitting(true);
      const paymentMethod =
        PAYMENT_METHODS.find(item => item.id === selectedPayment)?.title ||
        'Cash on Work Completion';
      const bookingData = {
        labourerId: worker.id,
        farmName: farmName,
        farmLocation: farmLocation,
        activity: activity,
        workType: activity,
        workerCount: Number(workerCount) || 1,
        bookingDate: rawBookingDate,
        duration:
          firstValue(params.duration, params.selectedDuration) || 'Full Day',
        time: workingHours !== 'Time not specified' ? workingHours : '',
        totalAmount: Number(grandTotal) || 0,
        startTime: firstValue(params.startTime, params.fromTime) || null,
        endTime: firstValue(params.endTime, params.toTime) || null,
        crop: crop,
        farmSize: farmSize,
        distance: distance,
        labourCost: Number(calculatedLabourCost) || 0,
        platformFee: Number(platformFee) || 0,
        taxes: Number(taxes) || 0,
        grandTotal: Number(grandTotal) || 0,
        paymentMethod: paymentMethod,
        paymentMethodId: selectedPayment,
      };
      console.log('========================================');
      console.log('CREATING LABOUR BOOKING:');
      console.log(JSON.stringify(bookingData, null, 2));
      console.log('========================================');
      const response = await createLabourBookingApi(bookingData);
      console.log('========================================');
      console.log('BOOKING CREATED:');
      console.log(JSON.stringify(response, null, 2));
      console.log('========================================');
      if (response?.success === false) {
        throw new Error(response?.message || 'Unable to create booking');
      }
      const createdBooking =
        response?.booking || response?.data?.booking || response?.data || null;
      const booking = {
        bookingId:
          createdBooking?._id ||
          createdBooking?.bookingId ||
          response?.bookingId ||
          `KM-${Date.now()}`,
        _id: createdBooking?._id || null,
        labourerId: worker.id,
        workerId: worker.id,
        worker: {
          _id: worker.id,
          fullName: worker.name,
          profileImage: rawWorker.profileImage || rawWorker.image || '',
          rating: worker.rating,
          totalReviews: worker.reviews,
          experience: worker.experience,
          experienceUnit: worker.experienceUnit,
          expectedWage: worker.dailyWage,
          labourType: worker.labourType,
        },
        workerCount: workerCount,
        activity: activity,
        bookingDate: rawBookingDate,
        workingHours: workingHours,
        startTime: firstValue(params.startTime, params.fromTime) || null,
        endTime: firstValue(params.endTime, params.toTime) || null,
        duration:
          firstValue(params.duration, params.selectedDuration) || 'Full Day',
        time: workingHours,
        farm: {
          name: farmName,
          location: farmLocation,
          distance: distance,
          size: farmSize,
        },
        farmName: farmName,
        farmLocation: farmLocation,
        distance: distance,
        farmSize: farmSize,
        crop: crop,
        pricing: {
          labourCost: calculatedLabourCost,
          platformFee: platformFee,
          taxes: taxes,
          grandTotal: grandTotal,
        },
        labourCost: calculatedLabourCost,
        platformFee: platformFee,
        taxes: taxes,
        grandTotal: grandTotal,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod,
        paymentMethodId: selectedPayment,
        status: createdBooking?.status || response?.status || 'pending',
        createdAt: createdBooking?.createdAt || new Date().toISOString(),
      };
      navigation.replace('LabourBookingSuccess', {
        booking,
      });
    } catch (error) {
      console.log('========================================');
      console.log('CREATE BOOKING ERROR:');
      console.log(error?.response?.data || error?.message || error);
      console.log('========================================');
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create booking. Please try again.';
      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}

      <View style={styles.header}>
        <TouchableOpacity
          disabled={isSubmitting}
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Confirm Booking</Text>

          <Text style={styles.headerSub}>Review your labour booking</Text>
        </View>

        <View
          style={{
            width: 40,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}

        <View style={styles.workerCard}>
          {worker.image ? (
            <Image source={worker.image} style={styles.workerImage} />
          ) : (
            <View style={styles.workerPlaceholder}>
              <Users size={rf(30)} color={GREEN} />
            </View>
          )}

          <View style={styles.workerInfo}>
            <View style={styles.workerNameRow}>
              <Text style={styles.workerName} numberOfLines={1}>
                {worker.name}
              </Text>

              <View style={styles.verifiedPill}>
                <BadgeCheck
                  size={rf(10)}
                  color={DARK_GREEN}
                  strokeWidth={2.5}
                />

                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              <Star size={rf(12)} color="#FACC15" fill="#FACC15" />

              <Text style={styles.rating}>{worker.rating}</Text>

              <Text style={styles.reviews}>({worker.reviews} Reviews)</Text>

              <View style={styles.expPill}>
                <Text style={styles.expText}>
                  {worker.experience} {worker.experienceUnit}
                </Text>
              </View>
            </View>

            <Text style={styles.wage}>
              {formatINR(worker.dailyWage)}

              <Text style={styles.perDay}> / Day</Text>
            </Text>
          </View>
        </View>

        {}

        <Text style={styles.sectionTitle}>Booking Summary</Text>

        <View style={styles.detailsCard}>
          <DetailRow Icon={CalendarDays} label="DATE" value={bookingDate} />

          <DetailRow Icon={Clock3} label="WORKING HOURS" value={workingHours} />

          <DetailRow
            Icon={Users}
            label="WORKERS"
            value={`${workerCount} Workers`}
          />

          <DetailRow Icon={Sprout} label="ACTIVITY" value={activity} last />
        </View>

        {}

        <Text style={styles.sectionTitle}>Farm Location</Text>

        <View style={styles.locationCard}>
          <View style={styles.locIconBox}>
            <MapPin size={rf(19)} color={GREEN} strokeWidth={2.4} />
          </View>

          <View style={styles.locationInfo}>
            <Text style={styles.locName}>{farmName}</Text>

            <Text style={styles.locSub}>{farmLocation}</Text>

            {distance ? <Text style={styles.locDist}>{distance}</Text> : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSubmitting}
            style={styles.mapBtn}
            onPress={() =>
              Alert.alert('Farm Location', `${farmName}\n${farmLocation}`)
            }
          >
            <Text style={styles.mapBtnText}>Map</Text>
          </TouchableOpacity>
        </View>

        {}

        <Text style={styles.sectionTitle}>Price Summary</Text>

        <View style={styles.summaryCard}>
          <SummaryRow
            label={`Labour Cost (${workerCount} Workers × 1 Day)`}
            value={formatINR(calculatedLabourCost)}
          />

          <SummaryRow label="Platform Fee" value={formatINR(platformFee)} />

          <SummaryRow label="Taxes (GST 3.3%)" value={formatINR(taxes)} />

          <View style={styles.divider} />

          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Grand Total</Text>

            <Text style={styles.grandValue}>{formatINR(grandTotal)}</Text>
          </View>
        </View>

        {}

        <Text style={styles.sectionTitle}>Payment Method</Text>

        {PAYMENT_METHODS.map(method => (
          <PaymentCard
            key={method.id}
            method={method}
            selected={selectedPayment === method.id}
            onPress={() => setSelectedPayment(method.id)}
          />
        ))}

        {}

        <View style={styles.cancelCard}>
          <View style={styles.cancelIconBox}>
            <Info size={rf(17)} color={ORANGE} strokeWidth={2.4} />
          </View>

          <View style={styles.cancelInfo}>
            <Text style={styles.cancelTitle}>Free Cancellation</Text>

            <Text style={styles.cancelText}>
              Cancel up to{' '}
              <Text style={styles.boldText}>12 hours before work starts</Text>{' '}
              at no cost. Late cancellations may incur a partial charge of up to
              ₹200.
            </Text>
          </View>
        </View>

        {}

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSubmitting}
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={styles.termsCard}
        >
          <View
            style={[styles.checkbox, termsAccepted && styles.activeCheckbox]}
          >
            {termsAccepted && (
              <Check size={rf(14)} color="#FFFFFF" strokeWidth={3} />
            )}
          </View>

          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>booking terms</Text>{' '}
            and <Text style={styles.termsLink}>labour policy</Text> of
            KhetiMaster. I confirm the booking details are correct.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {}

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>GRAND TOTAL</Text>

          <Text style={styles.bottomValue}>{formatINR(grandTotal)}</Text>

          <Text style={styles.bottomSub}>Incl. all taxes</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isSubmitting}
          onPress={handleConfirm}
          style={[
            styles.confirmBtn,
            !termsAccepted && {
              opacity: 0.55,
            },
            isSubmitting && {
              opacity: 0.7,
            },
          ]}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />

              <Text style={styles.confirmText}>Creating...</Text>
            </>
          ) : (
            <>
              <Text style={styles.confirmText}>Confirm Booking</Text>

              <Check size={rf(17)} color="#FFFFFF" strokeWidth={2.6} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
function DetailRow({ Icon, label, value, last }) {
  return (
    <View
      style={[
        styles.detailRow,
        last && {
          borderBottomWidth: 0,
        },
      ]}
    >
      <View style={styles.detailIconBox}>
        <Icon size={rf(17)} color={GREEN} strokeWidth={2.4} />
      </View>

      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>

        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}
function SummaryRow({ label, value }) {
  return (
    <View style={styles.sRow}>
      <Text style={styles.sLabel}>{label}</Text>

      <Text style={styles.sValue}>{value}</Text>
    </View>
  );
}
function PaymentCard({ method, selected, onPress }) {
  const Icon = method.Icon;
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.payCard, selected && styles.selectedPayCard]}
    >
      <View style={styles.payIconBox}>
        <Icon
          size={rf(19)}
          color={selected ? GREEN : '#5B6575'}
          strokeWidth={2.3}
        />
      </View>

      <View style={styles.payInfo}>
        <View style={styles.payTitleRow}>
          <Text style={styles.payTitle}>{method.title}</Text>

          {method.default && (
            <View style={styles.defaultPill}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>

        <Text style={styles.paySub}>{method.subtitle}</Text>
      </View>

      <View style={[styles.radio, selected && styles.activeRadio]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.037,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  headerSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingTop: 14,
    paddingBottom: 120,
    backgroundColor: '#FAFBFA',
  },
  workerCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
  },
  workerImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  workerPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerName: {
    flexShrink: 1,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  verifiedPill: {
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK_GREEN,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  rating: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  reviews: {
    fontSize: rf(11),
    color: MUTED,
  },
  expPill: {
    marginLeft: 5,
    paddingHorizontal: 7,
    minHeight: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK,
  },
  wage: {
    marginTop: 6,
    fontSize: rf(16),
    fontWeight: '900',
    color: GREEN,
  },
  perDay: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  detailsCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  detailRow: {
    minHeight: 68,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#98A1AF',
  },
  detailValue: {
    marginTop: 3,
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  locationCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  locSub: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  locDist: {
    marginTop: 3,
    fontSize: rf(11),
    color: GREEN,
    fontWeight: '800',
  },
  mapBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBtnText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  sRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  sLabel: {
    flex: 1,
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '500',
  },
  sValue: {
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  grandRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandLabel: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  grandValue: {
    fontSize: rf(20),
    fontWeight: '900',
    color: GREEN,
  },
  payCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPayCard: {
    borderColor: GREEN,
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  payIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payInfo: {
    flex: 1,
    marginLeft: 12,
  },
  payTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payTitle: {
    flexShrink: 1,
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  paySub: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  defaultPill: {
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#B45309',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D8DDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRadio: {
    borderColor: GREEN,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
  },
  cancelCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
  },
  cancelIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cancelTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  cancelText: {
    marginTop: 4,
    fontSize: rf(11),
    lineHeight: rf(16),
    color: MUTED,
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '900',
    color: DARK,
  },
  termsCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheckbox: {
    backgroundColor: DARK_GREEN,
    borderColor: DARK_GREEN,
  },
  termsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: rf(11),
    lineHeight: rf(16),
    color: MUTED,
    fontWeight: '500',
  },
  termsLink: {
    color: DARK_GREEN,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 82,
    paddingHorizontal: width * 0.037,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLabel: {
    fontSize: rf(10),
    color: '#94A3B8',
    fontWeight: '800',
  },
  bottomValue: {
    marginTop: 2,
    fontSize: rf(22),
    color: DARK_GREEN,
    fontWeight: '900',
  },
  bottomSub: {
    fontSize: rf(10),
    color: MUTED,
  },
  confirmBtn: {
    minWidth: 170,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmText: {
    fontSize: rf(15),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
