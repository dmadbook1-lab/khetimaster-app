import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BadgeCheck, Briefcase, MapPin, Star } from 'lucide-react-native';

import PersonAvatar from './PersonAvatar';
import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';
import { StatusPill } from '../market/MarketBits';
import {
  AVAILABILITY_META,
  WAGE_TYPE_LABELS,
  formatExperience,
} from '../../utils/labourFormat';

/*
 * Worker row on the labour browse screen.
 */
function LabourerCard({ labourer, onPress, onBook }) {
  const skills = [
    ...(labourer.skills || []),
    ...(labourer.preferredWork || []),
  ];
  const uniqueSkills = [...new Set(skills)].slice(0, 3);
  const location = [labourer.village, labourer.district]
    .filter(Boolean)
    .join(', ');

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <PersonAvatar
          name={labourer.fullName}
          image={labourer.profileImage}
          size={62}
        />

        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {labourer.fullName}
            </Text>
            {labourer.availability !== 'available' && (
              <StatusPill meta={AVAILABILITY_META[labourer.availability]} />
            )}
          </View>

          <Text style={styles.type} numberOfLines={1}>
            {labourer.labourType}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star size={12} color={C.gold} fill={C.gold} />
              <Text style={styles.statText}>
                {labourer.totalReviews
                  ? `${labourer.rating} (${labourer.totalReviews})`
                  : 'New'}
              </Text>
            </View>
            <View style={styles.stat}>
              <Briefcase size={12} color={C.blue} />
              <Text style={styles.statText}>
                {formatExperience(labourer.experience, labourer.experienceUnit)}
              </Text>
            </View>
            {labourer.totalJobsCompleted > 0 && (
              <View style={styles.stat}>
                <BadgeCheck size={12} color={C.green} />
                <Text style={styles.statText}>
                  {labourer.totalJobsCompleted} jobs
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {uniqueSkills.length > 0 && (
        <View style={styles.skills}>
          {uniqueSkills.map(skill => (
            <Text key={skill} style={styles.skill} numberOfLines={1}>
              {skill}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.flex}>
          <Text style={styles.wage}>
            ₹{Number(labourer.expectedWage || 0)}
            <Text style={styles.wageUnit}>
              {' '}
              {WAGE_TYPE_LABELS[labourer.wageType] || ''}
            </Text>
          </Text>
          {!!location && (
            <View style={styles.stat}>
              <MapPin size={11} color={C.muted} />
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>

        {onBook && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.bookButton}
            onPress={onBook}
          >
            <Text style={styles.bookText}>Book</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(LabourerCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  top: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  flex: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    flexShrink: 1,
    fontSize: 15.5,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
  },
  type: { fontSize: 12, fontWeight: '700', color: C.green, marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, fontWeight: '700', color: C.text },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  skill: {
    fontSize: 10.5,
    fontWeight: '800',
    color: C.text,
    backgroundColor: C.bg,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: '48%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF1EF',
    gap: 10,
  },
  wage: { fontSize: 17, fontWeight: '900', color: C.dark, letterSpacing: -0.3 },
  wageUnit: { fontSize: 11, fontWeight: '700', color: C.muted },
  location: { flex: 1, fontSize: 11, color: C.muted, fontWeight: '600' },
  bookButton: {
    height: 40,
    paddingHorizontal: 22,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { color: C.white, fontSize: 13, fontWeight: '900' },
});
