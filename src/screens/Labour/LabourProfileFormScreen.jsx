import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Camera,
  IndianRupee,
  MapPin,
  Save,
  UserRound,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useLiveRegionPrefill } from '../../context/LocationContext';
import MarketHero, { TopInset } from '../../components/market/MarketHero';
import {
  EmptyState,
  LoadingState,
  MarketButton,
} from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import PersonAvatar from '../../components/labour/PersonAvatar';
import useLabourMeta from '../../components/labour/useLabourMeta';
import {
  Field,
  FormCard,
  FormInput,
  PickerField,
  SectionHeading,
  SelectChips,
  TagInput,
} from '../../components/labour/FormBits';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import {
  fetchMyLabourerProfile,
  saveMyLabourerProfile,
} from '../../redux/slices/labourerSlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadNurseryImage } from '../../utils/nurseryCloudinary';
import {
  AVAILABILITY_META,
  WAGE_TYPE_LABELS,
  buildLabourerPayload,
  dayKeyOf,
  formatDay,
  toDayKey,
} from '../../utils/labourFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other' };
const EXPERIENCE_LABELS = { years: 'Years', months: 'Months' };
const AVAILABILITY_LABELS = Object.fromEntries(
  Object.entries(AVAILABILITY_META).map(([key, meta]) => [key, meta.label]),
);

const toText = value =>
  value === undefined || value === null ? '' : String(value);

const initialForm = (profile, user) => ({
  fullName: profile?.fullName || user?.fullName || '',
  phoneNumber: profile?.phoneNumber || user?.phoneNumber || '',
  profileImage: profile?.profileImage || '',
  gender: profile?.gender || '',
  age: toText(profile?.age),
  labourType: profile?.labourType || '',
  preferredWork: profile?.preferredWork || [],
  skills: profile?.skills || [],
  languages: profile?.languages || [],
  experience: toText(profile?.experience),
  experienceUnit: profile?.experienceUnit || 'years',
  expectedWage: toText(profile?.expectedWage || ''),
  wageType: profile?.wageType || 'daily',
  availability: profile?.availability || 'available',
  availableFrom: dayKeyOf(profile?.availableFrom),
  availableUntil: dayKeyOf(profile?.availableUntil),
  village: profile?.village ?? user?.village ?? '',
  taluka: profile?.taluka ?? user?.taluka ?? '',
  district: profile?.district ?? '',
  state: profile?.state ?? '',
});

/*
 * Pages of the "create profile" wizard. Editing shows them all at once.
 */
const STEPS = [
  { get title() {
    return i18n.t('labourProfileForm.aboutYou');
  }, get text() {
    return i18n.t('labourProfileForm.yourNamePhoneAndPhoto');
  } },
  { get title() {
    return i18n.t('labourProfileForm.yourWork');
  }, get text() {
    return i18n.t('labourProfileForm.whatWorkYouDoAnd');
  } },
  {
    get title() {
    return i18n.t('labourProfileForm.wageAvailability');
  },
    get text() {
    return i18n.t('labourProfileForm.whatYouChargeAndWhen');
  },
  },
  { get title() {
    return i18n.t('labourProfileForm.whereYouLive');
  }, get text() {
    return i18n.t('labourProfileForm.soFarmersNearbyCanFind');
  } },
];

// page each validated field lives on (fields from buildLabourerPayload)
const STEP_OF_FIELD = {
  fullName: 0,
  phoneNumber: 0,
  age: 0,
  labourType: 1,
  experience: 1,
  expectedWage: 2,
  availableUntil: 2,
};

