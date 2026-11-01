import React, { useRef, useState } from 'react';
import { FlatList, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import FeedPostCard from '../../components/community/social/FeedPostCard';
import usePostInteractions from '../../components/community/social/usePostInteractions';
import { COLORS, rf } from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';

/*
 * A scrollable list of posts opened from a grid, starting at the tapped one.
 *
 * params: ids, startId, title
 */
export default function CommunityPostsScreen({ navigation, route }) {
  const { ids: allIds = [], startId, title = 'Posts' } = route.params || {};

  const isFocused = useIsFocused();
  const postsById = useSelector(state => state.community.postsById);
  const { actions, sheets } = usePostInteractions(navigation);

  const ids = allIds.filter(id => postsById[id]);
  const startIndex = Math.max(ids.indexOf(startId), 0);

  const [activeId, setActiveId] = useState(startId);
  const listRef = useRef(null);
  const scrolledToStart = useRef(false);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length) setActiveId(viewableItems[0].item);
  }).current;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.navBar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <ArrowLeft size={rf(24)} color={COLORS.DARK} strokeWidth={2.3} />
        </Pressable>
        <Text style={styles.navTitle}>{title}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={ids}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <FeedPostCard
            postId={item}
            isActive={isFocused && item === activeId}
            actions={actions}
            onOpenReel={postId =>
              navigation.push(COMMUNITY_ROUTES.REELS, { ids: [postId], startId: postId })
            }
          />
        )}
        initialNumToRender={startIndex + 2}
        onLayout={() => {
          if (scrolledToStart.current || startIndex === 0) return;

          scrolledToStart.current = true;
          listRef.current?.scrollToIndex({ index: startIndex, animated: false });
        }}
        onScrollToIndexFailed={info => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });
          setTimeout(
            () =>
              listRef.current?.scrollToIndex({ index: info.index, animated: false }),
            120,
          );
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        ListEmptyComponent={
          <Text style={styles.empty}>This post is no longer available.</Text>
        }
        contentContainerStyle={styles.content}
      />

      {sheets}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE2E7',
  },
  navTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  content: {
    paddingBottom: 40,
  },
  empty: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: rf(14),
    color: COLORS.MUTED,
  },
});
