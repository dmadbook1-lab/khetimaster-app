import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import {
  ArrowLeft,
  Bookmark,
  Ellipsis,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import Avatar from '../../components/community/social/Avatar';
import CaptionText from '../../components/community/social/CaptionText';
import FollowButton from '../../components/community/social/FollowButton';
import LikeBurst from '../../components/community/social/LikeBurst';
import usePostInteractions from '../../components/community/social/usePostInteractions';
import { FIELD, rf } from '../../components/community/theme';
import { selectCommunityPost } from '../../redux/slices/communitySlice';
import { formatCount } from '../../utils/communityFormat';
import { timeAgo } from '../../utils/marketFormat';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DOUBLE_TAP_MS = 260;

function ViewerAction({ Icon, label, count, active, activeColor, onPress }) {
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
      hitSlop={8}
      accessibilityLabel={label}
      onPress={handlePress}
      style={styles.action}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          size={rf(26)}
          color={active ? activeColor : '#FFFFFF'}
          fill={active ? activeColor : 'transparent'}
          strokeWidth={1.9}
        />
      </Animated.View>
      {count > 0 ? (
        <Text style={styles.actionCount}>{formatCount(count)}</Text>
      ) : null}
    </Pressable>
  );
}

/*
 * Full-screen view of one post, opened by tapping it in a feed.
 *
 * params: postId, index (media slide to open on)
 */
export default function PostViewerScreen({ navigation, route }) {
  const { postId, index: startIndex = 0 } = route.params || {};

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const post = useSelector(state => selectCommunityPost(state, postId));
  const { actions, sheets } = usePostInteractions(navigation, {
    onDeleted: () => navigation.goBack(),
  });

  const [slide, setSlide] = useState(startIndex);
  const [muted, setMuted] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  const chrome = useRef(new Animated.Value(1)).current;
  const burstRef = useRef(null);
  const lastTap = useRef(0);
  const singleTapTimer = useRef(null);

  useEffect(() => () => clearTimeout(singleTapTimer.current), []);

  useEffect(() => {
    Animated.timing(chrome, {
      toValue: chromeVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [chrome, chromeVisible]);

  if (!post) {
    return (
      <View style={[styles.screen, styles.missing]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.missingText}>
          This post is no longer available.
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.missingBtn}
        >
          <Text style={styles.missingBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const media = post.media || [];

  // Single tap shows/hides the controls; double tap likes
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
    singleTapTimer.current = setTimeout(
      () => setChromeVisible(value => !value),
      DOUBLE_TAP_MS,
    );
  };

  const renderSlide = ({ item, index }) => {
    const playing = isFocused && index === slide && item.type === 'video';

    return (
      <Pressable onPress={handlePress} style={styles.slide}>
        {item.type === 'video' ? (
          <>
            {item.thumbnailUrl && !playing ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            ) : null}
            {playing ? (
              <Video
                source={{ uri: item.url }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
                repeat
                muted={muted}
                playInBackground={false}
                ignoreSilentSwitch="ignore"
                shutterColor="transparent"
              />
            ) : null}
          </>
        ) : (
          <Image
            source={{ uri: item.url }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        )}
      </Pressable>
    );
  };

  const current = media[slide];

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        data={media}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={Math.min(startIndex, Math.max(media.length - 1, 0))}
        getItemLayout={(_, i) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
        keyExtractor={(item, i) => `${item.url}-${i}`}
        renderItem={renderSlide}
        onMomentumScrollEnd={event =>
          setSlide(Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH))
        }
      />

      <View pointerEvents="none" style={styles.burst}>
        <LikeBurst ref={burstRef} size={110} />
      </View>

      {/* TOP BAR */}
      <Animated.View
        pointerEvents={chromeVisible ? 'box-none' : 'none'}
        style={[styles.topWrap, { opacity: chrome }]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={[styles.topBar, { paddingTop: insets.top + 8 }]}
        >
          <Pressable
            hitSlop={10}
            onPress={() => navigation.goBack()}
            style={styles.roundBtn}
            accessibilityLabel="Back"
          >
            <ArrowLeft size={rf(22)} color="#FFFFFF" strokeWidth={2.3} />
          </Pressable>

          {media.length > 1 ? (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {slide + 1} / {media.length}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <View style={styles.topRight}>
            {current?.type === 'video' ? (
              <Pressable
                hitSlop={10}
                onPress={() => setMuted(value => !value)}
                style={styles.roundBtn}
                accessibilityLabel={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? (
                  <VolumeX size={rf(19)} color="#FFFFFF" strokeWidth={2.3} />
                ) : (
                  <Volume2 size={rf(19)} color="#FFFFFF" strokeWidth={2.3} />
                )}
              </Pressable>
            ) : null}
            <Pressable
              hitSlop={10}
              onPress={() => actions.openOptions(post)}
              style={styles.roundBtn}
              accessibilityLabel="More options"
            >
              <Ellipsis size={rf(20)} color="#FFFFFF" />
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* BOTTOM: author, caption, actions */}
      <Animated.View
        pointerEvents={chromeVisible ? 'box-none' : 'none'}
        style={[styles.bottomWrap, { opacity: chrome }]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
          style={[styles.bottom, { paddingBottom: insets.bottom + 10 }]}
        >
          {media.length > 1 ? (
            <View style={styles.dots}>
              {media.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === slide && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.authorRow}>
            <Avatar
              user={post.author}
              size={38}
              onPress={() => actions.openProfile(post.author._id)}
            />
            <View style={styles.authorText}>
              <Text
                numberOfLines={1}
                style={styles.authorName}
                onPress={() => actions.openProfile(post.author._id)}
              >
                {post.author.fullName}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {[
                  post.location || post.author.location,
                  timeAgo(post.createdAt),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            <FollowButton
              userId={post.author._id}
              initialFollowing={post.author.isFollowing}
              variant="glass"
            />
          </View>

          {post.caption ? (
            <CaptionText
              dark
              caption={post.caption}
              numberOfLines={2}
              onHashtagPress={actions.openHashtag}
              style={styles.caption}
            />
          ) : null}

          <View style={styles.actions}>
            <ViewerAction
              Icon={Heart}
              label={post.isLiked ? 'Unlike' : 'Like'}
              count={post.likesCount}
              active={post.isLiked}
              activeColor="#F43F5E"
              onPress={() => actions.like(post)}
            />
            <ViewerAction
              Icon={MessageCircle}
              label="Comment"
              count={post.commentsCount}
              onPress={() => actions.openComments(post._id)}
            />
            <ViewerAction
              Icon={Share2}
              label="Share"
              onPress={() => actions.share(post)}
            />
            <View style={styles.flex} />
            <ViewerAction
              Icon={Bookmark}
              label={post.isSaved ? 'Remove from saved' : 'Save'}
              active={post.isSaved}
              activeColor={FIELD.WHEAT}
              onPress={() => actions.save(post)}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      {sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  burst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: rf(12.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottom: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  dots: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorText: {
    flex: 1,
  },
  authorName: {
    fontSize: rf(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  meta: {
    marginTop: 1,
    fontSize: rf(12),
    color: 'rgba(255,255,255,0.75)',
  },
  caption: {
    marginTop: 10,
  },
  actions: {
    marginTop: 8,
    marginHorizontal: -6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    height: 46,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: rf(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  missing: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  missingText: {
    fontSize: rf(15),
    color: 'rgba(255,255,255,0.8)',
  },
  missingBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
  },
  missingBtnText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
