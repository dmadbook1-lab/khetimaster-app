import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useDispatch } from 'react-redux';
import { Bookmark, Share2, Trash2, UserRound } from 'lucide-react-native';
import CommentsSheet from './CommentsSheet';
import OptionsSheet from './OptionsSheet';
import { bumpPostCounterApi } from '../../../api/communityApi';
import {
  deleteCommunityPost,
  togglePostLike,
  togglePostSave,
} from '../../../redux/slices/communitySlice';
import { COMMUNITY_ROUTES } from '../../../constants/communityRoutes';
import {useTranslation} from 'react-i18next';

/*
 * Everything a post can do, shared by the feed, reels, profile and search
 * screens. Pass `actions` to cards and render `sheets` once in the screen.
 */
export default function usePostInteractions(navigation, { onDeleted } = {}) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [commentsFor, setCommentsFor] = useState(null);
  // optionsFor is kept while the sheet animates closed
  const [optionsFor, setOptionsFor] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const openOptions = useCallback(post => {
    setOptionsFor(post);
    setOptionsVisible(true);
  }, []);

  const openProfile = useCallback(
    userId => {
      if (!userId) return;

      setCommentsFor(null);
      navigation.push(COMMUNITY_ROUTES.PROFILE, { userId });
    },
    [navigation],
  );

  // Photos open in the full-screen viewer, videos in the reels player
  const openPost = useCallback(
    (postId, index = 0) =>
      navigation.push(COMMUNITY_ROUTES.VIEWER, { postId, index }),
    [navigation],
  );

  const openVideo = useCallback(
    postId =>
      navigation.push(COMMUNITY_ROUTES.REELS, {
        ids: [postId],
        startId: postId,
      }),
    [navigation],
  );

  const openHashtag = useCallback(
    tag => navigation.push(COMMUNITY_ROUTES.SEARCH, { query: `#${tag}` }),
    [navigation],
  );

  const like = useCallback(
    (post, value = !post.isLiked) => {
      if (post.isLiked === value) return;

      dispatch(togglePostLike({ postId: post._id, like: value }));
    },
    [dispatch],
  );

  const save = useCallback(
    post => dispatch(togglePostSave({ postId: post._id, save: !post.isSaved })),
    [dispatch],
  );

  const share = useCallback(async post => {
    const media = post.media?.[0];
    const lines = [
      t('usePostInteractions.onKhetimasterCommunity', {v1: post.author?.fullName || 'A farmer'}),
      post.caption,
      media?.url,
    ].filter(Boolean);

    try {
      const result = await Share.share({ message: lines.join('\n\n') });

      if (result.action === Share.sharedAction) {
        bumpPostCounterApi(post._id, 'share').catch(() => {});
      }
    } catch {
      // share sheet dismissed / unavailable
    }
  }, [t]);

  const confirmDelete = useCallback(
    post => {
      Alert.alert(
        post.type === 'reel' ? t('usePostInteractions.deleteReel') : t('usePostInteractions.deletePost'),
        t('usePostInteractions.thisCannotBeUndone'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              const result = await dispatch(deleteCommunityPost(post._id));

              if (deleteCommunityPost.rejected.match(result)) {
                Alert.alert(t('common.delete'), result.payload);
                return;
              }

              onDeleted?.(post._id);
            },
          },
        ],
      );
    },
    [dispatch, onDeleted, t],
  );

  const options = optionsFor
    ? [
        {
          key: 'share',
          label: t('usePostInteractions.share'),
          Icon: Share2,
          onPress: () => share(optionsFor),
        },
        {
          key: 'save',
          label: optionsFor.isSaved ? t('usePostInteractions.removeFromSaved') : t('usePostInteractions.save'),
          Icon: Bookmark,
          onPress: () => save(optionsFor),
        },
        ...(optionsFor.isMine
          ? [
              {
                key: 'delete',
                label: t('common.delete'),
                Icon: Trash2,
                destructive: true,
                onPress: () => confirmDelete(optionsFor),
              },
            ]
          : [
              {
                key: 'profile',
                label: t('usePostInteractions.view', {v1: optionsFor.author?.fullName || 'profile'}),
                Icon: UserRound,
                onPress: () => openProfile(optionsFor.author?._id),
              },
            ]),
      ]
    : [];

  const sheets = (
    <>
      <CommentsSheet
        visible={Boolean(commentsFor)}
        postId={commentsFor}
        onClose={() => setCommentsFor(null)}
        onOpenProfile={openProfile}
      />
      <OptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        options={options}
      />
    </>
  );

  // Stable object so memoised cards don't re-render on every screen render
  const actions = useMemo(
    () => ({
      openProfile,
      openHashtag,
      like,
      save,
      share,
      openComments: setCommentsFor,
      openOptions,
      openPost,
      openVideo,
    }),
    [
      openProfile,
      openHashtag,
      like,
      save,
      share,
      openOptions,
      openPost,
      openVideo,
    ],
  );

  return { actions, sheets };
}
