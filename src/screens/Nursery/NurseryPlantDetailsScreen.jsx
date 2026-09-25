import React, {useEffect, useState, useCallback, useMemo, memo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Store,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchNurseryPlantById} from '../../redux/slices/nurserySlice';
import {addToNurseryCart, fetchNurseryCart} from '../../redux/slices/nurseryCartSlice';

const {width} = Dimensions.get('window');

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F6F8F7';
const MUTED = '#747B78';
const BORDER = '#E5E9E7';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';

/* ---------- Memoized Thumbnail Item ---------- */
const ThumbnailItem = memo(({item, active, index, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => onPress(index)}
    style={[
      styles.thumbnailWrapper,
      active && styles.activeThumbnail,
    ]}>
    <Image source={{uri: item}} style={styles.thumbnail} />
  </TouchableOpacity>
));

const NurseryPlantDetailsScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const plantId = route?.params?.plantId;

  const {selectedPlant, plantLoading} = useSelector(state => state.nursery);
  const {adding} = useSelector(state => state.nurseryCart);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (plantId) {
      dispatch(fetchNurseryPlantById(plantId));
    }
  }, [dispatch, plantId]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [selectedPlant?._id]);

  const images = useMemo(() => selectedPlant?.images || [], [selectedPlant]);
  const maxQuantity = useMemo(() => Number(selectedPlant?.quantity || 0), [selectedPlant]);
  const price = useMemo(() => Number(selectedPlant?.price || 0), [selectedPlant]);
  const totalPrice = useMemo(() => price * quantity, [price, quantity]);

  const increaseQuantity = useCallback(() => {
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    }
  }, [quantity, maxQuantity]);

  const decreaseQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedPlant?._id) return;

    if (maxQuantity <= 0) {
      Alert.alert('Out of stock', 'This plant is currently unavailable.');
      return;
    }

    try {
      await dispatch(
        addToNurseryCart({
          plantId: selectedPlant._id,
          quantity,
        }),
      ).unwrap();

      await dispatch(fetchNurseryCart());

      Alert.alert(
        'Added to cart',
        `${selectedPlant.name} has been added to your cart.`,
        [
          {text: 'Continue Shopping', style: 'cancel'},
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('NurseryCart'),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        'Unable to add',
        err?.message || err?.error || 'Could not add this plant to your cart.',
      );
    }
  }, [dispatch, selectedPlant, quantity, maxQuantity, navigation]);

  const handleThumbnailPress = useCallback((index) => {
    setActiveImage(index);
  }, []);

  const renderThumbnail = useCallback(({item, index}) => (
    <ThumbnailItem
      item={item}
      active={activeImage === index}
      index={index}
      onPress={handleThumbnailPress}
    />
  ), [activeImage, handleThumbnailPress]);

  const thumbnailKeyExtractor = useCallback((item, index) => `${item}-${index}`, []);

  const handlePrevImage = useCallback(() => {
    setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (plantLoading && !selectedPlant) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Loading plant details...</Text>
      </SafeAreaView>
    );
  }

  if (!selectedPlant) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Leaf size={48} color={GREEN} />
        <Text style={styles.emptyTitle}>Plant not found</Text>
        <Text style={styles.emptyText}>
          This plant may have been removed or is no longer available.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={21} color={DARK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Plant Details</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={() => navigation.navigate('NurseryCart')}>
          <ShoppingCart size={20} color={DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* IMAGE SECTION */}
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <>
              <Image
                source={{uri: images[activeImage]}}
                style={styles.mainImage}
                resizeMode="cover"
              />

              {images.length > 1 && (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.imageArrow, styles.leftArrow]}
                    onPress={handlePrevImage}>
                    <ChevronLeft size={20} color={DARK} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.imageArrow, styles.rightArrow]}
                    onPress={handleNextImage}>
                    <ChevronRight size={20} color={DARK} />
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <View style={styles.noImage}>
              <Leaf size={65} color={GREEN} />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
        </View>

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <FlatList
            horizontal
            data={images}
            keyExtractor={thumbnailKeyExtractor}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            renderItem={renderThumbnail}
            removeClippedSubviews
          />
        )}

        {/* CONTENT INFO */}
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Leaf size={12} color={GREEN} />
              <Text style={styles.categoryText}>{selectedPlant.category}</Text>
            </View>

            {maxQuantity > 0 ? (
              <View style={styles.availableBadge}>
                <CheckCircle2 size={13} color={GREEN} fill={LIGHT_GREEN} />
                <Text style={styles.availableText}>Available</Text>
              </View>
            ) : (
              <Text style={styles.outOfStock}>Out of stock</Text>
            )}
          </View>

          <Text style={styles.title}>{selectedPlant.name}</Text>
          <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>

          {/* SELLER */}
          {selectedPlant.seller && (
            <View style={styles.sellerCard}>
              <View style={styles.sellerIcon}>
                <Store size={19} color={GREEN} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerLabel}>Sold by</Text>
                <Text style={styles.sellerName}>
                  {selectedPlant.seller.name || 'KhetiMaster Seller'}
                </Text>
              </View>
            </View>
          )}

          {/* LOCATION */}
          {selectedPlant.location && (
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <MapPin size={18} color={GREEN} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Seller location</Text>
                <Text style={styles.locationValue}>
                  {selectedPlant.location.district || ''}
                  {selectedPlant.location.state ? `, ${selectedPlant.location.state}` : ''}
                </Text>
              </View>
            </View>
          )}

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this plant</Text>
            <Text style={styles.description}>
              {selectedPlant.description || 'No description available for this plant.'}
            </Text>
          </View>

          {/* STOCK INFO */}
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Available quantity</Text>
            <Text style={styles.stockValue}>{maxQuantity} plants</Text>
          </View>

          {/* QUANTITY PICKER */}
          {maxQuantity > 0 && (
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>

              <View style={styles.quantityRow}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.quantityButton}
                    onPress={decreaseQuantity}>
                    <Minus size={16} color={DARK} />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{quantity}</Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.quantityButton}
                    onPress={increaseQuantity}>
                    <Plus size={16} color={DARK} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.totalPrice}>
                  ₹{totalPrice.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM ADD TO CART */}
      {maxQuantity > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addCartButton}
            disabled={adding}
            onPress={handleAddToCart}>
            {adding ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <ShoppingCart size={19} color="#FFFFFF" />
                <Text style={styles.addCartText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  loadingText: {marginTop: 12, fontSize: 13, color: MUTED},
  emptyTitle: {marginTop: 16, fontSize: 19, fontWeight: '900', color: DARK, letterSpacing: -0.3},
  emptyText: {marginTop: 8, textAlign: 'center', color: MUTED, lineHeight: 20, fontSize: 12},
  primaryButton: {
    marginTop: 24,
    backgroundColor: GREEN,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {color: '#FFFFFF', fontWeight: '900', fontSize: 13},

  /* HEADER */
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F6',
  },
  headerTitle: {fontSize: 16, fontWeight: '900', color: DARK, letterSpacing: -0.3},
  scrollContent: {paddingBottom: 110},

  /* IMAGE SECTION */
  imageSection: {
    width: width,
    height: width * 0.82,
    backgroundColor: '#EAF2EC',
    position: 'relative',
  },
  mainImage: {width: '100%', height: '100%'},
  noImage: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  noImageText: {marginTop: 10, color: MUTED, fontSize: 13, fontWeight: '600'},
  imageArrow: {
    position: 'absolute',
    top: '44%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftArrow: {left: 14},
  rightArrow: {right: 14},

  /* THUMBNAILS */
  thumbnailList: {paddingHorizontal: 16, paddingVertical: 12, gap: 10},
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: WHITE,
  },
  activeThumbnail: {borderColor: GREEN},
  thumbnail: {width: '100%', height: '100%'},

  /* INFO CONTENT */
  content: {paddingHorizontal: 18},
  categoryRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10},
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  categoryText: {fontSize: 11.5, fontWeight: '800', color: GREEN},
  availableBadge: {flexDirection: 'row', alignItems: 'center', gap: 4},
  availableText: {fontSize: 11.5, fontWeight: '800', color: GREEN},
  outOfStock: {fontSize: 11.5, fontWeight: '800', color: '#D64545'},
  title: {fontSize: 22, fontWeight: '900', color: DARK, marginTop: 14, letterSpacing: -0.4},
  price: {fontSize: 22, fontWeight: '900', color: GREEN, marginTop: 6},

  /* CARD BADGES */
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: {marginLeft: 12},
  sellerLabel: {color: MUTED, fontSize: 10, fontWeight: '600'},
  sellerName: {color: DARK, fontSize: 14, fontWeight: '800', marginTop: 2},

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {marginLeft: 12},
  locationLabel: {fontSize: 10, color: MUTED, fontWeight: '600'},
  locationValue: {marginTop: 2, fontSize: 14, color: DARK, fontWeight: '800'},

  /* SECTIONS */
  section: {marginTop: 22},
  sectionTitle: {fontSize: 15, fontWeight: '900', color: DARK, letterSpacing: -0.2},
  description: {fontSize: 13, lineHeight: 21, color: '#5E6663', marginTop: 8, fontWeight: '500'},

  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  stockLabel: {color: MUTED, fontSize: 12.5, fontWeight: '600'},
  stockValue: {color: DARK, fontWeight: '800', fontSize: 13.5},

  /* QUANTITY */
  quantitySection: {marginTop: 20},
  quantityRow: {marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quantityButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  quantityText: {width: 40, textAlign: 'center', fontSize: 15, fontWeight: '900', color: DARK},
  totalPrice: {fontSize: 19, fontWeight: '900', color: GREEN},

  /* FOOTER */
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addCartButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addCartText: {color: WHITE, fontSize: 14, fontWeight: '900'},
});

export default NurseryPlantDetailsScreen;