const keyToLocalDate = key => {
  if (!key) return new Date();
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/*
 * Waits for the user's worker profile so the form knows whether it is
 * creating a new profile or editing one.
 */
export default function LabourProfileFormScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const { myProfileStatus, myProfileError } = useSelector(
    state => state.labourer,
  );

  useEffect(() => {
    if (myProfileStatus === 'idle') {
      dispatch(fetchMyLabourerProfile());
    }
  }, [dispatch, myProfileStatus]);

  if (
    myProfileStatus === 'idle' ||
    myProfileStatus === 'loading' ||
    myProfileStatus === 'error'
  ) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <MarketHero
          compact
          onBack={() => navigation.goBack()}
          title={t('labourProfileForm.workerProfile')}
        />
        {myProfileStatus === 'error' ? (
          <EmptyState
            title={t('labourProfileForm.couldntLoadYourProfile')}
            message={myProfileError}
            actionLabel={t('labourProfileForm.tryAgain')}
            onAction={() => dispatch(fetchMyLabourerProfile())}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  return <ProfileForm navigation={navigation} />;
}

function ProfileForm({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();

  const user = useSelector(state => state.auth.user);
  const { myProfile, myProfileStatus, saving } = useSelector(
    state => state.labourer,
  );
  const meta = useLabourMeta();

  const isCreate = !(myProfileStatus === 'loaded' && myProfile);

  const [form, setForm] = useState(() =>
    initialForm(isCreate ? null : myProfile, user),
  );
  useLiveRegionPrefill(setForm);
  const [photoAsset, setPhotoAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  // 'availableFrom' | 'availableUntil' | null
  const [dateField, setDateField] = useState(null);
  const [step, setStep] = useState(0);
  const scrollRef = useRef(null);

  const isLastStep = !isCreate || step === STEPS.length - 1;
  const shows = index => !isCreate || step === index;

  const goToStep = index => {
    setStep(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleBack = () => {
    if (isCreate && step > 0) {
      goToStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  /*
   * Checks only the fields on this page and the ones before it.
   */
  const handleNext = () => {
    const { error, field } = buildLabourerPayload(form);
    const errorStep = STEP_OF_FIELD[field];

    if (error && errorStep <= step) {
      if (errorStep < step) goToStep(errorStep);
      feedback.error('Check your details', error);
      return;
    }

    goToStep(step + 1);
  };

  const setField = (key, value) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const labourTypeOptions =
    form.labourType && !meta.labourTypes.includes(form.labourType)
      ? [form.labourType, ...meta.labourTypes]
      : meta.labourTypes;

  const choosePhoto = async () => {
    try {
      const [asset] = await pickNurseryImages({ selectionLimit: 1 });
      if (asset) setPhotoAsset(asset);
    } catch (error) {
      feedback.error('Could not open photos', error?.message);
    }
  };

  const handleDateChange = (event, date) => {
    const field = dateField;
    setDateField(null);

    if (event.type === 'set' && date && field) {
      setField(field, toDayKey(date));
    }
  };

  const handleSave = async () => {
    const { payload, error, field } = buildLabourerPayload(form);

    if (error) {
      if (isCreate && STEP_OF_FIELD[field] !== undefined) {
        goToStep(STEP_OF_FIELD[field]);
      }
      feedback.error('Check your profile', error);
      return;
    }

    try {
      if (photoAsset) {
        setUploading(true);
        payload.profileImage = await uploadNurseryImage(photoAsset);
        setUploading(false);
      }

      await dispatch(
        saveMyLabourerProfile({ labourerData: payload, isCreate }),
      ).unwrap();

      if (isCreate) {
        feedback.success(
          t('labourProfileForm.youAreReadyToGet'),
          t('labourProfileForm.farmersNearYouCanNow'),
          {
            primaryLabel: t('labourProfileForm.goToMyProfile'),
            dismissable: false,
            onPrimary: () => navigation.replace(LABOUR_ROUTES.MY_PROFILE),
          },
        );
      } else {
        feedback.success(
          t('labourProfileForm.profileUpdated'),
          t('labourProfileForm.farmersWillSeeYourNew'),
          {
            primaryLabel: t('labourProfileForm.done'),
            dismissable: false,
            onPrimary: () => navigation.goBack(),
          },
        );
      }
    } catch (failure) {
      setUploading(false);
      feedback.error(
        'Could not save profile',
        typeof failure === 'string' ? failure : failure?.message,
      );
    }
  };

  const photoUri = photoAsset?.uri || form.profileImage;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <MarketHero
            compact
            gradient={isCreate ? 'amber' : 'forest'}
            onBack={handleBack}
            eyebrow={isCreate ? t('labourProfileForm.joinAsAWorker') : t('labourProfileForm.workerProfile')}
            title={
              isCreate ? t('labourProfileForm.createYourWorkerProfile') : t('labourProfileForm.editYourProfile')
            }
            subtitle={
              isCreate
                ? STEPS[step].text
                : t('labourProfileForm.aCompleteProfileWithA')
            }
          >
            {isCreate && (
              <View style={styles.progress}>
                <Text style={styles.progressLabel}>
                  {t('labourProfileForm.stepOf', {v1: step + 1, length: STEPS.length, title: STEPS[step].title})}
                </Text>
                <View style={styles.progressBar}>
                  {STEPS.map((item, index) => (
                    <View
                      key={item.title}
                      style={[
                        styles.progressSegment,
                        index <= step && styles.progressSegmentDone,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {shows(0) && (
              <View style={styles.photoRow}>
                <TouchableOpacity activeOpacity={0.85} onPress={choosePhoto}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                  ) : (
                    <PersonAvatar
                      name={form.fullName}
                      size={78}
                      style={styles.photo}
                    />
                  )}
                  <View style={styles.cameraBadge}>
                    <Camera size={14} color={C.white} />
                  </View>
                </TouchableOpacity>
                <View style={styles.flex}>
                  <Text style={styles.photoTitle}>
                    {photoUri ? t('labourProfileForm.lookingGood') : t('labourProfileForm.addYourPhoto')}
                  </Text>
                  <Text style={styles.photoText}>
                    {t('labourProfileForm.farmersTrustWorkersTheyCan')}
                  </Text>
                </View>
              </View>
            )}
          </MarketHero>

          <View style={styles.body}>
            {shows(0) && (
              <>
                {/* ABOUT */}
                <SectionHeading
                  icon={<UserRound size={16} color={C.green} />}
                  title={t('labourProfileForm.aboutYou')}
                />
                <FormCard>
                  <Field label={t('labourProfileForm.fullName')}>
                    <FormInput
                      value={form.fullName}
                      onChangeText={value => setField('fullName', value)}
                      placeholder={t('labourProfileForm.yourName')}
                      maxLength={100}
                    />
                  </Field>
                  <Field
                    label={t('labourProfileForm.phoneNumber')}
                    hint={t('labourProfileForm.sharedWithAFarmerOnly')}
                  >
                    <FormInput
                      value={form.phoneNumber}
                      onChangeText={value => setField('phoneNumber', value)}
                      placeholder={t('labourProfileForm.10DigitMobileNumber')}
                      keyboardType="phone-pad"
                      maxLength={15}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flexWide}>
                      <Field label={t('labourProfileForm.gender')}>
                        <SelectChips
                          options={
                            meta.genders.length
                              ? meta.genders
                              : Object.keys(GENDER_LABELS)
                          }
                          labels={GENDER_LABELS}
                          value={form.gender}
                          onChange={value => setField('gender', value)}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.age')}>
                        <FormInput
                          value={form.age}
                          onChangeText={value => setField('age', value)}
                          placeholder="18+"
                          keyboardType="number-pad"
                          maxLength={3}
                        />
                      </Field>
                    </View>
                  </View>
                </FormCard>
              </>
            )}

            {shows(1) && (
              <>
                {/* WORK */}
                <SectionHeading
                  icon={<Briefcase size={16} color={C.orange} />}
                  color={C.orange}
                  title={t('labourProfileForm.yourWork')}
                />
                <FormCard>
                  <Field label={t('labourProfileForm.mainWorkYouDo')}>
                    <SelectChips
                      options={labourTypeOptions}
                      value={form.labourType}
                      onChange={value => setField('labourType', value)}
                    />
                  </Field>
                  <Field
                    label={t('labourProfileForm.otherWorkYouCanDo')}
                    hint={t('labourProfileForm.pickEverythingThatApplies')}
                  >
                    <SelectChips
                      multiple
                      options={meta.workTypes}
                      value={form.preferredWork}
                      onChange={value => setField('preferredWork', value)}
                    />
                  </Field>
                  <Field label={t('labourProfileForm.skills')}>
                    <TagInput
                      value={form.skills}
                      onChange={value => setField('skills', value)}
                      placeholder={t('labourProfileForm.eGDripFittingGrafting')}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.experience')}>
                        <FormInput
                          value={form.experience}
                          onChangeText={value => setField('experience', value)}
                          placeholder="0"
                          keyboardType="decimal-pad"
                          maxLength={4}
                        />
                      </Field>
                    </View>
                    <View style={styles.flexWide}>
                      <Field label={t('labourProfileForm.in')}>
                        <SelectChips
                          options={
                            meta.experienceUnits.length
                              ? meta.experienceUnits
                              : ['years', 'months']
                          }
                          labels={EXPERIENCE_LABELS}
                          value={form.experienceUnit}
                          onChange={value => setField('experienceUnit', value)}
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label={t('labourProfileForm.languagesYouSpeak')}>
                    <SelectChips
                      multiple
                      options={meta.languages}
                      value={form.languages}
                      onChange={value => setField('languages', value)}
                    />
                  </Field>
                </FormCard>
              </>
            )}

            {shows(2) && (
              <>
                {/* WAGE */}
                <SectionHeading
                  icon={<IndianRupee size={16} color={C.green} />}
                  title={t('labourProfileForm.wageAvailability')}
                />
                <FormCard>
                  <Field label={t('labourProfileForm.wageYouExpect')}>
                    <View style={styles.wageBox}>
                      <Text style={styles.rupee}>₹</Text>
                      <FormInput
                        value={form.expectedWage}
                        onChangeText={value => setField('expectedWage', value)}
                        placeholder="500"
                        keyboardType="decimal-pad"
                        style={styles.wageInput}
                      />
                    </View>
                  </Field>
                  <Field label={t('labourProfileForm.paid')}>
                    <SelectChips
                      options={
                        meta.wageTypes.length
                          ? meta.wageTypes
                          : ['daily', 'hourly', 'monthly']
                      }
                      labels={WAGE_TYPE_LABELS}
                      value={form.wageType}
                      onChange={value => setField('wageType', value)}
                    />
                  </Field>
                  <Field label={t('labourProfileForm.rightNowIAm')}>
                    <SelectChips
                      options={
                        meta.availabilityOptions.length
                          ? meta.availabilityOptions
                          : ['available', 'busy', 'unavailable']
                      }
                      labels={AVAILABILITY_LABELS}
                      value={form.availability}
                      onChange={value => setField('availability', value)}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.availableFrom')}>
                        <PickerField
                          icon={<Calendar size={16} color={C.green} />}
                          value={
                            form.availableFrom
                              ? formatDay(form.availableFrom, {
                                  weekday: false,
                                })
                              : ''
                          }
                          placeholder={t('labourProfileForm.anyTime')}
                          onPress={() => setDateField('availableFrom')}
                          onClear={() => setField('availableFrom', null)}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.until')}>
                        <PickerField
                          icon={<Calendar size={16} color={C.green} />}
                          value={
                            form.availableUntil
                              ? formatDay(form.availableUntil, {
                                  weekday: false,
                                })
                              : ''
                          }
                          placeholder={t('labourProfileForm.noEnd')}
                          onPress={() => setDateField('availableUntil')}
                          onClear={() => setField('availableUntil', null)}
                        />
                      </Field>
                    </View>
                  </View>
                </FormCard>
              </>
            )}

            {shows(3) && (
              <>
                {/* LOCATION */}
                <SectionHeading
                  icon={<MapPin size={16} color={C.blue} />}
                  color={C.blue}
                  title={t('labourProfileForm.whereYouLive')}
                  subtitle={t('labourProfileForm.farmersSearchForWorkersNear')}
                />
                <FormCard>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.village')}>
                        <FormInput
                          value={form.village}
                          onChangeText={value => setField('village', value)}
                          placeholder={t('labourProfileForm.village')}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.taluka')}>
                        <FormInput
                          value={form.taluka}
                          onChangeText={value => setField('taluka', value)}
                          placeholder={t('labourProfileForm.taluka')}
                        />
                      </Field>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.district')}>
                        <FormInput
                          value={form.district}
                          onChangeText={value => setField('district', value)}
                          placeholder={t('labourProfileForm.district')}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label={t('labourProfileForm.state')}>
                        <FormInput
                          value={form.state}
                          onChangeText={value => setField('state', value)}
                          placeholder={t('labourProfileForm.state')}
                        />
                      </Field>
                    </View>
                  </View>
                </FormCard>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {isCreate && step > 0 && (
          <MarketButton
            variant="outline"
            label={t('common.back')}
            icon={<ArrowLeft size={16} color={C.green} />}
            disabled={saving || uploading}
            onPress={handleBack}
            style={styles.flex}
          />
        )}
        {isLastStep ? (
          <MarketButton
            label={
              uploading
                ? t('labourProfileForm.uploadingPhoto')
                : isCreate
                ? t('labourProfileForm.createProfile')
                : t('labourProfileForm.saveChanges')
            }
            icon={<Save size={17} color={C.white} />}
            loading={saving || uploading}
            onPress={handleSave}
            style={styles.flexWide}
          />
        ) : (
          <MarketButton
            label={t('labourProfileForm.next')}
            icon={<ArrowRight size={17} color={C.white} />}
            onPress={handleNext}
            style={styles.flexWide}
          />
        )}
      </View>

      {!!dateField && (
        <DateTimePicker
          value={keyToLocalDate(form[dateField])}
          mode="date"
          minimumDate={
            dateField === 'availableUntil' && form.availableFrom
              ? keyToLocalDate(form.availableFrom)
              : undefined
          }
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  flexWide: { flex: 1.6 },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12 },

  progress: { marginTop: 16 },
  progressLabel: { color: '#FFF3D6', fontSize: 12, fontWeight: '900' },
  progressBar: { flexDirection: 'row', gap: 6, marginTop: 8 },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressSegmentDone: { backgroundColor: C.white },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
  },
  photo: {
    width: 78,
    height: 78,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTitle: { fontSize: 15, fontWeight: '900', color: C.white },
  photoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    marginTop: 3,
    lineHeight: 16,
  },

  wageBox: { flexDirection: 'row', alignItems: 'center' },
  rupee: {
    position: 'absolute',
    left: 13,
    zIndex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: C.green,
  },
  wageInput: { flex: 1, paddingLeft: 30, fontSize: 15, fontWeight: '800' },

  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
});
