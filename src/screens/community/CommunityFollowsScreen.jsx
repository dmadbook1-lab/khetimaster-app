import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Users } from 'lucide-react-native';
import Avatar from '../../components/community/social/Avatar';
import FollowButton from '../../components/community/social/FollowButton';
import { COLORS, rf } from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import { getUserFollowsApi } from '../../api/communityApi';
import { setFollowing } from '../../redux/slices/communitySlice';

/*
 * Followers / following of a user.
 *
 * params: userId, list ('followers' | 'following'), name
 */
export default function CommunityFollowsScreen({ navigation, route }) {
  const { userId, name } = route.params;

  const dispatch = useDispatch();
  const [list, setList] = useState(route.params.list || 'followers');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (which, nextPage) => {
      setLoading(true);

      try {
        const data = await getUserFollowsApi(userId, which, nextPage);

        data.users.forEach(user =>
          dispatch(setFollowing({ userId: user._id, isFollowing: user.isFollowing })),
        );

        setUsers(prev => (nextPage === 1 ? data.users : [...prev, ...data.users]));
        setPage(nextPage);
        setPages(data.pages || 1);
      } catch {
        setPages(0);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, userId],
  );

  useEffect(() => {
    setUsers([]);
    setPage(0);
    load(list, 1);
  }, [list, load]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.navBar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <ArrowLeft size={rf(24)} color={COLORS.DARK} strokeWidth={2.3} />
        </Pressable>
        <Text numberOfLines={1} style={styles.navTitle}>
          {name || 'Community'}
        </Text>
      </View>

      <View style={styles.tabs}>
        {['followers', 'following'].map(key => (
          <Pressable
            key={key}
            onPress={() => setList(key)}
            style={[styles.tab, list === key && styles.tabActive]}
          >
            <Text style={[styles.tabText, list === key && styles.tabTextActive]}>
              {key === 'followers' ? 'Followers' : 'Following'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item._id}
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
              {item.location || item.bio ? (
                <Text numberOfLines={1} style={styles.sub}>
                  {item.bio || item.location}
                </Text>
              ) : null}
            </View>
            <FollowButton userId={item._id} initialFollowing={item.isFollowing} />
          </Pressable>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && page > 0 && page < pages) load(list, page + 1);
        }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={COLORS.DARK_GREEN} />
          ) : (
            <View style={styles.empty}>
              <Users size={42} color="#C5CCD3" strokeWidth={1.6} />
              <Text style={styles.emptyText}>
                {list === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && users.length ? (
            <ActivityIndicator style={styles.loader} color={COLORS.DARK_GREEN} />
          ) : null
        }
      />
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
  },
  navTitle: {
    flex: 1,
    fontSize: rf(18),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE2E7',
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.DARK,
  },
  tabText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  tabTextActive: {
    color: COLORS.DARK,
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
  loader: {
    marginVertical: 30,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
});
