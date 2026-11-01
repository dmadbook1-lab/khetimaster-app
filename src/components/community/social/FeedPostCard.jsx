import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Video from 'react-native-video';
import {
  Bookmark,
  Clapperboard,
  Ellipsis,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import Avatar from './Avatar';
import CaptionText from './CaptionText';
import FollowButton from './FollowButton';
import LikeBurst from './LikeBurst';
import useMediaRatio from './useMediaRatio';
import { FIELD, rf } from '../theme';
import { selectCommunityPost } from '../../../redux/slices/communitySlice';
import { formatCount } from '../../../utils/communityFormat';
import { timeAgo } from '../../../utils/marketFormat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SIDE = 14;
const MEDIA_WIDTH = SCREEN_WIDTH;

const DOUBLE_TAP_MS = 260;

/*
 * Media runs edge to edge at the post's own shape (the first item's), so
 * there are no bars around it. Only extreme panoramas or very tall images
 * are trimmed slightly.
 */
const frameRatioFor = ratio => Math.min(Math.max(ratio, 0.5), 1.8);

function FittedMedia({ item, playing, muted, paused }) {
  const still = item.type === 'video' ? item.thumbnailUrl : item.url;

  return (
    <>
      {still ? (
        <Image
          source={{ uri: still }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}

      {playing ? (
        <Video
          source={{ uri: item.url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted={muted}
          paused={paused}
          playInBackground={false}
          ignoreSilentSwitch="ignore"
          shutterColor="transparent"
        />
      ) : null}
    </>
  );
}

function ActionIcon({ onPress, label, Icon, count, active, activeColor }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.actionBtn}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          size={rf(24)}
          color={active ? activeColor : FIELD.INK}
          fill={active ? activeColor : 'transparent'}
          strokeWidth={2}
        />
      </Animated.View>
      {count > 0 ? (
        <Text style={styles.actionCount}>{formatCount(count)}</Text>
      ) : null}
    </Pressable>
  );
}

function FeedPostCard({ postId, isActive, actions, onOpenReel }) {
  const post = useSelector(state => selectCommunityPost(state, postId));

  const [slide, setSlide] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  const burstRef = useRef(null);
  const lastTap = useRef(0);
  const singleTapTimer = useRef(null);

  useEffect(() => () => clearTimeout(singleTapTimer.current), []);

  const firstRatio = useMediaRatio(post?.media?.[0], 1);

  if (!post) {
    return null;
  }

  const media = post.media || [];
  const frameRatio = frameRatioFor(firstRatio);
  const mediaHeight = MEDIA_WIDTH * frameRatio;
  const isReel = post.type === 'reel';
  const hasVideo = isReel || media[0]?.type === 'video';

  // Single tap opens the post full screen, like Instagram
  const handleSingleTap = (item, index) => {
    if (isReel) {
      (onOpenReel || actions.openVideo)?.(post._id);
    } else if (item.type === 'video' && media.length === 1) {
      actions.openVideo?.(post._id);
    } else {
      actions.openPost?.(post._id, index);
    }
  };

  const handleMediaPress = (item, index) => {
    const now = Date.now();

    if (now - lastTap.current < DOUBLE_TAP_MS) {
      clearTimeout(singleTapTimer.current);
      lastTap.current = 0;
      burstRef.current?.play();
      actions.like(post, true);
      return;
    }

    lastTap.current = now;
    singleTapTimer.current = setTimeout(
      () => handleSingleTap(item, index),
      DOUBLE_TAP_MS,
    );
  };

  const renderMedia = ({ item, index }) => {
    const playing = isActive && index === slide && item.type === 'video';

    return (
      <Pressable
        onPress={() => handleMediaPress(item, index)}
        onLongPress={() => item.type === 'video' && setPaused(true)}
        onPressOut={() => setPaused(false)}
        style={{ width: MEDIA_WIDTH, height: mediaHeight }}
      >
        <FittedMedia
          item={item}
          playing={playing}
          muted={muted}
          paused={paused}
        />

        {item.type === 'video' ? (
          <Pressable
            hitSlop={10}
            onPress={() => setMuted(value => !value)}
            style={styles.muteChip}
          >
            {muted ? (
              <VolumeX size={14} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <Volume2 size={14} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </Pressable>
        ) : null}
      </Pressable>
    );
  };

  const caption = post.caption ? (
    <CaptionText
      caption={post.caption}
      numberOfLines={media.length ? 3 : 6}
      onHashtagPress={actions.openHashtag}
      style={media.length ? styles.caption : styles.captionTextOnly}
    />
  ) : null;

  return (
    <View style={styles.post}>
      {/* HEADER */}
      <View style={styles.header}>
        <Avatar
          user={post.author}
          size={40}
          ring={isReel}
          onPress={() => actions.openProfile(post.author._id)}
        />

        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={styles.name}
              onPress={() => actions.openProfile(post.author._id)}
            >
              {post.author.fullName}
            </Text>
            <FollowButton
              userId={post.author._id}
              initialFollowing={post.author.isFollowing}
              variant="text"
            />
          </View>
          <View style={styles.metaRow}>
            {post.location || post.author.location ? (
              <>
                <MapPin size={11} color={FIELD.BARK} strokeWidth={2.3} />
                <Text numberOfLines={1} style={styles.placeText}>
                  {post.location || post.author.location}
                </Text>
                <Text style={styles.metaDot}>·</Text>
              </>
            ) : null}
            <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
          </View>
        </View>

        <Pressable
          hitSlop={10}
          onPress={() => actions.openOptions(post)}
          style={styles.moreBtn}
          accessibilityLabel="More options"
        >
          <Ellipsis size={rf(20)} color={FIELD.INK} />
        </Pressable>
      </View>

      {/* text-only posts lead with the words */}
      {!media.length ? caption : null}

      {/* MEDIA */}
      {media.length ? (
        <View style={[styles.mediaFrame, { height: mediaHeight }]}>
          <FlatList
            data={media}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.url}-${index}`}
            renderItem={renderMedia}
            onMomentumScrollEnd={event =>
              setSlide(
                Math.round(event.nativeEvent.contentOffset.x / MEDIA_WIDTH),
              )
            }
          />

          {isReel ? (
            <View style={styles.reelBadge} pointerEvents="none">
              <Clapperboard size={12} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.reelBadgeText}>Reel</Text>
            </View>
          ) : null}

          {isReel ? (
            <View style={styles.playBadge} pointerEvents="none">
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          ) : null}

          {media.length > 1 ? (
            <View style={styles.counter} pointerEvents="none">
              <Text style={styles.counterText}>
                {slide + 1}/{media.length}
              </Text>
            </View>
          ) : null}

          <LikeBurst ref={burstRef} size={96} />
        </View>
      ) : null}

      {/* ACTIONS */}
      <View style={styles.actions}>
        <ActionIcon
          Icon={Heart}
          label={post.isLiked ? 'Unlike' : 'Like'}
          count={post.likesCount}
          active={post.isLiked}
          activeColor="#E11D48"
          onPress={() => actions.like(post)}
        />
        <ActionIcon
          Icon={MessageCircle}
          label="Comment"
          count={post.commentsCount}
          onPress={() => actions.openComments(post._id)}
        />
        <ActionIcon
          Icon={Share2}
          label="Share"
          onPress={() => actions.share(post)}
        />

        {media.length > 1 ? (
          <View style={styles.dots} pointerEvents="none">
            {media.map((_, index) => (
              <View
                key={index}
                style={[styles.dotItem, index === slide && styles.dotActive]}
              />
            ))}
          </View>
        ) : (
          <View style={styles.flex} />
        )}

        {hasVideo && post.viewsCount > 0 ? (
          <Text style={styles.views}>{formatCount(post.viewsCount)} views</Text>
        ) : null}

        <ActionIcon
          Icon={Bookmark}
          label={post.isSaved ? 'Remove from saved' : 'Save'}
          active={post.isSaved}
          activeColor={FIELD.FOREST}
          onPress={() => actions.save(post)}
        />
      </View>

      {media.length ? caption : null}

      {post.commentsCount > 0 ? (
        <Pressable hitSlop={4} onPress={() => actions.openComments(post._id)}>
          <Text style={styles.viewComments}>
            {post.commentsCount === 1
              ? 'View 1 comment'
              : `View all ${formatCount(post.commentsCount)} comments`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default memo(FeedPostCard);

const styles = StyleSheet.create({
  post: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIDE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontSize: rf(14.5),
    fontWeight: '700',
    color: FIELD.INK,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  placeText: {
    flexShrink: 1,
    fontSize: rf(11.5),
    fontWeight: '500',
    color: FIELD.BARK,
  },
  metaDot: {
    marginHorizontal: 2,
    fontSize: rf(11.5),
    color: FIELD.BARK,
  },
  time: {
    fontSize: rf(11.5),
    color: FIELD.BARK,
  },
  moreBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionTextOnly: {
    marginTop: 10,
    paddingHorizontal: SIDE,
  },
  caption: {
    marginTop: 4,
    paddingHorizontal: SIDE,
  },
  mediaFrame: {
    marginTop: 10,
    backgroundColor: '#F1F5F2',
  },
  muteChip: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reelBadgeText: {
    color: '#FFFFFF',
    fontSize: rf(11),
    fontWeight: '800',
  },
  playBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 9,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: rf(11),
    fontWeight: '700',
  },
  actions: {
    marginTop: 4,
    paddingHorizontal: SIDE - 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    height: 44,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: rf(13.5),
    fontWeight: '700',
    color: FIELD.INK,
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: FIELD.FOREST,
  },
  views: {
    marginRight: 4,
    fontSize: rf(12),
    fontWeight: '600',
    color: FIELD.BARK,
  },
  viewComments: {
    marginTop: 6,
    paddingHorizontal: SIDE,
    fontSize: rf(12.5),
    fontWeight: '500',
    color: FIELD.BARK,
  },
});
