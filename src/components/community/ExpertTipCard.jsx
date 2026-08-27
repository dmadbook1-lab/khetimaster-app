import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, BadgeCheck, Sprout, ArrowRight } from 'lucide-react-native';
import { COLORS, rf } from './theme';
export default function ExpertTipCard({ tip }) {
  return (
    <View style={styles.expertTipCard}>
      <View style={styles.expertTipHeader}>
        <View style={styles.expertTipBadge}>
          <Award size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
          <Text style={styles.expertTipBadgeText}>Expert Tip</Text>
        </View>
        <Text style={styles.timeAgo}>{tip.time}</Text>
      </View>

      <View style={styles.expertRow}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: '#F3E8FF',
            },
          ]}
        >
          <Text style={styles.avatarText}>{tip.emoji || '👨‍⚕️'}</Text>
        </View>
        <View style={styles.expertTextBox}>
          <View style={styles.expertNameRow}>
            <Text style={styles.userName}>{tip.name}</Text>
            <View style={styles.verifiedBadge}>
              <BadgeCheck size={rf(9)} color={COLORS.BLUE} strokeWidth={2.4} />
              <Text style={styles.verifiedText}>VERIFIED AGRONOMIST</Text>
            </View>
          </View>
          <Text style={styles.userLocation}>{tip.role}</Text>
        </View>
      </View>

      <Text style={styles.expertTipTitle}>{tip.title}</Text>

      <Text style={styles.postDesc}>{tip.desc}</Text>

      <View style={styles.expertTipFooter}>
        <View style={styles.cropNutritionTag}>
          <Sprout size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
          <Text style={styles.cropNutritionText}>{tip.category}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} style={styles.readTipBtn}>
          <Text style={styles.readTipBtnText}>Read Full Tip</Text>
          <ArrowRight size={rf(12)} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  expertTipCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FBFFFD',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.DARK_GREEN,
  },
  expertTipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expertTipBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expertTipBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  timeAgo: {
    fontSize: rf(9.5),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  expertRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: rf(20),
  },
  expertTextBox: {
    flex: 1,
  },
  expertNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  userLocation: {
    marginTop: 2,
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
  },
  verifiedText: {
    fontSize: rf(7.5),
    fontWeight: '900',
    color: COLORS.BLUE,
  },
  expertTipTitle: {
    marginTop: 12,
    fontSize: rf(13),
    lineHeight: rf(18),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  postDesc: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  expertTipFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropNutritionTag: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cropNutritionText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  readTipBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readTipBtnText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
