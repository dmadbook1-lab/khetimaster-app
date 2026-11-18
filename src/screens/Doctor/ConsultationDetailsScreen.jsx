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
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

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
    get label() {
    return i18n.t('consultationDetails.diagnosis');
  },
    get placeholder() {
    return i18n.t('consultationDetails.whatIsTheProblem');
  },
    multiline: true,
    maxLength: 2000,
  },
  {
    key: 'prescription',
    get label() {
    return i18n.t('consultationDetails.prescriptionTreatment');
  },
    get placeholder() {
    return i18n.t('consultationDetails.medicinesDosesSpraysHowLong');
  },
    multiline: true,
    maxLength: 2000,
  },
  {
    key: 'doctorNotes',
    get label() {
    return i18n.t('consultationDetails.adviceForTheFarmer');
  },
    get placeholder() {
    return i18n.t('consultationDetails.careTipsWhatToWatch');
  },
    multiline: true,
    maxLength: 2000,
  },
];

const SHEETS = {
  reject: {
    get title() {
    return i18n.t('consultationDetails.declineThisRequest');
  },
    get description() {
    return i18n.t('consultationDetails.theFarmerWillSeeThat');
  },
    fields: [
      {
        key: 'reason',
        get label() {
    return i18n.t('consultationDetails.reasonOptional');
  },
        get placeholder() {
    return i18n.t('consultationDetails.eGIAmTravelling');
  },
        multiline: true,
      },
    ],
    get submitLabel() {
    return i18n.t('consultationDetails.declineRequest');
  },
    variant: 'danger',
  },
  cancel: {
    get title() {
    return i18n.t('consultationDetails.cancelConsultation');
  },
    get description() {
    return i18n.t('consultationDetails.thisCancelsTheConsultationFor');
  },
    fields: [
      {
        key: 'reason',
        get label() {
    return i18n.t('consultationDetails.reasonOptional');
  },
        get placeholder() {
    return i18n.t('consultationDetails.eGTheAnimalIs');
  },
        multiline: true,
      },
    ],
    get submitLabel() {
    return i18n.t('consultationDetails.cancelConsultation2');
  },
    variant: 'danger',
  },
  review: {
    get title() {
    return i18n.t('consultationDetails.rateTheDoctor');
  },
    get description() {
    return i18n.t('consultationDetails.howHelpfulWasTheConsultation');
  },
    fields: [
      {
        key: 'comment',
        get label() {
    return i18n.t('consultationDetails.yourReviewOptional');
  },
        get placeholder() {
    return i18n.t('consultationDetails.eGCameOnTime');
  },
        multiline: true,
      },
    ],
    withRating: true,
    get submitLabel() {
    return i18n.t('consultationDetails.submitRating');
  },
  },
  complete: {
    get title() {
    return i18n.t('consultationDetails.completeConsultation');
  },
    get description() {
    return i18n.t('consultationDetails.writeWhatYouFoundAnd');
  },
    fields: OUTCOME_FIELDS,
    withFollowUp: true,
    get submitLabel() {
    return i18n.t('consultationDetails.markCompleted');
  },
  },
  notes: {
    get title() {
    return i18n.t('consultationDetails.diagnosisPrescription');
  },
    get description() {
    return i18n.t('consultationDetails.addOrCorrectYourNotes');
  },
    fields: OUTCOME_FIELDS,
    withFollowUp: true,
    get submitLabel() {
    return i18n.t('consultationDetails.saveNotes');
  },
  },
};

const TOASTS = {
  get accept() {
    return i18n.t('consultationDetails.acceptedYouCanNowCall');
  },
  get reject() {
    return i18n.t('consultationDetails.requestDeclined');
  },
  get cancel() {
    return i18n.t('consultationDetails.consultationCancelled');
  },
  get complete() {
    return i18n.t('consultationDetails.markedAsCompleted');
  },
  get notes() {
    return i18n.t('consultationDetails.notesSaved');
  },
};

