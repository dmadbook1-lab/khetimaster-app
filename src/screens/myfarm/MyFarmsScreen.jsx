import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Plus,
  RefreshCw,
} from 'lucide-react-native';

import {useDispatch, useSelector} from 'react-redux';

import BottomTabBar from '../../common/BottomTabBar';

import MyFarmsHeader from '../../components/myfarms/MyFarmsHeader';
import FarmSearchBar from '../../components/myfarms/FarmSearchBar';
import FarmOverviewCard from '../../components/myfarms/FarmOverviewCard';
import FarmFilterChips from '../../components/myfarms/FarmFilterChips';
import FarmGridCard from '../../components/myfarms/FarmGridCard';
import AddFarmGridCard from '../../components/myfarms/AddFarmGridCard';

import {
  loadMyFarms,
  selectFarmFields,
  selectFarmFieldsLoading,
  selectFarmFieldError,
} from '../../redux/slices/farmFieldSlice';

import {selectUser} from '../../redux/slices/authSlice';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#98A2B3';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

export default function MyFarmsScreen({
  navigation,
}) {
  const dispatch = useDispatch();

  /*
  |--------------------------------------------------------------------------
  | AUTH USER
  |--------------------------------------------------------------------------
  */

  const user = useSelector(selectUser);

  const userId =
    user?._id ||
    user?.id ||
    user?.userId;

  /*
  |--------------------------------------------------------------------------
  | FARM REDUX
  |--------------------------------------------------------------------------
  */

  const farms = useSelector(
    selectFarmFields,
  );

  const loading = useSelector(
    selectFarmFieldsLoading,
  );

  const error = useSelector(
    selectFarmFieldError,
  );

  /*
  |--------------------------------------------------------------------------
  | LOCAL UI STATE
  |--------------------------------------------------------------------------
  */

  const [
    activeFilter,
    setActiveFilter,
  ] = useState('All');

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER FARMS
  |--------------------------------------------------------------------------
  */

  const fetchFarms = useCallback(
    async () => {
      if (!userId) {
        return;
      }

      try {
        await dispatch(
          loadMyFarms(userId),
        ).unwrap();
      } catch (err) {
        console.log(
          '[MyFarms] Failed to load farms:',
          err,
        );
      }
    },
    [dispatch, userId],
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  /*
  |--------------------------------------------------------------------------
  | PULL TO REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh =
    useCallback(async () => {
      if (!userId) {
        return;
      }

      setRefreshing(true);

      try {
        await dispatch(
          loadMyFarms(userId),
        ).unwrap();
      } catch (err) {
        console.log(
          '[MyFarms] Refresh failed:',
          err,
        );
      } finally {
        setRefreshing(false);
      }
    }, [dispatch, userId]);

  /*
  |--------------------------------------------------------------------------
  | FILTER + SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredFarms = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return farms.filter(farm => {
      /*
      |--------------------------------------------------------------------------
      | SEARCH
      |--------------------------------------------------------------------------
      */

      const farmName =
        String(
          farm?.fieldName ||
            farm?.farmName ||
            '',
        ).toLowerCase();

      const cropName =
        String(
          farm?.cropName || '',
        ).toLowerCase();

      const variety =
        String(
          farm?.variety || '',
        ).toLowerCase();

      const matchesSearch =
        !query ||
        farmName.includes(query) ||
        cropName.includes(query) ||
        variety.includes(query);

      if (!matchesSearch) {
        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | FILTER
      |--------------------------------------------------------------------------
      |
      | We derive the UI filter from the actual
      | isBarrenLand value stored by the backend.
      |
      */

      if (
        activeFilter ===
        'Barren'
      ) {
        return Boolean(
          farm?.isBarrenLand,
        );
      }

      if (
        activeFilter ===
        'Active'
      ) {
        return !Boolean(
          farm?.isBarrenLand,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EXISTING FILTER COMPATIBILITY
      |--------------------------------------------------------------------------
      */

      if (
        activeFilter ===
        'Healthy'
      ) {
        return !Boolean(
          farm?.isBarrenLand,
        );
      }

      if (
        activeFilter ===
        'Attention'
      ) {
        return Boolean(
          farm?.isBarrenLand,
        );
      }

      return true;
    });
  }, [
    farms,
    searchQuery,
    activeFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FILTER OPTIONS
  |--------------------------------------------------------------------------
  */

  const filterOptions =
    useMemo(() => {
      return [
        'All',
        'Active',
        'Barren',
      ];
    }, []);

  /*
  |--------------------------------------------------------------------------
  | ADD FARM
  |--------------------------------------------------------------------------
  */

  const handleAddFarm =
    useCallback(() => {
      navigation.navigate(
        'MapYourFarm',
      );
    }, [navigation]);

  /*
  |--------------------------------------------------------------------------
  | NO USER
  |--------------------------------------------------------------------------
  */

  if (!userId) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View
          style={styles.centerState}
        >
          <Text
            style={styles.stateTitle}
          >
            Login required
          </Text>

          <Text
            style={styles.stateText}
          >
            Please log in to view your
            farms.
          </Text>
        </View>

        <BottomTabBar
          navigation={navigation}
          active="MyFarms"
        />
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SCREEN
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <MyFarmsHeader />

        <FarmSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FarmOverviewCard
          farms={farms}
        />

        <FarmFilterChips
          filters={filterOptions}
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        <View
          style={styles.sectionRow}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              {activeFilter === 'All'
                ? 'All Farms'
                : `${activeFilter} Farms`}
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              {searchQuery
                ? `${filteredFarms.length} matching farms`
                : `${farms.length} registered farms`}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <RefreshCw
              size={17}
              color={GREEN}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        {loading &&
        farms.length === 0 ? (
          <View
            style={styles.loadingState}
          >
            <ActivityIndicator
              size="large"
              color={GREEN}
            />

            <Text
              style={styles.loadingText}
            >
              Loading your farms...
            </Text>
          </View>
        ) : error &&
          farms.length === 0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyTitle}
            >
              Couldn't load farms
            </Text>

            <Text
              style={styles.emptyText}
            >
              {error}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={fetchFarms}
              style={styles.retryButton}
            >
              <RefreshCw
                size={17}
                color="#FFFFFF"
                strokeWidth={2.4}
              />

              <Text
                style={styles.retryText}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredFarms.length ===
          0 ? (
          <View
            style={styles.emptyCard}
          >
            <View
              style={styles.emptyIcon}
            >
              <Plus
                size={24}
                color={GREEN}
                strokeWidth={2.5}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              {farms.length === 0
                ? 'No farms added yet'
                : 'No matching farms'}
            </Text>

            <Text
              style={styles.emptyText}
            >
              {farms.length === 0
                ? 'Add your first farm by drawing its boundary on the map.'
                : 'Try another farm name, crop, or filter.'}
            </Text>

            {farms.length === 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddFarm}
                style={styles.retryButton}
              >
                <Plus
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />

                <Text
                  style={styles.retryText}
                >
                  Add Your Farm
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredFarms.map(
              (farm, index) => (
                <FarmGridCard
                  key={
                    farm?._id ||
                    farm?.id ||
                    `farm-${index}`
                  }
                  farm={farm}
                  navigation={
                    navigation
                  }
                />
              ),
            )}

            <AddFarmGridCard
              onPress={
                handleAddFarm
              }
            />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleAddFarm}
        style={styles.floatingAdd}
      >
        <Plus
          size={30}
          color="#FFFFFF"
          strokeWidth={2.8}
        />
      </TouchableOpacity>

      <BottomTabBar
        navigation={navigation}
        active="MyFarms"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingHorizontal:
      width * 0.055,
    paddingTop: 16,
    paddingBottom: 140,
  },

  sectionRow: {
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  sectionTitle: {
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.35,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '700',
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between',
    rowGap: 16,
  },

  floatingAdd: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 12,
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  stateTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: DARK,
  },

  stateText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    fontWeight: '600',
  },

  loadingState: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },

  emptyCard: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '900',
    color: DARK,
  },

  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
    color: '#64748B',
    fontWeight: '600',
  },

  retryButton: {
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});