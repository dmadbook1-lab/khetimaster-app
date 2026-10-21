import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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
  Calendar,
  Cog,
  ImagePlus,
  IndianRupee,
  MapPin,
  Plus,
  Save,
  Tractor,
  Trash2,
  UploadCloud,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import { MarketButton } from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import {
  Field,
  FormCard,
  FormInput,
  PickerField,
  SectionHeading,
  SelectChips,
} from '../../components/labour/FormBits';
import useMachineryMeta from '../../components/machinery/useMachineryMeta';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import { saveMachinery } from '../../redux/slices/machinerySlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadNurseryImages } from '../../utils/nurseryCloudinary';
import {
  AVAILABILITY_META,
  FUEL_LABELS,
  buildMachineryPayload,
} from '../../utils/machineryFormat';
import { dayKeyOf, formatDay, toDayKey } from '../../utils/indiaSchedule';

const MAX_IMAGES = 6;

const STEPS = [
  { title: 'Your machine', text: 'Name, type and photos' },
  { title: 'Specs & implements', text: 'Power, fuel and attachments' },
  { title: 'Rent rates', text: 'What you charge farmers' },
  { title: 'Availability & location', text: 'When and where it is available' },
];

// page each validated field lives on (fields from buildMachineryPayload)
const STEP_OF_FIELD = {
  name: 0,
  category: 0,
  modelYear: 0,
  enginePower: 1,
  pricing: 2,
  availableUntil: 3,
  description: 3,
};

const AVAILABILITY_LABELS = Object.fromEntries(
  Object.entries(AVAILABILITY_META).map(([key, meta]) => [key, meta.label]),
);

const CUSTOM_UNIT_LABELS = {
  acre: 'per acre',
  hour: 'per hour',
  day: 'per day',
  job: 'per job',
  custom: 'fixed',
};

const toText = value =>
  value === undefined || value === null ? '' : String(value);

let rateKeySeed = 0;
const newRate = (rate = {}) => ({
  key: `rate-${(rateKeySeed += 1)}`,
  _id: rate._id,
  name: rate.name || '',
  amount: toText(rate.amount),
  unit: rate.unit || 'acre',
});

const initialForm = (machine, user) => ({
  name: machine?.name || '',
  category: machine?.category || '',
  brand: machine?.brand || '',
  model: machine?.model || '',
  modelYear: toText(machine?.modelYear),
  images: machine?.images || [],
  description: machine?.description || '',
  enginePowerValue: toText(machine?.enginePower?.value || ''),
  enginePowerUnit: machine?.enginePower?.unit || 'HP',
  fuelType: machine?.fuelType || '',
  driveType: machine?.driveType || '',
  supportsImplements: Boolean(machine?.supportsImplements),
  supportedImplements: machine?.supportedImplements || [],
  hourly: machine?.pricing?.hourly ? String(machine.pricing.hourly) : '',
  daily: machine?.pricing?.daily ? String(machine.pricing.daily) : '',
  customRates: (machine?.pricing?.custom || []).map(newRate),
  availability: machine?.availability || 'available',
  availableFrom: dayKeyOf(machine?.availableFrom),
  availableUntil: dayKeyOf(machine?.availableUntil),
  ownerName: machine?.ownerName || user?.fullName || '',
  village: machine?.village ?? user?.village ?? '',
  district: machine?.district ?? user?.district ?? '',
  state: machine?.state ?? user?.state ?? '',
  address: machine?.address || '',
  ownerNotes: machine?.ownerNotes || '',
});

const keyToLocalDate = key => {
  if (!key) return new Date();
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

function SwitchRow({ label, description, value, onValueChange }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.flex}>
        <Text style={styles.switchLabel}>{label}</Text>
        {!!description && <Text style={styles.switchText}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D0D5D2', true: '#9ED8B4' }}
        thumbColor={value ? C.green : '#F4F4F4'}
      />
    </View>
  );
}