export default function ConsultationDetailsScreen({ navigation, route }) {
  const {t} = useTranslation();
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
        <CareTopBar title={t('consultationDetails.consultation')} onBack={() => navigation.goBack()} />
        {selectedError && !selectedLoading ? (
          <CareEmpty
            title={t('consultationDetails.consultationNotAvailable')}
            message={selectedError}
            actionLabel={t('consultationDetails.goBack')}
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
  const otherName = other?.fullName || (isDoctor ? t('common.farmer') : t('consultationDetails.doctor'));
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
        toast.show(t('consultationDetails.thanksForYourRating'));
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
      title: t('consultationDetails.acceptThisConsultation'),
      message:
        t('consultationDetails.youAndTheFarmerWill'),
      confirmLabel: t('consultationDetails.accept'),
      onConfirm: () => runAction('accept'),
    });

  const completeAsFarmer = () =>
    feedback.confirm({
      title: t('consultationDetails.markAsCompleted'),
      message: t('consultationDetails.doThisOnceTheDoctor'),
      confirmLabel: t('consultationDetails.yesCompleted'),
      onConfirm: () => runAction('complete'),
    });

  const call = () => Linking.openURL(`tel:${other.phoneNumber}`);

  const renderActions = () => {
    if (actions.includes('accept')) {
      return (
        <>
          <CareButton
            variant="danger"
            label={t('consultationDetails.decline')}
            icon={<CircleX size={16} color={C.red} />}
            disabled={!!actionInProgress}
            onPress={() => openSheet('reject')}
            style={styles.flex}
          />
          <CareButton
            label={t('consultationDetails.accept')}
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
          label={t('consultationDetails.rateTheDoctor2')}
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
              label={t('consultationDetails.call')}
              icon={<Phone size={16} color={C.tealDark} />}
              onPress={call}
              style={styles.flex}
            />
          )}
          <CareButton
            label={t('consultationDetails.markCompleted')}
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
              consultation.status === 'pending' ? t('consultationDetails.cancelRequest') : t('common.cancel')
            }
            disabled={!!actionInProgress}
            onPress={() => openSheet('cancel')}
            style={styles.flex}
          />
          {contactShared && !!other?.phoneNumber && (
            <CareButton
              label={isDoctor ? t('consultationDetails.callFarmer') : t('consultationDetails.callDoctor')}
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
          label={hasOutcome ? t('consultationDetails.editDiagnosis') : t('consultationDetails.addDiagnosis')}
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
            isDoctor ? t('consultationDetails.consultationRequest') : t('consultationDetails.yourConsultation')
          } · ${CONSULTATION_TYPE_LABELS[consultation.consultationType]}`}
          title={consultation.problemType || 'Consultation'}
          subtitle={`${
            day === todayKey ? t('common.today') : formatDay(day)
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
              <Text style={styles.heroReason}>{t('consultationDetails.reason', {reason})}</Text>
            )}
          </View>
          <View style={styles.heroFeeRow}>
            <Text style={styles.heroFeeLabel}>{t('consultationDetails.fee')}</Text>
            <Text style={styles.heroFee}>
              {consultation.totalAmount
                ? formatRupees(consultation.totalAmount)
                : t('consultationDetails.free')}
            </Text>
          </View>
        </CareHero>

        <View style={styles.body}>
          {/* OTHER PERSON */}
          <CareCard>
            <Text style={styles.cardLabel}>
              {isDoctor ? t('common.farmer') : t('consultationDetails.doctor')}
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
                  {t('consultationDetails.phoneNumbersAreSharedOnce')}
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
                title={t('consultationDetails.doctorsAdvice')}
              />
              {!!consultation.diagnosis && (
                <View style={styles.outcomeBlock}>
                  <Text style={styles.outcomeLabel}>{t('consultationDetails.diagnosis')}</Text>
                  <Text style={styles.outcomeText}>
                    {consultation.diagnosis}
                  </Text>
                </View>
              )}
              {!!consultation.prescription && (
                <View style={styles.outcomeBlock}>
                  <View style={styles.inline}>
                    <Pill size={13} color={C.teal} />
                    <Text style={styles.outcomeLabel}>{t('consultationDetails.prescription')}</Text>
                  </View>
                  <Text style={styles.outcomeText}>
                    {consultation.prescription}
                  </Text>
                </View>
              )}
              {!!consultation.doctorNotes && (
                <View style={styles.outcomeBlock}>
                  <Text style={styles.outcomeLabel}>{t('consultationDetails.advice')}</Text>
                  <Text style={styles.outcomeText}>
                    {consultation.doctorNotes}
                  </Text>
                </View>
              )}
              {!!consultation.followUpDate && (
                <View style={styles.followUp}>
                  <CalendarClock size={15} color={C.amber} />
                  <Text style={styles.followUpText}>
                    {t('consultationDetails.followUpOn', {v1: formatDay(consultation.followUpDate)})}
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
              title={isVet ? t('consultationDetails.aboutTheAnimal') : t('consultationDetails.aboutTheCrop')}
            />
            <CareInfoRow label={t('consultationDetails.problem')} value={consultation.problemType} />
            {isVet ? (
              <>
                <CareInfoRow label={t('consultationDetails.animal')} value={consultation.animalType} />
                <CareInfoRow
                  label={t('consultationDetails.howMany')}
                  value={consultation.animalCount || ''}
                />
                <CareInfoRow label={t('consultationDetails.age')} value={consultation.animalAge} />
              </>
            ) : (
              <CareInfoRow label={t('common.crop')} value={consultation.cropName} />
            )}
            {!!consultation.symptoms && (
              <View style={styles.outcomeBlock}>
                <Text style={styles.outcomeLabel}>{t('consultationDetails.symptoms')}</Text>
                <Text style={styles.outcomeText}>{consultation.symptoms}</Text>
              </View>
            )}
            {!!consultation.description && (
              <View style={styles.outcomeBlock}>
                <Text style={styles.outcomeLabel}>{t('consultationDetails.moreDetails')}</Text>
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
                  ? t('consultationDetails.payBy', {v1: PAYMENT_LABELS[consultation.paymentMethod] || 'cash'})
                  : t('consultationDetails.freeConsultation')}
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
                {isDoctor ? t('consultationDetails.farmersRating') : t('consultationDetails.yourRating')}
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
              {t('consultationDetails.requested', {v1: formatDay(consultation.createdAt, { weekday: false })})}
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
