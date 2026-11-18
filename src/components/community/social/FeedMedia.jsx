import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { Clapperboard, Volume2, VolumeX } from 'lucide-react-native';
import LikeBurst from './LikeBurst';
import { useMediaRatios } from './useMediaRatio';
import { CARD_GUTTER, FIELD, rf } from '../theme';
import { formatDuration } from '../../../utils/communityFormat';
import {useTranslation} from 'react-i18next';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// fills the feed card, which is inset from the screen edge
const MEDIA_WIDTH = WINDOW_WIDTH - CARD_GUTTER * 2;

const DOUBLE_TAP_MS = 260;
const PHOTO_MS = 3500;

const MAX_FRAME_HEIGHT = WINDOW_HEIGHT * 0.82;
const MIN_FRAME_HEIGHT = MEDIA_WIDTH * 0.4;

const frameHeightFor = ratio =>
  Math.min(Math.max(MEDIA_WIDTH * ratio, MIN_FRAME_HEIGHT), MAX_FRAME_HEIGHT);

/*
 * The exact on-screen box for a media item. It always keeps the file's own
 * shape: nothing is cropped, and only panoramas or unusually tall files
 * (past the frame limits above) sit inside the frame with a dark surround.
 */
const boxFor = ratio => {
  const width = Math.min(MEDIA_WIDTH, frameHeightFor(ratio) / ratio);

  return { width, height: width * ratio };
};

/*
 * The player for the slide on screen. Mounted only while it should play, so
 * its loading and progress state starts fresh each time.
 *
 * onFinished  called at the end of the video, when it isn't looping
 */
