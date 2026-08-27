import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
  Image,
  Alert,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Camera,
  Check,
  Calendar,
} from 'lucide-react-native';

import {useDispatch, useSelector} from 'react-redux';

import {setLabourFormData} from '../../redux/slices/labourSlice';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size,
    Math.min(size * scale, size + 3),
  );
};

const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';

export default function FindWorkStep3Screen({
  navigation,
}) {
  const dispatch = useDispatch();

  const formData = useSelector(
    state => state?.labour?.formData || {},
  );

  const [name, setName] = useState(
    formData.fullName || '',
  );

  const [phone, setPhone] = useState(
    formData.phoneNumber || '',
  );

  const [age, setAge] = useState(
    formData.age
      ? String(formData.age)
      : '',
  );

  const [village, setVillage] = useState(
    formData.village || '',
  );

  const selectedWorkTypes = Array.isArray(
    formData.preferredWork,
  )
    ? formData.preferredWork
    : [];

  // ==========================================================
  // NEXT
  // ==========================================================

  const handleNext = () => {
    const trimmedName = name.trim();

    const cleanedPhone = phone.replace(/\D/g, '');

    const trimmedAge = age.trim();

    const trimmedVillage = village.trim();

    const numericAge = Number(trimmedAge);

    // ========================================================
    // NAME VALIDATION
    // ========================================================

    if (!trimmedName) {
      Alert.alert(
        'Required',
        'Please enter your full name.',
      );
      return;
    }

    // ========================================================
    // PHONE VALIDATION
    // ========================================================

    if (!cleanedPhone) {
      Alert.alert(
        'Mobile Number Required',
        'Please enter your mobile number.',
      );
      return;
    }

    if (cleanedPhone.length !== 10) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit mobile number.',
      );
      return;
    }

    // ========================================================
    // AGE VALIDATION
    // ========================================================

    if (!trimmedAge) {
      Alert.alert(
        'Age Required',
        'Please enter your age.',
      );
      return;
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 18
    ) {
      Alert.alert(
        'Invalid Age',
        'You must be at least 18 years old to register as a labourer.',
      );
      return;
    }

    if (numericAge > 100) {
      Alert.alert(
        'Invalid Age',
        'Please enter a valid age.',
      );
      return;
    }

    // ========================================================
    // VILLAGE VALIDATION
    // ========================================================

    if (!trimmedVillage) {
      Alert.alert(
        'Required',
        'Please enter your village.',
      );
      return;
    }

    // ========================================================
    // WORK VALIDATION
    // ========================================================

    if (selectedWorkTypes.length === 0) {
      Alert.alert(
        'Work Type Required',
        'Please select at least one type of work.',
      );
      return;
    }

    // ========================================================
    // SAVE DATA
    // ========================================================

    dispatch(
      setLabourFormData({
        fullName: trimmedName,

        phoneNumber: cleanedPhone,

        age: numericAge,

        village: trimmedVillage,

        preferredWork: selectedWorkTypes,

        skills: selectedWorkTypes,
      }),
    );

    navigation.navigate('FindWorkStep4');
  };

  // ==========================================================
  // LOCATION
  // ==========================================================

  const handleUseLocation = () => {
    Alert.alert(
      'Location',
      'GPS location integration can be connected here. For now, please enter your village manually.',
    );
  };

  // ==========================================================
  // PHOTO
  // ==========================================================

  const handlePhotoPress = () => {
    Alert.alert(
      'Profile Photo',
      'Camera/photo picker can be connected here.',
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}>

          <ArrowLeft
            size={rf(20)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Find Work
        </Text>

        <Text style={styles.stepText}>
          Step 3 of 4
        </Text>
      </View>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <View style={styles.progressRow}>
        <View
          style={[
            styles.progressBar,
            styles.activeBar,
          ]}
        />

        <View
          style={[
            styles.progressBar,
            styles.activeBar,
          ]}
        />

        <View
          style={[
            styles.progressBar,
            styles.activeBar,
          ]}
        />

        <View style={styles.progressBar} />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }>

        {/* HERO */}

        <Image
          source={require('../../assets/labour/hero6.jpg')}
          style={styles.heroImage}
        />

        <Text style={styles.mainTitle}>
          Your Details
        </Text>

        <Text style={styles.subtitle}>
          Tell farmers a little about yourself.
        </Text>

        {/* ====================================================
            NAME
        ==================================================== */}

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <User
              size={rf(15)}
              color={GREEN}
              strokeWidth={2.4}
            />

            <Text style={styles.label}>
              Full Name
            </Text>
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        {/* ====================================================
            MOBILE NUMBER
        ==================================================== */}

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Phone
              size={rf(15)}
              color={GREEN}
              strokeWidth={2.4}
            />

            <Text style={styles.label}>
              Mobile Number
            </Text>
          </View>

          <View style={styles.phoneInputWrapper}>
            <Text style={styles.countryCode}>
              +91
            </Text>

            <View style={styles.phoneDivider} />

            <TextInput
              value={phone}
              onChangeText={text => {
                const cleaned = text.replace(
                  /\D/g,
                  '',
                );

                if (cleaned.length <= 10) {
                  setPhone(cleaned);
                }
              }}
              placeholder="Enter mobile number"
              placeholderTextColor="#94A3B8"
              style={styles.phoneInput}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={styles.phoneHint}>
            Enter your 10-digit mobile number
          </Text>
        </View>

        {/* ====================================================
            AGE
        ==================================================== */}

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Calendar
              size={rf(15)}
              color={GREEN}
              strokeWidth={2.4}
            />

            <Text style={styles.label}>
              Age
            </Text>
          </View>

          <TextInput
            value={age}
            onChangeText={text => {
              const cleaned = text.replace(
                /\D/g,
                '',
              );

              if (cleaned.length <= 3) {
                setAge(cleaned);
              }
            }}
            placeholder="Enter your age"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={3}
          />

          <Text style={styles.ageHint}>
            You must be at least 18 years old
          </Text>
        </View>

        {/* ====================================================
            VILLAGE
        ==================================================== */}

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <MapPin
              size={rf(15)}
              color="#F97316"
              strokeWidth={2.4}
            />

            <Text style={styles.label}>
              Village
            </Text>
          </View>

          <TextInput
            value={village}
            onChangeText={setVillage}
            placeholder="Enter your village"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="words"
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUseLocation}
            style={styles.locationBox}>

            <View style={styles.locIconBox}>
              <MapPin
                size={rf(17)}
                color={GREEN}
                strokeWidth={2.4}
              />
            </View>

            <View
              style={styles.locationTextWrap}>

              <Text style={styles.locName}>
                Use current location
              </Text>

              <Text style={styles.locSub}>
                Auto-detect via GPS
              </Text>
            </View>

            <ArrowRight
              size={rf(17)}
              color={GREEN}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        {/* ====================================================
            SELECTED WORK
        ==================================================== */}

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Check
              size={rf(15)}
              color={GREEN}
              strokeWidth={2.8}
            />

            <Text style={styles.label}>
              Selected Work
            </Text>
          </View>

          <View
            style={styles.selectedWorkWrap}>

            {selectedWorkTypes.map(work => (
              <View
                key={work}
                style={styles.workPill}>

                <Check
                  size={rf(12)}
                  color={GREEN}
                  strokeWidth={2.8}
                />

                <Text
                  style={styles.workPillText}>
                  {work}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ====================================================
            PHOTO
        ==================================================== */}

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Camera
              size={rf(15)}
              color={GREEN}
              strokeWidth={2.4}
            />

            <Text style={styles.label}>
              Profile Photo
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePhotoPress}
            style={styles.photoBox}>

            <View style={styles.cameraIcon}>
              <Camera
                size={rf(22)}
                color={GREEN}
                strokeWidth={2.4}
              />
            </View>

            <Text style={styles.photoTitle}>
              Add Profile Photo
            </Text>

            <Text style={styles.photoSub}>
              Helps farmers identify you
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ======================================================
          BOTTOM BUTTON
      ====================================================== */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          style={styles.nextBtn}>

          <Text style={styles.nextText}>
            Next
          </Text>

          <ArrowRight
            size={rf(17)}
            color="#FFFFFF"
            strokeWidth={2.6}
          />
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
    paddingBottom: 20,
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

  field: {
    marginTop: 20,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 9,
  },

  label: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },

  input: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#E7EBED',
    fontSize: rf(14),
    color: DARK,
    backgroundColor: '#FFFFFF',
  },

  // ========================================================
  // PHONE
  // ========================================================

  phoneInputWrapper: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#E7EBED',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  countryCode: {
    fontSize: rf(14),
    fontWeight: '800',
    color: DARK,
  },

  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E7EBED',
    marginHorizontal: 12,
  },

  phoneInput: {
    flex: 1,
    height: 54,
    padding: 0,
    fontSize: rf(14),
    fontWeight: '700',
    color: DARK,
  },

  phoneHint: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: rf(11),
    color: MUTED,
  },

  // ========================================================
  // AGE
  // ========================================================

  ageHint: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: rf(11),
    color: MUTED,
  },

  // ========================================================
  // LOCATION
  // ========================================================

  locationBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7EBED',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  locIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  locName: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },

  locSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },

  // ========================================================
  // WORK
  // ========================================================

  selectedWorkWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  workPill: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  workPillText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: GREEN,
  },

  // ========================================================
  // PHOTO
  // ========================================================

  photoBox: {
    padding: 22,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: GREEN,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
  },

  cameraIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoTitle: {
    marginTop: 10,
    fontSize: rf(14),
    fontWeight: '900',
    color: GREEN,
  },

  photoSub: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
  },

  // ========================================================
  // BOTTOM
  // ========================================================

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
    gap: 8,
  },

  nextText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});