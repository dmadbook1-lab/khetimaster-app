import React, { useCallback, useState } from 'react';
import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeftRight,
  ChevronRight,
  CircleCheck,
  CircleX,
  Leaf,
  Lock,
  MapPin,
  Phone,
  Star,
  Tractor,
  User,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHeader from '../../components/market/MarketHeader';
import MarketHero, { TopInset } from '../../components/market/MarketHero';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import OfferSheet from '../../components/market/OfferSheet';
import NoteSheet from '../../components/market/NoteSheet';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  fetchMarketDealById,
  reviewMarketDeal,
  updateMarketDeal,
} from '../../redux/slices/marketDealSlice';
import {
  DEAL_STATUS_META,
  describeDealState,
  formatLocation,
  formatPricePerUnit,
  formatQuantity,
  formatRupees,
  timeAgo,
} from '../../utils/marketFormat';

/*
 * Hero colour for each deal state.
 */
const heroGradientFor = deal => {
  if (deal.status === 'PENDING') return deal.isMyTurn ? 'amber' : 'blue';
  if (deal.status === 'ACCEPTED') return 'green';
  if (deal.status === 'COMPLETED') return 'forest';
  if (deal.status === 'REJECTED') return 'red';
  return 'slate';
};

const HISTORY_LABELS = {
  OFFER: 'sent an offer',
  COUNTER: 'sent a counter offer',
  ACCEPT: 'accepted the deal',
  REJECT: 'rejected the offer',
  CANCEL: 'cancelled the deal',
  COMPLETE: 'marked the deal completed',
};

const TOASTS = {
  accept: 'Deal accepted. You can now call each other.',
  counter: 'Counter offer sent',
  reject: 'Offer rejected',
  cancel: 'Deal cancelled',
  complete: 'Deal marked as completed',
};

const SHEETS = {
  reject: {
    title: 'Reject offer?',
    description: 'The other side will see that you rejected this offer.',
    placeholder: 'Reason (optional), e.g. Price too low',
    submitLabel: 'Reject Offer',
    variant: 'danger',
  },
  cancel: {
    title: 'Cancel deal?',
    description:
      'This closes the deal for both sides. If it was accepted, the quantity goes back to the listing.',
    placeholder: 'Reason (optional)',
    submitLabel: 'Cancel Deal',
    variant: 'danger',
  },
  review: {
    title: 'Rate the seller',
    description: 'Your rating helps other farmers buy with confidence.',
    placeholder: 'How was the quality and experience? (optional)',
    submitLabel: 'Submit Review',
    withRating: true,
  },
};

