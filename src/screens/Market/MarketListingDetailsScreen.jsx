import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
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
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  CalendarClock,
  ChevronRight,
  Eye,
  Handshake,
  MapPin,
  Package,
  Pause,
  Pencil,
  Play,
  Scale,
  Star,
  Trash2,
  Truck,
  User,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import OfferSheet from '../../components/market/OfferSheet';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import { GlassButton, TopInset } from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import useMarketMeta from '../../components/market/useMarketMeta';
import { getKindMeta } from '../../components/market/kinds';
import {
  MARKET_COLORS as C,
  MARKET_GRADIENTS,
  MARKET_SHADOW,
} from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  deleteMarketListing,
  fetchMarketListingById,
  toggleSaveMarketListing,
  updateMarketListingStatus,
} from '../../redux/slices/marketSlice';
import { createMarketDeal } from '../../redux/slices/marketDealSlice';
import {
  CONDITION_LABELS,
  DEAL_STATUS_META,
  GRADE_LABELS,
  LISTING_STATUS_META,
  formatAmount,
  formatDate,
  formatLocation,
  formatPricePerUnit,
  formatQuantity,
  getExpiryInfo,
  listingSubtitle,
  timeAgo,
} from '../../utils/marketFormat';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 360;

const STEPS = [
  { title: 'Send offer', text: 'Propose your price and quantity' },
  { title: 'Agree', text: 'Phone numbers shared on accept' },
  { title: 'Meet & pay', text: 'Pay when you get the goods' },
];

const EXPIRY_BANNER = {
  expired: {
    color: C.red,
    bg: C.lightRed,
    text: 'This product has passed its expiry date and cannot be sold.',
  },
  soon: {
    color: C.amber,
    bg: C.lightAmber,
    text: 'Close to expiry. Check the seal and date before you buy.',
  },
  ok: { color: C.green, bg: C.lightGreen, text: 'Within its shelf life.' },
};

