import React, {useEffect, useState, useCallback, useMemo, memo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ImagePlus,
  Leaf,
  MapPin,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  createNurseryPlant,
  fetchNurseryCategories,
  updateNurseryPlant,
} from '../../redux/slices/nurserySlice';
import {pickNurseryImages} from '../../utils/nurseryImagePicker';
import {uploadNurseryImages} from '../../utils/nurseryCloudinary';

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F6F8F7';
const MUTED = '#747B78';
const BORDER = '#E1E6E3';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';

/* ---------- Memoized Local Image Thumbnail ---------- */
const SelectedImageItem = memo(({uri, onRemove, isExisting, index}) => (
  <View style={styles.imageBox}>
    <Image source={{uri}} style={styles.selectedImage} />
    {!isExisting && (
      <View style={styles.newImageBadge}>
        <UploadCloud size={11} color={WHITE} />
      </View>
    )}
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.removeImageButton}
      onPress={() => onRemove(index, isExisting)}>
      <Trash2 size={13} color={WHITE} />
    </TouchableOpacity>
  </View>
));

/* ---------- Memoized Category Selector ---------- */
const CategoryChipItem = memo(({item, selected, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[
      styles.categoryChip,
      selected && styles.selectedCategoryChip,
    ]}
    onPress={() => onPress(item)}>
    <Text
      style={[
        styles.categoryChipText,
        selected && styles.selectedCategoryText,
      ]}>
      {item}
    </Text>
  </TouchableOpacity>
));

const SellPlantScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const editingPlant = route?.params?.plant || null;
  const isEditMode = Boolean(editingPlant);

  const {categories = [], categoriesLoading, creating, updating} = useSelector(
    state => state.nursery,
  );

  const [name, setName] = useState(editingPlant?.name || '');
  const [category, setCategory] = useState(editingPlant?.category || '');
  const [description, setDescription] = useState(editingPlant?.description || '');
  const [price, setPrice] = useState(editingPlant?.price ? String(editingPlant.price) : '');
  const [quantity, setQuantity] = useState(editingPlant?.quantity ? String(editingPlant.quantity) : '');
  const [stateName, setStateName] = useState(editingPlant?.location?.state || '');
  const [district, setDistrict] = useState(editingPlant?.location?.district || '');
  const [images, setImages] = useState(editingPlant?.images || []);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!categories?.length) {
      dispatch(fetchNurseryCategories());
    }
  }, [dispatch, categories]);

  const chooseImages = useCallback(async () => {
    try {
      const remaining = 5 - (images.length + selectedAssets.length);
      if (remaining <= 0) {
        Alert.alert('Maximum reached', 'You can add up to 5 images.');
        return;
      }

      const assets = await pickNurseryImages({selectionLimit: remaining});
      if (assets.length > 0) {
        setSelectedAssets(prev => [...prev, ...assets]);
      }
    } catch (error) {
      Alert.alert('Image selection failed', error?.message || 'Unable to select images.');
    }
  }, [images.length, selectedAssets.length]);

  const handleRemoveImage = useCallback((index, isExisting) => {
    if (isExisting) {
      setImages(prev => prev.filter((_, idx) => idx !== index));
    } else {
      setSelectedAssets(prev => prev.filter((_, idx) => idx !== index));
    }
  }, []);

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Plant name required', 'Please enter the plant name.');
      return false;
    }
    if (!category.trim()) {
      Alert.alert('Category required', 'Please select a plant category.');
      return false;
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid plant price.');
      return false;
    }
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Invalid quantity', 'Please enter the available quantity.');
      return false;
    }
    return true;
  }, [name, category, price, quantity]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      let finalImages = [...images];

      if (selectedAssets.length > 0) {
        setUploading(true);
        const uploadedUrls = await uploadNurseryImages(selectedAssets);
        finalImages = [...finalImages, ...uploadedUrls];
        setUploading(false);
      }

      const payload = {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        images: finalImages,
        price: Number(price),
        quantity: Number(quantity),
        state: stateName.trim(),
        district: district.trim(),
      };

      if (isEditMode) {
        await dispatch(
          updateNurseryPlant({
            plantId: editingPlant._id,
            data: payload,
          }),
        ).unwrap();

        Alert.alert(
          'Listing updated',
          'Your plant listing has been updated successfully.',
          [{text: 'OK', onPress: () => navigation.goBack()}],
        );
      } else {
        await dispatch(createNurseryPlant(payload)).unwrap();
        Alert.alert(
          'Plant listed',
          'Your plant has been added to the Nursery marketplace.',
          [
            {
              text: 'View Listings',
              onPress: () => navigation.replace('MyNurseryListings'),
            },
          ],
        );
      }
    } catch (error) {
      setUploading(false);
      Alert.alert(
        'Unable to save listing',
        error?.message || error?.error || 'Something went wrong. Please try again.',
      );
    }
  }, [
    validateForm,
    images,
    selectedAssets,
    name,
    category,
    description,
    price,
    quantity,
    stateName,
    district,
    isEditMode,
    editingPlant?._id,
    dispatch,
    navigation,
  ]);

  const handleCategoryPress = useCallback((item) => {
    setCategory(item);
  }, []);

  const totalImageCount = useMemo(() => {
    return images.length + selectedAssets.length;
  }, [images.length, selectedAssets.length]);

  const busy = creating || updating || uploading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={21} color={DARK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Plant' : 'Sell Your Plant'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          
          {/* INTRO HERO */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Leaf size={22} color={GREEN} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.introTitle}>
                {isEditMode ? 'Update your listing' : 'List your plant'}
              </Text>
              <Text style={styles.introText}>
                Add accurate details so buyers can easily find your plant listing.
              </Text>
            </View>
          </View>

          {/* IMAGE ROW */}
          <Text style={styles.sectionTitle}>Plant Photos</Text>
          <Text style={styles.sectionSubtitle}>Add up to 5 clear photos of your plant.</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageList}>
            
            {/* EXISTING CLOUDINARY IMAGES */}
            {images.map((img, index) => (
              <SelectedImageItem
                key={`existing-${img}-${index}`}
                uri={img}
                index={index}
                isExisting={true}
                onRemove={handleRemoveImage}
              />
            ))}

            {/* NEW LOCAL SELECTED ASSETS */}
            {selectedAssets.map((asset, index) => (
              <SelectedImageItem
                key={`asset-${index}`}
                uri={asset.uri}
                index={index}
                isExisting={false}
                onRemove={handleRemoveImage}
              />
            ))}

            {totalImageCount < 5 && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addImageBox}
                onPress={chooseImages}>
                <ImagePlus size={26} color={GREEN} />
                <Text style={styles.addImageText}>Add Photos</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Plant Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Alphonso Mango Plant"
              placeholderTextColor="#A3AAA7"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Category *</Text>
            {categoriesLoading ? (
              <ActivityIndicator size="small" color={GREEN} style={{alignSelf: 'flex-start', marginVertical: 8}} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}>
                {categories.map((item) => (
                  <CategoryChipItem
                    key={item}
                    item={item}
                    selected={category === item}
                    onPress={handleCategoryPress}
                  />
                ))}
              </ScrollView>
            )}

            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Or enter custom category"
              placeholderTextColor="#A3AAA7"
              style={[styles.input, {marginTop: 10}]}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe plant growth, age, watering needs..."
              placeholderTextColor="#A3AAA7"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Price *</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="150"
                    placeholderTextColor="#A3AAA7"
                    keyboardType="numeric"
                    style={styles.priceInput}
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Quantity *</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="20"
                  placeholderTextColor="#A3AAA7"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* LOCATION CARD */}
          <View style={styles.formCard}>
            <View style={styles.locationTitleRow}>
              <MapPin size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Seller Location</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Allows buyers in your area to locate you.</Text>

            <Text style={styles.fieldLabel}>State</Text>
            <TextInput
              value={stateName}
              onChangeText={setStateName}
              placeholder="Maharashtra"
              placeholderTextColor="#A3AAA7"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>District</Text>
            <TextInput
              value={district}
              onChangeText={setDistrict}
              placeholder="Pune"
              placeholderTextColor="#A3AAA7"
              style={styles.input}
            />
          </View>

          {/* COD NOTIFICATION */}
          <View style={styles.codCard}>
            <Text style={styles.codTitle}>🌱 Simple Marketplace Model</Text>
            <Text style={styles.codText}>
              Buyers will purchase using Cash on Delivery. Hand-to-hand transactions keep process simple and direct.
            </Text>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busy}
            style={[styles.submitButton, busy && styles.disabledButton]}
            onPress={handleSubmit}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Listing' : 'List Plant'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4F6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {fontSize: 16, fontWeight: '900', color: DARK, letterSpacing: -0.3},
  headerSpacer: {width: 40},
  scrollContent: {padding: 16, paddingBottom: 40},

  /* HERO */
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 18,
    padding: 15,
    marginBottom: 22,
  },
  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  introTitle: {fontSize: 15, fontWeight: '900', color: DARK, letterSpacing: -0.2},
  introText: {marginTop: 4, fontSize: 11.5, lineHeight: 17, color: MUTED, fontWeight: '500'},

  /* SECTIONS */
  sectionTitle: {fontSize: 16, fontWeight: '900', color: DARK, letterSpacing: -0.2},
  sectionSubtitle: {fontSize: 11.5, color: MUTED, lineHeight: 17, marginTop: 4, fontWeight: '500'},

  /* IMAGES */
  imageList: {gap: 10, paddingVertical: 12},
  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E9EFEB',
  },
  selectedImage: {width: '100%', height: '100%'},
  addImageBox: {
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },
  addImageText: {marginTop: 6, color: GREEN, fontSize: 10.5, fontWeight: '800'},
  removeImageButton: {
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
  newImageBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* FORM CARD */
  formCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
  },
  fieldLabel: {fontSize: 12, fontWeight: '800', color: DARK, marginTop: 14, marginBottom: 7},
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 13.5,
    color: DARK,
    backgroundColor: '#FBFCFB',
  },
  textArea: {height: 100, paddingTop: 12},

  /* CHIPS */
  categoryList: {gap: 8, paddingVertical: 2},
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  selectedCategoryChip: {backgroundColor: LIGHT_GREEN, borderColor: GREEN},
  categoryChipText: {fontSize: 11.5, color: MUTED, fontWeight: '700'},
  selectedCategoryText: {color: GREEN},

  /* PRICING ROW */
  row: {flexDirection: 'row', gap: 12},
  halfField: {flex: 1},
  priceInputWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFCFB',
  },
  rupeeSymbol: {paddingLeft: 13, fontSize: 14.5, fontWeight: '800', color: GREEN},
  priceInput: {flex: 1, height: '100%', paddingHorizontal: 8, fontSize: 13.5, color: DARK, paddingVertical: 0},

  /* LOCATION */
  locationTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cardTitle: {fontSize: 15, fontWeight: '900', color: DARK, letterSpacing: -0.2},

  /* COD */
  codCard: {backgroundColor: '#FFF9E8', borderRadius: 16, padding: 15, marginTop: 12},
  codTitle: {color: '#725C19', fontWeight: '900', fontSize: 13.5, letterSpacing: -0.2},
  codText: {color: '#806E36', fontSize: 11.5, lineHeight: 17, marginTop: 5, fontWeight: '500'},

  /* SUBMIT */
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {opacity: 0.65},
  submitButtonText: {color: WHITE, fontSize: 14, fontWeight: '900'},
});

export default SellPlantScreen;