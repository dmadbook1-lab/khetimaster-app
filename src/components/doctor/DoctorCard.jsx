import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, Languages, MapPin, Star } from 'lucide-react-native';

import { CARE as C, CARE_SHADOW } from './careTheme';
import DoctorAvatar from './DoctorAvatar';
import {
  DOCTOR_TYPE_META,
  feeLabel,
  isFreeDoctor,
  listText,
} from '../../utils/doctorFormat';

/*
 * Doctor row in search results and on the home screen.
 */
function DoctorCard({ doctor, onPress, style }) {
  const type = DOCTOR_TYPE_META[doctor.doctorType];
  const isCrop = doctor.doctorType === 'agriculturalDoctor';
  const place = [doctor.district, doctor.state].filter(Boolean).join(', ');
  const free = isFreeDoctor(doctor);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, style]}
      onPress={onPress}
    >
      <View style={styles.top}>
        <DoctorAvatar
          name={doctor.fullName}
          image={doctor.profileImage}
          doctorType={doctor.doctorType}
          availability={doctor.availability}
          showStatus
          size={62}
        />

        <View style={styles.flex}>
          <Text
            style={[styles.type, { color: isCrop ? C.olive : C.tealDark }]}
            numberOfLines={1}
          >
            {type?.label || 'Doctor'}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {doctor.fullName}
          </Text>
          {!!(doctor.specialization || []).length && (
            <Text style={styles.special} numberOfLines={1}>
              {listText(doctor.specialization, 2)}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Star size={12} color={C.gold} fill={C.gold} />
            <Text style={styles.meta}>
              {doctor.totalReviews
                ? `${doctor.rating} (${doctor.totalReviews})`
                : 'New'}
            </Text>
            <View style={styles.metaDot} />
            <Text style={styles.meta}>
              {doctor.totalConsultations || 0} consultations
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.flex}>
          {!!place && (
            <View style={styles.inline}>
              <MapPin size={12} color={C.muted} />
              <Text style={styles.small} numberOfLines={1}>
                {place}
              </Text>
            </View>
          )}
          {!!(doctor.languages || []).length && (
            <View style={styles.inline}>
              <Languages size={12} color={C.muted} />
              <Text style={styles.small} numberOfLines={1}>
                {listText(doctor.languages, 3)}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.fee, free && styles.feeFree]}>
          <Text style={[styles.feeText, free && styles.feeTextFree]}>
            {feeLabel(doctor)}
          </Text>
          <ArrowRight size={14} color={free ? C.tealDark : C.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(DoctorCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF3F2',
    ...CARE_SHADOW,
  },
  top: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  flex: { flex: 1 },
  type: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  special: { fontSize: 12, fontWeight: '600', color: C.text, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  meta: { fontSize: 11, fontWeight: '700', color: C.muted },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.placeholder,
    marginHorizontal: 3,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFF4F3',
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  small: { flex: 1, fontSize: 11.5, fontWeight: '600', color: C.muted },
  fee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: C.navy,
  },
  feeFree: { backgroundColor: C.tealSoft },
  feeText: { fontSize: 13, fontWeight: '900', color: C.white },
  feeTextFree: { color: C.tealDark },
});
