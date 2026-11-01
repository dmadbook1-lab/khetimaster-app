import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bookmark,
  Ellipsis,
  Sprout,
  MessageCircle,
  Music2,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import Avatar from './Avatar';
import CaptionText from './CaptionText';
import FollowButton from './FollowButton';
import LikeBurst from './LikeBurst';
import useMediaRatio from './useMediaRatio';
import { COLORS, rf } from '../theme';
import {
  bumpPostViews,
  selectCommunityPost,
} from '../../../redux/slices/communitySlice';
import { bumpPostCounterApi } from '../../../api/communityApi';
import { formatCount, shortTimeAgo } from '../../../utils/communityFormat';

const DOUBLE_TAP_MS = 260;

function SideAction({ Icon, label, onPress, active, activeColor, fill }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.sideAction}>
      <Icon
        size={rf(28)}
        color={active ? activeColor : '#FFFFFF'}
        fill={active && fill ? activeColor : 'transparent'}
        strokeWidth={1.9}
      />
      {label !== undefined ? (
        <Text style={styles.sideLabel}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

/*
 * One full-screen reel.
 *
 * isActive   the reel on screen - plays and counts a view
 * shouldLoad neighbours mount their player early so swiping is instant
 * paused    screen-level pause (screen blurred / app in background)
 */
function ReelItem({
  postId,
  height,
  bottomInset = 0,
  isActive,
  shouldLoad,
  paused: screenPaused,
  muted,
  onToggleMute,
  actions,
}) {
  const dispatch = useDispatch();
  const post = useSelector(state => selectCommunityPost(state, postId));

  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [held, setHeld] = useState(false);
  const [failed, setFailed] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const muteIconOpacity = useRef(new Animated.Value(0)).current;
  const burstRef = useRef(null);
  const lastTap = useRef(0);
  const singleTapTimer = useRef(null);
  const viewCounted = useRef(false);

  useEffect(() => () => clearTimeout(singleTapTimer.current), []);

  useEffect(() => {
    if (isActive && !viewCounted.current && post) {
      viewCounted.current = true;
      dispatch(bumpPostViews(post._id));
      bumpPostCounterApi(post._id, 'view').catch(() => {});
    }
  }, [isActive, post, dispatch]);

  // Vertical videos fill the screen; landscape ones play whole, letterboxed
  const videoRatio = useMediaRatio(post?.media?.[0], 16 / 9);

  if (!post) {
    return <View style={[styles.container, { height }]} />;
  }

  const video = post.media?.[0];
  const fit = videoRatio < 1 ? 'contain' : 'cover';

  const flashMuteIcon = () => {
    muteIconOpacity.setValue(1);
    Animated.timing(muteIconOpacity, {
      toValue: 0,
      duration: 700,
      delay: 350,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    const now = Date.now();

    if (now - lastTap.current < DOUBLE_TAP_MS) {
      clearTimeout(singleTapTimer.current);
      lastTap.current = 0;
      burstRef.current?.play();
      actions.like(post, true);
      return;
    }

    lastTap.current = now;
    singleTapTimer.current = setTimeout(() => {
      onToggleMute();
      flashMuteIcon();
    }, DOUBLE_TAP_MS);
  };

  // tap toggles sound, press-and-hold pauses (as on Instagram)
  const isPaused = !isActive || screenPaused || held;

  return (
    <View style={[styles.container, { height }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handlePress}
        onLongPress={() => setHeld(true)}
        onPressOut={() => setHeld(false)}
        delayLongPress={220}
      >
        {video?.thumbnailUrl && !ready ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode={fit}
          />
        ) : null}

        {shouldLoad && video?.url && !failed ? (
          <Video
            source={{ uri: video.url }}
            style={StyleSheet.absoluteFill}
            resizeMode={fit}
            repeat
            paused={isPaused}
            muted={muted}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            shutterColor="transparent"
            progressUpdateInterval={250}
            onReadyForDisplay={() => setReady(true)}
            onLoad={() => setReady(true)}
            onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
            onError={() => setFailed(true)}
            onProgress={({ currentTime, seekableDuration }) => {
              if (seekableDuration > 0) {
                progress.setValue(currentTime / seekableDuration);
              }
            }}
          />
        ) : null}
      </Pressable>

      {/* readability gradients */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.35)', 'transparent']}
        style={styles.topShade}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={styles.bottomShade}
      />

      {/* center overlays */}
      <View pointerEvents="none" style={styles.center}>
        {failed ? (
          <Text style={styles.errorText}>This reel could not be played</Text>
        ) : (isActive && buffering) || (isActive && !ready && shouldLoad) ? (
          <ActivityIndicator size="large" color="rgba(255,255,255,0.9)" />
        ) : null}

        <Animated.View style={[styles.muteBadge, { opacity: muteIconOpacity }]}>
          {muted ? (
            <VolumeX size={26} color="#FFFFFF" />
          ) : (
            <Volume2 size={26} color="#FFFFFF" />
          )}
        </Animated.View>
      </View>

      <LikeBurst ref={burstRef} size={110} />

      {/* right action rail */}
      <View style={[styles.rail, { bottom: bottomInset + 28 }]}>
        <SideAction
          Icon={Sprout}
          label={formatCount(post.likesCount)}
          active={post.isLiked}
          activeColor="#7EE08F"
          onPress={() => actions.like(post)}
        />
        <SideAction
          Icon={MessageCircle}
          label={formatCount(post.commentsCount)}
          onPress={() => actions.openComments(post._id)}
        />
        <SideAction
          Icon={Send}
          label={post.sharesCount ? formatCount(post.sharesCount) : 'Share'}
          onPress={() => actions.share(post)}
        />
        <SideAction
          Icon={Bookmark}
          active={post.isSaved}
          activeColor="#FFFFFF"
          fill
          onPress={() => actions.save(post)}
        />
        <SideAction Icon={Ellipsis} onPress={() => actions.openOptions(post)} />
        <Pressable
          onPress={() => actions.openProfile(post.author._id)}
          style={styles.audioThumb}
        >
          <Avatar user={post.author} size={30} />
        </Pressable>
      </View>

      {/* author + caption */}
      <View style={[styles.meta, { bottom: bottomInset + 22 }]}>
        <View style={styles.authorRow}>
          <Avatar
            user={post.author}
            size={34}
            onPress={() => actions.openProfile(post.author._id)}
          />
          <Text
            numberOfLines={1}
            style={styles.authorName}
            onPress={() => actions.openProfile(post.author._id)}
          >
            {post.author.fullName}
          </Text>
          <FollowButton
            userId={post.author._id}
            initialFollowing={post.author.isFollowing}
            variant="glass"
          />
        </View>

        {post.caption ? (
          <CaptionText
            caption={post.caption}
            dark
            numberOfLines={2}
            onHashtagPress={actions.openHashtag}
            style={styles.caption}
          />
        ) : null}

        <View style={styles.audioRow}>
          <Music2 size={12} color="#FFFFFF" strokeWidth={2.4} />
          <Text numberOfLines={1} style={styles.audioText}>
            Original audio · {post.author.fullName}
          </Text>
          <Text style={styles.audioText}>
            · {formatCount(post.viewsCount)} views ·{' '}
            {shortTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* progress */}
      <View style={[styles.progressTrack, { bottom: bottomInset }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              transform: [
                {
                  scaleX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

export default memo(ReelItem);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  topShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: rf(13),
    fontWeight: '600',
  },
  muteBadge: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    position: 'absolute',
    right: 10,
    alignItems: 'center',
    gap: 20,
  },
  sideAction: {
    alignItems: 'center',
    gap: 4,
  },
  sideLabel: {
    color: '#FFFFFF',
    fontSize: rf(12),
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  audioThumb: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    position: 'absolute',
    left: 14,
    right: 78,
    gap: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  authorName: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: rf(14),
    fontWeight: '800',
  },
  caption: {
    marginRight: 6,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  audioText: {
    flexShrink: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: rf(11.5),
    fontWeight: '600',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFFFFF',
    transformOrigin: 'left',
  },
});
