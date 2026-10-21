import React, { useCallback, useState } from 'react';
import {
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
  Clock,
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
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import {
  fetchLabourBookingById,
  reviewLabourBooking,
  updateLabourBooking,
} from '../../redux/slices/labourBookingSlice';
import {
  BOOKING_STATUS_META,
  WAGE_TYPE_LABELS,
  describeBookingState,
  formatDateRange,
  formatDay,
  formatLabourLocation,
  formatTimeRange,
  getBookingActions,
  isAcceptedStatus,
} from '../../utils/labourFormat';
import { formatRupees } from '../../utils/marketFormat';

const heroGradientFor = booking => {
  if (booking.status === 'pending')
    return booking.myRole === 'labourer' ? 'amber' : 'blue';
  if (isAcceptedStatus(booking.status)) return 'green';
  if (booking.status === 'completed') return 'forest';
  if (booking.status === 'rejected') return 'red';
  return 'slate';
};

const SHEETS = {
  reject: {
    title: 'Decline this request?',
    description:
      'The farmer will see that you declined. Add a reason if you like.',
    placeholder: 'Reason (optional), e.g. Already working that day',
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
    title: 'Rate the worker',
    description: 'Your rating helps other farmers hire good workers.',
    placeholder: 'How was the work? (optional)',
    submitLabel: 'Submit Rating',
    withRating: true,
  },
};

const TOASTS = {
  accept: 'Booking accepted. You can now call the farmer.',
  reject: 'Request declined',
  cancel: 'Booking cancelled',
  complete: 'Marked as completed',
};

export default function LabourBookingDetailsScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { selectedBooking, bookingLoading, bookingError, actionInProgress } =
    useSelector(state => state.labourBooking);

  const [sheet, setSheet] = useState(null);
  const [sheetError, setSheetError] = useState(null);

  const booking = selectedBooking?._id === bookingId ? selectedBooking : null;

  const load = useCallback(
    () => dispatch(fetchLabourBookingById(bookingId)),
    [dispatch, bookingId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /*
   * Runs an action. Returns true on success. Errors go to the sheet when
   * one is open, otherwise to the feedback modal.
   */
  const runAction = async (action, reason) => {
    try {
      await dispatch(
        updateLabourBooking({ bookingId, action, reason }),
      ).unwrap();
      toast.show(TOASTS[action]);
      return true;
    } catch (error) {
      if (sheet) {
        setSheetError(String(error));
      } else {
        feedback.error('Something went wrong', String(error));
      }
      // the booking may have changed (409), show the latest
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
          reviewLabourBooking({ bookingId, rating, comment: text }),
        ).unwrap();
        setSheet(null);
        toast.show('Thanks for rating the worker');
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
        <MarketHeader title="Booking" onBack={() => navigation.goBack()} />
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

  const isFarmer = booking.myRole === 'farmer';
  const other = isFarmer ? booking.labourer : booking.farmer;
  const contactShared =
    isAcceptedStatus(booking.status) || booking.status === 'completed';
  const actions = getBookingActions(booking);
  const workLocation = [
    booking.address,
    booking.village,
    booking.district,
    booking.state,
  ]
    .filter(Boolean)
    .join(', ');

  const handleAccept = () =>
    feedback.confirm({
      title: 'Accept this work?',
      message: `${booking.workType} on ${formatDateRange(
        booking.bookingDate,
        booking.numberOfDays,
      )} for ${formatRupees(
        booking.totalAmount,
      )}. Other requests for these dates will be declined automatically.`,
      confirmLabel: 'Accept Work',
      onConfirm: () => runAction('accept'),
    });

  const handleComplete = () =>
    feedback.confirm({
      title: 'Mark work as completed?',
      message: isFarmer
        ? 'Do this once the work is finished and you have paid the worker.'
        : 'Do this once the work is finished and you have been paid.',
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
            label="Accept Work"
            icon={<CircleCheck size={17} color={C.white} />}
            disabled={!!actionInProgress}
            onPress={handleAccept}
            style={styles.flexWide}
          />
        </>
      );
    }

    if (actions.includes('review')) {
      return (
        <MarketButton
          label="Rate the Worker"
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
              label={isFarmer ? 'Call Worker' : 'Call Farmer'}
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
  const closingReason =
    booking.status === 'rejected'
      ? booking.rejectionReason
      : booking.cancellationReason;

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
            tintColor={C.white}
          />
        }
      >
        {/* STATUS HERO */}
        <MarketHero
          compact
          gradient={heroGradientFor(booking)}
          onBack={() => navigation.goBack()}
          eyebrow={isFarmer ? 'Your booking' : 'Work request'}
          title={booking.workType}
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
          <Text style={styles.heroTerms}>
            {formatDateRange(booking.bookingDate, booking.numberOfDays)} ·{' '}
            {formatTimeRange(booking.startTime, booking.endTime)}
          </Text>

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
              {describeBookingState(booking)}
            </Text>
            {!!closingReason &&
              ['rejected', 'cancelled'].includes(booking.status) && (
                <Text style={styles.heroReason}>Reason: {closingReason}</Text>
              )}
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* OTHER PARTY */}
          <TouchableOpacity
            activeOpacity={isFarmer ? 0.88 : 1}
            disabled={!isFarmer}
            style={styles.card}
            onPress={() =>
              navigation.navigate(LABOUR_ROUTES.LABOURER_DETAILS, {
                labourerId: booking.labourer?._id,
              })
            }
          >
            <Text style={styles.cardLabel}>
              {isFarmer ? 'Worker' : 'Farmer'}
            </Text>
            <View style={styles.partyRow}>
              <PersonAvatar
                name={other?.fullName}
                image={isFarmer ? other?.profileImage : null}
                gradient={isFarmer ? 'green' : 'blue'}
                size={52}
              />
              <View style={styles.flex}>
                <Text style={styles.partyName}>{other?.fullName || '—'}</Text>
                <Text style={styles.partyMeta} numberOfLines={1}>
                  {isFarmer ? other?.labourType : formatLabourLocation(other)}
                </Text>
                {isFarmer && other?.totalReviews > 0 && (
                  <View style={styles.inline}>
                    <Star size={11} color={C.gold} fill={C.gold} />
                    <Text style={styles.partyMeta}>
                      {other.rating} ({other.totalReviews})
                    </Text>
                  </View>
                )}
              </View>
              {contactShared && !!other?.phoneNumber ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.callButton}
                  onPress={callOther}
                >
                  <Phone size={18} color={C.white} />
                </TouchableOpacity>
              ) : (
                isFarmer && <ChevronRight size={18} color={C.muted} />
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
                  Phone number is shared once the worker accepts
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* SCHEDULE */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <CalendarDays size={17} color={C.green} />
              <Text style={styles.cardTitle}>Schedule</Text>
            </View>
            <InfoRow label="Starts" value={formatDay(booking.bookingDate)} />
            {booking.numberOfDays > 1 && (
              <InfoRow label="Ends" value={formatDay(booking.endDate)} />
            )}
            <InfoRow
              label="Duration"
              value={`${booking.numberOfDays || 1} ${
                booking.numberOfDays > 1 ? 'days' : 'day'
              }`}
            />
            <InfoRow
              label="Hours"
              value={formatTimeRange(booking.startTime, booking.endTime)}
            />
          </View>

          {/* WORK */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Briefcase size={17} color={C.orange} />
              <Text style={styles.cardTitle}>Work</Text>
            </View>
            <InfoRow label="Type" value={booking.workType} />
            {!!booking.description && (
              <Text style={styles.paragraph}>{booking.description}</Text>
            )}

            {!!workLocation && (
              <View style={styles.locationRow}>
                <MapPin size={15} color={C.green} />
                <Text style={styles.locationText}>{workLocation}</Text>
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
              <Clock size={17} color={C.blue} />
              <Text style={styles.cardTitle}>Payment</Text>
            </View>
            <InfoRow
              label="Wage"
              value={`${formatRupees(booking.wage)} ${
                WAGE_TYPE_LABELS[booking.wageType] || ''
              }`}
            />
            <InfoRow label="Days" value={booking.numberOfDays || 1} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatRupees(booking.totalAmount)}
              </Text>
            </View>
            <Text style={styles.payNote}>
              Paid directly to the worker after the work.
            </Text>
          </View>

          {/* REVIEW */}
          {!!booking.review?.rating && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isFarmer ? 'Your rating' : "Farmer's rating"}
              </Text>
              <View style={[styles.inline, styles.stars]}>
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
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },

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

  paragraph: {
    fontSize: 13,
    lineHeight: 19,
    color: C.text,
    fontWeight: '500',
    marginTop: 10,
  },
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
  stars: { marginTop: 8, gap: 4 },

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
