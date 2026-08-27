import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  Sun,
  Calendar,
  MapPin,
  Check,
  IndianRupee,
  BriefcaseBusiness,
  Users,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createLabourer } from '../../redux/slices/labourerSlice';
import {
  setLabourFormData,
  resetLabourForm,
} from '../../redux/slices/labourSlice';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
const AVAILABILITY = [
  {
    id: 'today',
    label: 'From Today',
    Icon: CalendarDays,
  },
  {
    id: 'tomorrow',
    label: 'From Tomorrow',
    Icon: Sun,
  },
  {
    id: 'later',
    label: 'Later',
    Icon: Calendar,
  },
];
const DISTANCES = ['5 KM', '10 KM', '20 KM', 'Anywhere'];
const WAGE_TYPES = [
  {
    id: 'daily',
    label: 'Per Day',
  },
  {
    id: 'hourly',
    label: 'Per Hour',
  },
];
const EXPERIENCE_OPTIONS = ['0', '1', '2', '3', '5', '10'];
const ARRANGEMENTS = [
  {
    id: 'single',
    label: 'Single',
    sub: 'I work alone',
  },
  {
    id: 'couple',
    label: 'Couple',
    sub: 'Two workers',
  },
  {
    id: 'group',
    label: 'Group',
    sub: 'Multiple workers',
  },
];
export default function FindWorkStep4Screen({ navigation }) {
  const dispatch = useDispatch();
  const formData = useSelector(state => state?.labour?.formData || {});
  const isCreating = useSelector(state => state?.labourer?.isCreating || false);
  const apiError = useSelector(state => state?.labourer?.error || null);
  const selectedWorkTypes = Array.isArray(formData.preferredWork)
    ? formData.preferredWork
    : [];
  const [availability, setAvailability] = useState(
    formData.availability || 'today',
  );
  const [distance, setDistance] = useState(formData.workDistance || '10 KM');
  const [wageType, setWageType] = useState(formData.wageType || 'daily');
  const [wage, setWage] = useState(
    formData.expectedWage ? String(formData.expectedWage) : '',
  );
  const [experience, setExperience] = useState(
    formData.experience !== undefined ? String(formData.experience) : '',
  );
  const [experienceUnit, setExperienceUnit] = useState(
    formData.experienceUnit || 'years',
  );
  const [workerArrangement, setWorkerArrangement] = useState(
    formData.workerArrangement || 'single',
  );
  const [customWage, setCustomWage] = useState(
    formData.expectedWage ? String(formData.expectedWage) : '',
  );
  const displayWage = useMemo(
    () => wage || customWage || '',
    [wage, customWage],
  );
  const validate = () => {
    if (!formData.fullName?.trim()) {
      Alert.alert('Missing Details', 'Please enter your name in Step 3.');
      return false;
    }
    if (!formData.phoneNumber?.trim()) {
      Alert.alert(
        'Missing Phone',
        'Your verified phone number could not be found.',
      );
      return false;
    }
    if (!formData.village?.trim()) {
      Alert.alert('Missing Village', 'Please enter your village in Step 3.');
      return false;
    }
    if (selectedWorkTypes.length === 0) {
      Alert.alert(
        'Work Type Required',
        'Please select at least one type of work.',
      );
      return false;
    }
    if (!displayWage.trim()) {
      Alert.alert('Wage Required', 'Please enter your expected wage.');
      return false;
    }
    const numericWage = Number(displayWage);
    if (!Number.isFinite(numericWage) || numericWage <= 0) {
      Alert.alert('Invalid Wage', 'Please enter a valid wage amount.');
      return false;
    }
    if (experience === '' || Number(experience) < 0) {
      Alert.alert('Experience Required', 'Please select your experience.');
      return false;
    }
    return true;
  };
  const getAvailabilityValue = () => {
    return 'available';
  };
  const getLabourType = () => {
    return 'Farm Labourer';
  };
  const handleStartWorking = async () => {
    if (!validate()) {
      return;
    }
    const numericWage = Number(displayWage);
    const numericExperience = Number(experience);
    dispatch(
      setLabourFormData({
        availability,
        workDistance: distance,
        wageType,
        expectedWage: numericWage,
        experience: numericExperience,
        experienceUnit,
        workerArrangement,
      }),
    );
    const labourerData = {
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber
        .replace('+91', '')
        .replace(/\s/g, '')
        .trim(),
      profileImage: formData.profileImage || '',
      gender: formData.gender || 'other',
      age: Number(formData.age) || 0,
      labourType: getLabourType(),
      skills: selectedWorkTypes,
      experience: numericExperience,
      experienceUnit: experienceUnit || 'years',
      expectedWage: numericWage,
      wageType: wageType || 'daily',
      availability: getAvailabilityValue(),
      availableFrom: null,
      availableUntil: null,
      state: formData.state || 'Kerala',
      district: formData.district || '',
      village: formData.village.trim(),
      languages: formData.languages || ['Malayalam'],
      preferredWork: selectedWorkTypes,
      profileCompleted: true,
      isActive: true,
    };
    console.log(
      'CREATE LABOURER PAYLOAD:',
      JSON.stringify(labourerData, null, 2),
    );
    try {
      const result = await dispatch(createLabourer(labourerData)).unwrap();
      console.log('LABOURER CREATED:', result);
      dispatch(
        setLabourFormData({
          availability,
          workDistance: distance,
          wageType,
          expectedWage: numericWage,
          experience: numericExperience,
          experienceUnit,
          workerArrangement,
        }),
      );
      navigation.replace('FindWorkSuccess', {
        labourer: result?.labourer || result,
      });
      setTimeout(() => {
        dispatch(resetLabourForm());
      }, 500);
    } catch (error) {
      console.log('CREATE LABOURER ERROR:', error);
      Alert.alert(
        'Registration Failed',
        typeof error === 'string'
          ? error
          : error?.message ||
              apiError ||
              'Unable to create your labour profile. Please try again.',
      );
    }
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(20)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.title}>Find Work</Text>

        <Text style={styles.stepText}>Step 4 of 4</Text>
      </View>

      {}

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map(item => (
          <View key={item} style={[styles.progressBar, styles.activeBar]} />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={require('../../assets/labour/hero7.jpg')}
          style={styles.heroImage}
        />

        <Text style={styles.mainTitle}>Ready to work?</Text>

        <Text style={styles.subtitle}>
          Set your availability, wage and work preferences.
        </Text>

        {}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <CalendarDays size={rf(15)} color={GREEN} strokeWidth={2.4} />

            <Text style={styles.label}>When are you available?</Text>
          </View>

          <View style={styles.availRow}>
            {AVAILABILITY.map(item => {
              const Icon = item.Icon;
              const active = availability === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setAvailability(item.id)}
                  style={[styles.availCard, active && styles.activeAvailCard]}
                >
                  <Icon
                    size={rf(24)}
                    color={active ? GREEN : MUTED}
                    strokeWidth={2.2}
                  />

                  <Text
                    style={[
                      styles.availLabel,
                      active && {
                        color: GREEN,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>

                  <View
                    style={[
                      styles.availCheck,
                      active && styles.activeAvailCheck,
                    ]}
                  >
                    {active && (
                      <Check size={rf(10)} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <IndianRupee size={rf(15)} color={GREEN} strokeWidth={2.4} />

            <Text style={styles.label}>Expected wage</Text>
          </View>

          <View style={styles.wageInputRow}>
            <View style={styles.rupeeCircle}>
              <IndianRupee size={rf(18)} color={GREEN} strokeWidth={2.5} />
            </View>

            <TextInput
              value={customWage}
              onChangeText={value => {
                const cleaned = value.replace(/[^0-9]/g, '');
                setCustomWage(cleaned);
                setWage(cleaned);
              }}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor="#94A3B8"
              style={styles.wageInput}
            />
          </View>

          <Text style={styles.helperText}>
            Enter the amount you expect for your selected wage type.
          </Text>

          <View style={styles.chipRow}>
            {['500', '600', '700', '800', '1000'].map(item => {
              const active = displayWage === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => {
                    setWage(item);
                    setCustomWage(item);
                  }}
                  style={[styles.wageChip, active && styles.activeWageChip]}
                >
                  <Text
                    style={[
                      styles.wageChipText,
                      active && {
                        color: GREEN,
                      },
                    ]}
                  >
                    ₹{item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.subLabelRow}>
            <Text style={styles.subLabel}>Wage basis</Text>
          </View>

          <View style={styles.wageTypeRow}>
            {WAGE_TYPES.map(item => {
              const active = wageType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setWageType(item.id)}
                  style={[
                    styles.wageTypeCard,
                    active && styles.activeWageTypeCard,
                  ]}
                >
                  <Text
                    style={[
                      styles.wageTypeText,
                      active && {
                        color: GREEN,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>

                  {active && (
                    <View style={styles.miniCheck}>
                      <Check size={rf(10)} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <BriefcaseBusiness size={rf(15)} color={GREEN} strokeWidth={2.4} />

            <Text style={styles.label}>Work experience</Text>
          </View>

          <View style={styles.chipRow}>
            {EXPERIENCE_OPTIONS.map(item => {
              const active = experience === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setExperience(item)}
                  style={[
                    styles.experienceChip,
                    active && styles.activeExperienceChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.experienceText,
                      active && {
                        color: GREEN,
                      },
                    ]}
                  >
                    {item === '0' ? 'No experience' : `${item}+ yrs`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Users size={rf(15)} color={GREEN} strokeWidth={2.4} />

            <Text style={styles.label}>How do you work?</Text>
          </View>

          <View style={styles.arrangementList}>
            {ARRANGEMENTS.map(item => {
              const active = workerArrangement === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setWorkerArrangement(item.id)}
                  style={[
                    styles.arrangementCard,
                    active && styles.activeArrangementCard,
                  ]}
                >
                  <View style={styles.arrangementIcon}>
                    <Users
                      size={rf(18)}
                      color={active ? GREEN : MUTED}
                      strokeWidth={2.3}
                    />
                  </View>

                  <View style={styles.arrangementText}>
                    <Text
                      style={[
                        styles.arrangementTitle,
                        active && {
                          color: GREEN,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                    <Text style={styles.arrangementSub}>{item.sub}</Text>
                  </View>

                  <View style={[styles.radio, active && styles.activeRadio]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <MapPin size={rf(15)} color="#F97316" strokeWidth={2.4} />

            <Text style={styles.label}>How far will you work?</Text>
          </View>

          <View style={styles.distanceRow}>
            {DISTANCES.map(item => {
              const active = distance === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setDistance(item)}
                  style={[
                    styles.distancePill,
                    active && styles.activeDistancePill,
                  ]}
                >
                  <Text
                    style={[
                      styles.distanceText,
                      active && {
                        color: GREEN,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Your profile</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Name</Text>

            <Text style={styles.summaryValue}>{formData.fullName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Work</Text>

            <Text style={styles.summaryValue}>
              {selectedWorkTypes.join(', ')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Wage</Text>

            <Text style={styles.summaryValue}>
              ₹{displayWage} / {wageType === 'daily' ? 'day' : 'hour'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Arrangement</Text>

            <Text style={styles.summaryValue}>{workerArrangement}</Text>
          </View>
        </View>

        {}

        {apiError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}
      </ScrollView>

      {}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isCreating}
          onPress={handleStartWorking}
          style={[styles.nextBtn, isCreating && styles.disabledBtn]}
        >
          {isCreating ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />

              <Text style={styles.nextText}>Creating Profile...</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextText}>Start Working</Text>

              <Check size={rf(18)} color="#FFFFFF" strokeWidth={2.8} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  stepText: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: width * 0.037,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E7EBED',
  },
  activeBar: {
    backgroundColor: GREEN,
  },
  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingBottom: 25,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  mainTitle: {
    marginTop: 20,
    fontSize: rf(24),
    fontWeight: '900',
    color: DARK,
  },
  subtitle: {
    marginTop: 6,
    fontSize: rf(13),
    color: MUTED,
    lineHeight: rf(19),
  },
  section: {
    marginTop: 23,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  label: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  availRow: {
    flexDirection: 'row',
    gap: 10,
  },
  availCard: {
    flex: 1,
    minHeight: 128,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  activeAvailCard: {
    backgroundColor: '#F0FDF4',
    borderColor: GREEN,
    borderWidth: 2,
  },
  availLabel: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },
  availCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeAvailCheck: {
    backgroundColor: GREEN,
  },
  wageInputRow: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: '#E7EBED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rupeeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wageInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: rf(15),
    fontWeight: '800',
    color: DARK,
  },
  helperText: {
    marginTop: 7,
    fontSize: rf(11),
    color: MUTED,
    lineHeight: rf(16),
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wageChip: {
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeWageChip: {
    backgroundColor: '#F0FDF4',
    borderColor: GREEN,
    borderWidth: 2,
  },
  wageChipText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  subLabelRow: {
    marginTop: 17,
  },
  subLabel: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  wageTypeRow: {
    marginTop: 9,
    flexDirection: 'row',
    gap: 10,
  },
  wageTypeCard: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7EBED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeWageTypeCard: {
    backgroundColor: '#F0FDF4',
    borderColor: GREEN,
    borderWidth: 2,
  },
  wageTypeText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  miniCheck: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeExperienceChip: {
    backgroundColor: '#F0FDF4',
    borderColor: GREEN,
    borderWidth: 2,
  },
  experienceText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  arrangementList: {
    gap: 9,
  },
  arrangementCard: {
    minHeight: 68,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E7EBED',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeArrangementCard: {
    backgroundColor: '#F0FDF4',
    borderColor: GREEN,
    borderWidth: 2,
  },
  arrangementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrangementText: {
    flex: 1,
    marginLeft: 11,
  },
  arrangementTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  arrangementSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRadio: {
    borderColor: GREEN,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  distanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  distancePill: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDistancePill: {
    backgroundColor: '#F0FDF4',
    borderColor: GREEN,
    borderWidth: 2,
  },
  distanceText: {
    fontSize: rf(13),
    fontWeight: '800',
    color: DARK,
  },
  summaryBox: {
    marginTop: 23,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E7EBED',
  },
  summaryTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  summaryLabel: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '700',
  },
  summaryValue: {
    maxWidth: '65%',
    fontSize: rf(11),
    color: DARK,
    fontWeight: '800',
    textAlign: 'right',
  },
  errorBox: {
    marginTop: 15,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: rf(12),
    color: '#DC2626',
    fontWeight: '700',
    lineHeight: rf(17),
  },
  bottomBar: {
    padding: width * 0.037,
    backgroundColor: '#FFFFFF',
  },
  nextBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disabledBtn: {
    opacity: 0.65,
  },
  nextText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
