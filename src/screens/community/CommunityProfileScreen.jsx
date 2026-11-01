import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Clapperboard,
  Heart,
  LayoutGrid,
  MapPin,
  Share2,
  SquarePlus,
} from 'lucide-react-native';
import Avatar from '../../components/community/social/Avatar';
import BottomSheet from '../../components/community/social/BottomSheet';
import FollowButton from '../../components/community/social/FollowButton';
import GridTile from '../../components/community/social/GridTile';
import { COLORS, FIELD, rf } from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import {
  getCommunityProfileApi,
  getSavedPostsApi,
  getUserCommunityPostsApi,
  updateCommunityProfileApi,
} from '../../api/communityApi';
import {
  selectMyUserId,
  setFollowing,
  updateMyAuthorInfo,
  upsertCommunityPosts,
} from '../../redux/slices/communitySlice';
import { mergeAuthUser } from '../../redux/slices/authSlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadCommunityAsset } from '../../utils/communityMedia';
import { formatCount } from '../../utils/communityFormat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SIDE = 14;
const GAP = 10;
const TILE = (SCREEN_WIDTH - SIDE * 2 - GAP) / 2;

const PROFILE_TABS = [
  { key: 'posts', label: 'Posts', Icon: LayoutGrid },
  { key: 'reels', label: 'Reels', Icon: Clapperboard },
  { key: 'saved', label: 'Saved', Icon: Bookmark, mineOnly: true },
];

const emptyTab = () => ({ ids: [], page: 0, pages: 1, loading: false });

