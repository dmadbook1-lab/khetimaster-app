import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Hash, Search, X } from 'lucide-react-native';
import Avatar from '../../components/community/social/Avatar';
import FollowButton from '../../components/community/social/FollowButton';
import GridTile from '../../components/community/social/GridTile';
import { COLORS, rf } from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import { searchCommunityApi } from '../../api/communityApi';
import {
  fetchCommunityList,
  setFollowing,
  upsertCommunityPosts,
} from '../../redux/slices/communitySlice';
import { formatCount } from '../../utils/communityFormat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GAP = 2;
const TILE = (SCREEN_WIDTH - GAP * 2) / 3;

/*
 * Explore grid when empty; accounts, posts and hashtags when searching.
 *
 * params: query (e.g. '#organic' from a tapped hashtag)
 */
export default function CommunitySearchScreen({ navigation, route }) {
  const initialQuery = route.params?.query || '';

  const dispatch = useDispatch();
  const feed = useSelector(state => state.community.feed);
  const postsById = useSelector(state => state.community.postsById);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(initialQuery.startsWith('#') ? 'posts' : 'accounts');

  useEffect(() => {
    if (feed.page === 0) {
      dispatch(fetchCommunityList({ list: 'all', refresh: true }));
    }
  }, [dispatch, feed.page]);

  // debounced search
  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setResults(null);
      return undefined;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await searchCommunityApi(q);

        if (cancelled) return;

        dispatch(upsertCommunityPosts(data.posts));
        data.users.forEach(user =>
          dispatch(setFollowing({ userId: user._id, isFollowing: user.isFollowing })),
        );

        setResults({
          users: data.users,
          postIds: data.posts.map(post => post._id),
          hashtags: data.hashtags,
        });
      } catch {
        if (!cancelled) setResults({ users: [], postIds: [], hashtags: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, dispatch]);

  const openPost = (ids, post) => {
    if (post.type === 'reel') {
      navigation.push(COMMUNITY_ROUTES.REELS, {
        ids: ids.filter(id => postsById[id]?.type === 'reel'),
        startId: post._id,
      });
      return;
    }

    navigation.push(COMMUNITY_ROUTES.POSTS, {
      ids: ids.filter(id => postsById[id]?.type !== 'reel'),
      startId: post._id,
      title: query.trim() || 'Explore',
    });
  };

  const renderGrid = (ids, header) => (
    <FlatList
      key="grid"
      data={ids.filter(id => postsById[id])}
      keyExtractor={item => item}
      numColumns={3}
      columnWrapperStyle={styles.gridRow}
      keyboardDismissMode="on-drag"
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <GridTile
          post={postsById[item]}
          size={TILE}
          onPress={() => openPost(ids, postsById[item])}
        />
      )}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (!results) dispatch(fetchCommunityList({ list: 'all' }));
      }}
      ListEmptyComponent={
        loading || feed.loading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.DARK_GREEN} />
        ) : (
          <Text style={styles.empty}>
            {results ? 'No posts found' : 'Nothing to explore yet'}
          </Text>
        )
      }
    />
  );

  const renderAccounts = () => (
    <FlatList
      key="accounts"
      data={results.users}
      keyExtractor={item => item._id}
      keyboardDismissMode="on-drag"
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => navigation.push(COMMUNITY_ROUTES.PROFILE, { userId: item._id })}
        >
          <Avatar user={item} size={50} />
          <View style={styles.rowText}>
            <Text numberOfLines={1} style={styles.name}>
              {item.fullName}
            </Text>
            {item.location ? (
              <Text numberOfLines={1} style={styles.sub}>
                {item.location}
              </Text>
            ) : null}
          </View>
          <FollowButton userId={item._id} initialFollowing={item.isFollowing} />
        </Pressable>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.DARK_GREEN} />
        ) : (
          <Text style={styles.empty}>No accounts found</Text>
        )
      }
    />
  );

  const renderTags = () => (
    <FlatList
      key="tags"
      data={results.hashtags}
      keyExtractor={item => item.tag}
      keyboardDismissMode="on-drag"
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => {
            setQuery(`#${item.tag}`);
            setTab('posts');
          }}
        >
          <View style={styles.tagIcon}>
            <Hash size={22} color={COLORS.DARK} strokeWidth={2} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.name}>#{item.tag}</Text>
            <Text style={styles.sub}>
              {formatCount(item.posts)} {item.posts === 1 ? 'post' : 'posts'}
            </Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.DARK_GREEN} />
        ) : (
          <Text style={styles.empty}>No hashtags found</Text>
        )
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.searchRow}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <ArrowLeft size={rf(24)} color={COLORS.DARK} strokeWidth={2.3} />
        </Pressable>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.MUTED} strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus={!initialQuery}
            placeholder="Search farmers, crops, #hashtags"
            placeholderTextColor={COLORS.MUTED}
            returnKeyType="search"
            autoCapitalize="none"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable hitSlop={10} onPress={() => setQuery('')}>
              <X size={16} color={COLORS.MUTED} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {results ? (
        <>
          <View style={styles.tabs}>
            {[
              ['accounts', 'Accounts'],
              ['posts', 'Posts'],
              ['tags', 'Tags'],
            ].map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tab, tab === key && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === 'accounts'
            ? renderAccounts()
            : tab === 'tags'
            ? renderTags()
            : renderGrid(results.postIds)}
        </>
      ) : (
        renderGrid(feed.ids, <Text style={styles.exploreTitle}>Explore</Text>)
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchBox: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F0F2F5',
  },
  searchInput: {
    flex: 1,
    fontSize: rf(14.5),
    color: COLORS.DARK,
    paddingVertical: 0,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE2E7',
  },
  tab: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.DARK,
  },
  tabText: {
    fontSize: rf(13.5),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  tabTextActive: {
    color: COLORS.DARK,
  },
  exploreTitle: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
    fontSize: rf(15),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  gridRow: {
    gap: GAP,
    marginBottom: GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: rf(14),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  sub: {
    marginTop: 2,
    fontSize: rf(12.5),
    color: COLORS.MUTED,
  },
  tagIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDE2E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginVertical: 30,
  },
  empty: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: rf(14),
    color: COLORS.MUTED,
  },
});
