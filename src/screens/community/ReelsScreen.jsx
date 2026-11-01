import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Camera, Clapperboard } from 'lucide-react-native';
import ReelItem from '../../components/community/social/ReelItem';
import usePostInteractions from '../../components/community/social/usePostInteractions';
import { COLORS, rf } from '../../components/community/theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import { fetchCommunityList } from '../../redux/slices/communitySlice';

/*
 * Full-screen vertical reels player.
 *
 * params:
 *   ids      play exactly these reels (profile grid, saved, search)
 *   startId  reel to open on; without ids the global reels feed follows it
 *   title    header text (default "Reels")
 */
export default function ReelsScreen({ navigation, route }) {
  const { ids: fixedIds, startId, title = 'Reels' } = route.params || {};

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const reels = useSelector(state => state.community.reels);

  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [appActive, setAppActive] = useState(true);
  const [removed, setRemoved] = useState([]);

  const { actions, sheets } = usePostInteractions(navigation, {
    onDeleted: postId => setRemoved(prev => [...prev, postId]),
  });

  const isFeed = !fixedIds;

  useEffect(() => {
    if (isFeed && reels.page === 0) {
      dispatch(fetchCommunityList({ list: 'reel', refresh: true }));
    }
  }, [dispatch, isFeed, reels.page]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state =>
      setAppActive(state === 'active'),
    );

    return () => subscription.remove();
  }, []);

  const ids = useMemo(() => {
    const base = fixedIds
      ? fixedIds
      : startId
      ? [startId, ...reels.ids.filter(id => id !== startId)]
      : reels.ids;

    return base.filter(id => !removed.includes(id));
  }, [fixedIds, startId, reels.ids, removed]);

  const initialIndex = Math.max(fixedIds && startId ? ids.indexOf(startId) : 0, 0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    setActiveIndex(initialIndex);
    // only for the first layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = useCallback(() => setMuted(value => !value), []);

  const renderItem = ({ item, index }) => (
    <ReelItem
      postId={item}
      height={height}
      bottomInset={insets.bottom}
      isActive={index === activeIndex}
      shouldLoad={Math.abs(index - activeIndex) <= 1}
      paused={!isFocused || !appActive}
      muted={muted}
      onToggleMute={toggleMute}
      actions={actions}
    />
  );

  const openCreate = () =>
    navigation.navigate(COMMUNITY_ROUTES.CREATE, { type: 'reel' });

  const showEmpty = ids.length === 0 && !(isFeed && reels.loading);

  return (
    <View
      style={styles.container}
      onLayout={event => setHeight(event.nativeEvent.layout.height)}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />

      {height > 0 && ids.length > 0 ? (
        <FlatList
          data={ids}
          keyExtractor={item => item}
          renderItem={renderItem}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          removeClippedSubviews
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onEndReachedThreshold={2}
          onEndReached={() => {
            if (isFeed) dispatch(fetchCommunityList({ list: 'reel' }));
          }}
          refreshControl={
            isFeed ? (
              <RefreshControl
                refreshing={reels.refreshing}
                onRefresh={() =>
                  dispatch(fetchCommunityList({ list: 'reel', refresh: true }))
                }
                tintColor="#FFFFFF"
                progressViewOffset={insets.top + 40}
              />
            ) : undefined
          }
        />
      ) : null}

      {isFeed && reels.loading && ids.length === 0 ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}

      {showEmpty ? (
        <View style={styles.centerFill}>
          <Clapperboard size={54} color="#FFFFFF" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>
            {reels.error && isFeed ? 'Could not load reels' : 'No reels yet'}
          </Text>
          <Text style={styles.emptyText}>
            {reels.error && isFeed
              ? reels.error
              : 'Share a short video from your farm and inspire other farmers.'}
          </Text>
          <Pressable style={styles.emptyButton} onPress={openCreate}>
            <Camera size={18} color="#FFFFFF" strokeWidth={2.3} />
            <Text style={styles.emptyButtonText}>Create a reel</Text>
          </Pressable>
        </View>
      ) : null}

      {/* header */}
      <View
        style={[styles.header, { paddingTop: insets.top + 6 }]}
        pointerEvents="box-none"
      >
        <Pressable
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft size={rf(24)} color="#FFFFFF" strokeWidth={2.3} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable hitSlop={10} onPress={openCreate} style={styles.headerButton}>
          <Camera size={rf(24)} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
      </View>

      {sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: rf(20),
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
  },
  centerFill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: rf(20),
    fontWeight: '800',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: rf(13.5),
    textAlign: 'center',
    lineHeight: rf(19),
  },
  emptyButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 23,
    backgroundColor: COLORS.DARK_GREEN,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: rf(14),
    fontWeight: '800',
  },
});