function Stat({ value, label, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.stat}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

/*
 * params: userId (defaults to the signed-in user)
 */
export default function CommunityProfileScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const myId = useSelector(selectMyUserId);
  const userId = route.params?.userId || myId;
  const postsById = useSelector(state => state.community.postsById);

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('posts');
  const [tabs, setTabs] = useState({
    posts: emptyTab(),
    reels: emptyTab(),
    saved: emptyTab(),
  });

  // latest tabs for loadTab, which must not depend on tabs itself
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [avatarDraft, setAvatarDraft] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isMe = profile?.isMe ?? String(userId) === String(myId);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getCommunityProfileApi(userId);

      setProfile(data.profile);
      setError(null);
      dispatch(
        setFollowing({ userId, isFollowing: data.profile.isFollowing }),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load profile');
    }
  }, [dispatch, userId]);

  const loadTab = useCallback(
    async (key, refresh = false) => {
      const page = refresh ? 1 : tabsRef.current[key].page + 1;

      setTabs(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));

      try {
        const data =
          key === 'saved'
            ? await getSavedPostsApi({ page })
            : await getUserCommunityPostsApi(userId, {
                type: key === 'reels' ? 'reel' : undefined,
                page,
              });

        dispatch(upsertCommunityPosts(data.posts));

        const ids = data.posts.map(post => post._id);

        setTabs(prev => ({
          ...prev,
          [key]: {
            ids: page === 1 ? ids : [...prev[key].ids, ...ids],
            page,
            pages: data.pages || 1,
            loading: false,
          },
        }));
      } catch (err) {
        setTabs(prev => ({ ...prev, [key]: { ...prev[key], loading: false } }));
      }
    },
    [dispatch, userId],
  );

  useEffect(() => {
    loadProfile();
    loadTab('posts', true);
  }, [loadProfile, loadTab]);

  const changeTab = key => {
    setTab(key);

    if (tabs[key].page === 0 && !tabs[key].loading) {
      loadTab(key, true);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadTab(tab, true)]);
    setRefreshing(false);
  };

  // deleted posts drop out of postsById, so hide them here too
  const current = tabs[tab];
  const ids = current.ids.filter(id => postsById[id]);

  const openTile = post => {
    if (post.type === 'reel') {
      navigation.push(COMMUNITY_ROUTES.REELS, {
        ids: ids.filter(id => postsById[id]?.type === 'reel'),
        startId: post._id,
        title: isMe ? 'Your reels' : profile?.fullName,
      });
      return;
    }

    navigation.push(COMMUNITY_ROUTES.POSTS, {
      ids: ids.filter(id => postsById[id]?.type !== 'reel'),
      startId: post._id,
      title: tab === 'saved' ? 'Saved' : 'Posts',
    });
  };

  const openFollows = list =>
    navigation.push(COMMUNITY_ROUTES.FOLLOWS, {
      userId,
      list,
      name: profile?.fullName,
    });

  const shareProfile = () =>
    Share.share({
      message: `Follow ${profile?.fullName || 'me'} on KhetiMaster Community to see farm posts and reels.`,
    }).catch(() => {});

  const openEdit = () => {
    setBioDraft(profile?.bio || '');
    setAvatarDraft(profile?.avatar || '');
    setEditing(true);
  };

  const changeAvatar = async () => {
    try {
      const [asset] = await pickNurseryImages({ selectionLimit: 1 });

      if (!asset) return;

      setUploadingAvatar(true);

      const uploaded = await uploadCommunityAsset({
        uri: asset.uri,
        kind: 'image',
        mimeType: asset.type || 'image/jpeg',
        fileName: asset.fileName || `avatar-${Date.now()}.jpg`,
      });

      setAvatarDraft(uploaded.url);
    } catch (err) {
      Alert.alert('Profile photo', err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);

    try {
      const data = await updateCommunityProfileApi({
        bio: bioDraft,
        avatar: avatarDraft,
      });

      setProfile(prev => ({ ...prev, ...data.user }));
      dispatch(mergeAuthUser({ avatar: data.user.avatar, bio: data.user.bio }));
      dispatch(updateMyAuthorInfo(data.user));
      setEditing(false);
    } catch (err) {
      Alert.alert(
        'Edit profile',
        err.response?.data?.message || 'Unable to save profile',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* ------------------------------------------------------------------ */

  const renderHeader = () => (
    <View>
      <LinearGradient
        colors={[FIELD.DEEP, FIELD.FOREST]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <View style={styles.coverGlow} pointerEvents="none" />
      </LinearGradient>

      <View style={styles.identity}>
        <View style={styles.avatarFrame}>
          <Avatar
            user={profile}
            size={96}
            ring={profile?.stats?.reels > 0}
            onPress={
              profile?.stats?.reels > 0 ? () => changeTab('reels') : undefined
            }
          />
        </View>

        <Text style={styles.fullName}>{profile?.fullName}</Text>

        <View style={styles.metaRow}>
          {profile?.location ? (
            <View style={styles.metaChip}>
              <MapPin size={11} color={FIELD.FOREST} strokeWidth={2.4} />
              <Text style={styles.metaText}>{profile.location}</Text>
            </View>
          ) : null}
          <View style={[styles.metaChip, styles.metaChipWheat]}>
            <Heart
              size={11}
              color="#E11D48"
              fill="#E11D48"
              strokeWidth={2.4}
            />
            <Text style={[styles.metaText, styles.metaTextDark]}>
              {formatCount(profile?.stats?.likes)} likes
            </Text>
          </View>
          {profile?.followsYou && !isMe ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>Follows you</Text>
            </View>
          ) : null}
        </View>

        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
      </View>

      <View style={styles.statsCard}>
        <Stat value={profile?.stats?.posts} label="Posts" />
        <View style={styles.statDivider} />
        <Stat
          value={profile?.stats?.followers}
          label="Followers"
          onPress={() => openFollows('followers')}
        />
        <View style={styles.statDivider} />
        <Stat
          value={profile?.stats?.following}
          label="Following"
          onPress={() => openFollows('following')}
        />
      </View>

      <View style={styles.buttonsRow}>
        {isMe ? (
          <Pressable style={styles.primaryButton} onPress={openEdit}>
            <Text style={styles.primaryButtonText}>Edit profile</Text>
          </Pressable>
        ) : (
          <FollowButton
            userId={userId}
            initialFollowing={profile?.isFollowing}
            style={styles.flexButton}
            onChange={following =>
              setProfile(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  followers: Math.max(
                    (prev.stats?.followers || 0) + (following ? 1 : -1),
                    0,
                  ),
                },
              }))
            }
          />
        )}
        <Pressable
          style={styles.shareButton}
          onPress={shareProfile}
          accessibilityLabel="Share profile"
        >
          <Share2 size={rf(17)} color={FIELD.FOREST} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {PROFILE_TABS.filter(item => isMe || !item.mineOnly).map(
          ({ key, label, Icon }) => {
            const active = tab === key;

            return (
              <Pressable
                key={key}
                onPress={() => changeTab(key)}
                style={[styles.tabItem, active && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Icon
                  size={16}
                  color={active ? '#FFFFFF' : FIELD.BARK}
                  strokeWidth={2.4}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (current.loading || current.page === 0) {
      return <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />;
    }

    const copy = {
      posts: isMe
        ? ['Share your first post', 'Photos and videos you share will appear on your profile.']
        : ['No posts yet', `${profile?.fullName || 'This farmer'} hasn't shared anything yet.`],
      reels: isMe
        ? ['Create your first reel', 'Short videos from your farm reach more farmers.']
        : ['No reels yet', 'Reels they share will show up here.'],
      saved: ['Nothing saved yet', 'Tap the bookmark on any post or reel to save it here.'],
    }[tab];

    const Icon = tab === 'reels' ? Clapperboard : tab === 'saved' ? Bookmark : Camera;

    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Icon size={30} color={FIELD.FOREST} strokeWidth={1.9} />
        </View>
        <Text style={styles.emptyTitle}>{copy[0]}</Text>
        <Text style={styles.emptyText}>{copy[1]}</Text>
        {isMe && tab !== 'saved' ? (
          <Pressable
            onPress={() =>
              navigation.navigate(COMMUNITY_ROUTES.CREATE, {
                type: tab === 'reels' ? 'reel' : 'post',
              })
            }
          >
            <Text style={styles.emptyLink}>
              {tab === 'reels' ? 'Create reel' : 'Share a post'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.navBar}>
          <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
            <ArrowLeft size={rf(22)} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>
        <View style={styles.centerFill}>
          {error ? (
            <>
              <Text style={styles.emptyTitle}>Profile not available</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <Pressable onPress={loadProfile}>
                <Text style={styles.emptyLink}>Try again</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator color={FIELD.FOREST} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={FIELD.DEEP} />

      <View style={styles.navBar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <ArrowLeft size={rf(22)} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
        <Text numberOfLines={1} style={styles.navTitle}>
          {profile.fullName}
        </Text>
        {isMe ? (
          <Pressable
            hitSlop={10}
            onPress={() => navigation.navigate(COMMUNITY_ROUTES.CREATE)}
          >
            <SquarePlus size={rf(22)} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        key={tab === 'reels' ? 'tall' : 'square'}
        data={ids}
        keyExtractor={item => item}
        numColumns={2}
        style={styles.list}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty()}
        renderItem={({ item }) => (
          <GridTile
            post={postsById[item]}
            size={TILE}
            tall={tab === 'reels'}
            radius={18}
            onPress={() => openTile(postsById[item])}
          />
        )}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!current.loading && current.page < current.pages) loadTab(tab);
        }}
        ListFooterComponent={
          current.loading && ids.length ? (
            <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />
          ) : (
            <View style={styles.footerSpace} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={FIELD.FOREST}
            colors={[FIELD.FOREST]}
          />
        }
      />

      {/* EDIT PROFILE */}
      <BottomSheet visible={editing} onClose={() => setEditing(false)} keyboardAware>
        <View style={styles.editBody}>
          <Text style={styles.editTitle}>Edit profile</Text>

          <Pressable onPress={changeAvatar} style={styles.editAvatar}>
            <Avatar user={{ ...profile, avatar: avatarDraft }} size={92} />
            {uploadingAvatar ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : null}
            <Text style={styles.editAvatarText}>Change photo</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>Name</Text>
          <Text style={styles.readonlyField}>{profile.fullName}</Text>

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            value={bioDraft}
            onChangeText={setBioDraft}
            maxLength={150}
            multiline
            placeholder="e.g. Organic wheat & soybean farmer · 12 acres · Indore"
            placeholderTextColor={COLORS.MUTED}
            style={styles.bioInput}
          />
          <Text style={styles.bioCounter}>{bioDraft.length}/150</Text>

          <Pressable
            onPress={saveProfile}
            disabled={savingProfile || uploadingAvatar}
            style={[
              styles.saveButton,
              (savingProfile || uploadingAvatar) && styles.saveDisabled,
            ]}
          >
            {savingProfile ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FIELD.DEEP,
  },
  list: {
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    backgroundColor: FIELD.DEEP,
  },
  navTitle: {
    flex: 1,
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  cover: {
    height: 70,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  coverGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -60,
    top: -120,
    backgroundColor: 'rgba(227,163,59,0.25)',
  },
  identity: {
    marginTop: -52,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarFrame: {
    padding: 4,
    borderRadius: 56,
    backgroundColor: FIELD.SOIL,
  },
  fullName: {
    marginTop: 10,
    fontSize: rf(20),
    fontWeight: '900',
    color: FIELD.INK,
    textAlign: 'center',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
    backgroundColor: FIELD.SPROUT,
  },
  metaChipWheat: {
    backgroundColor: FIELD.WHEAT_SOFT,
  },
  metaText: {
    fontSize: rf(11.5),
    fontWeight: '700',
    color: FIELD.FOREST,
  },
  metaTextDark: {
    color: FIELD.DEEP,
  },
  bio: {
    marginTop: 10,
    fontSize: rf(13.5),
    lineHeight: rf(19),
    color: FIELD.INK,
    textAlign: 'center',
  },
  statsCard: {
    marginTop: 16,
    marginHorizontal: SIDE,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: FIELD.CARD,
    borderWidth: 1,
    borderColor: FIELD.LINE,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: FIELD.LINE,
  },
  statValue: {
    fontSize: rf(18),
    fontWeight: '900',
    color: FIELD.INK,
  },
  statLabel: {
    marginTop: 2,
    fontSize: rf(11.5),
    fontWeight: '700',
    color: FIELD.BARK,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: SIDE,
    paddingTop: 12,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: FIELD.FOREST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: FIELD.SPROUT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    marginTop: 16,
    marginBottom: 14,
    marginHorizontal: SIDE,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: FIELD.WHEAT_SOFT,
  },
  tabItem: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: FIELD.FOREST,
  },
  tabText: {
    fontSize: rf(12.5),
    fontWeight: '800',
    color: FIELD.BARK,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  gridRow: {
    gap: GAP,
    paddingHorizontal: SIDE,
    marginBottom: GAP,
  },
  loader: {
    marginVertical: 30,
  },
  footerSpace: {
    height: 40,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: FIELD.SPROUT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: '800',
    color: COLORS.DARK,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: rf(13.5),
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: rf(19),
  },
  emptyLink: {
    marginTop: 6,
    fontSize: rf(14),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  editBody: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  editTitle: {
    textAlign: 'center',
    fontSize: rf(16),
    fontWeight: '800',
    color: COLORS.DARK,
    marginBottom: 14,
  },
  editAvatar: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarText: {
    fontSize: rf(13.5),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  fieldLabel: {
    marginTop: 8,
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  readonlyField: {
    marginTop: 4,
    fontSize: rf(15),
    color: COLORS.DARK,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE2E7',
  },
  bioInput: {
    marginTop: 4,
    minHeight: 70,
    fontSize: rf(15),
    color: COLORS.DARK,
    textAlignVertical: 'top',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE2E7',
  },
  bioCounter: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: rf(11),
    color: COLORS.MUTED,
  },
  saveButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: rf(15),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