export default function MachineryFormScreen({ navigation, route }) {
  const editing = route?.params?.machinery || null;
  const isCreate = !editing;

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const scrollRef = useRef(null);

  const user = useSelector(state => state.auth.user);
  const saving = useSelector(state => state.machinery.saving);
  const meta = useMachineryMeta();

  const [form, setForm] = useState(() => initialForm(editing, user));
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [step, setStep] = useState(0);

  const setField = (key, value) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const shows = index => !isCreate || step === index;
  const isLastStep = !isCreate || step === STEPS.length - 1;

  const goToStep = index => {
    setStep(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleBack = () => {
    if (isCreate && step > 0) goToStep(step - 1);
    else navigation.goBack();
  };

  const handleNext = () => {
    const { error, field } = buildMachineryPayload(form);
    const errorStep = STEP_OF_FIELD[field];

    if (error && errorStep <= step) {
      if (errorStep < step) goToStep(errorStep);
      feedback.error('Check your details', error);
      return;
    }

    goToStep(step + 1);
  };

  /* RATES */

  const updateRate = (key, change) =>
    setField(
      'customRates',
      form.customRates.map(rate =>
        rate.key === key ? { ...rate, ...change } : rate,
      ),
    );

  const addRate = () =>
    setField('customRates', [...form.customRates, newRate()]);

  const removeRate = key =>
    setField(
      'customRates',
      form.customRates.filter(rate => rate.key !== key),
    );

  /* PHOTOS */

  const totalImages = form.images.length + assets.length;

  const choosePhotos = async () => {
    const remaining = MAX_IMAGES - totalImages;

    if (remaining <= 0) {
      feedback.info(
        'Maximum reached',
        `You can add up to ${MAX_IMAGES} photos.`,
      );
      return;
    }

    try {
      const picked = await pickNurseryImages({ selectionLimit: remaining });
      if (picked.length)
        setAssets(previous => [...previous, ...picked].slice(0, MAX_IMAGES));
    } catch (error) {
      feedback.error('Could not open photos', error?.message);
    }
  };

  const handleDateChange = (event, date) => {
    const field = dateField;
    setDateField(null);
    if (event.type === 'set' && date && field) setField(field, toDayKey(date));
  };

  /* SAVE */

  const handleSave = async () => {
    const { payload, error, field } = buildMachineryPayload(form);

    if (error) {
      if (isCreate && STEP_OF_FIELD[field] !== undefined)
        goToStep(STEP_OF_FIELD[field]);
      feedback.error('Check your machine details', error);
      return;
    }

    try {
      if (assets.length) {
        setUploading(true);
        const uploaded = await uploadNurseryImages(assets);
        payload.images = [...payload.images, ...uploaded];
        setUploading(false);
      }

      const result = await dispatch(
        saveMachinery({ machineryId: editing?._id, machineryData: payload }),
      ).unwrap();

      if (isCreate) {
        feedback.success(
          'Your machine is listed!',
          'Farmers near you can now find it and send rental requests.',
          {
            primaryLabel: 'View Machine',
            dismissable: false,
            onPrimary: () =>
              navigation.replace(MACHINERY_ROUTES.DETAILS, {
                machineryId: result.machinery._id,
              }),
          },
        );
      } else {
        feedback.success(
          'Machine updated',
          'New rates apply to new bookings only.',
          {
            primaryLabel: 'Done',
            dismissable: false,
            onPrimary: () => navigation.goBack(),
          },
        );
      }
    } catch (failure) {
      setUploading(false);
      feedback.error(
        'Could not save machine',
        typeof failure === 'string' ? failure : failure?.message,
      );
    }
  };

  const implementOptions = [
    ...new Set([
      ...(meta.implements || []),
      ...(form.supportedImplements || []),
    ]),
  ];
  const categoryOptions =
    form.category && !meta.categories.includes(form.category)
      ? [form.category, ...meta.categories]
      : meta.categories;

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
            eyebrow={isCreate ? 'List your machine' : 'Edit machine'}
            title={isCreate ? 'Rent out your\nmachine' : editing.name}
            subtitle={
              isCreate
                ? STEPS[step].text
                : 'Price changes only apply to new bookings.'
            }
          >
            {isCreate && (
              <View style={styles.progress}>
                <Text style={styles.progressLabel}>
                  Step {step + 1} of {STEPS.length} · {STEPS[step].title}
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
          </MarketHero>

          <View style={styles.body}>
            {shows(0) && (
              <>
                <SectionHeading
                  icon={<Tractor size={16} color={C.green} />}
                  title="Your machine"
                />
                <FormCard>
                  <Field
                    label="Photos"
                    hint={`Clear photos get more bookings. Up to ${MAX_IMAGES}.`}
                  >
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.imageList}
                    >
                      {form.images.map((uri, index) => (
                        <View key={`url-${uri}`} style={styles.imageBox}>
                          <Image source={{ uri }} style={styles.image} />
                          <TouchableOpacity
                            style={styles.removeImage}
                            onPress={() =>
                              setField(
                                'images',
                                form.images.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 size={13} color={C.white} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {assets.map((asset, index) => (
                        <View
                          key={`asset-${asset.uri}`}
                          style={styles.imageBox}
                        >
                          <Image
                            source={{ uri: asset.uri }}
                            style={styles.image}
                          />
                          <View style={styles.newBadge}>
                            <UploadCloud size={11} color={C.white} />
                          </View>
                          <TouchableOpacity
                            style={styles.removeImage}
                            onPress={() =>
                              setAssets(previous =>
                                previous.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 size={13} color={C.white} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {totalImages < MAX_IMAGES && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.addImage}
                          onPress={choosePhotos}
                        >
                          <ImagePlus size={24} color={C.green} />
                          <Text style={styles.addImageText}>Add Photos</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </Field>

                  <Field label="Machine name *">
                    <FormInput
                      value={form.name}
                      onChangeText={value => setField('name', value)}
                      placeholder="e.g. Mahindra 575 DI with Rotavator"
                      maxLength={100}
                    />
                  </Field>
                  <Field label="Type of machine *">
                    <SelectChips
                      options={categoryOptions}
                      value={form.category}
                      onChange={value => setField('category', value)}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Brand">
                        <FormInput
                          value={form.brand}
                          onChangeText={value => setField('brand', value)}
                          placeholder="Mahindra"
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Model">
                        <FormInput
                          value={form.model}
                          onChangeText={value => setField('model', value)}
                          placeholder="575 DI"
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label="Model year">
                    <FormInput
                      value={form.modelYear}
                      onChangeText={value => setField('modelYear', value)}
                      placeholder="2020"
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </Field>
                </FormCard>
              </>
            )}

            {shows(1) && (
              <>
                <SectionHeading
                  icon={<Cog size={16} color={C.blue} />}
                  color={C.blue}
                  title="Specs & implements"
                />
                <FormCard>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Engine power">
                        <FormInput
                          value={form.enginePowerValue}
                          onChangeText={value =>
                            setField('enginePowerValue', value)
                          }
                          placeholder="45"
                          keyboardType="decimal-pad"
                        />
                      </Field>
                    </View>
                    <View style={styles.flexWide}>
                      <Field label="Unit">
                        <SelectChips
                          options={
                            meta.enginePowerUnits.length
                              ? meta.enginePowerUnits
                              : ['HP', 'kW', 'CC']
                          }
                          value={form.enginePowerUnit}
                          onChange={value => setField('enginePowerUnit', value)}
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label="Fuel">
                    <SelectChips
                      options={
                        meta.fuelTypes.length
                          ? meta.fuelTypes
                          : Object.keys(FUEL_LABELS)
                      }
                      labels={FUEL_LABELS}
                      value={form.fuelType}
                      onChange={value => setField('fuelType', value)}
                    />
                  </Field>
                  <Field label="Drive">
                    <SelectChips
                      options={
                        meta.driveTypes.length
                          ? meta.driveTypes
                          : ['2WD', '4WD']
                      }
                      value={form.driveType}
                      onChange={value => setField('driveType', value)}
                    />
                  </Field>

                  <SwitchRow
                    label="Comes with implements"
                    description="Rotavator, plough, trolley... that farmers can choose"
                    value={form.supportsImplements}
                    onValueChange={value =>
                      setField('supportsImplements', value)
                    }
                  />
                  {form.supportsImplements && (
                    <Field label="Implements you have">
                      <SelectChips
                        multiple
                        options={implementOptions}
                        value={form.supportedImplements}
                        onChange={value =>
                          setField('supportedImplements', value)
                        }
                      />
                    </Field>
                  )}
                </FormCard>
              </>
            )}

            {shows(2) && (
              <>
                <SectionHeading
                  icon={<IndianRupee size={16} color={C.orange} />}
                  color={C.orange}
                  title="Rent rates"
                  subtitle="Set at least one. Leave a box empty if you don't offer it."
                />
                <FormCard>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Per hour">
                        <View style={styles.moneyBox}>
                          <Text style={styles.rupee}>₹</Text>
                          <FormInput
                            value={form.hourly}
                            onChangeText={value => setField('hourly', value)}
                            placeholder="800"
                            keyboardType="decimal-pad"
                            style={styles.moneyInput}
                          />
                        </View>
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Per day">
                        <View style={styles.moneyBox}>
                          <Text style={styles.rupee}>₹</Text>
                          <FormInput
                            value={form.daily}
                            onChangeText={value => setField('daily', value)}
                            placeholder="5000"
                            keyboardType="decimal-pad"
                            style={styles.moneyInput}
                          />
                        </View>
                      </Field>
                    </View>
                  </View>

                  <Field
                    label="Other rates"
                    hint='e.g. "Rotavation" ₹1200 per acre, or "Trolley trip" ₹500 per job'
                  >
                    {form.customRates.map(rate => (
                      <View key={rate.key} style={styles.rateRow}>
                        <View style={styles.rateTop}>
                          <FormInput
                            value={rate.name}
                            onChangeText={value =>
                              updateRate(rate.key, { name: value })
                            }
                            placeholder="Rate name"
                            style={styles.flex}
                          />
                          <View style={[styles.moneyBox, styles.rateAmount]}>
                            <Text style={styles.rupee}>₹</Text>
                            <FormInput
                              value={rate.amount}
                              onChangeText={value =>
                                updateRate(rate.key, { amount: value })
                              }
                              placeholder="0"
                              keyboardType="decimal-pad"
                              style={styles.moneyInput}
                            />
                          </View>
                          <TouchableOpacity
                            hitSlop={8}
                            style={styles.rateRemove}
                            onPress={() => removeRate(rate.key)}
                          >
                            <Trash2 size={16} color={C.red} />
                          </TouchableOpacity>
                        </View>
                        <SelectChips
                          options={
                            meta.customPriceUnits.length
                              ? meta.customPriceUnits
                              : Object.keys(CUSTOM_UNIT_LABELS)
                          }
                          labels={CUSTOM_UNIT_LABELS}
                          value={rate.unit}
                          onChange={value =>
                            updateRate(rate.key, { unit: value })
                          }
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.addRate}
                      onPress={addRate}
                    >
                      <Plus size={16} color={C.green} />
                      <Text style={styles.addRateText}>Add a rate</Text>
                    </TouchableOpacity>
                  </Field>
                </FormCard>
              </>
            )}

            {shows(3) && (
              <>
                <SectionHeading
                  icon={<MapPin size={16} color={C.green} />}
                  title="Availability & location"
                />
                <FormCard>
                  <Field label="Right now it is">
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
                      <Field label="Available from">
                        <PickerField
                          icon={<Calendar size={16} color={C.green} />}
                          value={
                            form.availableFrom
                              ? formatDay(form.availableFrom, {
                                  weekday: false,
                                })
                              : ''
                          }
                          placeholder="Any time"
                          onPress={() => setDateField('availableFrom')}
                          onClear={() => setField('availableFrom', null)}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Until">
                        <PickerField
                          icon={<Calendar size={16} color={C.green} />}
                          value={
                            form.availableUntil
                              ? formatDay(form.availableUntil, {
                                  weekday: false,
                                })
                              : ''
                          }
                          placeholder="No end"
                          onPress={() => setDateField('availableUntil')}
                          onClear={() => setField('availableUntil', null)}
                        />
                      </Field>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Village">
                        <FormInput
                          value={form.village}
                          onChangeText={value => setField('village', value)}
                          placeholder="Village"
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="District">
                        <FormInput
                          value={form.district}
                          onChangeText={value => setField('district', value)}
                          placeholder="District"
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label="State">
                    <FormInput
                      value={form.state}
                      onChangeText={value => setField('state', value)}
                      placeholder="State"
                    />
                  </Field>
                  <Field
                    label="Owner name"
                    hint="Shown to farmers on your listing."
                  >
                    <FormInput
                      value={form.ownerName}
                      onChangeText={value => setField('ownerName', value)}
                      placeholder="Your name"
                      maxLength={100}
                    />
                  </Field>
                  <Field label="About the machine">
                    <FormInput
                      value={form.description}
                      onChangeText={value => setField('description', value)}
                      placeholder="Condition, operator included, diesel terms..."
                      maxLength={500}
                      multiline
                      textAlignVertical="top"
                      style={styles.textArea}
                    />
                  </Field>
                  <Field label="Note for farmers">
                    <FormInput
                      value={form.ownerNotes}
                      onChangeText={value => setField('ownerNotes', value)}
                      placeholder="e.g. Diesel to be provided by farmer"
                      maxLength={500}
                    />
                  </Field>
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
            label="Back"
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
                ? 'Uploading photos…'
                : isCreate
                ? 'List Machine'
                : 'Save Changes'
            }
            icon={<Save size={17} color={C.white} />}
            loading={saving || uploading}
            onPress={handleSave}
            style={styles.flexWide}
          />
        ) : (
          <MarketButton
            label="Next"
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

  imageList: { gap: 10 },
  imageBox: {
    width: 92,
    height: 92,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E9EFEB',
  },
  image: { width: '100%', height: '100%' },
  addImage: {
    width: 92,
    height: 92,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.lightGreen,
  },
  addImageText: {
    marginTop: 6,
    color: C.green,
    fontSize: 10.5,
    fontWeight: '800',
  },
  removeImage: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  switchLabel: { fontSize: 13, fontWeight: '800', color: C.dark },
  switchText: { fontSize: 11, color: C.muted, marginTop: 2, fontWeight: '500' },

  moneyBox: { flexDirection: 'row', alignItems: 'center' },
  rupee: {
    position: 'absolute',
    left: 13,
    zIndex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: C.green,
  },
  moneyInput: { flex: 1, paddingLeft: 30, fontSize: 15, fontWeight: '800' },
  rateRow: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.bg,
    marginBottom: 10,
    gap: 10,
  },
  rateTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateAmount: { width: 104 },
  rateRemove: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRate: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addRateText: { fontSize: 13, fontWeight: '900', color: C.green },

  textArea: { height: 90, paddingTop: 12 },

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
