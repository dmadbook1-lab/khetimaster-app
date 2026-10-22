import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Leaf,
  PawPrint,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero, { CareGlassButton } from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareChips,
  CareEmpty,
  CareLoading,
  CareSectionTitle,
} from '../../components/doctor/CareBits';
import {
  CARE as C,
  CARE_GRADIENTS,
  CARE_SHADOW,
  CARE_SHADOW_STRONG,
  DOCTOR_BANNER,
} from '../../components/doctor/careTheme';
import DoctorCard from '../../components/doctor/DoctorCard';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import useDoctorMeta from '../../components/doctor/useDoctorMeta';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import {
  fetchDoctors,
  fetchMyDoctorProfile,
} from '../../redux/slices/doctorSlice';
import { fetchMyConsultations } from '../../redux/slices/doctorConsultationSlice';
import {
  dayKeyOf,
  formatDay,
  formatTime,
  todayInIndiaKey,
} from '../../utils/indiaSchedule';
import { STATUS_META, isAcceptedStatus } from '../../utils/doctorFormat';

const STEPS = [
  { icon: Search, title: 'Pick a doctor', text: 'Vet or crop expert near you' },
  {
    icon: CalendarCheck,
    title: 'Choose a time',
    text: 'Tell them the problem',
  },
  { icon: Phone, title: 'Get advice', text: 'Call or visit after accept' },
];

