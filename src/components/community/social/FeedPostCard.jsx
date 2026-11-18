import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  Bookmark,
  Ellipsis,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react-native';
import Avatar from './Avatar';
import CaptionText from './CaptionText';
import FeedMedia from './FeedMedia';
import FollowButton from './FollowButton';
import {
  CARD_GUTTER,
  CARD_RADIUS,
  CARD_SHADOW,
  FIELD,
  rf,
} from '../theme';
import { selectCommunityPost } from '../../../redux/slices/communitySlice';
import { formatCount } from '../../../utils/communityFormat';
import { timeAgo } from '../../../utils/marketFormat';
import {useTranslation} from 'react-i18next';

const SIDE = 14;

const countLabel = (count, one, many) =>
  `${formatCount(count)} ${count === 1 ? one : many}`;

function PostAction({ Icon, label, active, activeColor, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const color = active ? activeColor : FIELD.BARK;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.82,
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
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          size={rf(19)}
          color={color}
          fill={active ? activeColor : 'transparent'}
          strokeWidth={2}
        />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.actionLabel, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FeedPostCard({
  postId,
  isActive,
  actions,
  onOpenReel,
  muted,
  onToggleMute,
}) {
  const {t} = useTranslation();
  const post = useSelector(state => selectCommunityPost(state, postId));

  if (!post) {
    return null;
  }

  const media = post.media || [];
  const isReel = post.type === 'reel';
  const hasVideo = isReel || media[0]?.type === 'video';
  const place = post.location || post.author.location;
  const showViews = hasVideo && post.viewsCount > 0;

  const openProfile = () => actions.openProfile(post.author._id);
  const openComments = () => actions.openComments(post._id);

  const openMedia = (item, index) => {
    if (isReel) {
      (onOpenReel || actions.openVideo)?.(post._id);
    } else if (item.type === 'video' && media.length === 1) {
      actions.openVideo?.(post._id);
    } else {
      actions.openPost?.(post._id, index);
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.header}>
        <Avatar
          user={post.author}
          size={44}
          ring={isReel}
          onPress={openProfile}
        />

        <View style={styles.headerText}>
          <Text numberOfLines={1} style={styles.name} onPress={openProfile}>
            {post.author.fullName}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {[place, timeAgo(post.createdAt)].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <FollowButton
          userId={post.author._id}
          initialFollowing={post.author.isFollowing}
          variant="outline"
        />

        <Pressable
          hitSlop={10}
          onPress={() => actions.openOptions(post)}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel={t('feedPostCard.moreOptions')}
        >
          <Ellipsis size={rf(20)} color={FIELD.BARK} />
        </Pressable>
      </View>

      {post.caption ? (
        <CaptionText
          caption={post.caption}
          numberOfLines={media.length ? 3 : 8}
          onHashtagPress={actions.openHashtag}
          style={styles.caption}
        />
      ) : null}

      {media.length ? (
        <View style={styles.media}>
          <FeedMedia
            media={media}
            isReel={isReel}
            isActive={isActive}
            muted={muted}
            onToggleMute={onToggleMute}
            onLike={() => actions.like(post, true)}
            onOpen={openMedia}
          />
        </View>
      ) : null}

      {post.likesCount > 0 || post.commentsCount > 0 || showViews ? (
        <View style={styles.stats}>
          {post.likesCount > 0 ? (
            <View style={styles.likes}>
              <View style={styles.likeBadge}>
                <Heart size={9} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <Text style={styles.statText}>
                {countLabel(post.likesCount, 'like', 'likes')}
              </Text>
            </View>
          ) : null}

          <View style={styles.flex} />

          {post.commentsCount > 0 ? (
            <Text style={styles.statText} onPress={openComments}>
              {countLabel(post.commentsCount, 'comment', 'comments')}
            </Text>
          ) : null}

          {post.commentsCount > 0 && showViews ? (
            <Text style={styles.statText}>·</Text>
          ) : null}

          {showViews ? (
            <Text style={styles.statText}>
              {countLabel(post.viewsCount, 'view', 'views')}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <PostAction
          Icon={Heart}
          label={post.isLiked ? t('feedPostCard.liked') : t('feedPostCard.like')}
          active={post.isLiked}
          activeColor="#E11D48"
          onPress={() => actions.like(post)}
        />
        <PostAction
          Icon={MessageCircle}
          label={t('feedPostCard.comment')}
          onPress={openComments}
        />
        <PostAction
          Icon={Share2}
          label={t('feedPostCard.share')}
          onPress={() => actions.share(post)}
        />
        <PostAction
          Icon={Bookmark}
          label={post.isSaved ? t('feedPostCard.saved') : t('feedPostCard.save')}
          active={post.isSaved}
          activeColor={FIELD.FOREST}
          onPress={() => actions.save(post)}
        />
      </View>
    </View>
  );
}

export default memo(FeedPostCard);

const styles = StyleSheet.create({
  post: {
    marginHorizontal: CARD_GUTTER,
    marginBottom: 14,
    paddingTop: 14,
    borderRadius: CARD_RADIUS,
    backgroundColor: FIELD.CARD,
    ...CARD_SHADOW,
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
  name: {
    fontSize: rf(15),
    fontWeight: '600',
    color: FIELD.INK,
    letterSpacing: -0.1,
  },
  meta: {
    marginTop: 2,
    fontSize: rf(12),
    color: FIELD.BARK,
  },
  moreBtn: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    marginTop: 10,
    paddingHorizontal: SIDE,
  },
  media: {
    marginTop: 12,
  },
  stats: {
    marginTop: 10,
    paddingHorizontal: SIDE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeBadge: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: rf(12.5),
    color: FIELD.BARK,
  },
  actions: {
    marginTop: 10,
    marginHorizontal: SIDE,
    paddingVertical: 2,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E9EF',
  },
  action: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPressed: {
    backgroundColor: '#EEF2F6',
  },
  actionLabel: {
    fontSize: rf(12.5),
    fontWeight: '600',
  },
});
