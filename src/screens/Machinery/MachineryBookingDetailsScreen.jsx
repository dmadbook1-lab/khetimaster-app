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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Briefcase,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  CircleX,
  IndianRupee,
  Lock,
  MapPin,
  MessageSquareText,
  Phone,
  Star,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
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
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import PersonAvatar from '../../components/labour/PersonAvatar';
import { machineryImageSource } from '../../components/machinery/machineryImages';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import {
  fetchMachineryBookingById,
  reviewMachineryBooking,
  updateMachineryBooking,
} from '../../redux/slices/machineryBookingSlice';
import {
  BOOKING_STATUS_META,
  PAYMENT_LABELS,
  describeRentalState,
  formatDuration,
  formatRate,
  getRentalActions,
  isAcceptedStatus,
} from '../../utils/machineryFormat';
import {
  formatDateRange,
  formatDay,
  formatTimeRange,
} from '../../utils/indiaSchedule';
import { formatRupees } from '../../utils/marketFormat';

const heroGradientFor = booking => {
  if (booking.status === 'pending')
    return booking.myRole === 'owner' ? 'amber' : 'blue';
  if (isAcceptedStatus(booking.status)) return 'green';
  if (booking.status === 'completed') return 'forest';
  if (booking.status === 'rejected') return 'red';
  return 'slate';
};

const SHEETS = {
  accept: {
    title: 'Confirm this rental?',
    description:
      'Phone numbers will be shared and other requests for the same time will be declined. Add a note for the farmer if you like.',
    placeholder: 'Note (optional), e.g. Please arrange diesel',
    submitLabel: 'Confirm Rental',
  },
  reject: {
    title: 'Decline this request?',
    description:
      'The farmer will see that you declined. Add a reason if you like.',
    placeholder: 'Reason (optional), e.g. Machine under repair',
    submitLabel: 'Decline Request',
    variant: 'danger',
  },
  cancel: {
    title: 'Cancel booking?',
    description: 'This cancels the booking for both of you.',
    placeholder: 'Reason (optional)',
    submitLabel: 'Cancel Booking',
    variant: 'danger',
  },
  review: {
    title: 'Rate this rental',
    description:
      'How were the machine and the owner? Your rating helps other farmers.',
    placeholder: 'How was the work? (optional)',
    submitLabel: 'Submit Rating',
    withRating: true,
  },
};

const TOASTS = {
  accept: 'Rental confirmed. You can now call the farmer.',
  reject: 'Request declined',
  cancel: 'Booking cancelled',
  complete: 'Marked as completed',
};

const scheduleText = booking =>
  booking.durationUnit === 'days'
    ? formatDateRange(booking.bookingDate, booking.duration)
    : `${formatDay(booking.bookingDate)} · ${formatTimeRange(
        booking.startTime,
        booking.endTime,
      )}`;

