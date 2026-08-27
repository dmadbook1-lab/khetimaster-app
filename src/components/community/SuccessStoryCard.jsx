import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {ArrowRight, Heart, MessageCircle} from 'lucide-react-native';
import {COLORS, rf} from './theme';
import {resolveCommunityImageSource} from './communityImages';

export default function SuccessStoryCard({story}) {
  return (
    <View style={styles.successCard}>
      <Image source={resolveCommunityImageSource(story.image)} style={styles.successImage} />

      <View style={styles.successBadge}>
        <Text style={styles.successBadgePlus}>+</Text>
        <Text style={styles.successBadgeText}>Success Story</Text>
      </View>

      <View style={styles.successAuthor}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{story.emoji || '👩'}</Text>
        </View>
        <View>
          <Text style={styles.successAuthorName}>{story.name}</Text>
          <Text style={styles.successAuthorLoc}>{story.location}</Text>
        </View>
      </View>

      <View style={styles.successMetricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>BEFORE</Text>
          <Text style={[styles.metricValue, {color: COLORS.RED}]}>
            {story.before}
          </Text>
          <Text style={styles.metricUnit}>{story.unit}</Text>
        </View>

        <View style={styles.arrowCircle}>
          <ArrowRight size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.6} />
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>AFTER</Text>
          <Text style={[styles.metricValue, {color: COLORS.DARK_GREEN}]}>
            {story.after}
          </Text>
          <Text style={styles.metricUnit}>{story.unit}</Text>
        </View>
      </View>

      <View style={styles.costSavedBox}>
        <Text style={styles.costSavedLabel}>COST SAVED</Text>
        <Text style={styles.costSavedValue}>{story.savings}</Text>
      </View>

      <View style={styles.successBody}>
        <Text style={styles.successTitle}>{story.title}</Text>
        <Text style={styles.postDesc}>{story.desc}</Text>
      </View>

      <View style={styles.successFooter}>
        <View style={styles.actionItem}>
          <Heart size={rf(14)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.actionText}>{story.likes}</Text>
        </View>
        <View style={styles.actionItem}>
          <MessageCircle size={rf(14)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.actionText}>{story.comments}</Text>
        </View>
        <View style={{flex: 1}} />
        <TouchableOpacity activeOpacity={0.9} style={styles.readStoryBtn}>
          <Text style={styles.readStoryBtnText}>Read Story</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successCard: {
    marginTop: 6,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  successImage: {width: '100%', height: 200},
  successBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: COLORS.ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  successBadgePlus: {fontSize: rf(12), fontWeight: '900', color: '#FFFFFF'},
  successBadgeText: {fontSize: rf(10), fontWeight: '900', color: '#FFFFFF'},

  successAuthor: {
    position: 'absolute',
    top: 155,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: rf(20)},
  successAuthorName: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},
  successAuthorLoc: {
    fontSize: rf(9),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },

  successMetricsRow: {
    marginTop: 20,
    marginHorizontal: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: rf(8.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  metricValue: {marginTop: 4, fontSize: rf(24), fontWeight: '900'},
  metricUnit: {marginTop: 2, fontSize: rf(9), fontWeight: '600', color: COLORS.MUTED},
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  costSavedBox: {
    marginTop: 12,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  costSavedLabel: {
    fontSize: rf(9),
    fontWeight: '900',
    color: COLORS.RED,
    letterSpacing: 0.5,
  },
  costSavedValue: {fontSize: rf(15), fontWeight: '900', color: COLORS.RED},

  successBody: {padding: 14},
  successTitle: {
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

  successFooter: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 4,
  },
  actionText: {fontSize: rf(11), fontWeight: '700', color: COLORS.MUTED},
  readStoryBtn: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: COLORS.DARK_GREEN,
    justifyContent: 'center',
  },
  readStoryBtnText: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},
});