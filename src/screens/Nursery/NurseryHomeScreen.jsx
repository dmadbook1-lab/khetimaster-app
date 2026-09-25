import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowRight,
  Filter,
  Leaf,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  X,
} from 'lucide-react-native';

import {useDispatch, useSelector} from 'react-redux';

import {
  fetchNurseryCategories,
  fetchNurseryPlants,
} from '../../redux/slices/nurserySlice';

import {fetchNurseryCart} from '../../redux/slices/nurseryCartSlice';

// ======================================================
// COLORS
// ======================================================

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F5F7F6';
const WHITE = '#FFFFFF';
const MUTED = '#747B78';
const BORDER = '#E3E8E5';
const LIGHT_GREEN = '#EAF7EF';
const RED = '#D64545';

// ======================================================
// PLANT CARD
// ======================================================

const PlantCard = memo(({item, onPress}) => {
  const image =
    item?.images?.length > 0
      ? item.images[0]
      : null;

  const price = Number(item?.price || 0);

  const quantity = Number(
    item?.quantity || 0,
  );

  const outOfStock = quantity <= 0;

  const plantName =
    item?.name || 'Plant';

  const category =
    item?.category || 'Plants';

  const district =
    item?.location?.district || '';

  const state =
    item?.location?.state || '';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.plantCard}
      onPress={() =>
        onPress(
          item?._id || item?.id,
        )
      }>

      {/* ============================================ */}
      {/* IMAGE */}
      {/* ============================================ */}

      <View style={styles.plantImageContainer}>

        {image ? (
          <Image
            source={{uri: image}}
            style={styles.plantImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={
              styles.noImageContainer
            }>

            <Leaf
              size={34}
              color={GREEN}
            />

            <Text
              style={
                styles.noImageText
              }>
              No Image
            </Text>

          </View>
        )}

        {/* subtle image overlay */}

        <View
          pointerEvents="none"
          style={
            styles.imageBottomOverlay
          }
        />

        {/* ======================================== */}
        {/* STOCK */}
        {/* ======================================== */}

        <View
          style={[
            styles.stockBadge,
            outOfStock &&
              styles.outOfStockBadge,
          ]}>

          <View
            style={[
              styles.stockDot,
              outOfStock &&
                styles.outOfStockDot,
            ]}
          />

          <Text
            style={[
              styles.stockText,
              outOfStock &&
                styles.outOfStockText,
            ]}>

            {quantity > 0
              ? `${quantity} left`
              : 'Out of stock'}

          </Text>

        </View>

        {/* ======================================== */}
        {/* CATEGORY */}
        {/* ======================================== */}

        <View
          style={
            styles.imageCategoryBadge
          }>

          <Leaf
            size={10}
            color={WHITE}
          />

          <Text
            numberOfLines={1}
            style={
              styles.imageCategoryText
            }>
            {category}
          </Text>

        </View>

      </View>

      {/* ============================================ */}
      {/* CONTENT */}
      {/* ============================================ */}

      <View
        style={
          styles.plantInfo
        }>

        {/* NAME */}

        <Text
          numberOfLines={2}
          style={
            styles.plantName
          }>
          {plantName}
        </Text>

        {/* LOCATION */}

        {district ? (
          <View
            style={
              styles.locationRow
            }>

            <MapPin
              size={11}
              color={MUTED}
            />

            <Text
              numberOfLines={1}
              style={
                styles.locationText
              }>

              {district}
              {state
                ? `, ${state}`
                : ''}

            </Text>

          </View>
        ) : (
          <View
            style={
              styles.locationRow
            }>

            <Store
              size={11}
              color={MUTED}
            />

            <Text
              numberOfLines={1}
              style={
                styles.locationText
              }>
              Local nursery seller
            </Text>

          </View>
        )}

        {/* DIVIDER */}

        <View
          style={
            styles.cardDivider
          }
        />

        {/* PRICE */}

        <View
          style={
            styles.priceRow
          }>

          <View>

            <Text
              style={
                styles.priceLabel
              }>
              PRICE
            </Text>

            <Text
              style={
                styles.plantPrice
              }>

              ₹
              {price.toLocaleString(
                'en-IN',
              )}

            </Text>

          </View>

          {/* VIEW BUTTON */}

          <View
            style={
              styles.arrowButton
            }>

            <ArrowRight
              size={16}
              color={GREEN}
            />

          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
});

