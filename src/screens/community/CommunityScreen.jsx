import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronRight,
  Clapperboard,
  Images,
  Play,
  Plus,
  Sprout,
  UsersRound,
} from 'lucide-react-native';
import CommunityHero, {
  CommunitySectionTabs,
} from '../../components/community/CommunityHeader';
import { TopInset } from '../../components/market/MarketHero';
import Avatar from '../../components/community/social/Avatar';
import FeedPostCard from '../../components/community/social/FeedPostCard';
import OptionsSheet from '../../components/community/social/OptionsSheet';
import usePostInteractions from '../../components/community/social/usePostInteractions';
import {
  CARD_GUTTER,
  CARD_RADIUS,
  CARD_SHADOW,
  FIELD,
  rf,
} from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import {
  fetchCommunityList,
  fetchReelCreators,
} from '../../redux/slices/communitySlice';
import {useTranslation} from 'react-i18next';

const INNER = 14;

// Rows ahead of the posts: the pinned tabs, then composer or empty state
const TABS_ROW = '__tabs';
const FEED_TOP_ROW = '__feedTop';
const isPost = id => id !== TABS_ROW && id !== FEED_TOP_ROW;

const LIST_BY_TAB = {
  Community: 'all',
  Following: 'following',
  Reels: 'reel',
};

