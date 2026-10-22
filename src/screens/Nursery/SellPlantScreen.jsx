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
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  ImagePlus,
  MapPin,
  Save,
  Sprout,
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
  SectionHeading,
  SelectChips,
} from '../../components/labour/FormBits';
import PlantGridCard from '../../components/nursery/PlantGridCard';
import useNurseryMeta from '../../components/nursery/useNurseryMeta';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import { saveNurseryPlant } from '../../redux/slices/nurserySlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadNurseryImages } from '../../utils/nurseryCloudinary';
import { formatRupees } from '../../utils/marketFormat';
import { MAX_PLANT_IMAGES, buildPlantPayload } from '../../utils/nurseryFormat';

const STEPS = [
  { title: 'Your plant', text: 'Name, category and photos' },
  { title: 'Price & stock', text: 'What you charge and how many you have' },
  { title: 'Location & details', text: 'Where buyers get it from' },
];

// page each validated field lives on (fields from buildPlantPayload)
const STEP_OF_FIELD = {
  name: 0,
  category: 0,
  images: 0,
  price: 1,
  quantity: 1,
  description: 2,
};

const toText = value =>
  value === undefined || value === null ? '' : String(value);

const initialForm = (plant, user) => ({
  name: plant?.name || '',
  category: plant?.category || '',
  images: plant?.images || [],
  price: toText(plant?.price),
  quantity: toText(plant?.quantity),
  description: plant?.description || '',
  district: plant?.location?.district ?? user?.district ?? '',
  state: plant?.location?.state ?? user?.state ?? '',
  isActive: plant?.isActive !== false,
});

