import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Calendar,
  Camera,
  CircleCheck,
  FlaskConical,
  ImagePlus,
  Leaf,
  MapPin,
  Plus,
  Save,
  Tag,
  Tractor,
  Trash2,
  Truck,
  UploadCloud,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import { ChipRow, MarketButton } from '../../components/market/MarketBits';
import useMarketMeta from '../../components/market/useMarketMeta';
import { KIND_META, KIND_ORDER } from '../../components/market/kinds';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  createMarketListing,
  updateMarketListing,
} from '../../redux/slices/marketSlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadNurseryImages } from '../../utils/nurseryCloudinary';
import {
  CONDITION_LABELS,
  GRADE_LABELS,
  buildListingPayload,
  formatDate,
  formatRupees,
  isDiscreteUnit,
  validateListingForm,
} from '../../utils/marketFormat';

const MAX_IMAGES = 6;

const HERO_TIPS = [
  { icon: Camera, label: 'Clear photos' },
  { icon: Tag, label: 'Fair price' },
  { icon: CircleCheck, label: 'Free to list' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/*
 * Limits for each date field on the form.
 */
const DATE_LIMITS = {
  harvestDate: { maximumDate: () => new Date() },
  manufacturingDate: { maximumDate: () => new Date() },
  expiryDate: { minimumDate: () => new Date(Date.now() + DAY_MS) },
};

const toText = value =>
  value === undefined || value === null ? '' : String(value);

const initialForm = (listing, user) => {
  if (listing) {
    return {
      kind: listing.kind,
      category: listing.category,
      title: listing.title || '',
      description: listing.description || '',
      images: listing.images || [],
      unit: listing.unit,
      quantity: toText(listing.quantity),
      minOrderQuantity: toText(listing.minOrderQuantity),
      pricePerUnit: toText(listing.pricePerUnit),
      isNegotiable: listing.isNegotiable !== false,
      variety: listing.variety || '',
      grade: listing.grade || 'ungraded',
      isOrganic: Boolean(listing.isOrganic),
      harvestDate: listing.harvestDate || null,
      brand: listing.brand || '',
      model: listing.model || '',
      modelYear: toText(listing.modelYear),
      condition: listing.condition || null,
      usageHours: toText(listing.usageHours),
      composition: listing.composition || '',
      packSize: listing.packSize || '',
      isSealed: listing.isSealed !== false,
      manufacturingDate: listing.manufacturingDate || null,
      expiryDate: listing.expiryDate || null,
      deliveryAvailable: Boolean(listing.deliveryAvailable),
      deliveryNotes: listing.deliveryNotes || '',
      location: {
        state: listing.location?.state || '',
        district: listing.location?.district || '',
        taluka: listing.location?.taluka || '',
        village: listing.location?.village || '',
        pincode: listing.location?.pincode || '',
      },
    };
  }

  return {
    kind: 'PRODUCE',
    category: '',
    title: '',
    description: '',
    images: [],
    unit: 'quintal',
    quantity: '',
    minOrderQuantity: '',
    pricePerUnit: '',
    isNegotiable: true,
    variety: '',
    grade: 'ungraded',
    isOrganic: false,
    harvestDate: null,
    brand: '',
    model: '',
    modelYear: '',
    condition: null,
    usageHours: '',
    composition: '',
    packSize: '',
    isSealed: true,
    manufacturingDate: null,
    expiryDate: null,
    deliveryAvailable: false,
    deliveryNotes: '',
    // prefilled from the profile; the seller can change it
    location: {
      state: user?.state || '',
      district: user?.district || '',
      taluka: user?.taluka || '',
      village: user?.village || '',
      pincode: '',
    },
  };
};

function Field({ label, children, hint }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

function SwitchRow({ label, description, value, onValueChange }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.flex}>
        <Text style={styles.switchLabel}>{label}</Text>
        {!!description && <Text style={styles.hint}>{description}</Text>}
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

function DateField({ value, placeholder = 'Select date', onPress, onClear }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.input, styles.dateInput]}
      onPress={onPress}
    >
      <Calendar size={17} color={C.green} />
      <Text style={[styles.dateText, !value && styles.placeholderText]}>
        {value ? formatDate(value) : placeholder}
      </Text>
      {!!value && (
        <TouchableOpacity hitSlop={10} onPress={onClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function SectionHeading({ icon, title, color = C.green }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={[styles.sectionIcon, { backgroundColor: `${color}1A` }]}>
        {icon}
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function MarketSellScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const editingListing = route?.params?.listing || null;
  const feedback = useFeedbackModal();
  const isEdit = Boolean(editingListing);

  const user = useSelector(state => state.auth.user);
  const saving = useSelector(state => state.market.saving);
  const { categories, units, equipmentConditions, produceGrades, metaLoading } =
    useMarketMeta();

  const [form, setForm] = useState(() => initialForm(editingListing, user));
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  // which date field the picker is open for, or null
  const [dateField, setDateField] = useState(null);

  const setField = useCallback(
    (key, value) => setForm(previous => ({ ...previous, [key]: value })),
    [],
  );

  const setLocationField = useCallback(
    (key, value) =>
      setForm(previous => ({
        ...previous,
        location: { ...previous.location, [key]: value },
      })),
    [],
  );

  const isEquipment = form.kind === 'EQUIPMENT';

  const categoryOptions = useMemo(
    () =>
      categories
        .filter(item => item.kind === form.kind)
        .map(item => ({ key: item.key, label: item.label })),
    [categories, form.kind],
  );

  const selectedCategory = categories.find(item => item.key === form.category);

  const unitOptions = useMemo(
    () =>
      (units.length ? units : ['kg', 'quintal', 'ton', 'piece']).map(unit => ({
        key: unit,
        label: unit,
      })),
    [units],
  );

  const handleKindChange = kind => {
    if (isEdit || kind === form.kind) {
      return;
    }

    setForm(previous => ({
      ...previous,
      kind,
      category: '',
      unit: KIND_META[kind].defaultUnit,
      quantity:
        kind === 'EQUIPMENT' && !previous.quantity ? '1' : previous.quantity,
    }));
  };

  const totalImages = form.images.length + assets.length;

  const chooseImages = async () => {
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
      if (picked.length) {
        setAssets(previous => [...previous, ...picked].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      feedback.error(
        'Image selection failed',
        error?.message || 'Unable to select images.',
      );
    }
  };

  const handleDateChange = (event, date) => {
    const field = dateField;
    setDateField(null);

    if (event.type === 'set' && date && field) {
      setField(field, date.toISOString());
    }
  };

  const handleSubmit = async () => {
    const validationError = validateListingForm(form, {
      isCreate: !isEdit,
      category: selectedCategory,
    });

    if (validationError) {
      feedback.error('Check your listing', validationError);
      return;
    }

    try {
      let images = form.images;

      if (assets.length) {
        setUploading(true);
        const uploaded = await uploadNurseryImages(assets);
        images = [...images, ...uploaded];
        setUploading(false);
      }

      const listingData = buildListingPayload(
        { ...form, images },
        { isCreate: !isEdit },
      );

      if (isEdit) {
        await dispatch(
          updateMarketListing({ listingId: editingListing._id, listingData }),
        ).unwrap();

        feedback.success('Listing updated', 'Your changes have been saved.', {
          primaryLabel: 'Done',
          dismissable: false,
          onPrimary: () => navigation.goBack(),
        });
      } else {
        const result = await dispatch(
          createMarketListing(listingData),
        ).unwrap();

        feedback.success(
          'Listing published!',
          'Buyers can now see your listing and send offers.',
          {
            primaryLabel: 'View Listing',
            dismissable: false,
            onPrimary: () =>
              navigation.replace(MARKET_ROUTES.LISTING_DETAILS, {
                listingId: result.listing._id,
              }),
          },
        );
      }
    } catch (error) {
      setUploading(false);
      feedback.error(
        'Unable to save listing',
        typeof error === 'string'
          ? error
          : error?.message || 'Please try again.',
      );
    }
  };

  const busy = saving || uploading;

  const totalValue = Number(form.quantity) * Number(form.pricePerUnit);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <MarketHero
            onBack={() => navigation.goBack()}
            eyebrow={isEdit ? 'Update listing' : 'Free listing'}
            title={isEdit ? 'Edit your listing' : 'Sell to farmers\nnear you'}
            subtitle={
              isEdit
                ? 'Keep price and stock up to date so buyers can trust your listing.'
                : 'Add details, set your price and start getting offers in minutes.'
            }
          >
            <View style={styles.tipRow}>
              {HERO_TIPS.map(({ icon: Icon, label }) => (
                <View key={label} style={styles.tip}>
                  <Icon size={13} color="#BFF0D2" />
                  <Text style={styles.tipText}>{label}</Text>
                </View>
              ))}
            </View>
          </MarketHero>

          <View style={styles.body}>
            {/* WHAT ARE YOU SELLING */}
            <Text style={styles.sectionTitle}>What are you selling?</Text>
            <View style={styles.kindRow}>
              {KIND_ORDER.map(key => {
                const meta = KIND_META[key];
                const selected = form.kind === key;
                const locked = isEdit && !selected;

                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.88}
                    disabled={locked}
                    onPress={() => handleKindChange(key)}
                    style={[
                      styles.kindTile,
                      selected && {
                        borderColor: meta.color,
                        backgroundColor: meta.bg,
                      },
                      locked && styles.kindLocked,
                    ]}
                  >
                    <View
                      style={[
                        styles.kindImageBox,
                        { backgroundColor: meta.bg },
                      ]}
                    >
                      <Image
                        source={meta.image}
                        resizeMode={meta.imageMode}
                        style={[
                          styles.kindImage,
                          meta.imageMode === 'contain' &&
                            styles.kindImageContain,
                        ]}
                      />
                      {selected && (
                        <View
                          style={[
                            styles.kindCheck,
                            { backgroundColor: meta.color },
                          ]}
                        >
                          <CircleCheck size={13} color={C.white} />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.kindLabel,
                        selected && { color: meta.color },
                      ]}
                    >
                      {meta.label}
                    </Text>
                    <Text style={styles.kindTagline} numberOfLines={2}>
                      {meta.tagline}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {isEdit && (
              <Text style={styles.hint}>
                Type can't be changed after publishing. Create a new listing
                instead.
              </Text>
            )}

            <View style={styles.card}>
              <Field label="Category *">
                {metaLoading && !categoryOptions.length ? (
                  <ActivityIndicator color={C.green} style={styles.loader} />
                ) : (
                  <ChipRow
                    scroll={false}
                    options={categoryOptions}
                    value={form.category}
                    onChange={value => setField('category', value)}
                  />
                )}
              </Field>

              <Field
                label="Title *"
                hint={
                  selectedCategory?.examples?.length
                    ? `e.g. ${selectedCategory.examples.slice(0, 3).join(', ')}`
                    : null
                }
              >
                <TextInput
                  value={form.title}
                  onChangeText={value => setField('title', value)}
                  placeholder={
                    isEquipment
                      ? 'Mahindra 575 DI Tractor'
                      : 'Fresh Soybean, JS-335'
                  }
                  placeholderTextColor={C.placeholder}
                  maxLength={120}
                  style={styles.input}
                />
              </Field>

              <Field label="Description">
                <TextInput
                  value={form.description}
                  onChangeText={value => setField('description', value)}
                  placeholder={
                    isEquipment
                      ? 'Service history, attachments included, reason for selling...'
                      : 'Moisture, packing, storage, quality details...'
                  }
                  placeholderTextColor={C.placeholder}
                  maxLength={2000}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.textArea]}
                />
              </Field>
            </View>

            {/* PHOTOS */}
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.hint}>
              Clear photos get more offers. Add up to {MAX_IMAGES}.
            </Text>
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
                <View key={`asset-${asset.uri}`} style={styles.imageBox}>
                  <Image source={{ uri: asset.uri }} style={styles.image} />
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
                  onPress={chooseImages}
                >
                  <ImagePlus size={26} color={C.green} />
                  <Text style={styles.addImageText}>Add Photos</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* QUANTITY & PRICE */}
            <Text style={styles.sectionTitle}>Quantity & Price</Text>
            <View style={styles.card}>
              <Field label="Unit *">
                <ChipRow
                  options={unitOptions}
                  value={form.unit}
                  onChange={value => setField('unit', value)}
                />
              </Field>

              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label={isEdit ? 'Quantity left *' : 'Quantity *'}>
                    <TextInput
                      value={form.quantity}
                      onChangeText={value => setField('quantity', value)}
                      placeholder="0"
                      placeholderTextColor={C.placeholder}
                      keyboardType={
                        isDiscreteUnit(form.unit) ? 'number-pad' : 'decimal-pad'
                      }
                      style={styles.input}
                    />
                  </Field>
                </View>

                <View style={styles.flex}>
                  <Field label={`Price per ${form.unit} *`}>
                    <View style={[styles.input, styles.priceBox]}>
                      <Text style={styles.rupee}>₹</Text>
                      <TextInput
                        value={form.pricePerUnit}
                        onChangeText={value => setField('pricePerUnit', value)}
                        placeholder="0"
                        placeholderTextColor={C.placeholder}
                        keyboardType="decimal-pad"
                        style={styles.priceInput}
                      />
                    </View>
                  </Field>
                </View>
              </View>

              {isEdit && (
                <Text style={styles.hint}>
                  Set quantity to 0 to mark this listing as sold out.
                </Text>
              )}

              <Field label="Minimum order (optional)">
                <TextInput
                  value={form.minOrderQuantity}
                  onChangeText={value => setField('minOrderQuantity', value)}
                  placeholder={`Smallest amount a buyer can order, in ${form.unit}`}
                  placeholderTextColor={C.placeholder}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </Field>

              {Number.isFinite(totalValue) && totalValue > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total value of stock</Text>
                  <Text style={styles.totalValue}>
                    {formatRupees(totalValue)}
                  </Text>
                </View>
              )}

              <SwitchRow
                label="Price is negotiable"
                description="Buyers can propose their own price"
                value={form.isNegotiable}
                onValueChange={value => setField('isNegotiable', value)}
              />
            </View>

            {/* KIND SPECIFIC */}
            {form.kind === 'INPUTS' ? (
              <>
                <SectionHeading
                  icon={<FlaskConical size={16} color={C.orange} />}
                  color={C.orange}
                  title="Product Details"
                />
                <View style={styles.card}>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Brand">
                        <TextInput
                          value={form.brand}
                          onChangeText={value => setField('brand', value)}
                          placeholder="IFFCO, Bayer..."
                          placeholderTextColor={C.placeholder}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Pack size">
                        <TextInput
                          value={form.packSize}
                          onChangeText={value => setField('packSize', value)}
                          placeholder="50 kg bag"
                          placeholderTextColor={C.placeholder}
                          maxLength={50}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                  </View>

                  <Field label="Composition / technical content">
                    <TextInput
                      value={form.composition}
                      onChangeText={value => setField('composition', value)}
                      placeholder="e.g. NPK 19:19:19, Chlorpyrifos 20% EC"
                      placeholderTextColor={C.placeholder}
                      maxLength={200}
                      style={styles.input}
                    />
                  </Field>

                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Manufactured">
                        <DateField
                          value={form.manufacturingDate}
                          onPress={() => setDateField('manufacturingDate')}
                          onClear={() => setField('manufacturingDate', null)}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field
                        label={
                          selectedCategory?.requiresExpiry
                            ? 'Expiry *'
                            : 'Expiry'
                        }
                      >
                        <DateField
                          value={form.expiryDate}
                          onPress={() => setDateField('expiryDate')}
                          onClear={() => setField('expiryDate', null)}
                        />
                      </Field>
                    </View>
                  </View>

                  {selectedCategory?.requiresExpiry && (
                    <Text style={styles.hint}>
                      {selectedCategory.label} must have an expiry date. Expired
                      products can't be listed or sold.
                    </Text>
                  )}

                  <SwitchRow
                    label="Sealed, unopened pack"
                    description="Buyers trust sealed packs more"
                    value={form.isSealed}
                    onValueChange={value => setField('isSealed', value)}
                  />
                </View>
              </>
            ) : isEquipment ? (
              <>
                <SectionHeading
                  icon={<Tractor size={16} color={C.blue} />}
                  color={C.blue}
                  title="Equipment Details"
                />
                <View style={styles.card}>
                  <Field label="Condition *">
                    <ChipRow
                      scroll={false}
                      options={(equipmentConditions.length
                        ? equipmentConditions
                        : Object.keys(CONDITION_LABELS)
                      ).map(key => ({
                        key,
                        label: CONDITION_LABELS[key] || key,
                      }))}
                      value={form.condition}
                      onChange={value => setField('condition', value)}
                    />
                  </Field>

                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Brand">
                        <TextInput
                          value={form.brand}
                          onChangeText={value => setField('brand', value)}
                          placeholder="Mahindra"
                          placeholderTextColor={C.placeholder}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Model">
                        <TextInput
                          value={form.model}
                          onChangeText={value => setField('model', value)}
                          placeholder="575 DI"
                          placeholderTextColor={C.placeholder}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Model year">
                        <TextInput
                          value={form.modelYear}
                          onChangeText={value => setField('modelYear', value)}
                          placeholder="2019"
                          placeholderTextColor={C.placeholder}
                          keyboardType="number-pad"
                          maxLength={4}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Usage (hours)">
                        <TextInput
                          value={form.usageHours}
                          onChangeText={value => setField('usageHours', value)}
                          placeholder="1200"
                          placeholderTextColor={C.placeholder}
                          keyboardType="number-pad"
                          style={styles.input}
                        />
                      </Field>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <SectionHeading
                  icon={<Leaf size={16} color={C.green} />}
                  title="Produce Details"
                />
                <View style={styles.card}>
                  <Field label="Variety">
                    <TextInput
                      value={form.variety}
                      onChangeText={value => setField('variety', value)}
                      placeholder="e.g. JS-335, Nashik Red"
                      placeholderTextColor={C.placeholder}
                      style={styles.input}
                    />
                  </Field>

                  <Field label="Grade">
                    <ChipRow
                      scroll={false}
                      options={(produceGrades.length
                        ? produceGrades
                        : Object.keys(GRADE_LABELS)
                      ).map(key => ({ key, label: GRADE_LABELS[key] || key }))}
                      value={form.grade}
                      onChange={value => setField('grade', value)}
                    />
                  </Field>

                  <Field label="Harvest date">
                    <DateField
                      value={form.harvestDate}
                      onPress={() => setDateField('harvestDate')}
                      onClear={() => setField('harvestDate', null)}
                    />
                  </Field>

                  <SwitchRow
                    label="Organic produce"
                    description="Grown without chemical fertilizers or pesticides"
                    value={form.isOrganic}
                    onValueChange={value => setField('isOrganic', value)}
                  />
                </View>
              </>
            )}

            {/* DELIVERY */}
            <SectionHeading
              icon={<Truck size={16} color={C.blue} />}
              color={C.blue}
              title="Delivery"
            />
            <View style={styles.card}>
              <SwitchRow
                label="I can deliver"
                description="Otherwise buyers will pick up from your location"
                value={form.deliveryAvailable}
                onValueChange={value => setField('deliveryAvailable', value)}
              />

              {form.deliveryAvailable && (
                <Field label="Delivery notes">
                  <TextInput
                    value={form.deliveryNotes}
                    onChangeText={value => setField('deliveryNotes', value)}
                    placeholder="e.g. Free within 20 km, transport charges extra beyond"
                    placeholderTextColor={C.placeholder}
                    maxLength={300}
                    style={styles.input}
                  />
                </Field>
              )}
            </View>

            {/* LOCATION */}
            <SectionHeading
              icon={<MapPin size={16} color={C.green} />}
              title="Location"
            />
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label="Village">
                    <TextInput
                      value={form.location.village}
                      onChangeText={value => setLocationField('village', value)}
                      placeholder="Village"
                      placeholderTextColor={C.placeholder}
                      style={styles.input}
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label="Taluka">
                    <TextInput
                      value={form.location.taluka}
                      onChangeText={value => setLocationField('taluka', value)}
                      placeholder="Taluka"
                      placeholderTextColor={C.placeholder}
                      style={styles.input}
                    />
                  </Field>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label="District">
                    <TextInput
                      value={form.location.district}
                      onChangeText={value =>
                        setLocationField('district', value)
                      }
                      placeholder="District"
                      placeholderTextColor={C.placeholder}
                      style={styles.input}
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label="State">
                    <TextInput
                      value={form.location.state}
                      onChangeText={value => setLocationField('state', value)}
                      placeholder="State"
                      placeholderTextColor={C.placeholder}
                      style={styles.input}
                    />
                  </Field>
                </View>
              </View>

              <Field label="Pincode">
                <TextInput
                  value={form.location.pincode}
                  onChangeText={value => setLocationField('pincode', value)}
                  placeholder="411001"
                  placeholderTextColor={C.placeholder}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />
              </Field>

              {!isEdit && (
                <Text style={styles.hint}>
                  Left blank? We'll use the location from your profile.
                </Text>
              )}
            </View>

            <MarketButton
              label={
                uploading
                  ? 'Uploading photos…'
                  : isEdit
                  ? 'Save Changes'
                  : 'Publish Listing'
              }
              icon={
                isEdit ? (
                  <Save size={18} color={C.white} />
                ) : (
                  <Plus size={18} color={C.white} />
                )
              }
              loading={busy}
              onPress={handleSubmit}
              style={styles.submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!!dateField && (
        <DateTimePicker
          value={form[dateField] ? new Date(form[dateField]) : new Date()}
          mode="date"
          minimumDate={DATE_LIMITS[dateField].minimumDate?.()}
          maximumDate={DATE_LIMITS[dateField].maximumDate?.()}
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
  scrollContent: { paddingBottom: 40 },
  body: { paddingHorizontal: 16 },

  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tipText: { color: C.white, fontSize: 11, fontWeight: '800' },

  kindRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  kindTile: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 8,
    paddingBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  kindLocked: { opacity: 0.45 },
  kindImageBox: { height: 70, borderRadius: 13, overflow: 'hidden' },
  kindImage: { width: '100%', height: '100%' },
  kindImageContain: { transform: [{ scale: 0.9 }] },
  kindCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindLabel: { fontSize: 12.5, fontWeight: '900', color: C.dark, marginTop: 8 },
  kindTagline: {
    fontSize: 9.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
    lineHeight: 13,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { alignSelf: 'flex-start', marginVertical: 8 },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
    marginTop: 22,
  },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  hint: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
    marginTop: 5,
    fontWeight: '500',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    paddingTop: 4,
    marginTop: 12,
    ...MARKET_SHADOW,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.dark,
    marginTop: 14,
    marginBottom: 7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 13.5,
    color: C.dark,
    backgroundColor: C.input,
  },
  textArea: { height: 100, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  rupee: { paddingLeft: 13, fontSize: 14.5, fontWeight: '800', color: C.green },
  priceInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 13.5,
    color: C.dark,
  },

  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateText: { flex: 1, fontSize: 13.5, color: C.dark },
  placeholderText: { color: C.placeholder },
  clearText: { fontSize: 12, fontWeight: '800', color: C.red },

  totalRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: 12, fontWeight: '700', color: C.text },
  totalValue: { fontSize: 14, fontWeight: '900', color: C.green },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  switchLabel: { fontSize: 13, fontWeight: '800', color: C.dark },

  imageList: { gap: 10, paddingVertical: 12 },
  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E9EFEB',
  },
  image: { width: '100%', height: '100%' },
  addImage: {
    width: 100,
    height: 100,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submit: { marginTop: 24 },
});