export default function MarketDealDetailsScreen({ navigation, route }) {
  const { dealId } = route.params;
  const dispatch = useDispatch();
  const { selectedDeal, dealLoading, dealError, actionInProgress } =
    useSelector(state => state.marketDeal);

  const feedback = useFeedbackModal();
  const toast = useToast();

  const [counterVisible, setCounterVisible] = useState(false);
  const [sheet, setSheet] = useState(null);
  // failed request message shown inside the open sheet
  const [sheetError, setSheetError] = useState(null);

  const deal = selectedDeal?._id === dealId ? selectedDeal : null;

  const load = useCallback(
    () => dispatch(fetchMarketDealById(dealId)),
    [dispatch, dealId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /*
   * Errors go inside the sheet when the action came from one (iOS can't
   * show a second modal on top), otherwise to the feedback modal.
   */
  const runAction = async (action, body = {}, { fromSheet = false } = {}) => {
    try {
      const result = await dispatch(
        updateMarketDeal({ dealId, action, body }),
      ).unwrap();
      toast.show(TOASTS[action] || result.message);
      return result;
    } catch (error) {
      if (fromSheet) {
        setSheetError(String(error));
      } else {
        feedback.error('Something went wrong', String(error));
      }
      // the deal may have changed underneath us (409), show the latest
      load();
      return null;
    }
  };

  const openSheet = name => {
    setSheetError(null);
    setSheet(name);
  };

  const handleAccept = () =>
    feedback.confirm({
      title: 'Accept this deal?',
      message: `${formatQuantity(
        deal.quantity,
        deal.listingSnapshot.unit,
      )} at ${formatPricePerUnit(
        deal.pricePerUnit,
        deal.listingSnapshot.unit,
      )} for a total of ${formatRupees(
        deal.totalAmount,
      )}. Phone numbers will be shared with each other.`,
      confirmLabel: 'Accept Deal',
      cancelLabel: 'Not yet',
      onConfirm: () => runAction('accept'),
    });

  const handleComplete = () =>
    feedback.confirm({
      title: 'Mark as completed?',
      message:
        'Do this only after the goods are handed over and you have received payment.',
      confirmLabel: 'Yes, completed',
      onConfirm: () => runAction('complete'),
    });

  const handleCounter = async values => {
    const result = await runAction(
      'counter',
      {
        quantity: values.quantity,
        pricePerUnit: values.pricePerUnit,
        message: values.message,
      },
      { fromSheet: true },
    );

    if (result) {
      setCounterVisible(false);
    }
  };

  const handleSheetSubmit = async ({ text, rating }) => {
    if (sheet === 'review') {
      try {
        await dispatch(
          reviewMarketDeal({ dealId, rating, comment: text }),
        ).unwrap();
        setSheet(null);
        toast.show('Thanks for your review');
      } catch (error) {
        setSheetError(String(error));
      }
      return;
    }

    const result = await runAction(
      sheet,
      { reason: text },
      { fromSheet: true },
    );
    if (result) {
      setSheet(null);
    }
  };

  if (!deal) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Deal" onBack={() => navigation.goBack()} />
        {dealError && !dealLoading ? (
          <EmptyState
            title="Deal not available"
            message={dealError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const snapshot = deal.listingSnapshot || {};
  const unit = snapshot.unit;
  const listing =
    deal.listing && typeof deal.listing === 'object' ? deal.listing : null;
  const image = listing?.images?.[0] || snapshot.image;
  const isBuyer = deal.myRole === 'BUYER';
  const counterparty = isBuyer ? deal.seller : deal.buyer;
  const contactShared = ['ACCEPTED', 'COMPLETED'].includes(deal.status);
  const priceDiff = deal.pricePerUnit - snapshot.listedPricePerUnit;

  const roleLabel = by =>
    by === deal.myRole ? 'You' : by === 'BUYER' ? 'Buyer' : 'Seller';

  const canReview =
    isBuyer && deal.status === 'COMPLETED' && !deal.review?.rating;

  const renderActions = () => {
    if (deal.status === 'PENDING' && deal.isMyTurn) {
      return (
        <View style={styles.actionColumn}>
          <View style={styles.actionRow}>
            <MarketButton
              variant="danger"
              label="Reject"
              icon={<CircleX size={16} color={C.red} />}
              disabled={!!actionInProgress}
              onPress={() => openSheet('reject')}
              style={styles.flex}
            />
            <MarketButton
              variant="outline"
              label="Counter"
              icon={<ArrowLeftRight size={16} color={C.green} />}
              disabled={!!actionInProgress}
              onPress={() => {
                setSheetError(null);
                setCounterVisible(true);
              }}
              style={styles.flex}
            />
          </View>
          <MarketButton
            label="Accept Deal"
            icon={<CircleCheck size={17} color={C.white} />}
            loading={actionInProgress === 'accept'}
            disabled={!!actionInProgress}
            onPress={handleAccept}
          />
        </View>
      );
    }

    if (deal.status === 'PENDING') {
      return (
        <MarketButton
          variant="danger"
          label={isBuyer ? 'Withdraw Offer' : 'Cancel Deal'}
          disabled={!!actionInProgress}
          onPress={() => openSheet('cancel')}
          style={styles.flex}
        />
      );
    }

    if (deal.status === 'ACCEPTED') {
      return (
        <View style={[styles.actionRow, styles.flex]}>
          <MarketButton
            variant="danger"
            label="Cancel"
            disabled={!!actionInProgress}
            onPress={() => openSheet('cancel')}
            style={styles.flex}
          />
          {isBuyer ? (
            <MarketButton
              label="Call Seller"
              icon={<Phone size={16} color={C.white} />}
              disabled={!counterparty?.phoneNumber}
              onPress={() => Linking.openURL(`tel:${counterparty.phoneNumber}`)}
              style={styles.flexWide}
            />
          ) : (
            <MarketButton
              label="Mark Completed"
              icon={<CircleCheck size={16} color={C.white} />}
              loading={actionInProgress === 'complete'}
              disabled={!!actionInProgress}
              onPress={handleComplete}
              style={styles.flexWide}
            />
          )}
        </View>
      );
    }

    if (canReview) {
      return (
        <MarketButton
          label="Rate the Seller"
          icon={<Star size={17} color={C.white} />}
          onPress={() => openSheet('review')}
          style={styles.flex}
        />
      );
    }

    return null;
  };

  const actions = renderActions();
  const sheetConfig = sheet ? SHEETS[sheet] : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={dealLoading}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.white}
          />
        }
      >
        {/* STATUS HERO */}
        <MarketHero
          compact
          gradient={heroGradientFor(deal)}
          onBack={() => navigation.goBack()}
          eyebrow={isBuyer ? 'Your purchase' : 'Your sale'}
          title={snapshot.title}
          right={
            <StatusPill
              meta={DEAL_STATUS_META[deal.status]}
              style={styles.heroPill}
            />
          }
        >
          <View style={styles.heroAmountRow}>
            <View style={styles.flex}>
              <Text style={styles.heroLabel}>
                {deal.status === 'PENDING' ? 'Current offer' : 'Deal value'}
              </Text>
              <Text style={styles.heroAmount}>
                {formatRupees(deal.totalAmount)}
              </Text>
              <Text style={styles.heroTerms}>
                {formatQuantity(deal.quantity, unit)} ×{' '}
                {formatPricePerUnit(deal.pricePerUnit, unit)}
              </Text>
            </View>
          </View>

          <View
            style={[styles.heroState, deal.isMyTurn && styles.heroStateMyTurn]}
          >
            <Text
              style={[
                styles.heroStateText,
                deal.isMyTurn && styles.heroStateTextMyTurn,
              ]}
            >
              {describeDealState(deal)}
            </Text>
            {!!deal.closingReason &&
              ['REJECTED', 'CANCELLED'].includes(deal.status) && (
                <Text style={styles.heroReason}>
                  Reason: {deal.closingReason}
                </Text>
              )}
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* LISTING */}
          <TouchableOpacity
            activeOpacity={listing ? 0.85 : 1}
            disabled={!listing}
            style={[styles.card, styles.listingRow]}
            onPress={() =>
              navigation.navigate(MARKET_ROUTES.LISTING_DETAILS, {
                listingId: listing._id,
              })
            }
          >
            <View style={styles.imageBox}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : snapshot.kind === 'EQUIPMENT' ? (
                <Tractor size={24} color={C.green} />
              ) : (
                <Leaf size={24} color={C.green} />
              )}
            </View>
            <View style={styles.flex}>
              <Text style={styles.listingTitle} numberOfLines={2}>
                {snapshot.title}
              </Text>
              <Text style={styles.muted}>
                Listed at{' '}
                {formatPricePerUnit(snapshot.listedPricePerUnit, unit)}
              </Text>
            </View>
            {!!listing && <ChevronRight size={18} color={C.muted} />}
          </TouchableOpacity>

          {/* CURRENT TERMS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {deal.status === 'PENDING' ? 'Current Offer' : 'Agreed Terms'}
            </Text>

            <InfoRow
              label="Quantity"
              value={formatQuantity(deal.quantity, unit)}
            />
            <InfoRow
              label="Price"
              value={formatPricePerUnit(deal.pricePerUnit, unit)}
            />
            {priceDiff !== 0 && Number.isFinite(priceDiff) && (
              <InfoRow
                label="Vs listed price"
                value={`${priceDiff > 0 ? '+' : '-'}${formatRupees(
                  Math.abs(priceDiff),
                )}/${unit}`}
              />
            )}
            <InfoRow
              label="Pickup / delivery"
              value={
                deal.fulfilment === 'DELIVERY'
                  ? 'Seller delivers'
                  : 'Buyer picks up'
              }
            />
            {deal.fulfilment === 'DELIVERY' && (
              <InfoRow label="Deliver to" value={deal.deliveryAddress} />
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total amount</Text>
              <Text style={styles.totalValue}>
                {formatRupees(deal.totalAmount)}
              </Text>
            </View>
          </View>

          {/* COUNTERPARTY */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {isBuyer ? 'Seller' : 'Buyer'}
            </Text>

            <View style={styles.partyRow}>
              <View style={styles.avatar}>
                <User size={20} color={C.green} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.partyName}>
                  {counterparty?.fullName || 'Farmer'}
                </Text>
                {!!formatLocation(counterparty) && (
                  <View style={styles.inline}>
                    <MapPin size={11} color={C.muted} />
                    <Text style={styles.muted} numberOfLines={1}>
                      {formatLocation(counterparty)}
                    </Text>
                  </View>
                )}
              </View>

              {contactShared && !!counterparty?.phoneNumber && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.callButton}
                  onPress={() =>
                    Linking.openURL(`tel:${counterparty.phoneNumber}`)
                  }
                >
                  <Phone size={17} color={C.white} />
                </TouchableOpacity>
              )}
            </View>

            {contactShared ? (
              !!counterparty?.phoneNumber && (
                <Text style={styles.phone}>{counterparty.phoneNumber}</Text>
              )
            ) : (
              <View style={styles.lockedRow}>
                <Lock size={13} color={C.muted} />
                <Text style={styles.lockedText}>
                  Phone number is shared once the deal is accepted
                </Text>
              </View>
            )}

            {isBuyer && !!deal.seller?._id && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(MARKET_ROUTES.SELLER_PROFILE, {
                    sellerId: deal.seller._id,
                  })
                }
              >
                <Text style={styles.link}>View seller profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* REVIEW */}
          {!!deal.review?.rating && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {isBuyer ? 'Your Review' : "Buyer's Review"}
              </Text>
              <View style={styles.inline}>
                {[1, 2, 3, 4, 5].map(value => (
                  <Star
                    key={value}
                    size={18}
                    color="#F5A524"
                    fill={
                      value <= deal.review.rating ? '#F5A524' : 'transparent'
                    }
                  />
                ))}
              </View>
              {!!deal.review.comment && (
                <Text style={styles.reviewComment}>{deal.review.comment}</Text>
              )}
            </View>
          )}

          {/* HISTORY */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Negotiation History</Text>

            {[...(deal.history || [])].reverse().map((entry, index, list) => {
              const mine = entry.by === deal.myRole;

              return (
                <View key={`${entry.at}-${index}`} style={styles.historyItem}>
                  <View style={styles.timeline}>
                    <View
                      style={[
                        styles.timelineDot,
                        mine && styles.timelineDotMine,
                      ]}
                    />
                    {index < list.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.historyBody}>
                    <Text style={styles.historyTitle}>
                      <Text style={styles.historyActor}>
                        {roleLabel(entry.by)}
                      </Text>{' '}
                      {HISTORY_LABELS[entry.action] ||
                        entry.action.toLowerCase()}
                    </Text>

                    {entry.quantity !== null &&
                      entry.quantity !== undefined &&
                      ['OFFER', 'COUNTER'].includes(entry.action) && (
                        <Text style={styles.historyTerms}>
                          {formatQuantity(entry.quantity, unit)} at{' '}
                          {formatPricePerUnit(entry.pricePerUnit, unit)} ={' '}
                          {formatRupees(entry.quantity * entry.pricePerUnit)}
                        </Text>
                      )}

                    {!!entry.message && (
                      <Text style={styles.historyMessage}>
                        "{entry.message}"
                      </Text>
                    )}

                    <Text style={styles.historyTime}>{timeAgo(entry.at)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {!!actions && <View style={styles.bottomBar}>{actions}</View>}

      <OfferSheet
        visible={counterVisible}
        mode="counter"
        terms={{
          unit,
          available: listing?.quantity,
          listedPrice: snapshot.listedPricePerUnit,
        }}
        initialQuantity={deal.quantity}
        initialPrice={deal.pricePerUnit}
        loading={actionInProgress === 'counter'}
        onClose={() => setCounterVisible(false)}
        serverError={sheetError}
        onSubmit={handleCounter}
      />

      <NoteSheet
        visible={!!sheetConfig}
        {...(sheetConfig || {})}
        loading={!!actionInProgress}
        serverError={sheetError}
        onClose={() => setSheet(null)}
        onSubmit={handleSheetSubmit}
      />

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16, paddingTop: 4 },

  heroPill: { backgroundColor: C.white },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11.5,
    fontWeight: '800',
  },
  heroAmount: {
    color: C.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 2,
  },
  heroTerms: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  heroState: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroStateMyTurn: { backgroundColor: C.white, borderColor: C.white },
  heroStateText: { color: C.white, fontSize: 13, fontWeight: '800' },
  heroStateTextMyTurn: { color: '#8A4A00', fontWeight: '900' },
  heroReason: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  flex: { flex: 1 },
  flexWide: { flex: 1.6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  muted: { fontSize: 11.5, color: C.muted, fontWeight: '600', marginTop: 2 },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: C.dark,
    marginBottom: 6,
  },

  listingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  listingTitle: { fontSize: 14, fontWeight: '900', color: C.dark },

  totalRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, fontWeight: '800', color: C.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: C.green },

  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyName: { fontSize: 14, fontWeight: '900', color: C.dark },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    fontSize: 15,
    fontWeight: '900',
    color: C.dark,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: C.bg,
  },
  lockedText: { flex: 1, fontSize: 11.5, color: C.muted, fontWeight: '600' },
  link: { fontSize: 12.5, color: C.green, fontWeight: '800', marginTop: 12 },

  reviewComment: {
    fontSize: 12.5,
    color: C.text,
    marginTop: 8,
    lineHeight: 18,
  },

  historyItem: { flexDirection: 'row', gap: 12 },
  timeline: { alignItems: 'center', width: 14 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C9D1CC',
    marginTop: 4,
  },
  timelineDotMine: { backgroundColor: C.green },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E9E6',
    marginVertical: 2,
  },
  historyBody: { flex: 1, paddingBottom: 16 },
  historyTitle: { fontSize: 12.5, color: C.text, fontWeight: '600' },
  historyActor: { fontWeight: '900', color: C.dark },
  historyTerms: {
    fontSize: 12.5,
    color: C.green,
    fontWeight: '800',
    marginTop: 3,
  },
  historyMessage: {
    fontSize: 12,
    color: C.text,
    fontStyle: 'italic',
    marginTop: 3,
  },
  historyTime: {
    fontSize: 10.5,
    color: C.muted,
    marginTop: 3,
    fontWeight: '600',
  },

  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionColumn: { flex: 1, gap: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
});