export default function SellPlantScreen({ navigation, route }) {
  const editing = route.params?.plant || null;
  const isCreate = !editing;

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const scrollRef = useRef(null);
  const meta = useNurseryMeta();

  const user = useSelector(state => state.auth.user);
  const saving = useSelector(state => state.nursery.saving);

  const [form, setForm] = useState(() => initialForm(editing, user));
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
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

  const validate = () =>
    buildPlantPayload(
      { ...form, images: [...form.images, ...assets.map(asset => asset.uri)] },
      { isCreate },
    );

  const handleNext = () => {
    const { error, field } = validate();
    const errorStep = STEP_OF_FIELD[field];

    if (error && errorStep <= step) {
      if (errorStep < step) goToStep(errorStep);
      feedback.error('Check your plant details', error);
      return;
    }

    goToStep(step + 1);
  };

  /* PHOTOS */

  const totalImages = form.images.length + assets.length;

  const choosePhotos = async () => {
    const remaining = MAX_PLANT_IMAGES - totalImages;

    if (remaining <= 0) {
      feedback.info(
        'Maximum reached',
        `You can add up to ${MAX_PLANT_IMAGES} photos.`,
      );
      return;
    }

    try {
      const picked = await pickNurseryImages({ selectionLimit: remaining });
      if (picked.length) {
        setAssets(previous =>
          [...previous, ...picked].slice(0, MAX_PLANT_IMAGES),
        );
      }
    } catch (error) {
      feedback.error('Could not open photos', error?.message);
    }
  };

  /* SAVE */

  const handleSave = async () => {
    const { error, field } = validate();

    if (error) {
      if (isCreate && STEP_OF_FIELD[field] !== undefined) {
        goToStep(STEP_OF_FIELD[field]);
      }
      feedback.error('Check your plant details', error);
      return;
    }

    const { payload } = buildPlantPayload(form, { isCreate });
    if (!isCreate) payload.isActive = form.isActive;

    try {
      if (assets.length) {
        setUploading(true);
        const uploaded = await uploadNurseryImages(assets);
        payload.images = [...payload.images, ...uploaded];
        setUploading(false);
      }

      const result = await dispatch(
        saveNurseryPlant({ plantId: editing?._id, plantData: payload }),
      ).unwrap();

      if (isCreate) {
        feedback.success(
          'Your plant is listed!',
          'Buyers can now find it and order with cash on delivery.',
          {
            primaryLabel: 'View Listing',
            secondaryLabel: 'My Nursery',
            dismissable: false,
            onPrimary: () =>
              navigation.replace(NURSERY_ROUTES.PLANT, {
                plantId: result.data._id,
              }),
            onSecondary: () => navigation.goBack(),
          },
        );
      } else {
        feedback.success(
          'Plant updated',
          'New prices apply to new orders. Orders already placed keep their price.',
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
        'Could not save plant',
        typeof failure === 'string' ? failure : failure?.message,
      );
    }
  };

  const suggested = meta.categories || [];
  const isCustomCategory =
    !!form.category &&
    !suggested.some(
      item => item.toLowerCase() === form.category.trim().toLowerCase(),
    );

  const preview = {
    _id: 'preview',
    name: form.name || 'Your plant name',
    category: form.category || 'Category',
    price: Number(form.price) || 0,
    quantity: Number(form.quantity) || 0,
    images: [...form.images, ...assets.map(asset => asset.uri)],
    location: { district: form.district, state: form.state },
  };

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
            eyebrow={isCreate ? 'Sell a plant' : 'Edit listing'}
            title={isCreate ? 'List your plant' : editing.name}
            subtitle={
              isCreate
                ? STEPS[step].text
                : 'Price changes only apply to new orders.'
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
                  icon={<Sprout size={16} color={C.green} />}
                  title="Your plant"
                />
                <FormCard>
                  <Field
                    label="Photos"
                    hint={`Real photos of your plants sell faster. Up to ${MAX_PLANT_IMAGES}.`}
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
                      {totalImages < MAX_PLANT_IMAGES && (
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

                  <Field label="Plant name *">
                    <FormInput
                      value={form.name}
                      onChangeText={value => setField('name', value)}
                      placeholder="e.g. Alphonso Mango grafted sapling"
                      maxLength={100}
                    />
                  </Field>

                  <Field label="Category *">
                    <SelectChips
                      options={suggested}
                      value={isCustomCategory ? null : form.category}
                      onChange={value => setField('category', value)}
                    />
                  </Field>
                  <Field
                    label="Or type your own category"
                    hint="Use this if none of the above fits."
                  >
                    <FormInput
                      value={isCustomCategory ? form.category : ''}
                      onChangeText={value => setField('category', value)}
                      placeholder="e.g. Bonsai"
                      maxLength={100}
                    />
                  </Field>
                </FormCard>
              </>
            )}

            {shows(1) && (
              <>
                <SectionHeading
                  icon={<Boxes size={16} color={C.blue} />}
                  color={C.blue}
                  title="Price & stock"
                />
                <FormCard>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Price per plant *">
                        <View style={styles.moneyBox}>
                          <Text style={styles.rupee}>₹</Text>
                          <FormInput
                            value={form.price}
                            onChangeText={value =>
                              setField('price', value.replace(/[^0-9.]/g, ''))
                            }
                            placeholder="0"
                            keyboardType="decimal-pad"
                            style={styles.moneyInput}
                          />
                        </View>
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Plants in stock *">
                        <FormInput
                          value={form.quantity}
                          onChangeText={value =>
                            setField('quantity', value.replace(/\D/g, ''))
                          }
                          placeholder="e.g. 50"
                          keyboardType="number-pad"
                          style={styles.moneyInput}
                        />
                      </Field>
                    </View>
                  </View>

                  <View style={styles.deliveryNote}>
                    <Text style={styles.deliveryNoteText}>
                      Buyers pay {formatRupees(meta.delivery.fee)} delivery on
                      orders below {formatRupees(meta.delivery.freeAbove)}.
                      Stock goes down automatically when someone orders, and
                      comes back if the order is cancelled.
                    </Text>
                  </View>
                </FormCard>

                {isCreate && (
                  <>
                    <Text style={styles.previewTitle}>
                      How buyers will see it
                    </Text>
                    <View style={styles.preview}>
                      <PlantGridCard plant={preview} width={180} />
                    </View>
                  </>
                )}
              </>
            )}

            {shows(2) && (
              <>
                <SectionHeading
                  icon={<MapPin size={16} color={C.orange} />}
                  color={C.orange}
                  title="Location & details"
                />
                <FormCard>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="District">
                        <FormInput
                          value={form.district}
                          onChangeText={value => setField('district', value)}
                          placeholder="District"
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="State">
                        <FormInput
                          value={form.state}
                          onChangeText={value => setField('state', value)}
                          placeholder="State"
                        />
                      </Field>
                    </View>
                  </View>
                  <Field
                    label="About this plant"
                    hint="Age, height, variety, care tips, pot or bag size..."
                  >
                    <FormInput
                      value={form.description}
                      onChangeText={value => setField('description', value)}
                      placeholder="e.g. 2 year old grafted sapling, 2-3 ft tall, in 8 inch bag"
                      maxLength={1000}
                      multiline
                      textAlignVertical="top"
                      style={styles.textArea}
                    />
                  </Field>

                  {!isCreate && (
                    <View style={styles.switchRow}>
                      <View style={styles.flex}>
                        <Text style={styles.switchLabel}>Show to buyers</Text>
                        <Text style={styles.switchText}>
                          Turn off to pause this listing
                        </Text>
                      </View>
                      <Switch
                        value={form.isActive}
                        onValueChange={value => setField('isActive', value)}
                        trackColor={{ true: C.green, false: '#D0D5D2' }}
                        thumbColor={C.white}
                      />
                    </View>
                  )}
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
                ? 'List Plant'
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
  deliveryNote: {
    marginTop: 14,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightBlue,
  },
  deliveryNoteText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E3A8A',
    lineHeight: 17,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: C.muted,
    marginTop: 20,
    marginBottom: 10,
  },
  preview: { alignItems: 'center' },

  textArea: { height: 110, paddingTop: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 6,
  },
  switchLabel: { fontSize: 13, fontWeight: '800', color: C.dark },
  switchText: { fontSize: 11, color: C.muted, marginTop: 2, fontWeight: '500' },

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
