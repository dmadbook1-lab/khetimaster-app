import React, { useCallback, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
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
  CalendarClock,
  CircleCheck,
  CircleX,
  ClipboardList,
  Leaf,
  Lock,
  MapPin,
  MessageSquareText,
  PawPrint,
  Pencil,
  Phone,
  Pill,
  Star,
  Wallet,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero, { CareTopBar } from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareBottomBar,
  CareButton,
  CareCard,
  CareCardTitle,
  CareEmpty,
  CareInfoRow,
  CareLoading,
  CarePill,
} from '../../components/doctor/CareBits';
import { CARE as C } from '../../components/doctor/careTheme';
import CareSheet from '../../components/doctor/CareSheet';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import {
  fetchConsultationById,
  reviewConsultation,
  updateConsultation,
} from '../../redux/slices/doctorConsultationSlice';
import { formatRupees } from '../../utils/marketFormat';
import {
  dayKeyOf,
  formatDay,
  formatTimeRange,
  todayInIndiaKey,
} from '../../utils/indiaSchedule';
import {
  CONSULTATION_TYPE_LABELS,
  PAYMENT_LABELS,
  STATUS_META,
  closingReason,
  describeConsultationState,
  getConsultationActions,
  isAcceptedStatus,
} from '../../utils/doctorFormat';

const heroGradientFor = consultation => {
  const { status, myRole } = consultation;
  if (status === 'pending') return myRole === 'doctor' ? 'amber' : 'blue';
  if (isAcceptedStatus(status)) return 'care';
  if (status === 'completed') return 'vet';
  if (status === 'rejected') return 'coral';
  return 'slate';
};

const OUTCOME_FIELDS = [
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    placeholder: 'What is the problem?',
    multiline: true,
    maxLength: 2000,
  },
  {
    key: 'prescription',
    label: 'Prescription / treatment',
    placeholder: 'Medicines, doses, sprays, how long...',
    multiline: true,
    maxLength: 2000,
  },
  {
    key: 'doctorNotes',
    label: 'Advice for the farmer',
    placeholder: 'Care tips, what to watch for...',
    multiline: true,
    maxLength: 2000,
  },
];

const SHEETS = {
  reject: {
    title: 'Decline this request?',
    description:
      'The farmer will see that you declined. Add a reason if you like.',
    fields: [
      {
        key: 'reason',
        label: 'Reason (optional)',
        placeholder: 'e.g. I am travelling that day',
        multiline: true,
      },
    ],
    submitLabel: 'Decline Request',
    variant: 'danger',
  },
  cancel: {
    title: 'Cancel consultation?',
    description: 'This cancels the consultation for both of you.',
    fields: [
      {
        key: 'reason',
        label: 'Reason (optional)',
        placeholder: 'e.g. The animal is better now',
        multiline: true,
      },
    ],
    submitLabel: 'Cancel Consultation',
    variant: 'danger',
  },
  review: {
    title: 'Rate the doctor',
    description:
      'How helpful was the consultation? Your rating helps other farmers.',
    fields: [
      {
        key: 'comment',
        label: 'Your review (optional)',
        placeholder: 'e.g. Came on time, cow recovered in 2 days',
        multiline: true,
      },
    ],
    withRating: true,
    submitLabel: 'Submit Rating',
  },
  complete: {
    title: 'Complete consultation',
    description: 'Write what you found and what to do. The farmer sees this.',
    fields: OUTCOME_FIELDS,
    withFollowUp: true,
    submitLabel: 'Mark Completed',
  },
  notes: {
    title: 'Diagnosis & prescription',
    description:
      'Add or correct your notes. The farmer sees the latest version.',
    fields: OUTCOME_FIELDS,
    withFollowUp: true,
    submitLabel: 'Save Notes',
  },
};

const TOASTS = {
  accept: 'Accepted. You can now call each other.',
  reject: 'Request declined',
  cancel: 'Consultation cancelled',
  complete: 'Marked as completed',
  notes: 'Notes saved',
};

