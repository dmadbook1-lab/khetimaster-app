import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Banknote,
  BadgeCheck,
  MapPin,
  Package,
  Pencil,
  Power,
  RotateCcw,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { GlassButton, TopInset } from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import {
  EmptyState,
  LoadingState,
  MarketButton,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import PersonAvatar from '../../components/labour/PersonAvatar';
import { PlantImage, QtyStepper } from '../../components/nursery/NurseryBits';
import { categoryVisual } from '../../components/nursery/nurseryVisuals';
import useNurseryMeta from '../../components/nursery/useNurseryMeta';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  fetchNurseryPlantById,
  setNurseryPlantActive,
} from '../../redux/slices/nurserySlice';
import {
  addToNurseryCart,
  fetchNurseryCart,
} from '../../redux/slices/nurseryCartSlice';
import { formatRupees, timeAgo } from '../../utils/marketFormat';
import { plantLocation, stockInfo } from '../../utils/nurseryFormat';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 340;

const userIdOf = user => user?._id || user?.id || user?.userId;

export default function NurseryPlantDetailsScreen({ navigation, route }) {
  const { plantId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();
  const { delivery } = useNurseryMeta();

  const user = useSelector(state => state.auth.user);
  const { selected, selectedLoading, selectedError, togglingId } = useSelector(
    state => state.nursery,
  );
  const { cart, adding } = useSelector(state => state.nurseryCart);

  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const plant = selected?._id === plantId ? selected : null;

  const load = useCallback(
    () => dispatch(fetchNurseryPlantById(plantId)),
    [dispatch, plantId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
      dispatch(fetchNurseryCart());
    }, [dispatch, load]),
  );

  const inCart = cart.items.find(item => item.plant?._id === plantId);
  const available = Math.max(
    (plant?.quantity || 0) - (inCart?.quantity || 0),
    0,
  );

  // keep the picked quantity within what can still be added
  useEffect(() => {
    if (available > 0 && quantity > available) setQuantity(available);
  }, [available, quantity]);

  if (!plant) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Plant" onBack={() => navigation.goBack()} />
        {selectedError && !selectedLoading ? (
          <EmptyState
            title="Plant not available"
            message={selectedError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const isMine =
    !!userIdOf(user) && String(plant.seller?.userId) === String(userIdOf(user));
  const images = (plant.images || []).filter(Boolean);
  const visual = categoryVisual(plant.category);
  const stock = stockInfo(plant.quantity);
  const location = plantLocation(plant);
  const reviews = plant.recentReviews || [];
  const sellerName = plant.seller?.name || 'Nursery';
  const outOfStock = plant.quantity <= 0;

  const handleAdd = async () => {
    try {
      await dispatch(addToNurseryCart({ plantId, quantity })).unwrap();
      toast.show(`${quantity} × ${plant.name} added to cart`);
      setQuantity(1);
    } catch (error) {
      feedback.error('Could not add to cart', String(error));
      load();
    }
  };

  const togglePaused = () => {
    const active = plant.isActive === false;

    feedback.confirm({
      title: active ? 'Show this plant again?' : 'Pause this listing?',
      message: active
        ? 'Buyers will be able to find and order it again.'
        : 'Buyers will not see it. Orders already placed are not affected.',
      confirmLabel: active ? 'Show Again' : 'Pause',
      destructive: !active,
      onConfirm: async () => {
        try {
          await dispatch(setNurseryPlantActive({ plantId, active })).unwrap();
          toast.show(active ? 'Plant is live again' : 'Listing paused');
          if (!active) navigation.goBack();
        } catch (error) {
          feedback.error('Could not update', String(error));
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={selectedLoading}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
      >
        {/* PHOTO HERO */}
        <View style={styles.hero}>
          {images.length ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={event =>
                setImageIndex(
                  Math.round(event.nativeEvent.contentOffset.x / width),
                )
              }
            >
              {images.map(uri => (
                <Image key={uri} source={{ uri }} style={styles.heroImage} />
              ))}
            </ScrollView>
          ) : (
            <PlantImage plant={plant} style={styles.heroImage} iconSize={86} />
          )}

          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']}
            style={styles.topShade}
          />

          <View style={styles.heroButtons}>
            <GlassButton
              style={styles.darkGlass}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color={C.white} />
            </GlassButton>
            {!isMine && (
              <GlassButton
                style={styles.darkGlass}
                badge={cart.totalItems}
                onPress={() => navigation.navigate(NURSERY_ROUTES.CART)}
              >
                <ShoppingCart size={19} color={C.white} />
              </GlassButton>
            )}
          </View>

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((uri, index) => (
                <View
                  key={uri}
                  style={[styles.dot, index === imageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.sheet}>
          <Text
            style={[
              styles.categoryTag,
              { color: visual.color, backgroundColor: visual.bg },
            ]}
          >
            {plant.category}
          </Text>
          <Text style={styles.title}>{plant.name}</Text>

          <View style={styles.ratingRow}>
            <Star size={14} color={C.gold} fill={C.gold} />
            <Text style={styles.ratingText}>
              {plant.totalReviews
                ? `${plant.rating} · ${plant.totalReviews} reviews`
                : 'No reviews yet'}
            </Text>
            {!!plant.totalSold && (
              <>
                <BadgeCheck size={14} color={C.green} />
                <Text style={styles.ratingText}>{plant.totalSold} sold</Text>
              </>
            )}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>{formatRupees(plant.price)}</Text>
              <Text style={styles.priceUnit}>per plant</Text>
            </View>
            <Text
              style={[
                styles.stock,
                stock.tone === 'low' && styles.stockLow,
                stock.tone === 'out' && styles.stockOut,
              ]}
            >
              {stock.label}
            </Text>
          </View>

          {isMine && (
            <View style={[styles.card, styles.ownerNotice]}>
              <Package size={18} color={C.blue} />
              <Text style={styles.ownerNoticeText}>
                This is your listing
                {plant.isActive === false ? ' (paused)' : ''}. Buyers see it
                like this.
              </Text>
            </View>
          )}

          {!isMine && !!inCart && (
            <View style={[styles.card, styles.ownerNotice]}>
              <ShoppingCart size={18} color={C.green} />
              <Text style={styles.ownerNoticeText}>
                {inCart.quantity} already in your cart
              </Text>
            </View>
          )}

          {/* DELIVERY */}
          <View style={styles.perks}>
            <View style={styles.perk}>
              <Truck size={17} color={C.green} />
              <Text style={styles.perkTitle}>
                {formatRupees(delivery.fee)} delivery
              </Text>
              <Text style={styles.perkText}>
                Free above {formatRupees(delivery.freeAbove)}
              </Text>
            </View>
            <View style={styles.perk}>
              <Banknote size={17} color={C.blue} />
              <Text style={styles.perkTitle}>Cash on delivery</Text>
              <Text style={styles.perkText}>Pay when it arrives</Text>
            </View>
            <View style={styles.perk}>
              <RotateCcw size={17} color={C.orange} />
              <Text style={styles.perkTitle}>Free cancel</Text>
              <Text style={styles.perkText}>Until dispatched</Text>
            </View>
          </View>

          {!!plant.description && (
            <>
              <Text style={styles.blockTitle}>About this plant</Text>
              <View style={styles.card}>
                <Text style={styles.paragraph}>{plant.description}</Text>
              </View>
            </>
          )}

          {/* SELLER */}
          <Text style={styles.blockTitle}>Sold by</Text>
          <View style={[styles.card, styles.sellerRow]}>
            <PersonAvatar name={sellerName} size={50} />
            <View style={styles.flex}>
              <Text style={styles.sellerName}>{sellerName}</Text>
              {!!location && (
                <View style={styles.inline}>
                  <MapPin size={11} color={C.muted} />
                  <Text style={styles.cardText} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              )}
              <Text style={styles.cardText}>
                Phone number shared once they confirm your order
              </Text>
            </View>
          </View>

          {/* REVIEWS */}
          {reviews.length > 0 && (
            <>
              <Text style={styles.blockTitle}>What buyers say</Text>
              {reviews.map((review, index) => (
                <View
                  key={`${review.createdAt}-${index}`}
                  style={styles.reviewCard}
                >
                  <View style={styles.reviewHeader}>
                    <PersonAvatar
                      name={review.buyerName}
                      size={36}
                      gradient="blue"
                    />
                    <View style={styles.flex}>
                      <Text style={styles.reviewer}>
                        {review.buyerName || 'Buyer'}
                      </Text>
                      <Text style={styles.reviewMeta}>
                        {timeAgo(review.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.reviewStars}>
                      <Star size={12} color={C.gold} fill={C.gold} />
                      <Text style={styles.reviewRating}>{review.rating}</Text>
                    </View>
                  </View>
                  {!!review.comment && (
                    <Text style={styles.paragraph}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {isMine ? (
          <>
            <MarketButton
              variant={plant.isActive === false ? 'outline' : 'danger'}
              label={plant.isActive === false ? 'Show Again' : 'Pause'}
              icon={
                <Power
                  size={16}
                  color={plant.isActive === false ? C.green : C.red}
                />
              }
              loading={togglingId === plantId}
              onPress={togglePaused}
              style={styles.flex}
            />
            <MarketButton
              label="Edit Listing"
              icon={<Pencil size={16} color={C.white} />}
              onPress={() =>
                navigation.navigate(NURSERY_ROUTES.FORM, { plant })
              }
              style={styles.flexWide}
            />
          </>
        ) : outOfStock || available <= 0 ? (
          <MarketButton
            label={outOfStock ? 'Out of Stock' : 'Go to Cart'}
            icon={
              outOfStock ? null : <ShoppingCart size={17} color={C.white} />
            }
            disabled={outOfStock}
            onPress={() => navigation.navigate(NURSERY_ROUTES.CART)}
            style={styles.flex}
          />
        ) : (
          <>
            <View>
              <QtyStepper
                value={quantity}
                onChange={setQuantity}
                max={available}
              />
              <Text style={styles.lineTotal}>
                {formatRupees(plant.price * quantity)}
              </Text>
            </View>
            <MarketButton
              label="Add to Cart"
              icon={<ShoppingCart size={17} color={C.white} />}
              loading={adding}
              onPress={handleAdd}
              style={styles.flex}
            />
          </>
        )}
      </View>

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  flex: { flex: 1 },
  flexWide: { flex: 1.5 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },

  hero: { height: HERO_HEIGHT, backgroundColor: '#DDE8E1' },
  heroImage: { width, height: HERO_HEIGHT },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  heroButtons: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkGlass: {
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dots: {
    position: 'absolute',
    bottom: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: { width: 18, backgroundColor: C.white },

  sheet: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    fontSize: 10.5,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: C.dark,
    marginTop: 10,
    letterSpacing: -0.6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
    marginRight: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  price: {
    fontSize: 30,
    fontWeight: '900',
    color: C.green,
    letterSpacing: -1,
  },
  priceUnit: { fontSize: 12, fontWeight: '700', color: C.muted },
  stock: {
    fontSize: 12,
    fontWeight: '900',
    color: C.green,
    backgroundColor: C.lightGreen,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stockLow: { color: C.amber, backgroundColor: C.lightAmber },
  stockOut: { color: C.red, backgroundColor: C.lightRed },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  ownerNotice: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ownerNoticeText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: C.text,
  },

  perks: { flexDirection: 'row', gap: 8, marginTop: 16 },
  perk: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 11,
    ...MARKET_SHADOW,
  },
  perkTitle: { fontSize: 12, fontWeight: '900', color: C.dark, marginTop: 7 },
  perkText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },

  blockTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.dark,
    marginTop: 22,
    marginBottom: -2,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: C.text,
    fontWeight: '500',
  },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerName: { fontSize: 15.5, fontWeight: '900', color: C.dark },
  cardText: { fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 3 },

  reviewCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    gap: 8,
    ...MARKET_SHADOW,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewer: { fontSize: 13, fontWeight: '900', color: C.dark },
  reviewMeta: { fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 1 },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.lightAmber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewRating: { fontSize: 12, fontWeight: '900', color: C.amber },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  lineTotal: {
    fontSize: 11,
    fontWeight: '800',
    color: C.muted,
    textAlign: 'center',
    marginTop: 4,
  },
});
