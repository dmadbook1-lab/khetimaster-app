import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Leaf, PawPrint } from 'lucide-react-native';

import { CARE as C, CARE_SHADOW } from './careTheme';
import { CarePill } from './CareBits';
import DoctorAvatar from './DoctorAvatar';
import { formatRupees } from '../../utils/marketFormat';
import { dayKeyOf, dayKeyToUtc, formatTime } from '../../utils/indiaSchedule';
import {
  STATUS_META,
  describeConsultationState,
} from '../../utils/doctorFormat';

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

/*
 * Consultation row for the farmer ("My consultations") and the doctor
 * ("Requests"). A calendar tile on the left, the other person on the
 * right.
 */
function ConsultationCard({ consultation, todayKey, onPress, footer }) {
  const isDoctor = consultation.myRole === 'doctor';
  const needsMe = isDoctor && consultation.status === 'pending';
  const key = dayKeyOf(consultation.consultationDate);
  const date = key ? dayKeyToUtc(key) : null;
  const isToday = key === todayKey;
  const isVet = consultation.consultationType !== 'agricultural';
  const doctor = consultation.doctor || {};
  const farmer = consultation.farmer || {};
  const subject = isVet
    ? [
        consultation.animalType,
        consultation.animalCount > 1 ? `×${consultation.animalCount}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : consultation.cropName;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, needsMe && styles.cardHighlight]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View style={[styles.dateTile, isToday && styles.dateTileToday]}>
          <Text style={[styles.month, isToday && styles.todayText]}>
            {isToday ? 'TODAY' : date ? MONTHS[date.getUTCMonth()] : ''}
          </Text>
          <Text style={[styles.day, isToday && styles.todayText]}>
            {date ? date.getUTCDate() : '-'}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={10} color={isToday ? C.white : C.muted} />
            <Text
              style={[styles.time, isToday && styles.todayText]}
              numberOfLines={1}
            >
              {formatTime(consultation.startTime)}
            </Text>
          </View>
        </View>

        <View style={styles.flex}>
          <View style={styles.headRow}>
            {isDoctor ? (
              <Text style={styles.person} numberOfLines={1}>
                {farmer.fullName || 'Farmer'}
              </Text>
            ) : (
              <View style={styles.doctorRow}>
                <DoctorAvatar
                  name={doctor.fullName}
                  image={doctor.profileImage}
                  size={26}
                />
                <Text style={styles.person} numberOfLines={1}>
                  {doctor.fullName || 'Doctor'}
                </Text>
              </View>
            )}
            <CarePill meta={STATUS_META[consultation.status]} />
          </View>

          <View style={styles.problemRow}>
            {isVet ? (
              <PawPrint size={13} color={C.teal} />
            ) : (
              <Leaf size={13} color={C.olive} />
            )}
            <Text style={styles.problem} numberOfLines={1}>
              {consultation.problemType || 'Consultation'}
              {subject ? ` · ${subject}` : ''}
            </Text>
          </View>

          {isDoctor && !!(farmer.village || farmer.district) && (
            <Text style={styles.place} numberOfLines={1}>
              {[farmer.village, farmer.district].filter(Boolean).join(', ')}
            </Text>
          )}

          <View style={styles.bottomRow}>
            <Text
              style={[styles.state, needsMe && styles.stateHighlight]}
              numberOfLines={2}
            >
              {describeConsultationState(consultation, todayKey)}
            </Text>
            <Text style={styles.fee}>
              {consultation.totalAmount
                ? formatRupees(consultation.totalAmount)
                : 'Free'}
            </Text>
          </View>
        </View>
      </View>

      {footer}
    </TouchableOpacity>
  );
}

export default memo(ConsultationCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#EDF3F2',
    ...CARE_SHADOW,
  },
  cardHighlight: { borderColor: '#F7C2B9' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  dateTile: {
    width: 66,
    borderRadius: 18,
    backgroundColor: C.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dateTileToday: { backgroundColor: C.teal },
  month: {
    fontSize: 10,
    fontWeight: '900',
    color: C.tealDark,
    letterSpacing: 0.8,
  },
  day: {
    fontSize: 24,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.8,
    marginTop: -1,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  time: { fontSize: 9.5, fontWeight: '800', color: C.muted },
  todayText: { color: C.white },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doctorRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  person: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.2,
  },
  problemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },
  problem: { flex: 1, fontSize: 12.5, fontWeight: '800', color: C.text },
  place: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 3 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  state: { flex: 1, fontSize: 11, fontWeight: '700', color: C.muted },
  stateHighlight: { color: C.coral, fontWeight: '900' },
  fee: { fontSize: 15, fontWeight: '900', color: C.ink },
});
