import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronRight,
  Clapperboard,
  Images,
  Play,
  Plus,
  Sprout,
  UsersRound,
} from 'lucide-react-native';
import CommunityHeader from '../../components/community/CommunityHeader';
import Avatar from '../../components/community/social/Avatar';
import FeedPostCard from '../../components/community/social/FeedPostCard';
import OptionsSheet from '../../components/community/social/OptionsSheet';
import usePostInteractions from '../../components/community/social/usePostInteractions';
import { FIELD, rf } from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import {
  fetchCommunityList,
  fetchReelCreators,
} from '../../redux/slices/communitySlice';
import { coverOf, formatCount } from '../../utils/communityFormat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SIDE = 14;
const BOARD_COLUMNS = 3;
const BOARD_GAP = 2;
const BOARD_TILE =
  (SCREEN_WIDTH - BOARD_GAP * (BOARD_COLUMNS - 1)) / BOARD_COLUMNS;

const FEED_TABS = {
  Community: 'all',
  Following: 'following',
};

export default function CommunityScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const me = useSelector(state => state.auth.user);
  const creators = useSelector(state => state.community.creators);
  const feedList = useSelector(state => state.community.feed);
  const followingList = useSelector(state => state.community.followingFeed);
  const reelList = useSelector(state => state.community.reels);
  const lists = { all: feedList, following: followingList, reel: reelList };

  const [activeTab, setActiveTab] = useState(route.params?.tab || 'Community');

  /* ---------------- collapsing header ---------------- */

  // The header floats over the list (so its curved corners show the feed,
  // not white) and tucks away to just the tabs while scrolling down.
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [collapsible, setCollapsible] = useState(0);

  // fresh value per tab, so a new list always starts with the header open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollY = useMemo(() => new Animated.Value(0), [activeTab]);

  const headerShift = useMemo(() => {
    // iOS lists start at -headerHeight (content inset)
    const offset =
      Platform.OS === 'ios' ? Animated.add(scrollY, headerHeight) : scrollY;
    const fromTop = offset.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolateLeft: 'clamp',
    });
    return Animated.diffClamp(fromTop, 0, Math.max(collapsible, 1));
  }, [scrollY, headerHeight, collapsible]);

  const distance = Math.max(collapsible, 1);
  const headerTranslate = headerShift.interpolate({
    inputRange: [0, distance],
    outputRange: [0, -distance],
  });
  const headerCollapse = headerShift.interpolate({
    inputRange: [0, distance],
    outputRange: [0, 1],
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  // Lists start below the header: content inset on iOS (keeps the refresh
  // spinner visible), top padding on Android
  const listInsetProps =
    Platform.OS === 'ios'
      ? {
          contentInset: { top: headerHeight },
          contentOffset: { x: 0, y: -headerHeight },
          scrollIndicatorInsets: { top: headerHeight },
        }
      : {};
  const listPadding =
    Platform.OS === 'ios' ? null : { paddingTop: headerHeight };
  const [activeId, setActiveId] = useState(null);
  const [createSheet, setCreateSheet] = useState(false);

  const { actions, sheets } = usePostInteractions(navigation);

  const feedKey = FEED_TABS[activeTab];
  const list = feedKey ? lists[feedKey] : null;

  /* ---------------- tabs ---------------- */

  // tabs opened from other community screens
  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
      navigation.setParams({ tab: undefined });
    }
  }, [route.params?.tab, navigation]);

  // back from another section returns to Discover first
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (activeTab !== 'Community') {
          setActiveTab('Community');
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, [activeTab]);

  /* ---------------- data ---------------- */

  const listKey = activeTab === 'Reels' ? 'reel' : feedKey;
  const listPage = lists[listKey].page;

  useEffect(() => {
    if (listPage === 0) {
      dispatch(fetchCommunityList({ list: listKey, refresh: true }));
    }
  }, [dispatch, listKey, listPage]);

  useEffect(() => {
    dispatch(fetchReelCreators());
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchCommunityList({ list: listKey, refresh: true }));

    if (activeTab === 'Community') dispatch(fetchReelCreators());
  };

  const loadMore = () => dispatch(fetchCommunityList({ list: listKey }));

  /* ---------------- viewability (autoplay) ---------------- */

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setActiveId(viewableItems.length ? viewableItems[0].item : null);
  }).current;

  /* ---------------- navigation helpers ---------------- */

  const openCreate = type =>
    navigation.navigate(COMMUNITY_ROUTES.CREATE, { type });

  const openReel = useCallback(
    postId => navigation.navigate(COMMUNITY_ROUTES.REELS, { startId: postId }),
    [navigation],
  );

  /* ---------------- feed header ---------------- */

  const myCreator = creators.find(c => c.isMe);
  const otherCreators = creators.filter(c => !c.isMe);
  const firstName = (me?.fullName || me?.name || '').split(' ')[0];

  const renderShareCard = () => (
    <View style={styles.shareRow}>
      <Avatar
        user={me && { ...me, _id: me.id }}
        size={42}
        onPress={() => navigation.navigate(COMMUNITY_ROUTES.PROFILE)}
      />
      <Pressable style={styles.sharePrompt} onPress={() => openCreate('post')}>
        <Text numberOfLines={1} style={styles.sharePromptText}>
          {firstName
            ? `What's new in your field, ${firstName}?`
            : "What's new in your field?"}
        </Text>
      </Pressable>
      <Pressable
        hitSlop={6}
        style={styles.shareIcon}
        onPress={() => openCreate('post')}
        accessibilityLabel="Share a photo"
      >
        <Images size={rf(22)} color={FIELD.FOREST} strokeWidth={2.1} />
      </Pressable>
      <Pressable
        hitSlop={6}
        style={styles.shareIcon}
        onPress={() => openCreate('reel')}
        accessibilityLabel="Record a reel"
      >
        <Clapperboard size={rf(22)} color={FIELD.WHEAT} strokeWidth={2.1} />
      </Pressable>
    </View>
  );

  const renderCreatorShelf = () => (
    <View style={styles.shelf}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelfRow}
      >
        <Pressable
          style={styles.story}
          onPress={() =>
            myCreator ? openReel(myCreator.latestReel) : openCreate('reel')
          }
        >
          <View>
            <Avatar
              user={me && { ...me, _id: me.id }}
              size={66}
              ring={Boolean(myCreator)}
            />
            <Pressable
              style={styles.storyPlus}
              onPress={() => openCreate('reel')}
            >
              <Plus size={13} color="#FFFFFF" strokeWidth={3.2} />
            </Pressable>
          </View>
          <Text numberOfLines={1} style={styles.storyName}>
            Your reel
          </Text>
        </Pressable>

        {otherCreators.map(creator => (
          <Pressable
            key={creator._id}
            style={styles.story}
            onPress={() => openReel(creator.latestReel)}
          >
            <Avatar user={creator} size={66} ring />
            <Text numberOfLines={1} style={styles.storyName}>
              {creator.fullName.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeedHeader = () => (
    <View>
      {activeTab === 'Community' ? (
        <>
          {renderShareCard()}
          {creators.length ? renderCreatorShelf() : null}
        </>
      ) : (
        <SectionTitle title="From farmers you follow" />
      )}
    </View>
  );

  const renderFeedEmpty = () => {
    if (list.loading || list.page === 0) {
      return <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />;
    }

    if (list.error) {
      return (
        <EmptyState
          Icon={Sprout}
          title="Couldn't load posts"
          text={list.error}
          button="Try again"
          onPress={refresh}
        />
      );
    }

    if (feedKey === 'following') {
      return (
        <EmptyState
          Icon={UsersRound}
          title="Build your circle"
          text="Follow farmers whose work you like — their updates and reels will gather here."
          button="Find farmers"
          onPress={() => navigation.navigate(COMMUNITY_ROUTES.SEARCH)}
        />
      );
    }

    return (
      <EmptyState
        Icon={Sprout}
        title="Plant the first seed"
        text="Share a photo of your crop, harvest or a tip that worked for you."
        button="Share an update"
        onPress={() => openCreate('post')}
      />
    );
  };

  /* ---------------- tab content ---------------- */

  const renderFeed = () => (
    <Animated.FlatList
      key={feedKey}
      data={list.ids}
      keyExtractor={item => item}
      renderItem={({ item }) => (
        <FeedPostCard
          postId={item}
          isActive={isFocused && item === activeId}
          actions={actions}
          onOpenReel={openReel}
        />
      )}
      ListHeaderComponent={renderFeedHeader()}
      ListEmptyComponent={renderFeedEmpty()}
      ListFooterComponent={
        list.loading && list.ids.length ? (
          <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />
        ) : list.ids.length && list.page >= list.pages ? (
          <View style={styles.endRow}>
            <View style={styles.endLine} />
            <Text style={styles.endText}>🌾 You've seen every update</Text>
            <View style={styles.endLine} />
          </View>
        ) : null
      }
      onEndReachedThreshold={0.6}
      onEndReached={loadMore}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      windowSize={7}
      initialNumToRender={3}
      refreshControl={
        <RefreshControl
          refreshing={list.refreshing}
          onRefresh={refresh}
          tintColor={FIELD.FOREST}
          colors={[FIELD.FOREST]}
          progressViewOffset={headerHeight}
        />
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
      {...listInsetProps}
      contentContainerStyle={[styles.feedContent, listPadding]}
    />
  );

  const reels = lists.reel;

  const renderReelBoard = () => (
    <Animated.FlatList
      key="reel-board"
      data={reels.ids}
      keyExtractor={item => item}
      numColumns={BOARD_COLUMNS}
      columnWrapperStyle={styles.boardRow}
      renderItem={({ item }) => (
        <ReelCard postId={item} onPress={() => openReel(item)} />
      )}
      ListHeaderComponent={
        <Pressable
          style={styles.playAll}
          onPress={() => navigation.navigate(COMMUNITY_ROUTES.REELS)}
        >
          <LinearGradient
            colors={[FIELD.LEAF, FIELD.DEEP]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playAllIcon}
          >
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          </LinearGradient>
          <View style={styles.flex}>
            <Text style={styles.playAllTitle}>Play all reels</Text>
            <Text style={styles.playAllText}>
              Short videos from farms across India
            </Text>
          </View>
          <ChevronRight size={20} color={FIELD.BARK} strokeWidth={2.4} />
        </Pressable>
      }
      ListEmptyComponent={
        reels.loading || reels.page === 0 ? (
          <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />
        ) : (
          <EmptyState
            Icon={Clapperboard}
            title="No field reels yet"
            text="Record a short video of your field and show others what you learned."
            button="Record a reel"
            onPress={() => openCreate('reel')}
          />
        )
      }
      onEndReachedThreshold={0.6}
      onEndReached={loadMore}
      refreshControl={
        <RefreshControl
          refreshing={reels.refreshing}
          onRefresh={refresh}
          tintColor={FIELD.FOREST}
          colors={[FIELD.FOREST]}
          progressViewOffset={headerHeight}
        />
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
      {...listInsetProps}
      contentContainerStyle={[styles.feedContent, listPadding]}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={FIELD.DEEP} />

      <View style={styles.contentContainer}>
        {headerHeight > 0
          ? activeTab === 'Reels'
            ? renderReelBoard()
            : renderFeed()
          : null}
      </View>

      <Animated.View
        style={[
          styles.headerWrap,
          { transform: [{ translateY: headerTranslate }] },
        ]}
        onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        <CommunityHeader
          navigation={navigation}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapse={headerCollapse}
          onCollapsibleLayout={setCollapsible}
        />
      </Animated.View>

      {/* keeps the status bar green while the header is tucked away */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.statusStrip,
          { height: insets.top, opacity: headerCollapse },
        ]}
      />

      <Pressable
        style={styles.fab}
        onPress={() => setCreateSheet(true)}
        accessibilityLabel="Share"
      >
        <View style={styles.fabIcon}>
          <Plus size={18} color={FIELD.FOREST} strokeWidth={3} />
        </View>
        <Text style={styles.fabText}>Share</Text>
      </Pressable>

      <OptionsSheet
        visible={createSheet}
        onClose={() => setCreateSheet(false)}
        title="Share with farmers"
        options={[
          {
            key: 'post',
            label: 'Photo update — photos or videos',
            Icon: Images,
            onPress: () => openCreate('post'),
          },
          {
            key: 'reel',
            label: 'Field reel — short vertical video',
            Icon: Clapperboard,
            onPress: () => openCreate('reel'),
          },
        ]}
      />

      {sheets}
    </SafeAreaView>
  );
}

function SectionTitle({ title, action, onPress }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionMark} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable hitSlop={8} onPress={onPress} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ChevronRight size={14} color={FIELD.FOREST} strokeWidth={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyState({ Icon, title, text, button, onPress }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={30} color={FIELD.FOREST} strokeWidth={1.9} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      <Pressable style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>{button}</Text>
      </Pressable>
    </View>
  );
}

function ReelCard({ postId, onPress }) {
  const post = useSelector(state => state.community.postsById[postId]);

  if (!post) return null;

  const cover = coverOf(post);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.reelCard,
        { height: BOARD_TILE * 1.6 },
        pressed && styles.pressed,
      ]}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} />
      ) : null}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.reelShade}
      >
        <View style={styles.reelViews}>
          <Play size={11} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.reelViewsText}>
            {formatCount(post.viewsCount)}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  statusStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    backgroundColor: FIELD.DEEP,
  },
  feedContent: {
    paddingBottom: 110,
  },
  loader: {
    marginVertical: 40,
  },

  /* share row */
  shareRow: {
    paddingHorizontal: SIDE,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sharePrompt: {
    flex: 1,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  sharePromptText: {
    fontSize: rf(13.5),
    color: FIELD.BARK,
  },
  shareIcon: {
    width: 36,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* reel creators */
  shelf: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  shelfRow: {
    paddingHorizontal: SIDE,
    gap: 14,
  },
  story: {
    width: 70,
    alignItems: 'center',
    gap: 6,
  },
  storyPlus: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: FIELD.FOREST,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: {
    maxWidth: 70,
    fontSize: rf(11.5),
    fontWeight: '500',
    color: FIELD.INK,
  },

  /* sections */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: SIDE,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionMark: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: FIELD.FOREST,
  },
  sectionTitle: {
    flex: 1,
    fontSize: rf(16),
    fontWeight: '800',
    color: FIELD.INK,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: FIELD.FOREST,
  },

  /* empty */
  empty: {
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: FIELD.SPROUT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: FIELD.INK,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: rf(13.5),
    lineHeight: rf(20),
    color: FIELD.BARK,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 10,
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 23,
    backgroundColor: FIELD.FOREST,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: rf(14),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  endRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: SIDE + 10,
    paddingVertical: 24,
  },
  endLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D5DB',
  },
  endText: {
    fontSize: rf(12),
    fontWeight: '600',
    color: FIELD.BARK,
  },

  /* reel board */
  boardRow: {
    gap: BOARD_GAP,
    marginBottom: BOARD_GAP,
  },
  playAll: {
    paddingHorizontal: SIDE,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playAllIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  playAllTitle: {
    fontSize: rf(15),
    fontWeight: '800',
    color: FIELD.INK,
  },
  playAllText: {
    marginTop: 1,
    fontSize: rf(12),
    color: FIELD.BARK,
  },
  reelCard: {
    width: BOARD_TILE,
    backgroundColor: '#1F2937',
  },
  pressed: {
    opacity: 0.85,
  },
  reelShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingTop: 28,
    paddingBottom: 7,
  },
  reelViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reelViewsText: {
    fontSize: rf(11.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* share fab */
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    height: 54,
    paddingLeft: 8,
    paddingRight: 20,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FIELD.FOREST,
    shadowColor: FIELD.DEEP,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  fabIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: rf(14.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
