import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  CheckCircle,
  BadgeCheck,
  Heart,
  MessageCircle,
  Eye,
  Leaf,
} from 'lucide-react-native';
import {COLORS, rf} from './theme';

export default function QuestionCard({item}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.emoji || '👩'}</Text>
        </View>
        <View style={styles.postUserBox}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userLocation}>
            {item.location} · {item.time}
          </Text>
        </View>
        <View style={styles.diseaseTag}>
          <Text style={styles.diseaseTagText}>{item.badge}</Text>
        </View>
      </View>

      <View style={styles.qRow}>
        <View style={styles.qIconBox}>
          <CheckCircle
            size={rf(13)}
            color="#FFFFFF"
            strokeWidth={2.6}
            fill={COLORS.DARK_GREEN}
          />
        </View>
        <Text style={styles.qTitle}>{item.title}</Text>
      </View>

      <Text style={styles.postDesc}>{item.desc}</Text>

      <View style={styles.tagsRow}>
        <View style={styles.soybeanTag}>
          <Leaf size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
          <Text style={styles.soybeanTagText}>{item.crop}</Text>
        </View>
        {item.expertAvailable && (
          <View style={styles.expertTag}>
            <BadgeCheck size={rf(11)} color={COLORS.BLUE} strokeWidth={2.3} />
            <Text style={styles.expertTagText}>Expert Answer Available</Text>
          </View>
        )}
      </View>

      <View style={styles.qStatsRow}>
        <View style={styles.qStatBox}>
          <Heart size={rf(13)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.qStatText}>{item.likes}</Text>
        </View>
        <View style={styles.qStatBox}>
          <MessageCircle size={rf(13)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.qStatText}>{item.replies} Replies</Text>
        </View>
        <View style={styles.qStatBox}>
          <Eye size={rf(13)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.qStatText}>{item.views}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: rf(20)},
  postUserBox: {flex: 1},
  userName: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  userLocation: {
    marginTop: 2,
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  diseaseTag: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
  },
  diseaseTagText: {fontSize: rf(9), fontWeight: '900', color: COLORS.ORANGE},

  qRow: {marginTop: 12, flexDirection: 'row', gap: 8},
  qIconBox: {
    marginTop: 2,
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qTitle: {
    flex: 1,
    fontSize: rf(12.5),
    lineHeight: rf(17),
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

  tagsRow: {marginTop: 10, flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  soybeanTag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  soybeanTagText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK_GREEN},
  expertTag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expertTagText: {fontSize: rf(10), fontWeight: '900', color: COLORS.BLUE},

  qStatsRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qStatBox: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qStatText: {fontSize: rf(11), fontWeight: '700', color: COLORS.MUTED},
});