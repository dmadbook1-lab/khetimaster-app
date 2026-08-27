import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {
  Play,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Eye,
} from 'lucide-react-native';
import {COLORS, rf} from './theme';
import {resolveCommunityImageSource} from './communityImages';

export default function PostCard({post}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.emoji || '👨‍🌾'}</Text>
        </View>
        <View style={styles.postUserBox}>
          <Text style={styles.userName}>{post.name}</Text>
          <Text style={styles.userLocation}>
            {post.location} · {post.time}
          </Text>
        </View>
        {post.tag && (
          <View style={styles.progressiveTag}>
            <Text style={styles.progressiveTagText}>{post.tag}</Text>
          </View>
        )}
        <TouchableOpacity activeOpacity={0.85} style={styles.followBtn}>
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postDesc}>{post.desc}</Text>

      <View style={styles.videoBox}>
        <Image source={resolveCommunityImageSource(post.image)} style={styles.videoImage} />
        <View style={styles.playCircle}>
          <Play
            size={rf(22)}
            color={COLORS.DARK_GREEN}
            fill={COLORS.DARK_GREEN}
            strokeWidth={2}
          />
        </View>
        <View style={styles.videoViews}>
          <Eye size={rf(11)} color="#FFFFFF" strokeWidth={2.3} />
          <Text style={styles.videoViewsText}>{post.views}</Text>
        </View>
        <View style={styles.videoDuration}>
          <Text style={styles.videoDurationText}>{post.duration}</Text>
        </View>
      </View>

      <View style={styles.hashtagRow}>
        {post.hashtags.map((tag, i) => (
          <Text
            key={i}
            style={tag.startsWith('#') && /[\u0900-\u097F]/.test(tag)
              ? styles.hashtagBlue
              : styles.hashtagGreen}>
            {tag}
          </Text>
        ))}
      </View>

      <View style={styles.postActionsRow}>
        <View style={styles.actionItem}>
          <Heart size={rf(15)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </View>
        <View style={styles.actionItem}>
          <MessageCircle size={rf(15)} color={COLORS.MUTED} strokeWidth={2.2} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <View style={{flex: 1}} />
        <TouchableOpacity activeOpacity={0.7} style={styles.iconAction}>
          <Bookmark size={rf(15)} color={COLORS.MUTED} strokeWidth={2.2} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles.iconAction}>
          <Share2 size={rf(15)} color={COLORS.MUTED} strokeWidth={2.2} />
        </TouchableOpacity>
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
  progressiveTag: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
  },
  progressiveTagText: {fontSize: rf(8), fontWeight: '900', color: COLORS.ORANGE},
  followBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.DARK_GREEN,
    justifyContent: 'center',
  },
  followBtnText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK_GREEN},

  postTitle: {
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

  videoBox: {
    marginTop: 12,
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  videoImage: {width: '100%', height: '100%'},
  playCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -26,
    marginTop: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoViews: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  videoViewsText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},
  videoDuration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
  },
  videoDurationText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},

  hashtagRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagGreen: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
  hashtagBlue: {fontSize: rf(11), fontWeight: '900', color: COLORS.BLUE},

  postActionsRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
  iconAction: {padding: 6},
});