export default function CommunityScreen({ navigation, route }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const me = useSelector(state => state.auth.user);
  const creators = useSelector(state => state.community.creators);
  const feedList = useSelector(state => state.community.feed);
  const followingList = useSelector(state => state.community.followingFeed);
  const reelList = useSelector(state => state.community.reels);
  const lists = { all: feedList, following: followingList, reel: reelList };

  const [activeTab, setActiveTab] = useState(route.params?.tab || 'Community');

  const [activeId, setActiveId] = useState(null);
  const [createSheet, setCreateSheet] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggleMute = useCallback(() => setMuted(value => !value), []);

  const { actions, sheets } = usePostInteractions(navigation);

  const listKey = LIST_BY_TAB[activeTab];
  const list = lists[listKey];

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

  const listPage = list.page;

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
    const firstPost = viewableItems.find(({ item }) => isPost(item));
    setActiveId(firstPost ? firstPost.item : null);
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

  const renderComposer = () => (
    <View style={styles.composer}>
      <View style={styles.composerTop}>
        <Avatar
          user={me && { ...me, _id: me.id }}
          size={44}
          onPress={() => navigation.navigate(COMMUNITY_ROUTES.PROFILE)}
        />
        <Pressable
          style={styles.composerPrompt}
          onPress={() => openCreate('post')}
          accessibilityRole="button"
        >
          <Text numberOfLines={1} style={styles.composerPromptText}>
            {firstName
              ? t('community.whatsNewInYourField2', {firstName})
              : t('community.whatsNewInYourField')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.composerActions}>
        <ComposerAction
          Icon={Images}
          color={FIELD.FOREST}
          label={t('community.photoOrVideo')}
          onPress={() => openCreate('post')}
        />
        <View style={styles.composerDivider} />
        <ComposerAction
          Icon={Clapperboard}
          color={FIELD.WHEAT}
          label={t('community.fieldReel')}
          onPress={() => openCreate('reel')}
        />
      </View>
    </View>
  );

  const renderCreatorShelf = () => (
    <View style={styles.shelf}>
      <Text style={styles.shelfTitle}>{t('community.latestFieldReels')}</Text>
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
              size={60}
              ring={Boolean(myCreator)}
            />
            <Pressable
              style={styles.storyPlus}
              onPress={() => openCreate('reel')}
              accessibilityRole="button"
              accessibilityLabel={t('community.recordAReel')}
            >
              <Plus size={12} color="#FFFFFF" strokeWidth={3.2} />
            </Pressable>
          </View>
          <Text numberOfLines={1} style={styles.storyName}>
            {t('community.yourReel')}
          </Text>
        </Pressable>

        {otherCreators.map(creator => (
          <Pressable
            key={creator._id}
            style={styles.story}
            onPress={() => openReel(creator.latestReel)}
          >
            <Avatar user={creator} size={60} ring />
            <Text numberOfLines={1} style={styles.storyName}>
              {creator.fullName.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderPlayAll = () => (
    <Pressable
      style={styles.playAll}
      onPress={() => navigation.navigate(COMMUNITY_ROUTES.REELS)}
      accessibilityRole="button"
    >
      <View style={styles.playAllIcon}>
        <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
      </View>
      <View style={styles.flex}>
        <Text style={styles.playAllTitle}>{t('community.watchFullScreen')}</Text>
        <Text style={styles.playAllText}>
          {t('community.shortVideosFromFarmsAcross')}
        </Text>
      </View>
      <ChevronRight size={20} color={FIELD.BARK} strokeWidth={2.2} />
    </Pressable>
  );

  const renderFeedHeader = () => {
    if (activeTab === 'Reels') {
      return renderPlayAll();
    }

    if (activeTab === 'Following') {
      return null;
    }

    return (
      <>
        {renderComposer()}
        {creators.length ? renderCreatorShelf() : null}
      </>
    );
  };

  const renderFeedEmpty = () => {
    if (list.loading || list.page === 0) {
      return <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />;
    }

    if (list.error) {
      return (
        <EmptyState
          Icon={Sprout}
          title={t('community.couldntLoadPosts')}
          text={list.error}
          button={t('common.try_again')}
          onPress={refresh}
        />
      );
    }

    if (listKey === 'following') {
      return (
        <EmptyState
          Icon={UsersRound}
          title={t('community.buildYourCircle')}
          text={t('community.followFarmersWhoseWorkYou')}
          button={t('community.findFarmers')}
          onPress={() => navigation.navigate(COMMUNITY_ROUTES.SEARCH)}
        />
      );
    }

    if (listKey === 'reel') {
      return (
        <EmptyState
          Icon={Clapperboard}
          title={t('community.noFieldReelsYet')}
          text={t('community.recordAShortVideoOf')}
          button="Record a reel"
          onPress={() => openCreate('reel')}
        />
      );
    }

    return (
      <EmptyState
        Icon={Sprout}
        title={t('community.plantTheFirstSeed')}
        text={t('community.shareAPhotoOfYour')}
        button={t('community.shareAnUpdate')}
        onPress={() => openCreate('post')}
      />
    );
  };

  /* ---------------- tab content ---------------- */

  const renderRow = ({ item }) => {
    if (item === TABS_ROW) {
      return (
        <CommunitySectionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      );
    }

    if (item === FEED_TOP_ROW) {
      return (
        <>
          {renderFeedHeader()}
          {list.ids.length ? null : renderFeedEmpty()}
        </>
      );
    }

    return (
      <FeedPostCard
        postId={item}
        isActive={isFocused && item === activeId}
        actions={actions}
        onOpenReel={openReel}
        muted={muted}
        onToggleMute={toggleMute}
      />
    );
  };

  const renderFeed = () => (
    <FlatList
      key={listKey}
      data={[TABS_ROW, FEED_TOP_ROW, ...list.ids]}
      keyExtractor={item => item}
      renderItem={renderRow}
      ListHeaderComponent={<CommunityHero navigation={navigation} />}
      // the hero takes index 0, so the tabs row is index 1
      stickyHeaderIndices={[1]}
      ListFooterComponent={
        list.loading && list.ids.length ? (
          <ActivityIndicator style={styles.loader} color={FIELD.FOREST} />
        ) : list.ids.length && list.page >= list.pages ? (
          <Text style={styles.endText}>{t('community.youreAllCaughtUp')}</Text>
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
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.feedContent}
    />
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <TopInset />

      <View style={styles.flex}>{renderFeed()}</View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setCreateSheet(true)}
        accessibilityRole="button"
        accessibilityLabel={t('community.share')}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.6} />
      </Pressable>

      <OptionsSheet
        visible={createSheet}
        onClose={() => setCreateSheet(false)}
        title={t('community.shareWithFarmers')}
        options={[
          {
            key: 'post',
            label: t('community.photoUpdatePhotosOrVideos'),
            Icon: Images,
            onPress: () => openCreate('post'),
          },
          {
            key: 'reel',
            label: t('community.fieldReelShortVerticalVideo'),
            Icon: Clapperboard,
            onPress: () => openCreate('reel'),
          },
        ]}
      />

      {sheets}
    </SafeAreaView>
  );
}

function ComposerAction({ Icon, color, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.composerAction,
        pressed && styles.composerActionPressed,
      ]}
      accessibilityRole="button"
    >
      <Icon size={rf(18)} color={color} strokeWidth={2.1} />
      <Text style={styles.composerActionText}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ Icon, title, text, button, onPress }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={28} color={FIELD.FOREST} strokeWidth={1.9} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      <Pressable style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>{button}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FIELD.SOIL,
  },
  flex: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 96,
  },
  loader: {
    marginVertical: 40,
  },

  /* composer */
  composer: {
    marginHorizontal: CARD_GUTTER,
    marginBottom: 14,
    paddingTop: 14,
    borderRadius: CARD_RADIUS,
    backgroundColor: FIELD.CARD,
    ...CARD_SHADOW,
  },
  composerTop: {
    paddingHorizontal: INNER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  composerPrompt: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
  },
  composerPromptText: {
    fontSize: rf(14),
    color: FIELD.BARK,
  },
  composerActions: {
    marginTop: 10,
    marginHorizontal: INNER,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E9EF',
  },
  composerAction: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  composerActionPressed: {
    backgroundColor: '#EEF2F6',
  },
  composerActionText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: FIELD.INK,
  },
  composerDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: '#E3E9EF',
  },

  /* reel creators */
  shelf: {
    marginHorizontal: CARD_GUTTER,
    marginBottom: 14,
    paddingVertical: 14,
    borderRadius: CARD_RADIUS,
    backgroundColor: FIELD.CARD,
    ...CARD_SHADOW,
  },
  shelfTitle: {
    marginBottom: 12,
    paddingHorizontal: INNER,
    fontSize: rf(14),
    fontWeight: '700',
    color: FIELD.INK,
  },
  shelfRow: {
    paddingHorizontal: INNER,
    gap: 14,
  },
  story: {
    width: 66,
    alignItems: 'center',
    gap: 6,
  },
  storyPlus: {
    position: 'absolute',
    right: -1,
    bottom: -1,
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
    maxWidth: 66,
    fontSize: rf(11.5),
    color: FIELD.INK,
  },

  /* reels tab */
  playAll: {
    marginHorizontal: CARD_GUTTER,
    marginBottom: 14,
    paddingHorizontal: INNER,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: CARD_RADIUS,
    backgroundColor: FIELD.CARD,
    ...CARD_SHADOW,
  },
  playAllIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FIELD.FOREST,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  playAllTitle: {
    fontSize: rf(14.5),
    fontWeight: '700',
    color: FIELD.INK,
  },
  playAllText: {
    marginTop: 1,
    fontSize: rf(12),
    color: FIELD.BARK,
  },

  /* empty */
  empty: {
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: FIELD.SPROUT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: rf(18),
    fontWeight: '700',
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
    paddingHorizontal: 26,
    borderRadius: 23,
    backgroundColor: FIELD.DEEP,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  endText: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: rf(12.5),
    color: FIELD.BARK,
  },

  /* share fab */
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIELD.WHEAT,
    shadowColor: FIELD.DEEP,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: {
    backgroundColor: FIELD.WHEAT_DEEP,
  },
});