export default function DoctorHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const meta = useDoctorMeta();
  const todayKey = todayInIndiaKey();

  const { list, listLoading, listError } = useSelector(state => state.doctor);
  const { myProfile, myProfileStatus } = useSelector(state => state.doctor);
  const upcoming = useSelector(
    state => state.doctorConsultation.myConsultations.items,
  );

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([
        dispatch(fetchDoctors({ params: { sort: 'rating', limit: 5 } })),
        dispatch(
          fetchMyConsultations({ params: { status: 'active', limit: 5 } }),
        ),
        dispatch(fetchMyDoctorProfile()),
      ]),
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openList = params => navigation.navigate(DOCTOR_ROUTES.LIST, params);

  const next = [...upcoming]
    .filter(item => dayKeyOf(item.consultationDate) >= todayKey)
    .sort((a, b) =>
      `${dayKeyOf(a.consultationDate)}${a.startTime}`.localeCompare(
        `${dayKeyOf(b.consultationDate)}${b.startTime}`,
      ),
    )[0];

  const isDoctor = myProfileStatus === 'loaded' && !!myProfile;
  const pendingRequests = myProfile?.pendingRequests || 0;

  const specialities = [
    ...(meta.specializations?.veterinarian || []).slice(0, 4).map(item => ({
      key: `veterinarian|${item}`,
      label: item,
    })),
    ...(meta.specializations?.agriculturalDoctor || [])
      .slice(0, 4)
      .map(item => ({ key: `agriculturalDoctor|${item}`, label: item })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
      >
        <CareHero
          banner={DOCTOR_BANNER}
          onBack={() => navigation.goBack()}
          right={
            <>
              <CareGlassButton
                onPress={() =>
                  navigation.navigate(DOCTOR_ROUTES.MY_CONSULTATIONS)
                }
              >
                <CalendarCheck size={19} color={C.white} />
              </CareGlassButton>
              {isDoctor && (
                <CareGlassButton
                  badge={pendingRequests}
                  onPress={() => navigation.navigate(DOCTOR_ROUTES.DASHBOARD)}
                >
                  <Stethoscope size={19} color={C.white} />
                </CareGlassButton>
              )}
            </>
          }
          eyebrow="Doctor & Vet"
          title={'Sick animal?\nCrop trouble?'}
          subtitle="Book a vet or crop doctor near you. Phone numbers are shared once they accept."
        />

        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Search size={18} color={C.teal} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search doctor, speciality..."
              placeholderTextColor={C.placeholder}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => openList({ search: search.trim() })}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.searchGo}
              onPress={() => openList({ search: search.trim() })}
            >
              <ArrowRight size={16} color={C.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* WHO DO YOU NEED */}
          <CareSectionTitle title="Who do you need?" />
          <View style={styles.typeRow}>
            {[
              {
                key: 'veterinarian',
                icon: PawPrint,
                title: 'Veterinarian',
                text: 'Cows, buffaloes, goats, poultry & pets',
                gradient: CARE_GRADIENTS.vet,
              },
              {
                key: 'agriculturalDoctor',
                icon: Leaf,
                title: 'Crop Doctor',
                text: 'Pests, leaf disease, soil & nutrients',
                gradient: CARE_GRADIENTS.crop,
              },
            ].map(({ key, icon: Icon, title, text, gradient }) => (
              <TouchableOpacity
                key={key}
                activeOpacity={0.9}
                style={styles.typeWrap}
                onPress={() => openList({ doctorType: key })}
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.typeCard}
                >
                  <View style={styles.typeIcon}>
                    <Icon size={22} color={C.white} />
                  </View>
                  <Text style={styles.typeTitle}>{title}</Text>
                  <Text style={styles.typeText}>{text}</Text>
                  <View style={styles.typeLink}>
                    <Text style={styles.typeLinkText}>Find</Text>
                    <ArrowRight size={13} color={C.white} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* NEXT CONSULTATION */}
          {!!next && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.nextCard}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.CONSULTATION, {
                  consultationId: next._id,
                })
              }
            >
              <DoctorAvatar
                name={next.doctor?.fullName}
                image={next.doctor?.profileImage}
                doctorType={next.doctor?.doctorType}
                size={50}
              />
              <View style={styles.flex}>
                <Text style={styles.nextLabel}>
                  {isAcceptedStatus(next.status)
                    ? 'Your next consultation'
                    : 'Waiting for the doctor'}
                </Text>
                <Text style={styles.nextName} numberOfLines={1}>
                  {next.doctor?.fullName || 'Doctor'}
                </Text>
                <Text style={styles.nextWhen}>
                  {dayKeyOf(next.consultationDate) === todayKey
                    ? 'Today'
                    : formatDay(next.consultationDate, { year: false })}{' '}
                  · {formatTime(next.startTime)}
                </Text>
              </View>
              <View
                style={[
                  styles.nextStatus,
                  { backgroundColor: STATUS_META[next.status]?.bg },
                ]}
              >
                <Text
                  style={[
                    styles.nextStatusText,
                    { color: STATUS_META[next.status]?.color },
                  ]}
                >
                  {STATUS_META[next.status]?.label}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* SPECIALITIES */}
          {specialities.length > 0 && (
            <>
              <CareSectionTitle title="Popular specialities" />
              <CareChips
                scroll
                options={specialities}
                value={null}
                onChange={key => {
                  const [doctorType, specialization] = key.split('|');
                  openList({ doctorType, specialization });
                }}
                style={styles.chips}
              />
            </>
          )}

          {/* TOP DOCTORS */}
          <CareSectionTitle
            title="Top rated doctors"
            action="See all"
            onAction={() => openList({})}
          />
          <View style={styles.list}>
            {listLoading && !list.length ? (
              <CareLoading />
            ) : listError && !list.length ? (
              <CareEmpty
                icon={<Stethoscope size={30} color={C.teal} />}
                title="Couldn't load doctors"
                message={listError}
                actionLabel="Try Again"
                onAction={load}
              />
            ) : !list.length ? (
              <CareEmpty
                icon={<Stethoscope size={30} color={C.teal} />}
                title="No doctors available yet"
                message="Doctors who join KhetiMaster will show up here."
              />
            ) : (
              list.slice(0, 5).map(doctor => (
                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                  onPress={() =>
                    navigation.navigate(DOCTOR_ROUTES.PROFILE, {
                      doctorId: doctor._id,
                    })
                  }
                />
              ))
            )}
          </View>

          {/* HOW IT WORKS */}
          <CareSectionTitle title="How it works" />
          <View style={styles.steps}>
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <View key={title} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Icon size={18} color={C.teal} />
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* DOCTOR ENTRY */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.joinCard}
            onPress={() => navigation.navigate(DOCTOR_ROUTES.DASHBOARD)}
          >
            <View style={styles.joinIcon}>
              <Stethoscope size={22} color={C.teal} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.joinTitle}>
                {isDoctor ? 'Doctor dashboard' : 'Are you a doctor or vet?'}
              </Text>
              <Text style={styles.joinText}>
                {isDoctor
                  ? pendingRequests
                    ? `${pendingRequests} new requests waiting for you`
                    : 'See your requests and schedule'
                  : 'Join free and get consultation requests from farmers'}
              </Text>
            </View>
            <ChevronRight size={20} color={C.white} />
          </TouchableOpacity>

          <View style={styles.trust}>
            <ShieldCheck size={14} color={C.muted} />
            <Text style={styles.trustText}>
              Your phone number is shared only after the doctor accepts.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 40 },
  searchWrap: { paddingHorizontal: 16, marginTop: 16 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },

  searchBox: {
    height: 54,
    borderRadius: 27,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    ...CARE_SHADOW_STRONG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
    paddingVertical: 0,
    fontWeight: '600',
  },
  searchGo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  typeWrap: { flex: 1, borderRadius: 24, ...CARE_SHADOW },
  typeCard: { borderRadius: 24, padding: 15, minHeight: 168 },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: { color: C.white, fontSize: 16, fontWeight: '900', marginTop: 14 },
  typeText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 16,
  },
  typeLink: {
    marginTop: 'auto',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeLinkText: { color: C.white, fontSize: 12, fontWeight: '900' },

  nextCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.mint,
    ...CARE_SHADOW,
  },
  nextLabel: { fontSize: 11, fontWeight: '800', color: C.teal },
  nextName: { fontSize: 15, fontWeight: '900', color: C.ink, marginTop: 1 },
  nextWhen: { fontSize: 12, fontWeight: '700', color: C.text, marginTop: 2 },
  nextStatus: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  nextStatusText: { fontSize: 10.5, fontWeight: '900' },

  chips: { marginTop: 12 },
  list: { marginTop: 12 },

  steps: { flexDirection: 'row', gap: 8, marginTop: 12 },
  step: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF3F2',
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: C.navy,
    color: C.white,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 17,
  },
  stepTitle: { fontSize: 12, fontWeight: '900', color: C.ink, marginTop: 9 },
  stepText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
    lineHeight: 14,
  },

  joinCard: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: C.navy,
  },
  joinIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTitle: { color: C.white, fontSize: 15, fontWeight: '900' },
  joinText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 16,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  trustText: { fontSize: 11.5, fontWeight: '600', color: C.muted },
});