export default function ConsultationDetailsScreen({ navigation, route }) {
  const { consultationId } = route.params;
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const toast = useToast();
  const todayKey = todayInIndiaKey();

  const { selected, selectedLoading, selectedError, actionInProgress } =
    useSelector(state => state.doctorConsultation);

  const [sheet, setSheet] = useState(null);
  const [sheetError, setSheetError] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  const consultation = selected?._id === consultationId ? selected : null;

  const load = useCallback(
    () => dispatch(fetchConsultationById(consultationId)),
    [dispatch, consultationId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!consultation) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <CareTopBar title="Consultation" onBack={() => navigation.goBack()} />
        {selectedError && !selectedLoading ? (
          <CareEmpty
            title="Consultation not available"
            message={selectedError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <CareLoading />
        )}
      </SafeAreaView>
    );
  }

  const isDoctor = consultation.myRole === 'doctor';
  const isVet = consultation.consultationType !== 'agricultural';
  const doctor = consultation.doctor || {};
  const farmer = consultation.farmer || {};
  const other = isDoctor ? farmer : doctor;
  const otherName = other?.fullName || (isDoctor ? 'Farmer' : 'Doctor');
  const contactShared =
    isAcceptedStatus(consultation.status) ||
    consultation.status === 'completed';
  const actions = getConsultationActions(consultation, todayKey);
  const reason = closingReason(consultation);
  const hasOutcome = !!(
    consultation.diagnosis ||
    consultation.prescription ||
    consultation.doctorNotes ||
    consultation.followUpDate
  );
  const place = [
    consultation.address,
    consultation.village,
    consultation.district,
    consultation.state,
  ]
    .filter(Boolean)
    .join(', ');
  const day = dayKeyOf(consultation.consultationDate);

  /*
   * Errors go inside the sheet when one is open, otherwise to the modal.
   */
  const runAction = async (action, extra = {}) => {
    try {
      await dispatch(
        updateConsultation({ consultationId, action, ...extra }),
      ).unwrap();
      toast.show(TOASTS[action]);
      return true;
    } catch (error) {
      if (sheet) setSheetError(String(error));
      else feedback.error('Something went wrong', String(error));
      load();
      return false;
    }
  };

  const openSheet = name => {
    setSheetError(null);
    setSheet(name);
  };

  const handleSheetSubmit = async values => {
    if (sheet === 'review') {
      try {
        await dispatch(
          reviewConsultation({
            consultationId,
            rating: values.rating,
            comment: values.comment,
          }),
        ).unwrap();
        setSheet(null);
        toast.show('Thanks for your rating');
      } catch (error) {
        setSheetError(String(error));
      }
      return;
    }

    let extra = {};
    if (sheet === 'reject' || sheet === 'cancel') {
      extra = { reason: values.reason };
    } else {
      extra = {
        outcome: {
          diagnosis: values.diagnosis,
          prescription: values.prescription,
          doctorNotes: values.doctorNotes,
          followUpDate: values.followUpDate,
        },
      };
    }

    if (await runAction(sheet, extra)) setSheet(null);
  };

  const accept = () =>
    feedback.confirm({
      title: 'Accept this consultation?',
      message:
        'You and the farmer will see each other’s phone numbers. Other requests at the same time will be declined.',
      confirmLabel: 'Accept',
      onConfirm: () => runAction('accept'),
    });

  const completeAsFarmer = () =>
    feedback.confirm({
      title: 'Mark as completed?',
      message: 'Do this once the doctor has seen your animal or crop.',
      confirmLabel: 'Yes, completed',
      onConfirm: () => runAction('complete'),
    });

  const call = () => Linking.openURL(`tel:${other.phoneNumber}`);

  const renderActions = () => {
    if (actions.includes('accept')) {
      return (
        <>
          <CareButton
            variant="danger"
            label="Decline"
            icon={<CircleX size={16} color={C.red} />}
            disabled={!!actionInProgress}
            onPress={() => openSheet('reject')}
            style={styles.flex}
          />
          <CareButton
            label="Accept"
            icon={<CircleCheck size={17} color={C.white} />}
            loading={actionInProgress === 'accept'}
            disabled={!!actionInProgress}
            onPress={accept}
            style={styles.flexWide}
          />
        </>
      );
    }

    if (actions.includes('review')) {
      return (
        <CareButton
          label="Rate the Doctor"
          icon={<Star size={17} color={C.white} />}
          onPress={() => openSheet('review')}
          style={styles.flex}
        />
      );
    }

    if (actions.includes('complete')) {
      return (
        <>
          {contactShared && !!other?.phoneNumber && (
            <CareButton
              variant="outline"
              label="Call"
              icon={<Phone size={16} color={C.tealDark} />}
              onPress={call}
              style={styles.flex}
            />
          )}
          <CareButton
            label="Mark Completed"
            icon={<CircleCheck size={16} color={C.white} />}
            disabled={!!actionInProgress}
            onPress={() =>
              isDoctor ? openSheet('complete') : completeAsFarmer()
            }
            style={styles.flexWide}
          />
        </>
      );
    }

    if (actions.includes('cancel')) {
      return (
        <>
          <CareButton
            variant="danger"
            label={
              consultation.status === 'pending' ? 'Cancel Request' : 'Cancel'
            }
            disabled={!!actionInProgress}
            onPress={() => openSheet('cancel')}
            style={styles.flex}
          />
          {contactShared && !!other?.phoneNumber && (
            <CareButton
              label={isDoctor ? 'Call Farmer' : 'Call Doctor'}
              icon={<Phone size={16} color={C.white} />}
              onPress={call}
              style={styles.flexWide}
            />
          )}
        </>
      );
    }

    if (actions.includes('notes')) {
      return (
        <CareButton
          variant="outline"
          label={hasOutcome ? 'Edit Diagnosis' : 'Add Diagnosis'}
          icon={<Pencil size={16} color={C.tealDark} />}
          onPress={() => openSheet('notes')}
          style={styles.flex}
        />
      );
    }

    return null;
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
            refreshing={selectedLoading}
            onRefresh={load}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
      >
        <CareHero
          compact
          onBack={() => navigation.goBack()}
          right={
            <CarePill
              meta={STATUS_META[consultation.status]}
              style={styles.heroPill}
            />
          }
          gradient={heroGradientFor(consultation)}
          eyebrow={`${
            isDoctor ? 'Consultation request' : 'Your consultation'
          } · ${CONSULTATION_TYPE_LABELS[consultation.consultationType]}`}
          title={consultation.problemType || 'Consultation'}
          subtitle={`${
            day === todayKey ? 'Today' : formatDay(day)
          } · ${formatTimeRange(consultation.startTime, consultation.endTime)}`}
        >
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
              {describeConsultationState(consultation, todayKey)}
            </Text>
            {!!reason && (
              <Text style={styles.heroReason}>Reason: {reason}</Text>
            )}
          </View>
          <View style={styles.heroFeeRow}>
            <Text style={styles.heroFeeLabel}>Fee</Text>
            <Text style={styles.heroFee}>
              {consultation.totalAmount
                ? formatRupees(consultation.totalAmount)
                : 'Free'}
            </Text>
          </View>
        </CareHero>

        <View style={styles.body}>
          {/* OTHER PERSON */}
          <CareCard>
            <Text style={styles.cardLabel}>
              {isDoctor ? 'Farmer' : 'Doctor'}
            </Text>
            <TouchableOpacity
              activeOpacity={isDoctor ? 1 : 0.85}
              disabled={isDoctor || !doctor._id}
              style={styles.personRow}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.PROFILE, {
                  doctorId: doctor._id,
                })
              }
            >
              <DoctorAvatar
                name={otherName}
                image={isDoctor ? null : doctor.profileImage}
                doctorType={isDoctor ? null : doctor.doctorType}
                size={54}
              />
              <View style={styles.flex}>
                <Text style={styles.personName}>{otherName}</Text>
                <Text style={styles.personMeta} numberOfLines={1}>
                  {isDoctor
                    ? [farmer.village, farmer.district]
                        .filter(Boolean)
                        .join(', ')
                    : (doctor.specialization || []).slice(0, 2).join(' · ')}
                </Text>
              </View>
              {contactShared && !!other?.phoneNumber && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.callButton}
                  onPress={call}
                >
                  <Phone size={18} color={C.white} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {contactShared ? (
              !!other?.phoneNumber && (
                <Text style={styles.phone}>{other.phoneNumber}</Text>
              )
            ) : (
              <View style={styles.lockedRow}>
                <Lock size={13} color={C.muted} />
                <Text style={styles.lockedText}>
                  Phone numbers are shared once the doctor accepts
                </Text>
              </View>
            )}
          </CareCard>

          {/* DOCTOR'S OUTCOME */}
          {hasOutcome && (
            <CareCard style={styles.outcomeCard}>
              <CareCardTitle
                icon={<ClipboardList size={16} color={C.blue} />}
                color={C.blue}
                title="Doctor's advice"
              />
              {!!consultation.diagnosis && (
                <View style={styles.outcomeBlock}>
                  <Text style={styles.outcomeLabel}>Diagnosis</Text>
                  <Text style={styles.outcomeText}>
                    {consultation.diagnosis}
                  </Text>
                </View>
              )}
              {!!consultation.prescription && (
                <View style={styles.outcomeBlock}>
                  <View style={styles.inline}>
                    <Pill size={13} color={C.teal} />
                    <Text style={styles.outcomeLabel}>Prescription</Text>
                  </View>
                  <Text style={styles.outcomeText}>
                    {consultation.prescription}
                  </Text>
                </View>
              )}
              {!!consultation.doctorNotes && (
                <View style={styles.outcomeBlock}>
                  <Text style={styles.outcomeLabel}>Advice</Text>
                  <Text style={styles.outcomeText}>
                    {consultation.doctorNotes}
                  </Text>
                </View>
              )}
              {!!consultation.followUpDate && (
                <View style={styles.followUp}>
                  <CalendarClock size={15} color={C.amber} />
                  <Text style={styles.followUpText}>
                    Follow-up on {formatDay(consultation.followUpDate)}
                  </Text>
                </View>
              )}
            </CareCard>
          )}

          {/* PROBLEM */}
          <CareCard>
            <CareCardTitle
              icon={
                isVet ? (
                  <PawPrint size={16} color={C.teal} />
                ) : (
                  <Leaf size={16} color={C.olive} />
                )
              }
              color={isVet ? C.teal : C.olive}
              title={isVet ? 'About the animal' : 'About the crop'}
            />
            <CareInfoRow label="Problem" value={consultation.problemType} />
            {isVet ? (
              <>
                <CareInfoRow label="Animal" value={consultation.animalType} />
                <CareInfoRow
                  label="How many"
                  value={consultation.animalCount || ''}
                />
                <CareInfoRow label="Age" value={consultation.animalAge} />
              </>
            ) : (
              <CareInfoRow label="Crop" value={consultation.cropName} />
            )}
            {!!consultation.symptoms && (
              <View style={styles.outcomeBlock}>
                <Text style={styles.outcomeLabel}>Symptoms</Text>
                <Text style={styles.outcomeText}>{consultation.symptoms}</Text>
              </View>
            )}
            {!!consultation.description && (
              <View style={styles.outcomeBlock}>
                <Text style={styles.outcomeLabel}>More details</Text>
                <Text style={styles.outcomeText}>
                  {consultation.description}
                </Text>
              </View>
            )}
            {(consultation.images || []).length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoList}
              >
                {consultation.images.map(uri => (
                  <TouchableOpacity
                    key={uri}
                    activeOpacity={0.85}
                    onPress={() => setViewImage(uri)}
                  >
                    <Image source={{ uri }} style={styles.photo} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {!!consultation.farmerNotes && (
              <View style={styles.noteBox}>
                <MessageSquareText size={14} color={C.amber} />
                <Text style={styles.noteText}>{consultation.farmerNotes}</Text>
              </View>
            )}
          </CareCard>

          {/* PLACE + PAYMENT */}
          <CareCard>
            {!!place && (
              <View style={styles.placeRow}>
                <MapPin size={16} color={C.teal} />
                <Text style={styles.placeText}>{place}</Text>
              </View>
            )}
            <View style={styles.payRow}>
              <Wallet size={16} color={C.teal} />
              <Text style={styles.payLabel}>
                {consultation.totalAmount
                  ? `Pay by ${
                      PAYMENT_LABELS[consultation.paymentMethod] || 'cash'
                    }`
                  : 'Free consultation'}
              </Text>
              <Text style={styles.payValue}>
                {consultation.totalAmount
                  ? formatRupees(consultation.totalAmount)
                  : '₹0'}
              </Text>
            </View>
          </CareCard>

          {/* REVIEW */}
          {!!consultation.review?.rating && (
            <CareCard>
              <Text style={styles.cardLabel}>
                {isDoctor ? "Farmer's rating" : 'Your rating'}
              </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(value => (
                  <Star
                    key={value}
                    size={20}
                    color={C.gold}
                    fill={
                      value <= consultation.review.rating
                        ? C.gold
                        : 'transparent'
                    }
                  />
                ))}
              </View>
              {!!consultation.review.comment && (
                <Text style={styles.outcomeText}>
                  {consultation.review.comment}
                </Text>
              )}
            </CareCard>
          )}

          <View style={styles.statusFoot}>
            <CarePill meta={STATUS_META[consultation.status]} />
            <Text style={styles.footText}>
              Requested {formatDay(consultation.createdAt, { weekday: false })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {!!actionButtons && <CareBottomBar>{actionButtons}</CareBottomBar>}

      <CareSheet
        visible={!!sheetConfig}
        {...(sheetConfig || {})}
        todayKey={todayKey}
        initialValues={
          sheet === 'notes' || sheet === 'complete'
            ? {
                diagnosis: consultation.diagnosis,
                prescription: consultation.prescription,
                doctorNotes: consultation.doctorNotes,
                followUpDate: consultation.followUpDate,
              }
            : {}
        }
        loading={!!actionInProgress}
        serverError={sheetError}
        onClose={() => setSheet(null)}
        onSubmit={handleSheetSubmit}
      />

      <Modal
        visible={!!viewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setViewImage(null)}
      >
        <Pressable style={styles.viewer} onPress={() => setViewImage(null)}>
          {!!viewImage && (
            <Image
              source={{ uri: viewImage }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.viewerClose}>
            <X size={20} color={C.white} />
          </View>
        </Pressable>
      </Modal>

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  heroPill: { backgroundColor: C.white },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  flexWide: { flex: 1.5 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  heroState: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
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
  heroFeeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  heroFeeLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '800',
  },
  heroFee: {
    color: C.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  cardLabel: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  personName: { fontSize: 16, fontWeight: '900', color: C.ink },
  personMeta: { fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 2 },
  callButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    fontSize: 16,
    fontWeight: '900',
    color: C.ink,
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

  outcomeCard: { borderColor: '#D6E4FF' },
  outcomeBlock: { marginTop: 10 },
  outcomeLabel: { fontSize: 11.5, fontWeight: '900', color: C.muted },
  outcomeText: {
    fontSize: 13,
    lineHeight: 20,
    color: C.text,
    fontWeight: '600',
    marginTop: 3,
  },
  followUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.amberSoft,
  },
  followUpText: { fontSize: 12.5, fontWeight: '800', color: '#8A5A00' },

  photoList: { gap: 8, marginTop: 12 },
  photo: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: C.tealSoft,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.amberSoft,
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    color: '#725C19',
    fontWeight: '600',
    lineHeight: 18,
  },

  placeRow: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
  placeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 19,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.tealSoft,
  },
  payLabel: { flex: 1, fontSize: 13, fontWeight: '800', color: C.text },
  payValue: { fontSize: 17, fontWeight: '900', color: C.tealDark },
  stars: { flexDirection: 'row', gap: 4, marginTop: 8 },

  statusFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  footText: { fontSize: 11.5, fontWeight: '600', color: C.muted },

  viewer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: { width: '100%', height: '80%' },
  viewerClose: {
    position: 'absolute',
    top: 54,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