export default function MarketListingDetailsScreen({ navigation, route }) {
  const { listingId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { categoryLabels } = useMarketMeta();

  const {
    selectedListing,
    listingLoading,
    listingError,
    statusUpdating,
    deleting,
  } = useSelector(state => state.market);
  const creatingDeal = useSelector(state => state.marketDeal.creating);

  const feedback = useFeedbackModal();
  const toast = useToast();

  const [imageIndex, setImageIndex] = useState(0);
  const [offerVisible, setOfferVisible] = useState(false);
  // failed offer, shown inside the offer sheet
  const [offerError, setOfferError] = useState(null);

  const listing = selectedListing?._id === listingId ? selectedListing : null;

  // refetch on focus so myOpenDeal / quantity are fresh after a deal
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMarketListingById(listingId));
    }, [dispatch, listingId]),
  );

  const handleToggleSave = () => {
    dispatch(toggleSaveMarketListing({ listingId, save: !listing.isSaved }));
    toast.show(listing.isSaved ? 'Removed from saved' : 'Saved for later');
  };

  const openOffer = () => {
    setOfferError(null);
    setOfferVisible(true);
  };

  const goToDeal = dealId => {
    setOfferVisible(false);
    navigation.navigate(MARKET_ROUTES.DEAL_DETAILS, { dealId });
  };

  const handleSendOffer = async values => {
    try {
      const result = await dispatch(
        createMarketDeal({ listingId, ...values }),
      ).unwrap();
      goToDeal(result.deal._id);
    } catch (error) {
      setOfferError({
        message: error?.message || 'Please try again.',
        dealId: error?.dealId || null,
      });
    }
  };

  const handleToggleStatus = async () => {
    const status = listing.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    try {
      await dispatch(updateMarketListingStatus({ listingId, status })).unwrap();
      dispatch(fetchMarketListingById(listingId));
      toast.show(
        status === 'PAUSED'
          ? 'Listing paused. Buyers cannot see it.'
          : 'Listing is live again',
      );
    } catch (error) {
      feedback.error('Unable to update listing', String(error));
    }
  };

  const handleDelete = () =>
    feedback.confirm({
      title: 'Delete listing?',
      message:
        'Buyers will no longer see this listing. Pending offers will be closed.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try {
          await dispatch(deleteMarketListing(listingId)).unwrap();
          navigation.goBack();
        } catch (error) {
          feedback.error('Unable to delete', String(error));
        }
      },
    });

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Listing" onBack={() => navigation.goBack()} />
        {listingLoading || !listingError ? (
          <LoadingState />
        ) : (
          <EmptyState
            title="Listing not available"
            message={listingError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        )}
      </SafeAreaView>
    );
  }

  const kind = getKindMeta(listing.kind);
  const isOwner = listing.isOwner;
  const seller = listing.seller || {};
  const stats = listing.sellerStats || {};
  const myOpenDeal = listing.myOpenDeal;
  const images = listing.images || [];
  const subtitle = listingSubtitle(listing);
  const expiry =
    listing.kind === 'INPUTS' ? getExpiryInfo(listing.expiryDate) : null;
  const isExpired = Boolean(listing.isExpired || expiry?.tone === 'expired');
  const canBuy = listing.status === 'ACTIVE' && !isExpired;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={listingLoading}
            onRefresh={() => dispatch(fetchMarketListingById(listingId))}
            colors={[C.green]}
            tintColor={C.white}
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
            <LinearGradient
              colors={[kind.bg, '#FFFFFF']}
              style={[styles.heroImage, styles.heroPlaceholder]}
            >
              <Image
                source={kind.image}
                resizeMode={kind.imageMode}
                style={
                  kind.imageMode === 'cover'
                    ? styles.heroImage
                    : styles.heroPlaceholderImage
                }
              />
            </LinearGradient>
          )}

          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
            style={styles.topShade}
          />

          <View style={styles.heroButtons}>
            <GlassButton
              style={styles.darkGlass}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color={C.white} />
            </GlassButton>

            {isOwner ? (
              <GlassButton style={styles.darkGlass} onPress={handleDelete}>
                <Trash2 size={19} color="#FFB4AB" />
              </GlassButton>
            ) : (
              <GlassButton style={styles.darkGlass} onPress={handleToggleSave}>
                <Bookmark
                  size={19}
                  color={C.white}
                  fill={listing.isSaved ? C.white : 'transparent'}
                />
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

        {/* CONTENT SHEET */}
        <View style={styles.sheet}>
          <View style={styles.tagRow}>
            <Text
              style={[
                styles.kindTag,
                { color: kind.color, backgroundColor: kind.bg },
              ]}
            >
              {kind.label}
            </Text>
            <Text style={styles.categoryTag}>
              {categoryLabels[listing.category] || listing.category}
            </Text>
            {listing.isOrganic && (
              <Text style={styles.organicTag}>Organic</Text>
            )}
            {listing.status !== 'ACTIVE' && (
              <StatusPill meta={LISTING_STATUS_META[listing.status]} />
            )}
          </View>

          <Text style={styles.title}>{listing.title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₹{formatAmount(listing.pricePerUnit)}
            </Text>
            <Text style={styles.priceUnit}>/ {listing.unit}</Text>
            <Text
              style={[styles.negotiable, !listing.isNegotiable && styles.fixed]}
            >
              {listing.isNegotiable ? 'Negotiable' : 'Fixed price'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Package size={16} color={C.green} />
              <Text style={styles.statValue} numberOfLines={1}>
                {formatQuantity(listing.quantity, listing.unit)}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statBox}>
              <Scale size={16} color={C.blue} />
              <Text style={styles.statValue} numberOfLines={1}>
                {listing.minOrderQuantity
                  ? formatQuantity(listing.minOrderQuantity, listing.unit)
                  : 'Any'}
              </Text>
              <Text style={styles.statLabel}>Min. order</Text>
            </View>
            <View style={styles.statBox}>
              <Eye size={16} color={C.orange} />
              <Text style={styles.statValue}>{listing.views || 0}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>

          {/* EXPIRY */}
          {!!expiry && (
            <View
              style={[
                styles.expiryBanner,
                { backgroundColor: EXPIRY_BANNER[expiry.tone].bg },
              ]}
            >
              {expiry.tone === 'ok' ? (
                <CalendarClock size={20} color={EXPIRY_BANNER.ok.color} />
              ) : (
                <AlertTriangle
                  size={20}
                  color={EXPIRY_BANNER[expiry.tone].color}
                />
              )}
              <View style={styles.flex}>
                <Text
                  style={[
                    styles.expiryTitle,
                    { color: EXPIRY_BANNER[expiry.tone].color },
                  ]}
                >
                  {expiry.tone === 'ok'
                    ? `Expires ${formatDate(listing.expiryDate)}`
                    : expiry.label}
                </Text>
                <Text style={styles.expiryText}>
                  {EXPIRY_BANNER[expiry.tone].text}
                </Text>
              </View>
            </View>
          )}

          {/* DETAILS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Details</Text>

            {listing.kind === 'EQUIPMENT' && (
              <>
                <InfoRow label="Brand" value={listing.brand} />
                <InfoRow label="Model" value={listing.model} />
                <InfoRow label="Model year" value={listing.modelYear} />
                <InfoRow
                  label="Condition"
                  value={CONDITION_LABELS[listing.condition]}
                />
                <InfoRow
                  label="Usage"
                  value={
                    listing.usageHours !== null &&
                    listing.usageHours !== undefined
                      ? `${formatAmount(listing.usageHours)} hours`
                      : null
                  }
                />
              </>
            )}

            {listing.kind === 'INPUTS' && (
              <>
                <InfoRow label="Brand" value={listing.brand} />
                <InfoRow label="Composition" value={listing.composition} />
                <InfoRow label="Pack size" value={listing.packSize} />
                <InfoRow
                  label="Manufactured"
                  value={formatDate(listing.manufacturingDate)}
                />
                <InfoRow
                  label="Expiry"
                  value={formatDate(listing.expiryDate)}
                />
                <InfoRow
                  label="Packing"
                  value={listing.isSealed ? 'Sealed, unopened' : 'Opened'}
                />
              </>
            )}

            {listing.kind === 'PRODUCE' && (
              <>
                <InfoRow label="Variety" value={listing.variety} />
                <InfoRow label="Grade" value={GRADE_LABELS[listing.grade]} />
                <InfoRow
                  label="Organic"
                  value={listing.isOrganic ? 'Yes' : 'No'}
                />
                <InfoRow
                  label="Harvested"
                  value={formatDate(listing.harvestDate)}
                />
              </>
            )}

            <InfoRow label="Posted" value={timeAgo(listing.createdAt)} />

            {!!listing.description && (
              <>
                <Text style={[styles.sectionTitle, styles.descriptionTitle]}>
                  Description
                </Text>
                <Text style={styles.description}>{listing.description}</Text>
              </>
            )}
          </View>

          {/* LOCATION + DELIVERY */}
          <View style={styles.card}>
            <View style={styles.inline}>
              <View style={styles.iconBubble}>
                <MapPin size={16} color={C.green} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardLabel}>Pickup location</Text>
                <Text style={styles.locationText}>
                  {formatLocation(listing.location) || 'Not provided'}
                  {listing.location?.pincode
                    ? ` - ${listing.location.pincode}`
                    : ''}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inline}>
              <View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: listing.deliveryAvailable
                      ? C.lightBlue
                      : C.bg,
                  },
                ]}
              >
                <Truck
                  size={16}
                  color={listing.deliveryAvailable ? C.blue : C.muted}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardLabel}>
                  {listing.deliveryAvailable
                    ? 'Seller can deliver'
                    : 'Pickup only'}
                </Text>
                {!!listing.deliveryNotes && (
                  <Text style={styles.locationText}>
                    {listing.deliveryNotes}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* SELLER */}
          {!isOwner && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.SELLER_PROFILE, {
                  sellerId: seller._id,
                })
              }
            >
              <LinearGradient
                colors={['#FFFFFF', '#EFFAF3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.sellerCard]}
              >
                <LinearGradient
                  colors={MARKET_GRADIENTS.green}
                  style={styles.avatar}
                >
                  <User size={22} color={C.white} />
                </LinearGradient>
                <View style={styles.flex}>
                  <Text style={styles.cardLabel}>Sold by</Text>
                  <Text style={styles.sellerName}>
                    {seller.fullName || 'Farmer'}
                  </Text>
                  <View style={[styles.inline, styles.sellerStats]}>
                    <Star size={12} color={C.gold} fill={C.gold} />
                    <Text style={styles.sellerStatText}>
                      {stats.totalReviews
                        ? `${stats.averageRating} (${stats.totalReviews})`
                        : 'New seller'}
                    </Text>
                    <BadgeCheck size={12} color={C.green} />
                    <Text style={styles.sellerStatText}>
                      {stats.completedDeals || 0} deals
                    </Text>
                  </View>
                </View>
                <ChevronRight size={19} color={C.muted} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* HOW IT WORKS */}
          <Text style={styles.howTitle}>How buying works</Text>
          <View style={styles.steps}>
            {STEPS.map((step, index) => (
              <View key={step.title} style={styles.step}>
                <LinearGradient
                  colors={MARKET_GRADIENTS.green}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </LinearGradient>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>

          {listing.kind === 'INPUTS' && (
            <View style={styles.safetyCard}>
              <AlertTriangle size={16} color="#725C19" />
              <Text style={styles.safetyText}>
                Use crop-protection chemicals only as per the label. Wear gloves
                and a mask, and keep them away from children and animals.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {isOwner ? (
          <>
            {listing.status !== 'SOLD' && (
              <MarketButton
                variant="outline"
                label={listing.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                icon={
                  listing.status === 'ACTIVE' ? (
                    <Pause size={16} color={C.green} />
                  ) : (
                    <Play size={16} color={C.green} />
                  )
                }
                loading={statusUpdating}
                onPress={handleToggleStatus}
                style={styles.flex}
              />
            )}
            <MarketButton
              variant="outline"
              label="Edit"
              icon={<Pencil size={16} color={C.green} />}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.SELL, { listing })
              }
              style={styles.flex}
            />
            <MarketButton
              label="Offers"
              icon={<Handshake size={16} color={C.white} />}
              disabled={deleting}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.DEALS, {
                  listingId,
                  listingTitle: listing.title,
                })
              }
              style={styles.flex}
            />
          </>
        ) : myOpenDeal ? (
          <View style={styles.flex}>
            <View style={styles.openDealRow}>
              <StatusPill meta={DEAL_STATUS_META[myOpenDeal.status]} />
              <Text style={styles.openDealText} numberOfLines={1}>
                Your offer: {formatQuantity(myOpenDeal.quantity, listing.unit)}{' '}
                at {formatPricePerUnit(myOpenDeal.pricePerUnit, listing.unit)}
              </Text>
            </View>
            <MarketButton
              label="View Your Deal"
              icon={<Handshake size={17} color={C.white} />}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.DEAL_DETAILS, {
                  dealId: myOpenDeal._id,
                })
              }
            />
          </View>
        ) : (
          <>
            <View style={styles.bottomPrice}>
              <Text style={styles.bottomPriceLabel}>Price</Text>
              <Text style={styles.bottomPriceValue} numberOfLines={1}>
                {formatPricePerUnit(listing.pricePerUnit, listing.unit)}
              </Text>
            </View>
            <MarketButton
              label={
                isExpired
                  ? 'Expired'
                  : listing.status === 'ACTIVE'
                  ? 'Make an Offer'
                  : 'Not available'
              }
              icon={canBuy ? <Handshake size={17} color={C.white} /> : null}
              disabled={!canBuy}
              onPress={openOffer}
              style={styles.flexWide}
            />
          </>
        )}
      </View>

      <OfferSheet
        visible={offerVisible}
        mode="offer"
        terms={{
          unit: listing.unit,
          available: listing.quantity,
          minOrderQuantity: listing.minOrderQuantity,
          listedPrice: listing.pricePerUnit,
          deliveryAvailable: listing.deliveryAvailable,
        }}
        initialQuantity={
          listing.minOrderQuantity
            ? Math.min(listing.minOrderQuantity, listing.quantity)
            : undefined
        }
        initialPrice={listing.pricePerUnit}
        priceLocked={!listing.isNegotiable}
        loading={creatingDeal}
        serverError={offerError?.message}
        errorAction={
          offerError?.dealId
            ? {
                label: 'View your existing offer',
                onPress: () => goToDeal(offerError.dealId),
              }
            : null
        }
        onClose={() => setOfferVisible(false)}
        onSubmit={handleSendOffer}
      />

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
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  hero: { height: HERO_HEIGHT, backgroundColor: '#DDE8E1' },
  heroImage: { width, height: HERO_HEIGHT },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroPlaceholderImage: { width: width * 0.6, height: HERO_HEIGHT * 0.6 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  heroButtons: {
    top: 12,
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  kindTag: {
    fontSize: 10.5,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: C.text,
    backgroundColor: C.white,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  organicTag: {
    fontSize: 10.5,
    fontWeight: '900',
    color: C.white,
    backgroundColor: C.green,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: C.dark,
    marginTop: 12,
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 12.5, color: C.muted, fontWeight: '600', marginTop: 4 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 12,
  },
  price: { fontSize: 30, fontWeight: '900', color: C.green, letterSpacing: -1 },
  priceUnit: { fontSize: 14, fontWeight: '700', color: C.muted },
  negotiable: {
    marginLeft: 'auto',
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: '900',
    color: C.amber,
    backgroundColor: C.lightAmber,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fixed: { color: C.text, backgroundColor: '#E9ECEB' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statBox: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    ...MARKET_SHADOW,
  },
  statValue: { fontSize: 13.5, fontWeight: '900', color: C.dark, marginTop: 8 },
  statLabel: {
    fontSize: 10.5,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
  },

  expiryBanner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  expiryTitle: { fontSize: 13.5, fontWeight: '900' },
  expiryText: {
    fontSize: 11.5,
    color: C.text,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 16,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    marginBottom: 4,
  },
  descriptionTitle: { marginTop: 16 },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: C.text,
    fontWeight: '500',
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: { fontSize: 12.5, fontWeight: '900', color: C.dark },
  locationText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 17,
  },
  divider: { height: 1, backgroundColor: '#EEF1EF', marginVertical: 12 },

  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 15.5,
    fontWeight: '900',
    color: C.dark,
    marginTop: 1,
  },
  sellerStats: { marginTop: 5, gap: 4 },
  sellerStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.text,
    marginRight: 6,
  },

  howTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    marginTop: 22,
    marginBottom: 10,
  },
  steps: { flexDirection: 'row', gap: 8 },
  step: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 11,
    ...MARKET_SHADOW,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: C.white, fontSize: 12, fontWeight: '900' },
  stepTitle: { fontSize: 12, fontWeight: '900', color: C.dark, marginTop: 8 },
  stepText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },

  safetyCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF6DA',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  safetyText: {
    flex: 1,
    color: '#725C19',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bottomPrice: { flex: 1 },
  bottomPriceLabel: { fontSize: 11, color: C.muted, fontWeight: '700' },
  bottomPriceValue: {
    fontSize: 17,
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  openDealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  openDealText: { flex: 1, fontSize: 12, fontWeight: '700', color: C.text },
});
