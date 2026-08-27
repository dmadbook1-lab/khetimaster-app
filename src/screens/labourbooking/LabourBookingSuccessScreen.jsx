import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Check,
  Phone,
  MessageCircle,
  MapPin,
  Clock3,
  Users,
  Sprout,
  Hash,
  Cloud,
  User,
  CalendarDays,
  Briefcase,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK_GREEN = '#158B3D';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const getImageSource = image => {
  if (!image) {
    return require('../../assets/labour/worker-1.jpg');
  }
  if (typeof image === 'number') {
    return image;
  }
  if (typeof image === 'object' && image.uri) {
    return image;
  }
  if (typeof image === 'string' && image.trim().length > 0) {
    const uri = image.trim();
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return {
        uri,
      };
    }
  }
  return require('../../assets/labour/worker-1.jpg');
};
const formatINR = value => {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
};
const getWorkerName = worker => {
  if (!worker) {
    return 'Labour Worker';
  }
  return (
    worker.name || worker.fullName || worker.user?.fullName || 'Labour Worker'
  );
};
const getWorkerPhone = worker => {
  if (!worker) {
    return '';
  }
  return worker.phoneNumber || worker.phone || worker.user?.phoneNumber || '';
};
const getWorkerImage = worker => {
  if (!worker) {
    return null;
  }
  return (
    worker.profileImage ||
    worker.image ||
    worker.profilePhoto ||
    worker.photo ||
    null
  );
};
const getWorkerExperience = worker => {
  if (!worker) {
    return '';
  }
  if (worker.experience) {
    return `${worker.experience} ${worker.experienceUnit || 'Years'} Exp`;
  }
  return '';
};
const getWorkerSkills = worker => {
  if (!worker) {
    return 'Agricultural Labour';
  }
  if (Array.isArray(worker.preferredWork) && worker.preferredWork.length > 0) {
    return worker.preferredWork.join(' · ');
  }
  if (Array.isArray(worker.skills) && worker.skills.length > 0) {
    return worker.skills.join(' · ');
  }
  if (worker.skills) {
    return worker.skills;
  }
  return 'Agricultural Labour';
};
export default function LabourBookingSuccessScreen({ navigation, route }) {
  const labourForm = useSelector(state => state.labour?.formData || {});
  const labourerState = useSelector(state => state.labourer || {});
  const params = route?.params || {};
  const booking = params.booking || params.bookingData || {};
  const worker =
    params.worker ||
    params.labourer ||
    booking.worker ||
    booking.labourer ||
    labourerState.selectedLabourer ||
    labourerState.myProfile ||
    null;
  const bookingId =
    params.bookingId ||
    booking.bookingId ||
    booking._id ||
    booking.id ||
    'Pending';
  const activity =
    params.activity ||
    booking.activity ||
    booking.workType ||
    booking.work ||
    (Array.isArray(worker?.preferredWork) && worker.preferredWork.length > 0
      ? worker.preferredWork[0]
      : null) ||
    'Agricultural Work';
  const workerCount =
    Number(
      params.workerCount || booking.workerCount || booking.numberOfWorkers || 1,
    ) || 1;
  const bookingDate =
    params.date || booking.date || booking.workDate || 'Scheduled Date';
  const startTime = params.startTime || booking.startTime || '08:00 AM';
  const endTime = params.endTime || booking.endTime || '05:00 PM';
  const farmName =
    params.farmName || booking.farmName || booking.farm?.name || 'Farm';
  const farmLocation =
    params.farmLocation ||
    booking.farmLocation ||
    booking.farm?.location ||
    booking.location ||
    'Farm location';
  const distance =
    params.distance || booking.distance || booking.distanceKm || null;
  const grandTotal =
    params.grandTotal ?? booking.grandTotal ?? booking.totalAmount ?? 0;
  const paymentMethod =
    params.paymentMethod || booking.paymentMethod || 'Cash on Work Completion';
  const workerImage = getImageSource(getWorkerImage(worker));
  const workerName = getWorkerName(worker);
  const workerPhone = getWorkerPhone(worker);
  const workerExperience = getWorkerExperience(worker);
  const workerSkills = getWorkerSkills(worker);
  const workerRating = worker?.rating || worker?.averageRating || '—';
  const handleCall = () => {
    if (!workerPhone) {
      return;
    }
    Linking.openURL(`tel:${workerPhone}`);
  };
  const handleMessage = () => {
    if (!workerPhone) {
      return;
    }
    Linking.openURL(`sms:${workerPhone}`);
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {}

        <ImageBackground
          source={require('../../assets/labour/success-hero.jpg')}
          style={styles.hero}
        >
          <LinearGradient
            colors={['rgba(21,139,61,0.15)', 'rgba(21,139,61,0.88)']}
            style={styles.heroOverlay}
          >
            <View style={styles.idPill}>
              <Text style={styles.idText}>ID: {bookingId}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.checkCircle}>
          <Check size={rf(32)} color="#FFFFFF" strokeWidth={3.5} />
        </View>

        {}

        <View
          style={{
            padding: width * 0.037,
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>
            Labour Booked{' '}
            <Text
              style={{
                color: GREEN,
              }}
            >
              Successfully!
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Your booking has been confirmed.
            {'\n'}
            The selected worker has been notified.
          </Text>

          <View style={styles.confirmedPill}>
            <View style={styles.dot} />

            <Text style={styles.confirmedText}>
              Booking Confirmed · {bookingDate}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: width * 0.037,
          }}
        >
          {}

          <Text style={styles.sectionTitle}>Assigned Worker</Text>

          <View style={styles.workerCard}>
            <Image
              source={workerImage}
              style={styles.workerImage}
              resizeMode="cover"
            />

            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <Text style={styles.workerName}>{workerName}</Text>

                <View style={styles.verifiedPill}>
                  <Check size={rf(10)} color="#FFFFFF" strokeWidth={3} />

                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <Text style={styles.workerSkills}>{workerSkills}</Text>

              {workerExperience ? (
                <Text style={styles.workerExperience}>{workerExperience}</Text>
              ) : null}

              <Text style={styles.workerRating}>★ {workerRating}</Text>
            </View>
          </View>

          {}

          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.summaryCard}>
            <SummaryDetail Icon={Hash} label="Booking ID" value={bookingId} />

            <SummaryDetail
              Icon={CalendarDays}
              label="Date"
              value={bookingDate}
            />

            <SummaryDetail
              Icon={Users}
              label="Workers"
              value={`${workerCount} Worker${workerCount > 1 ? 's' : ''}`}
            />

            <SummaryDetail Icon={Sprout} label="Activity" value={activity} />

            <SummaryDetail
              Icon={Clock3}
              label="Working Hours"
              value={`${startTime} - ${endTime}`}
            />

            <SummaryDetail Icon={MapPin} label="Farm" value={farmName} />

            <SummaryDetail
              Icon={MapPin}
              label="Location"
              value={farmLocation}
            />

            <SummaryDetail
              Icon={Briefcase}
              label="Payment"
              value={paymentMethod}
              last
            />
          </View>

          {}

          <Text style={styles.sectionTitle}>Farm Location</Text>

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <MapPin size={rf(20)} color={GREEN} strokeWidth={2.4} />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <Text style={styles.locationName}>{farmName}</Text>

              <Text style={styles.locationText}>{farmLocation}</Text>

              {distance ? (
                <Text style={styles.distanceText}>{distance} km away</Text>
              ) : null}
            </View>
          </View>

          {}

          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.paymentCard}>
            <View>
              <Text style={styles.paymentLabel}>Payment Method</Text>

              <Text style={styles.paymentMethod}>{paymentMethod}</Text>
            </View>

            <View
              style={{
                alignItems: 'flex-end',
              }}
            >
              <Text style={styles.paymentLabel}>Total</Text>

              <Text style={styles.totalValue}>{formatINR(grandTotal)}</Text>
            </View>
          </View>

          {}

          <Text style={styles.sectionTitle}>Contact Worker</Text>

          <View style={styles.contactCard}>
            <Image
              source={workerImage}
              style={styles.contactImage}
              resizeMode="cover"
            />

            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <Text style={styles.contactName}>{workerName}</Text>

              <Text style={styles.contactSub}>
                {workerPhone || 'Phone number unavailable'}
              </Text>
            </View>

            <View
              style={{
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={handleCall}
                disabled={!workerPhone}
                style={[
                  styles.callBtn,
                  !workerPhone && {
                    opacity: 0.4,
                  },
                ]}
              >
                <Phone size={rf(17)} color={GREEN} strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMessage}
                disabled={!workerPhone}
                style={[
                  styles.chatBtn,
                  !workerPhone && {
                    opacity: 0.4,
                  },
                ]}
              >
                <MessageCircle
                  size={rf(17)}
                  color="#3B82F6"
                  strokeWidth={2.4}
                />
              </TouchableOpacity>
            </View>
          </View>

          {}

          <Text style={styles.sectionTitle}>AI Reminder</Text>

          <LinearGradient colors={['#158B3D', '#18A84A']} style={styles.aiCard}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View style={styles.aiIconBox}>
                <Cloud size={rf(19)} color="#FFFFFF" />
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.aiTitle}>Smart Farming Reminder</Text>

                <Text style={styles.aiSub}>Booking information</Text>
              </View>
            </View>

            <View style={styles.aiInfoBox}>
              <Text style={styles.aiInfoText}>
                Your labour booking is confirmed. Keep the farm ready before the
                scheduled start time.
              </Text>
            </View>

            <View style={styles.aiBottom}>
              <View>
                <Text style={styles.aiLabel}>Scheduled Start</Text>

                <Text style={styles.aiValue}>{startTime}</Text>
              </View>

              <View style={styles.aiStatus}>
                <Check size={rf(13)} color="#FFFFFF" strokeWidth={3} />

                <Text style={styles.aiStatusText}>Confirmed</Text>
              </View>
            </View>
          </LinearGradient>

          {}

          <Text style={styles.sectionTitle}>Booking Status</Text>

          <View style={styles.statusCard}>
            <StatusStep title="Booking Confirmed" active first />

            <StatusStep title="Worker Notified" active />

            <StatusStep title="Work Started" />

            <StatusStep title="Work Completed" />

            <StatusStep title="Payment" last />
          </View>

          {}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.trackBtn}
            onPress={() => {}}
          >
            <MapPin size={rf(17)} color="#FFFFFF" strokeWidth={2.4} />

            <Text style={styles.trackText}>Track Worker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Bazaar')}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back to Bazaar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function SummaryDetail({ Icon, label, value, last }) {
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
        <Icon size={rf(15)} color={GREEN} strokeWidth={2.4} />
      </View>

      <Text style={styles.detailLabel}>{label}</Text>

      <Text style={styles.detailValue} numberOfLines={2}>
        {String(value || '—')}
      </Text>
    </View>
  );
}
function StatusStep({ title, active = false, first = false, last = false }) {
  return (
    <View style={styles.statusStep}>
      <View style={styles.statusIndicatorColumn}>
        <View
          style={[styles.statusCircle, active && styles.activeStatusCircle]}
        >
          {active && <Check size={rf(12)} color="#FFFFFF" strokeWidth={3} />}
        </View>

        {!last && (
          <View
            style={[styles.statusLine, active && styles.activeStatusLine]}
          />
        )}
      </View>

      <Text style={[styles.statusTitle, active && styles.activeStatusTitle]}>
        {title}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    width: '100%',
    height: 240,
  },
  heroOverlay: {
    flex: 1,
    padding: 14,
    alignItems: 'flex-end',
  },
  idPill: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  checkCircle: {
    position: 'absolute',
    top: 212,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  title: {
    marginTop: 40,
    fontSize: rf(23),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: rf(13),
    color: MUTED,
    textAlign: 'center',
    lineHeight: rf(19),
  },
  confirmedPill: {
    marginTop: 16,
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  confirmedText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  workerCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
  },
  workerName: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  workerSkills: {
    marginTop: 5,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  workerExperience: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
  },
  workerRating: {
    marginTop: 5,
    fontSize: rf(11),
    color: '#F59E0B',
    fontWeight: '900',
  },
  verifiedPill: {
    paddingHorizontal: 8,
    height: 21,
    borderRadius: 11,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  detailRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '600',
  },
  detailValue: {
    maxWidth: width * 0.42,
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
    textAlign: 'right',
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
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  locationText: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  distanceText: {
    marginTop: 4,
    fontSize: rf(11),
    color: GREEN,
    fontWeight: '800',
  },
  paymentCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '700',
  },
  paymentMethod: {
    marginTop: 4,
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
    maxWidth: width * 0.55,
  },
  totalValue: {
    marginTop: 3,
    fontSize: rf(20),
    color: GREEN,
    fontWeight: '900',
  },
  contactCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
  },
  contactName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  contactSub: {
    marginTop: 4,
    fontSize: rf(11),
    color: MUTED,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCard: {
    borderRadius: 14,
    padding: 16,
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: '#DCFCE7',
  },
  aiInfoBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  aiInfoText: {
    fontSize: rf(11),
    lineHeight: rf(17),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiBottom: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiLabel: {
    fontSize: rf(10),
    color: '#DCFCE7',
    fontWeight: '700',
  },
  aiValue: {
    marginTop: 3,
    fontSize: rf(18),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  aiStatus: {
    paddingHorizontal: 11,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiStatusText: {
    fontSize: rf(11),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  statusCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  statusStep: {
    flexDirection: 'row',
    minHeight: 50,
  },
  statusIndicatorColumn: {
    width: 30,
    alignItems: 'center',
  },
  statusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusCircle: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  statusLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  activeStatusLine: {
    backgroundColor: GREEN,
  },
  statusTitle: {
    marginLeft: 12,
    paddingTop: 4,
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '600',
  },
  activeStatusTitle: {
    color: DARK,
    fontWeight: '900',
  },
  trackBtn: {
    marginTop: 22,
    height: 56,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trackText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  backBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: GREEN,
  },
});