function ActiveVideo({ item, loop, muted, paused, onFinished, onToggleMute }) {
  const {t} = useTranslation();
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [remaining, setRemaining] = useState(item.duration || 0);

  const progress = useRef(new Animated.Value(0)).current;

  const handleProgress = ({ currentTime, seekableDuration }) => {
    const duration = seekableDuration || item.duration || 0;

    if (duration > 0) {
      progress.setValue(currentTime / duration);
      setRemaining(Math.ceil(duration - currentTime));
    }
  };

  const handleError = () => {
    setFailed(true);
    onFinished?.();
  };

  if (failed) {
    return null;
  }

  const MuteIcon = muted ? VolumeX : Volume2;

  return (
    <>
      <Video
        source={{ uri: item.url }}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        repeat={loop}
        muted={muted}
        paused={paused}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        shutterColor="transparent"
        progressUpdateInterval={250}
        onReadyForDisplay={() => setReady(true)}
        onLoad={() => setReady(true)}
        onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
        onProgress={handleProgress}
        onEnd={() => onFinished?.()}
        onError={handleError}
      />

      {!ready || buffering ? (
        <View pointerEvents="none" style={styles.center}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}

      {remaining > 0 ? (
        <View pointerEvents="none" style={styles.timeChip}>
          <Text style={styles.timeText}>{formatDuration(remaining)}</Text>
        </View>
      ) : null}

      <Pressable
        hitSlop={10}
        onPress={onToggleMute}
        style={styles.muteChip}
        accessibilityRole="button"
        accessibilityLabel={muted ? t('feedMedia.unmute') : t('feedMedia.mute')}
      >
        <MuteIcon size={15} color="#FFFFFF" strokeWidth={2.4} />
      </Pressable>

      <View pointerEvents="none" style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </>
  );
}

/*
 * A post's photos and videos, card width and in their true proportions.
 * The frame eases to each slide's height while swiping.
 *
 * While the post is on screen, videos play on their own and a carousel moves
 * forward by itself until the viewer swipes it.
 */
function FeedMedia({
  media,
  isReel,
  isActive,
  muted,
  onToggleMute,
  onLike,
  onOpen,
}) {
  const {t} = useTranslation();
  const [slide, setSlide] = useState(0);
  const [held, setHeld] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const scrollRef = useRef(null);
  const burstRef = useRef(null);
  const lastTap = useRef(0);
  const singleTapTimer = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onScroll = useRef(
    Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
      useNativeDriver: false,
      listener: event =>
        setSlide(Math.round(event.nativeEvent.contentOffset.x / MEDIA_WIDTH)),
    }),
  ).current;

  useEffect(() => () => clearTimeout(singleTapTimer.current), []);

  const ratios = useMediaRatios(media);
  const heightsKey = ratios.map(frameHeightFor).join();

  const frameHeight = useMemo(() => {
    const heights = heightsKey.split(',').map(Number);

    if (heights.length < 2) return heights[0];

    return scrollX.interpolate({
      inputRange: heights.map((_, index) => index * MEDIA_WIDTH),
      outputRange: heights,
      extrapolate: 'clamp',
    });
  }, [heightsKey, scrollX]);

  const isCarousel = media.length > 1;
  const advances = isCarousel && autoAdvance;
  const currentType = media[slide]?.type;

  const advance = useCallback(() => {
    scrollRef.current?.scrollTo({
      x: ((slide + 1) % media.length) * MEDIA_WIDTH,
      animated: true,
    });
  }, [slide, media.length]);

  // Videos move the carousel on when they end; photos use this timer
  useEffect(() => {
    if (!isActive || !advances || held || currentType === 'video') {
      return undefined;
    }

    const timer = setTimeout(advance, PHOTO_MS);

    return () => clearTimeout(timer);
  }, [isActive, advances, held, currentType, advance]);

  const handlePress = (item, index) => {
    const now = Date.now();

    if (now - lastTap.current < DOUBLE_TAP_MS) {
      clearTimeout(singleTapTimer.current);
      lastTap.current = 0;
      burstRef.current?.play();
      onLike();
      return;
    }

    lastTap.current = now;
    singleTapTimer.current = setTimeout(
      () => onOpen(item, index),
      DOUBLE_TAP_MS,
    );
  };

  const renderSlide = (item, index) => {
    const still = item.type === 'video' ? item.thumbnailUrl : item.url;
    const playing = isActive && index === slide && item.type === 'video';

    return (
      <Animated.View
        key={`${item.url}-${index}`}
        style={{ width: MEDIA_WIDTH, height: frameHeight }}
      >
        <Pressable
          onPress={() => handlePress(item, index)}
          onLongPress={() => setHeld(true)}
          onPressOut={() => setHeld(false)}
          delayLongPress={220}
          style={styles.slideTouch}
          accessibilityRole="imagebutton"
          accessibilityLabel={item.type === 'video' ? t('feedMedia.video') : t('feedMedia.photo')}
        >
          <View style={[styles.box, boxFor(ratios[index])]}>
            {still ? (
              <Image
                source={{ uri: still }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            ) : null}

            {playing ? (
              <ActiveVideo
                item={item}
                loop={!advances}
                muted={muted}
                paused={held}
                onFinished={advances ? advance : undefined}
                onToggleMute={onToggleMute}
              />
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View>
      <Animated.View style={[styles.frame, { height: frameHeight }]}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          scrollEnabled={isCarousel}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onScrollBeginDrag={() => setAutoAdvance(false)}
        >
          {media.map(renderSlide)}
        </Animated.ScrollView>

        {isReel ? (
          <View pointerEvents="none" style={styles.reelChip}>
            <Clapperboard size={12} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.chipText}>{t('feedMedia.reel')}</Text>
          </View>
        ) : null}

        {isCarousel ? (
          <View pointerEvents="none" style={styles.counter}>
            <Text style={styles.chipText}>
              {slide + 1}/{media.length}
            </Text>
          </View>
        ) : null}

        <LikeBurst ref={burstRef} size={92} />
      </Animated.View>

      {isCarousel ? (
        <View pointerEvents="none" style={styles.dots}>
          {media.map((item, index) => (
            <View
              key={`${item.url}-${index}`}
              style={[styles.dot, index === slide && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default memo(FeedMedia);

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#0F1411',
  },
  slideTouch: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#E8EEF3',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeChip: {
    position: 'absolute',
    left: 12,
    bottom: 14,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(15,20,17,0.62)',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: rf(11.5),
    fontWeight: '600',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  muteChip: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,20,17,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  reelChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15,20,17,0.62)',
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: 'rgba(15,20,17,0.62)',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: rf(11.5),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dots: {
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D6DEE6',
  },
  dotActive: {
    width: 16,
    backgroundColor: FIELD.FOREST,
  },
});
