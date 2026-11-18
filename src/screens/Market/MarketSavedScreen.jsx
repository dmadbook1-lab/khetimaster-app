import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Bookmark } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import ListingCard from '../../components/market/ListingCard';
import { EmptyState, LoadingState } from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  fetchSavedMarketListings,
  toggleSaveMarketListing,
} from '../../redux/slices/marketSlice';
import {useTranslation} from 'react-i18next';

export default function MarketSavedScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const { saved, savedLoading, savedError } = useSelector(
    state => state.market,
  );

  const load = useCallback(
    () => dispatch(fetchSavedMarketListings()),
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleToggleSave = useCallback(
    listing =>
      dispatch(
        toggleSaveMarketListing({
          listingId: listing._id,
          save: !listing.isSaved,
        }),
      ),
    [dispatch],
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={savedLoading && !saved.length ? [] : saved}
        keyExtractor={item => item._id}
        ListHeaderComponent={
          <MarketHero
            compact
            gradient="forest"
            onBack={() => navigation.goBack()}
            eyebrow={t('marketSaved.wishlist')}
            title={t('marketSaved.savedListings')}
            subtitle={
              saved.length
                ? t('marketSaved.youreKeepingAnEyeOn', {length: saved.length, v2: saved.length === 1 ? 'item' : 'items'})
                : t('marketSaved.bookmarkListingsToCompareThem')
            }
            style={styles.hero}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ListingCard
              listing={item}
              showStatus={item.status !== 'ACTIVE'}
              onToggleSave={handleToggleSave}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.LISTING_DETAILS, {
                  listingId: item._id,
                })
              }
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={savedLoading && saved.length > 0}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          savedLoading ? (
            <LoadingState />
          ) : savedError ? (
            <EmptyState
              title={t('marketSaved.couldntLoadSavedListings')}
              message={savedError}
              actionLabel={t('marketSaved.tryAgain')}
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Bookmark size={30} color={C.green} />}
              title={t('marketSaved.nothingSavedYet')}
              message={t('marketSaved.tapTheBookmarkOnAny')}
              actionLabel={t('marketSaved.browseMarket')}
              onAction={() => navigation.goBack()}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  hero: { marginBottom: 16 },
  item: { paddingHorizontal: 16 },
});
