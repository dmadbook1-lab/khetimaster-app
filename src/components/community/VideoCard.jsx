import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Play, Video, Eye, BadgeCheck } from 'lucide-react-native';
import { COLORS, rf } from './theme';
import { resolveCommunityImageSource } from './communityImages';
export default function VideoCard({ item }) {
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoImageWrap}>
        <Image
          source={resolveCommunityImageSource(item.image)}
          style={styles.videoImage}
        />
        <View style={styles.videoTag}>
          <Video size={rf(11)} color="#FFFFFF" strokeWidth={2.3} />
          <Text style={styles.videoTagText}>Video</Text>
        </View>
        <View style={styles.videoPlay}>
          <Play
            size={rf(20)}
            color={COLORS.DARK_GREEN}
            fill={COLORS.DARK_GREEN}
            strokeWidth={2}
          />
        </View>
        <View style={styles.videoDuration}>
          <Text style={styles.videoDurationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.videoBody}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <View style={styles.videoMetaRow}>
          <View style={styles.videoMetaItem}>
            <Eye size={rf(11)} color={COLORS.MUTED} strokeWidth={2.2} />
            <Text style={styles.videoMetaText}>{item.views}</Text>
          </View>
          <Text style={styles.videoMetaDot}>·</Text>
          <View style={styles.videoMetaItem}>
            {item.verified ? (
              <BadgeCheck
                size={rf(11)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.4}
              />
            ) : (
              <Text
                style={{
                  fontSize: rf(11),
                }}
              >
                🎓
              </Text>
            )}
            <Text
              style={[
                styles.videoMetaText,
                item.verified && {
                  color: COLORS.DARK_GREEN,
                  fontWeight: '900',
                },
              ]}
            >
              {item.author}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  videoCard: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  videoImageWrap: {
    height: 200,
    position: 'relative',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  videoTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoTagText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  videoPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  videoDurationText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  videoBody: {
    padding: 12,
  },
  videoTitle: {
    fontSize: rf(13),
    lineHeight: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  videoMetaRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  videoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  videoMetaText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  videoMetaDot: {
    fontSize: rf(9),
    color: COLORS.MUTED,
  },
});