// ======================================================
// CATEGORY CHIP
// ======================================================

const CategoryChip = memo(
  ({
    item,
    selected,
    onPress,
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.categoryChip,
        selected &&
          styles.selectedCategoryChip,
      ]}
      onPress={() =>
        onPress(item)
      }>

      <Leaf
        size={13}
        color={
          selected
            ? WHITE
            : GREEN
        }
      />

      <Text
        style={[
          styles.categoryChipText,
          selected &&
            styles.selectedCategoryText,
        ]}>
        {item}
      </Text>

    </TouchableOpacity>
  ),
);

// ======================================================
// SCREEN
// ======================================================

const NurseryHomeScreen = ({
  navigation,
}) => {
  const dispatch = useDispatch();

  const {
    plants = [],
    categories = [],
    loading,
    categoriesLoading,
    pagination,
  } = useSelector(
    state => state.nursery,
  );

  const {
    totalItems = 0,
  } = useSelector(
    state => state.nurseryCart,
  );

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    activeCategory,
    setActiveCategory,
  ] = useState('');

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ====================================================
  // LOAD PLANTS
  // ====================================================

  const loadPlants = useCallback(
    async (
      page = 1,
      search = '',
      category = '',
    ) => {
      try {
        await dispatch(
          fetchNurseryPlants({
            search:
              search?.trim() ||
              undefined,

            category:
              category ||
              undefined,

            page,

            limit: 20,
          }),
        ).unwrap();
      } catch (err) {
        console.log(
          'Nursery plants error:',
          err,
        );
      }
    },
    [dispatch],
  );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadPlants(
      1,
      '',
      '',
    );

    dispatch(
      fetchNurseryCategories(),
    );

    dispatch(
      fetchNurseryCart(),
    );
  }, [
    dispatch,
    loadPlants,
  ]);

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh =
    useCallback(async () => {
      setRefreshing(true);

      try {
        await Promise.all([
          loadPlants(
            1,
            searchText,
            activeCategory,
          ),

          dispatch(
            fetchNurseryCategories(),
          ).unwrap(),

          dispatch(
            fetchNurseryCart(),
          ).unwrap(),
        ]);
      } catch (err) {
        console.log(
          'Refresh error:',
          err,
        );
      } finally {
        setRefreshing(false);
      }
    }, [
      dispatch,
      loadPlants,
      searchText,
      activeCategory,
    ]);

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch =
    useCallback(() => {
      loadPlants(
        1,
        searchText,
        activeCategory,
      );
    }, [
      loadPlants,
      searchText,
      activeCategory,
    ]);

  // ====================================================
  // CLEAR SEARCH
  // ====================================================

  const clearSearch =
    useCallback(() => {
      setSearchText('');

      loadPlants(
        1,
        '',
        activeCategory,
      );
    }, [
      loadPlants,
      activeCategory,
    ]);

  // ====================================================
  // CATEGORY
  // ====================================================

  const handleCategoryPress =
    useCallback(
      category => {
        const nextCategory =
          activeCategory === category
            ? ''
            : category;

        setActiveCategory(
          nextCategory,
        );

        loadPlants(
          1,
          searchText,
          nextCategory,
        );
      },
      [
        activeCategory,
        searchText,
        loadPlants,
      ],
    );

  // ====================================================
  // LOAD MORE
  // ====================================================

  const handleLoadMore =
    useCallback(() => {
      if (
        loading ||
        !pagination
      ) {
        return;
      }

      const currentPage =
        Number(
          pagination.page || 1,
        );

      const totalPages =
        Number(
          pagination.pages || 1,
        );

      if (
        currentPage >=
        totalPages
      ) {
        return;
      }

      loadPlants(
        currentPage + 1,
        searchText,
        activeCategory,
      );
    }, [
      loading,
      pagination,
      loadPlants,
      searchText,
      activeCategory,
    ]);

  // ====================================================
  // CART
  // ====================================================

  const openCart =
    useCallback(() => {
      navigation.navigate(
        'NurseryCart',
      );
    }, [navigation]);

  // ====================================================
  // PLANT DETAILS
  // ====================================================

  const openPlantDetails =
    useCallback(
      plantId => {
        navigation.navigate(
          'NurseryPlantDetails',
          {
            plantId,
          },
        );
      },
      [navigation],
    );

  // ====================================================
  // PLANT RENDER
  // ====================================================

  const renderPlant =
    useCallback(
      ({item}) => (
        <PlantCard
          item={item}
          onPress={
            openPlantDetails
          }
        />
      ),
      [openPlantDetails],
    );

  // ====================================================
  // KEY
  // ====================================================

  const keyExtractor =
    useCallback(
      (item, index) =>
        String(
          item?._id ||
            item?.id ||
            index,
        ),
      [],
    );

  // ====================================================
  // CATEGORY RENDER
  // ====================================================

  const renderCategory =
    useCallback(
      ({item}) => (
        <CategoryChip
          item={item}
          selected={
            activeCategory ===
            item
          }
          onPress={
            handleCategoryPress
          }
        />
      ),
      [
        activeCategory,
        handleCategoryPress,
      ],
    );

  // ====================================================
  // HEADER
  // ====================================================

  const ListHeader =
    useMemo(
      () => (
        <View>

          {/* ======================================== */}
          {/* TOP HEADER */}
          {/* ======================================== */}

          <View
            style={
              styles.topHeader
            }>

            <View>

              <Text
                style={
                  styles.smallGreeting
                }>
                KHETIMASTER
              </Text>

              <Text
                style={
                  styles.headerTitle
                }>
                Nursery
              </Text>

            </View>

            <View
              style={
                styles.headerActions
              }>

              {/* ORDERS */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.headerIconButton
                }
                onPress={() =>
                  navigation.navigate(
                    'MyOrders',
                  )
                }>

                <Package
                  size={19}
                  color={DARK}
                />

              </TouchableOpacity>

              {/* MY LISTINGS */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.headerIconButton
                }
                onPress={() =>
                  navigation.navigate(
                    'MyNurseryListings',
                  )
                }>

                <Store
                  size={19}
                  color={DARK}
                />

              </TouchableOpacity>

              {/* CART */}

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.cartButton
                }
                onPress={
                  openCart
                }>

                <ShoppingCart
                  size={19}
                  color={WHITE}
                />

                {totalItems >
                  0 && (
                  <View
                    style={
                      styles.cartBadge
                    }>

                    <Text
                      style={
                        styles.cartBadgeText
                      }>
                      {totalItems >
                      99
                        ? '99+'
                        : totalItems}
                    </Text>

                  </View>
                )}

              </TouchableOpacity>

            </View>

          </View>

          {/* ======================================== */}
          {/* HERO */}
          {/* ======================================== */}

          <View
            style={
              styles.heroCard
            }>

            <View
              style={
                styles.heroContent
              }>

              <View
                style={
                  styles.heroIcon
                }>

                <Leaf
                  size={20}
                  color={WHITE}
                />

              </View>

              <Text
                style={
                  styles.heroTitle
                }>
                Grow something{'\n'}
                beautiful 🌱
              </Text>

              <Text
                style={
                  styles.heroSubtitle
                }>
                Buy from local sellers
                or sell plants from
                your nursery.
              </Text>

              <View
                style={
                  styles.heroButtons
                }>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={
                    styles.heroBuyButton
                  }
                  onPress={() =>
                    loadPlants(
                      1,
                      '',
                      '',
                    )
                  }>

                  <Text
                    style={
                      styles.heroBuyText
                    }>
                    Explore
                  </Text>

                  <ArrowRight
                    size={15}
                    color={GREEN}
                  />

                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={
                    styles.heroSellButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      'SellPlant',
                    )
                  }>

                  <Plus
                    size={15}
                    color={WHITE}
                  />

                  <Text
                    style={
                      styles.heroSellText
                    }>
                    Sell
                  </Text>

                </TouchableOpacity>

              </View>

            </View>

            <View
              style={
                styles.heroCircleOne
              }>

              <Leaf
                size={110}
                color="rgba(255,255,255,0.07)"
              />

            </View>

            <View
              style={
                styles.heroCircleTwo
              }>

              <Leaf
                size={60}
                color="rgba(255,255,255,0.07)"
              />

            </View>

          </View>

          {/* ======================================== */}
          {/* SEARCH */}
          {/* ======================================== */}

          <View
            style={
              styles.searchSection
            }>

            <View
              style={
                styles.searchBox
              }>

              <Search
                size={18}
                color={MUTED}
              />

              <TextInput
                value={searchText}
                onChangeText={
                  setSearchText
                }
                placeholder="Search plants..."
                placeholderTextColor="#9AA19E"
                style={
                  styles.searchInput
                }
                returnKeyType="search"
                onSubmitEditing={
                  handleSearch
                }
              />

              {searchText.length >
                0 && (
                <TouchableOpacity
                  onPress={
                    clearSearch
                  }
                  hitSlop={{
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                  }}>

                  <X
                    size={17}
                    color={MUTED}
                  />

                </TouchableOpacity>
              )}

            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.filterButton
              }
              onPress={
                handleSearch
              }>

              <SlidersHorizontal
                size={18}
                color={WHITE}
              />

            </TouchableOpacity>

          </View>

          {/* ======================================== */}
          {/* CATEGORY TITLE */}
          {/* ======================================== */}

          <View
            style={
              styles.categoryHeader
            }>

            <View>

              <Text
                style={
                  styles.sectionTitle
                }>
                Browse Plants
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }>
                Find the right plant
                for your farm
              </Text>

            </View>

            {activeCategory ? (
              <TouchableOpacity
                onPress={() =>
                  handleCategoryPress(
                    activeCategory,
                  )
                }
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}>

                <Text
                  style={
                    styles.clearFilterText
                  }>
                  Clear
                </Text>

              </TouchableOpacity>
            ) : null}

          </View>

          {/* ======================================== */}
          {/* CATEGORIES */}
          {/* ======================================== */}

          {categoriesLoading ? (
            <View
              style={
                styles.categoryLoading
              }>

              <ActivityIndicator
                size="small"
                color={GREEN}
              />

              <Text
                style={
                  styles.categoryLoadingText
                }>
                Loading categories...
              </Text>

            </View>
          ) : (
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(
                item,
                index,
              ) =>
                `${item}-${index}`
              }
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoryList
              }
              renderItem={
                renderCategory
              }
              removeClippedSubviews
            />
          )}

          {/* ======================================== */}
          {/* RESULT HEADER */}
          {/* ======================================== */}

          <View
            style={
              styles.resultHeader
            }>

            <View>

              <Text
                style={
                  styles.resultTitle
                }>
                Plants
              </Text>

              <Text
                style={
                  styles.resultText
                }>
                {loading
                  ? 'Finding plants...'
                  : `${plants.length} plants available`}
              </Text>

            </View>

            {activeCategory ? (
              <View
                style={
                  styles.activeFilter
                }>

                <Filter
                  size={11}
                  color={GREEN}
                />

                <Text
                  style={
                    styles.activeFilterText
                  }>
                  {activeCategory}
                </Text>

              </View>
            ) : null}

          </View>

        </View>
      ),
      [
        navigation,
        openCart,
        totalItems,
        loadPlants,
        searchText,
        handleSearch,
        clearSearch,
        activeCategory,
        handleCategoryPress,
        categoriesLoading,
        categories,
        renderCategory,
        loading,
        plants.length,
      ],
    );

  // ====================================================
  // FOOTER
  // ====================================================

  const ListFooter =
    useMemo(() => {
      if (
        !loading ||
        plants.length === 0
      ) {
        return null;
      }

      return (
        <View
          style={
            styles.loadMoreContainer
          }>

          <ActivityIndicator
            size="small"
            color={GREEN}
          />

          <Text
            style={
              styles.loadMoreText
            }>
            Loading more...
          </Text>

        </View>
      );
    }, [
      loading,
      plants.length,
    ]);

  // ====================================================
  // EMPTY
  // ====================================================

  const ListEmpty =
    useMemo(() => {
      if (loading) {
        return (
          <View
            style={
              styles.loadingContainer
            }>

            <View
              style={
                styles.loadingCircle
              }>

              <Leaf
                size={28}
                color={GREEN}
              />

            </View>

            <ActivityIndicator
              size="small"
              color={GREEN}
            />

            <Text
              style={
                styles.loadingTitle
              }>
              Finding plants...
            </Text>

            <Text
              style={
                styles.loadingSubtitle
              }>
              Please wait while we
              load the marketplace.
            </Text>

          </View>
        );
      }

      return (
        <View
          style={
            styles.emptyContainer
          }>

          <View
            style={
              styles.emptyIcon
            }>

            <Leaf
              size={40}
              color={GREEN}
            />

          </View>

          <Text
            style={
              styles.emptyTitle
            }>
            No plants found
          </Text>

          <Text
            style={
              styles.emptySubtitle
            }>

            {searchText ||
            activeCategory
              ? 'Try changing your search or category.'
              : 'There are no plants available right now.'}

          </Text>

          {(searchText ||
            activeCategory) && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.resetButton
              }
              onPress={() => {
                setSearchText('');
                setActiveCategory('');

                loadPlants(
                  1,
                  '',
                  '',
                );
              }}>

              <Text
                style={
                  styles.resetButtonText
                }>
                View All Plants
              </Text>

            </TouchableOpacity>
          )}

        </View>
      );
    }, [
      loading,
      searchText,
      activeCategory,
      loadPlants,
    ]);

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
      edges={[
        'top',
        'left',
        'right',
      ]}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
      />

      <FlatList
        data={plants}
        renderItem={renderPlant}
        keyExtractor={keyExtractor}

        // ============================================
        // TWO COLUMN GRID
        // ============================================

        numColumns={2}

        columnWrapperStyle={
          styles.columnWrapper
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.listContent
        }

        ListHeaderComponent={
          ListHeader
        }

        ListEmptyComponent={
          ListEmpty
        }

        ListFooterComponent={
          ListFooter
        }

        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={GREEN}
            colors={[
              GREEN,
            ]}
          />
        }

        onEndReached={
          handleLoadMore
        }

        onEndReachedThreshold={
          0.5
        }

        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}

        removeClippedSubviews={
          Platform.OS ===
          'android'
        }

        updateCellsBatchingPeriod={
          50
        }
      />

    </SafeAreaView>
  );
};

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({

    // ==================================================
    // CONTAINER
    // ==================================================

    container: {
      flex: 1,
      backgroundColor: BG,
    },

    listContent: {
      paddingBottom: 35,
    },

    // ==================================================
    // HEADER
    // ==================================================

    topHeader: {
      backgroundColor: WHITE,
      paddingHorizontal: 18,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },

    smallGreeting: {
      fontSize: 10,
      color: GREEN,
      fontWeight: '800',
      letterSpacing: 1.2,
    },

    headerTitle: {
      marginTop: 2,
      fontSize: 24,
      color: DARK,
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#F2F5F3',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cartButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',

      shadowColor: GREEN,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 4,
    },

    cartBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#E74C3C',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
      borderWidth: 2,
      borderColor: WHITE,
    },

    cartBadgeText: {
      color: WHITE,
      fontSize: 8,
      fontWeight: '900',
    },

    // ==================================================
    // HERO
    // ==================================================

    heroCard: {
      marginHorizontal: 16,
      marginTop: 16,
      minHeight: 195,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: GREEN,
      position: 'relative',

      shadowColor: GREEN,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },

    heroContent: {
      padding: 22,
      zIndex: 2,
    },

    heroIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroTitle: {
      color: WHITE,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 14,
      lineHeight: 28,
      letterSpacing: -0.4,
    },

    heroSubtitle: {
      color:
        'rgba(255,255,255,0.85)',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      maxWidth: 260,
    },

    heroButtons: {
      flexDirection: 'row',
      marginTop: 18,
      gap: 9,
    },

    heroBuyButton: {
      backgroundColor: WHITE,
      height: 40,
      paddingHorizontal: 15,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    heroBuyText: {
      color: GREEN,
      fontSize: 12,
      fontWeight: '900',
    },

    heroSellButton: {
      height: 40,
      paddingHorizontal: 15,
      borderRadius: 12,
      backgroundColor:
        'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.28)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    heroSellText: {
      color: WHITE,
      fontSize: 12,
      fontWeight: '900',
    },

    heroCircleOne: {
      position: 'absolute',
      right: -20,
      top: 20,
      transform: [
        {
          rotate: '-25deg',
        },
      ],
    },

    heroCircleTwo: {
      position: 'absolute',
      right: 30,
      bottom: -5,
      transform: [
        {
          rotate: '25deg',
        },
      ],
    },

    // ==================================================
    // SEARCH
    // ==================================================

    searchSection: {
      paddingHorizontal: 16,
      marginTop: 18,
      flexDirection: 'row',
      gap: 10,
    },

    searchBox: {
      flex: 1,
      height: 50,
      backgroundColor: WHITE,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
    },

    searchInput: {
      flex: 1,
      height: '100%',
      marginLeft: 10,
      color: DARK,
      fontSize: 13,
      padding: 0,
    },

    filterButton: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',

      shadowColor: GREEN,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },

    // ==================================================
    // CATEGORY
    // ==================================================

    categoryHeader: {
      paddingHorizontal: 18,
      marginTop: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    sectionTitle: {
      color: DARK,
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.3,
    },

    sectionSubtitle: {
      color: MUTED,
      fontSize: 11,
      marginTop: 3,
    },

    clearFilterText: {
      color: GREEN,
      fontSize: 12,
      fontWeight: '800',
    },

    categoryLoading: {
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      gap: 8,
    },

    categoryLoadingText: {
      fontSize: 11,
      color: MUTED,
    },

    categoryList: {
      paddingHorizontal: 16,
      paddingTop: 13,
      paddingBottom: 4,
      gap: 8,
    },

    categoryChip: {
      height: 38,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: WHITE,
      borderWidth: 1,
      borderColor: BORDER,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    selectedCategoryChip: {
      backgroundColor: GREEN,
      borderColor: GREEN,

      shadowColor: GREEN,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },

    categoryChipText: {
      color: DARK,
      fontSize: 11,
      fontWeight: '700',
    },

    selectedCategoryText: {
      color: WHITE,
    },

    // ==================================================
    // RESULT HEADER
    // ==================================================

    resultHeader: {
      paddingHorizontal: 18,
      paddingTop: 19,
      paddingBottom: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    resultTitle: {
      color: DARK,
      fontSize: 15,
      fontWeight: '900',
    },

    resultText: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
    },

    activeFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: LIGHT_GREEN,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },

    activeFilterText: {
      color: GREEN,
      fontSize: 10,
      fontWeight: '800',
    },

    // ==================================================
    // GRID
    // ==================================================

    columnWrapper: {
      paddingHorizontal: 16,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    // ==================================================
    // PLANT CARD
    // ==================================================

    plantCard: {
      width: '48%',
      backgroundColor: WHITE,
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 14,

      borderWidth: 1,
      borderColor: '#E5EAE7',

      shadowColor: '#183B27',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.075,
      shadowRadius: 10,
      elevation: 3,
    },

    // ==================================================
    // IMAGE
    // ==================================================

    plantImageContainer: {
      height: 150,
      backgroundColor: '#EEF7F0',
      position: 'relative',
      overflow: 'hidden',
    },

    plantImage: {
      width: '100%',
      height: '100%',
    },

    imageBottomOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 45,
      backgroundColor:
        'rgba(0,0,0,0.08)',
    },

    noImageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    noImageText: {
      marginTop: 5,
      color: MUTED,
      fontSize: 9,
      fontWeight: '600',
    },

    // ==================================================
    // STOCK
    // ==================================================

    stockBadge: {
      position: 'absolute',
      left: 8,
      top: 8,

      backgroundColor:
        'rgba(255,255,255,0.96)',

      paddingHorizontal: 8,
      paddingVertical: 5,

      borderRadius: 9,

      flexDirection: 'row',
      alignItems: 'center',

      gap: 4,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },

    stockDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: GREEN,
    },

    stockText: {
      color: GREEN,
      fontSize: 9,
      fontWeight: '800',
    },

    outOfStockBadge: {
      backgroundColor:
        'rgba(255,255,255,0.96)',
    },

    outOfStockDot: {
      backgroundColor: RED,
    },

    outOfStockText: {
      color: RED,
    },

    // ==================================================
    // CATEGORY BADGE
    // ==================================================

    imageCategoryBadge: {
      position: 'absolute',
      left: 9,
      bottom: 8,

      maxWidth: '72%',

      paddingHorizontal: 8,
      paddingVertical: 5,

      borderRadius: 8,

      backgroundColor:
        'rgba(21,148,71,0.92)',

      flexDirection: 'row',
      alignItems: 'center',

      gap: 4,
    },

    imageCategoryText: {
      color: WHITE,
      fontSize: 8,
      fontWeight: '800',
    },

    // ==================================================
    // CARD CONTENT
    // ==================================================

    plantInfo: {
      paddingHorizontal: 12,
      paddingTop: 11,
      paddingBottom: 12,
    },

    plantName: {
      color: DARK,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 17,
      letterSpacing: -0.15,
      minHeight: 34,
    },

    // ==================================================
    // LOCATION
    // ==================================================

    locationRow: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    locationText: {
      flex: 1,
      color: MUTED,
      fontSize: 9,
      fontWeight: '600',
    },

    // ==================================================
    // DIVIDER
    // ==================================================

    cardDivider: {
      height: 1,
      backgroundColor: '#EDF0EE',
      marginTop: 10,
      marginBottom: 9,
    },

    // ==================================================
    // PRICE
    // ==================================================

    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    priceLabel: {
      color: '#9AA19E',
      fontSize: 7,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 1,
    },

    plantPrice: {
      color: GREEN,
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.3,
    },

    arrowButton: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: LIGHT_GREEN,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ==================================================
    // LOADING
    // ==================================================

    loadingContainer: {
      minHeight: 350,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },

    loadingCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: LIGHT_GREEN,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
    },

    loadingTitle: {
      marginTop: 12,
      color: DARK,
      fontSize: 16,
      fontWeight: '800',
    },

    loadingSubtitle: {
      marginTop: 5,
      color: MUTED,
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 18,
    },

    loadMoreContainer: {
      height: 65,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },

    loadMoreText: {
      color: MUTED,
      fontSize: 11,
    },

    // ==================================================
    // EMPTY
    // ==================================================

    emptyContainer: {
      minHeight: 350,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 35,
    },

    emptyIcon: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: LIGHT_GREEN,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyTitle: {
      marginTop: 17,
      color: DARK,
      fontSize: 19,
      fontWeight: '900',
    },

    emptySubtitle: {
      marginTop: 7,
      color: MUTED,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
    },

    resetButton: {
      marginTop: 18,
      backgroundColor: GREEN,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },

    resetButtonText: {
      color: WHITE,
      fontSize: 12,
      fontWeight: '800',
    },
  });

export default NurseryHomeScreen;