export default function MachineryBookingDetailsScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { selectedBooking, bookingLoading, bookingError, actionInProgress } =
    useSelector(state => state.machineryBooking);

  const [sheet, setSheet] = useState(null);
  const [sheetError, setSheetError] = useState(null);

  const booking = selectedBooking?._id === bookingId ? selectedBooking : null;

  const load = useCallback(
    () => dispatch(fetchMachineryBookingById(bookingId)),
    [dispatch, bookingId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /*
   * Errors go inside the sheet when one is open, otherwise to the modal.
   */
  const runAction = async (action, note) => {
    try {
      await dispatch(
        updateMachineryBooking({ bookingId, action, note }),
      ).unwrap();
      toast.show(TOASTS[action]);
      return true;
    } catch (error) {
      if (sheet) {
        setSheetError(String(error));
      } else {
        feedback.error('Something went wrong', String(error));
      }
      load();
      return false;
    }
  };

  const openSheet = name => {
    setSheetError(null);
    setSheet(name);
  };

  const handleSheetSubmit = async ({ text, rating }) => {
    if (sheet === 'review') {
      try {
        await dispatch(
          reviewMachineryBooking({ bookingId, rating, comment: text }),
        ).unwrap();
        setSheet(null);
        toast.show('Thanks for your rating');
      } catch (error) {
        setSheetError(String(error));
      }
      return;
    }

    if (await runAction(sheet, text)) {
      setSheet(null);
    }
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Rental" onBack={() => navigation.goBack()} />
        {bookingError && !bookingLoading ? (
          <EmptyState
            title="Booking not available"
            message={bookingError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const isOwner = booking.myRole === 'owner';
  const machine = booking.machinery || {};
  const other = isOwner ? booking.farmer : machine.owner;
  const otherName =
    other?.fullName || (isOwner ? 'Farmer' : machine.ownerName || 'Owner');
  const contactShared =
    isAcceptedStatus(booking.status) || booking.status === 'completed';
  const actions = getRentalActions(booking);
  const farmLocation = [
    booking.address,
    booking.village,
    booking.district,
    booking.state,
  ]
    .filter(Boolean)
    .join(', ');
  const closingReason =
    booking.status === 'rejected'
      ? booking.rejectionReason
      : booking.cancellationReason;
  const rateUnit =
    booking.customRate?.unit ||
    { hours: 'hour', days: 'day' }[booking.durationUnit];

  const handleComplete = () =>
    feedback.confirm({
      title: 'Mark work as completed?',
      message: isOwner
        ? 'Do this once the work is finished and you have been paid.'
        : 'Do this once the work is finished and you have paid the owner.',
      confirmLabel: 'Yes, completed',
      onConfirm: () => runAction('complete'),
    });

  const callOther = () => Linking.openURL(`tel:${other.phoneNumber}`);

  const renderActions = () => {
    if (!actions.length) return null;

    if (actions.includes('accept')) {
      return (
        <>
          <MarketButton
            variant="danger"
            label="Decline"
            icon={<CircleX size={16} color={C.red} />}
            disabled={!!actionInProgress}
            onPress={() => openSheet('reject')}
            style={styles.flex}
          />
          <MarketButton
            label="Confirm Rental"
            icon={<CircleCheck size={17} color={C.white} />}
            disabled={!!actionInProgress}
            onPress={() => openSheet('accept')}
            style={styles.flexWide}
          />
        </>
      );
    }

    if (actions.includes('review')) {
      return (
        <MarketButton
          label="Rate this Rental"
          icon={<Star size={17} color={C.white} />}
          onPress={() => openSheet('review')}
          style={styles.flex}
        />
      );
    }

    return (
      <>
        {actions.includes('cancel') && (
          <MarketButton
            variant="danger"
            label={booking.status === 'pending' ? 'Cancel Request' : 'Cancel'}
            disabled={!!actionInProgress}
            onPress={() => openSheet('cancel')}
            style={styles.flex}
          />
        )}
        {actions.includes('complete') ? (
          <MarketButton
            label="Mark Completed"
            icon={<CircleCheck size={16} color={C.white} />}
            disabled={!!actionInProgress}
            onPress={handleComplete}
            style={styles.flexWide}
          />
        ) : (
          contactShared &&
          !!other?.phoneNumber && (
            <MarketButton
              label={isOwner ? 'Call Farmer' : 'Call Owner'}
              icon={<Phone size={16} color={C.white} />}
              onPress={callOther}
              style={styles.flexWide}
            />
          )
        )}
      </>
    );
  };

  const actionButtons = renderActions();
  const sheetConfig = sheet ? SHEETS[sheet] : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={bookingLoading}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
      >
        <MarketHero
          compact
          gradient={heroGradientFor(booking)}
          onBack={() => navigation.goBack()}
          eyebrow={isOwner ? 'Rental request' : 'Your rental'}
          title={machine.name || 'Machinery'}
          right={
            <StatusPill
              meta={BOOKING_STATUS_META[booking.status]}
              style={styles.heroPill}
            />
          }
        >
          <Text style={styles.heroLabel}>Total payment</Text>
          <Text style={styles.heroAmount}>
            {formatRupees(booking.totalAmount)}
          </Text>
          <Text style={styles.heroTerms}>{scheduleText(booking)}</Text>

          <View
            style={[
              styles.heroState,
              actions.includes('accept') && styles.heroStateUrgent,
            ]}
          >
            <Text
              style={[
                styles.heroStateText,
                actions.includes('accept') && styles.heroStateTextUrgent,
              ]}
            >
              {describeRentalState(booking)}
            </Text>
            {!!closingReason &&
              ['rejected', 'cancelled'].includes(booking.status) && (
                <Text style={styles.heroReason}>Reason: {closingReason}</Text>
              )}
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* MACHINE */}
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!machine._id}
            style={[styles.card, styles.machineRow]}
            onPress={() =>
              navigation.navigate(MACHINERY_ROUTES.DETAILS, {
                machineryId: machine._id,
              })
            }
          >
            <Image
              source={machineryImageSource(machine)}
              style={styles.machineImage}
            />
            <View style={styles.flex}>
              <Text style={styles.machineName} numberOfLines={1}>
                {machine.name}
              </Text>
              <Text style={styles.machineMeta} numberOfLines={1}>
                {[machine.category, machine.brand, machine.model]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            <ChevronRight size={18} color={C.muted} />
          </TouchableOpacity>

          {/* OTHER PARTY */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{isOwner ? 'Farmer' : 'Owner'}</Text>
            <View style={styles.partyRow}>
              <PersonAvatar
                name={otherName}
                gradient={isOwner ? 'blue' : 'green'}
                size={50}
              />
              <View style={styles.flex}>
                <Text style={styles.partyName}>{otherName}</Text>
                <Text style={styles.partyMeta} numberOfLines={1}>
                  {[other?.village, other?.district].filter(Boolean).join(', ')}
                </Text>
              </View>
              {contactShared && !!other?.phoneNumber && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.callButton}
                  onPress={callOther}
                >
                  <Phone size={18} color={C.white} />
                </TouchableOpacity>
              )}
            </View>

            {contactShared ? (
              !!other?.phoneNumber && (
                <Text style={styles.phone}>{other.phoneNumber}</Text>
              )
            ) : (
              <View style={styles.lockedRow}>
                <Lock size={13} color={C.muted} />
                <Text style={styles.lockedText}>
                  Phone number is shared once the owner confirms
                </Text>
              </View>
            )}

            {!!booking.ownerNotes && (
              <View style={styles.noteBox}>
                <MessageSquareText size={14} color={C.blue} />
                <Text style={[styles.noteText, styles.ownerNote]}>
                  Owner: {booking.ownerNotes}
                </Text>
              </View>
            )}
          </View>

          {/* SCHEDULE + WORK */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <CalendarDays size={17} color={C.green} />
              <Text style={styles.cardTitle}>Schedule & work</Text>
            </View>
            <InfoRow label="Starts" value={formatDay(booking.bookingDate)} />
            {booking.durationUnit === 'days' && booking.duration > 1 && (
              <InfoRow label="Ends" value={formatDay(booking.endDate)} />
            )}
            {booking.durationUnit !== 'days' && (
              <InfoRow
                label="Time"
                value={formatTimeRange(booking.startTime, booking.endTime)}
              />
            )}
            <InfoRow label="Work" value={booking.workType} />
            <InfoRow label="Implement" value={booking.selectedImplement} />
            <InfoRow label="Crop" value={booking.crop} />
            <InfoRow label="Farm size" value={booking.farmSize} />

            {!!farmLocation && (
              <View style={styles.locationRow}>
                <MapPin size={15} color={C.green} />
                <Text style={styles.locationText}>{farmLocation}</Text>
              </View>
            )}

            {!!booking.farmerNotes && (
              <View style={styles.noteBox}>
                <MessageSquareText size={14} color={C.amber} />
                <Text style={styles.noteText}>{booking.farmerNotes}</Text>
              </View>
            )}
          </View>

          {/* PAYMENT */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <IndianRupee size={17} color={C.blue} />
              <Text style={styles.cardTitle}>Payment</Text>
            </View>
            {!!booking.customRate?.name && (
              <InfoRow label="Rate" value={booking.customRate.name} />
            )}
            <InfoRow
              label="Price"
              value={
                rateUnit
                  ? formatRate(booking.rate, rateUnit)
                  : formatRupees(booking.rate)
              }
            />
            <InfoRow
              label="Quantity"
              value={formatDuration(booking.duration, booking.durationUnit)}
            />
            <InfoRow
              label="Pay with"
              value={PAYMENT_LABELS[booking.paymentMethod]}
            />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatRupees(booking.totalAmount)}
              </Text>
            </View>
            <Text style={styles.payNote}>
              Paid directly to the owner after the work.
            </Text>
          </View>

          {/* REVIEW */}
          {!!booking.review?.rating && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isOwner ? "Farmer's rating" : 'Your rating'}
              </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(value => (
                  <Star
                    key={value}
                    size={20}
                    color={C.gold}
                    fill={
                      value <= booking.review.rating ? C.gold : 'transparent'
                    }
                  />
                ))}
              </View>
              {!!booking.review.comment && (
                <Text style={styles.paragraph}>{booking.review.comment}</Text>
              )}
            </View>
          )}

          {/* WORK TYPE ICON FOOTER */}
          <View style={styles.footerHint}>
            <Briefcase size={13} color={C.muted} />
            <Text style={styles.footerHintText}>
              Booked {formatDay(booking.createdAt, { weekday: false })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {!!actionButtons && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          {actionButtons}
        </View>
      )}

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
  flex: { flex: 1 },
  flexWide: { flex: 1.5 },

  heroPill: { backgroundColor: C.white },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 16,
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
  heroStateUrgent: { backgroundColor: C.white, borderColor: C.white },
  heroStateText: { color: C.white, fontSize: 13, fontWeight: '800' },
  heroStateTextUrgent: { color: '#8A4A00', fontWeight: '900' },
  heroReason: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  machineImage: {
    width: 58,
    height: 58,
    borderRadius: 15,
    backgroundColor: '#E3EEE7',
  },
  machineName: { fontSize: 15, fontWeight: '900', color: C.dark },
  machineMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },

  cardLabel: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: C.dark },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  partyName: { fontSize: 15.5, fontWeight: '900', color: C.dark },
  partyMeta: { fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 2 },
  callButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.bg,
  },
  lockedText: { flex: 1, fontSize: 11.5, color: C.muted, fontWeight: '600' },

  locationRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
  },
  locationText: {
    flex: 1,
    fontSize: 12.5,
    color: C.text,
    fontWeight: '700',
    lineHeight: 18,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightAmber,
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    color: '#725C19',
    fontWeight: '600',
    lineHeight: 18,
  },
  ownerNote: { color: C.blue },

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
  payNote: { fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 8 },
  stars: { flexDirection: 'row', gap: 4, marginTop: 8 },
  paragraph: {
    fontSize: 13,
    lineHeight: 19,
    color: C.text,
    fontWeight: '500',
    marginTop: 10,
  },

  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: 18,
  },
  footerHintText: { fontSize: 11.5, fontWeight: '600', color: C.muted },

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
});
