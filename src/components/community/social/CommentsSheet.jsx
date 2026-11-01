import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react-native';
import BottomSheet from './BottomSheet';
import Avatar from './Avatar';
import { COLORS, rf } from '../theme';
import {
  addPostCommentApi,
  deletePostCommentApi,
  getPostCommentsApi,
} from '../../../api/communityApi';
import { setPostCommentsCount } from '../../../redux/slices/communitySlice';
import { shortTimeAgo } from '../../../utils/communityFormat';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QUICK_EMOJIS = ['🌾', '🙏', '👏', '🔥', '❤️', '😍', '👍', '💯'];

export default function CommentsSheet({
  visible,
  postId,
  onClose,
  onOpenProfile,
}) {
  const dispatch = useDispatch();
  const me = useSelector(state => state.auth.user);

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(
    async nextPage => {
      if (!postId) return;

      setLoading(true);

      try {
        const data = await getPostCommentsApi(postId, nextPage);

        setComments(prev =>
          nextPage === 1 ? data.comments : [...prev, ...data.comments],
        );
        setPage(nextPage);
        setPages(data.pages || 1);
      } catch (error) {
        Alert.alert(
          'Comments',
          error.response?.data?.message || 'Unable to load comments',
        );
      } finally {
        setLoading(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    if (visible && postId) {
      setComments([]);
      setText('');
      load(1);
    }
  }, [visible, postId, load]);

  const send = async () => {
    const value = text.trim();

    if (!value || sending) return;

    setSending(true);

    try {
      const data = await addPostCommentApi(postId, value);

      setComments(prev => [data.comment, ...prev]);
      setText('');
      dispatch(
        setPostCommentsCount({ postId, commentsCount: data.commentsCount }),
      );
    } catch (error) {
      Alert.alert(
        'Comment',
        error.response?.data?.message || 'Unable to post comment',
      );
    } finally {
      setSending(false);
    }
  };

  const remove = comment => {
    Alert.alert('Delete comment?', comment.text, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const data = await deletePostCommentApi(comment._id);

            setComments(prev => prev.filter(c => c._id !== comment._id));
            dispatch(
              setPostCommentsCount({
                postId,
                commentsCount: data.commentsCount,
              }),
            );
          } catch (error) {
            Alert.alert(
              'Comment',
              error.response?.data?.message || 'Unable to delete comment',
            );
          }
        },
      },
    ]);
  };

  const renderComment = ({ item }) => (
    <Pressable
      onLongPress={item.canDelete ? () => remove(item) : undefined}
      delayLongPress={350}
      style={styles.comment}
    >
      <Avatar
        user={item.author}
        size={34}
        onPress={() => onOpenProfile?.(item.author._id)}
      />
      <View style={styles.commentBody}>
        <Text style={styles.commentMeta}>
          <Text
            style={styles.commentName}
            onPress={() => onOpenProfile?.(item.author._id)}
          >
            {item.author.fullName}
          </Text>
          {'  '}
          {shortTimeAgo(item.createdAt)}
        </Text>
        <Text style={styles.commentText}>{item.text}</Text>
        {item.canDelete ? (
          <Text style={styles.hint}>Hold to delete</Text>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      height={SCREEN_HEIGHT * 0.72}
      keyboardAware
    >
      <Text style={styles.title}>Comments</Text>
      <View style={styles.divider} />

      <FlatList
        data={comments}
        keyExtractor={item => item._id}
        renderItem={renderComment}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && page < pages) load(page + 1);
        }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              style={styles.loader}
              color={COLORS.DARK_GREEN}
            />
          ) : (
            <View style={styles.empty}>
              <MessageCircle size={40} color="#C5CCD3" strokeWidth={1.6} />
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptyText}>Start the conversation.</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && comments.length ? (
            <ActivityIndicator
              style={styles.loader}
              color={COLORS.DARK_GREEN}
            />
          ) : null
        }
      />

      <View style={styles.emojiRow}>
        {QUICK_EMOJIS.map(emoji => (
          <Pressable
            key={emoji}
            hitSlop={4}
            onPress={() => setText(prev => prev + emoji)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputRow}>
        <Avatar user={me && { ...me, _id: me.id }} size={34} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a comment…"
          placeholderTextColor={COLORS.MUTED}
          style={styles.input}
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={send}
          disabled={!text.trim() || sending}
          hitSlop={8}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.DARK_GREEN} />
          ) : (
            <Text style={[styles.post, !text.trim() && styles.postDisabled]}>
              Post
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: rf(15),
    fontWeight: '800',
    color: COLORS.DARK,
    paddingBottom: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DDE2E7',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  comment: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    fontSize: rf(12),
    color: COLORS.MUTED,
  },
  commentName: {
    fontWeight: '800',
    color: COLORS.DARK,
  },
  commentText: {
    marginTop: 2,
    fontSize: rf(14),
    lineHeight: rf(19),
    color: COLORS.DARK,
  },
  hint: {
    marginTop: 4,
    fontSize: rf(10.5),
    color: '#A3ABB6',
  },
  loader: {
    marginVertical: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    marginTop: 6,
    fontSize: rf(18),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  emptyText: {
    fontSize: rf(13),
    color: COLORS.MUTED,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDE2E7',
  },
  emoji: {
    fontSize: rf(22),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E6EB',
    fontSize: rf(14),
    color: COLORS.DARK,
  },
  post: {
    fontSize: rf(14),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  postDisabled: {
    opacity: 0.4,
  },
});
