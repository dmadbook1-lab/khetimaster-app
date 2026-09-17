import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import {
  fetchLatestArticles,
  setSelectedCategory,
} from '../../redux/slices/articleSlice';

const CATEGORIES = [
  {label: 'All', value: null},
  {label: 'Crops', value: 'crops'},
  {label: 'Technology', value: 'technology'},
  {label: 'Markets', value: 'markets'},
  {label: 'Weather', value: 'weather'},
  {label: 'Fisheries', value: 'fisheries'},
  {label: 'Livestock', value: 'livestock'},
];

const SOURCE_COLORS = {
  PIB: '#075A53',
  ICAR: '#344E41',
  FAO: '#5A7C6B',
};

const FALLBACK_COLOR = '#344E41';

/* ---------------------------------------------------------
   DATE
--------------------------------------------------------- */

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ---------------------------------------------------------
   IMAGE
--------------------------------------------------------- */

function ArticleImage({uri, featured = false}) {
  const [imageError, setImageError] = useState(false);

  if (!uri || imageError) {
    return (
      <View
        style={[
          styles.imageFallback,
          featured && styles.featuredImageFallback,
        ]}>

        <Text style={styles.imageFallbackIcon}>
          🌾
        </Text>

        <Text style={styles.imageFallbackText}>
          KhetiMaster
        </Text>

      </View>
    );
  }

  return (
    <Image
      source={{uri}}
      style={[
        styles.articleImage,
        featured && styles.featuredArticleImage,
      ]}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
}

/* ---------------------------------------------------------
   CATEGORY CHIP
--------------------------------------------------------- */

function CategoryChip({
  item,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.categoryChip,
        selected && styles.categoryChipActive,
      ]}>

      <Text
        style={[
          styles.categoryText,
          selected && styles.categoryTextActive,
        ]}>
        {item.label}
      </Text>

    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------
   ARTICLE CARD
--------------------------------------------------------- */

function ArticleCard({
  article,
  onPress,
}) {
  const sourceColor =
    SOURCE_COLORS[article?.source] ||
    FALLBACK_COLOR;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.articleCard}>

      <ArticleImage
        uri={article?.imageUrl}
      />

      <View style={styles.articleContent}>

        <View style={styles.articleMetaRow}>

          <View
            style={[
              styles.sourceBadge,
              {
                backgroundColor: `${sourceColor}15`,
              },
            ]}>

            <View
              style={[
                styles.sourceDot,
                {
                  backgroundColor: sourceColor,
                },
              ]}
            />

            <Text
              style={[
                styles.sourceText,
                {
                  color: sourceColor,
                },
              ]}>
              {article?.source || 'SOURCE'}
            </Text>

          </View>

          <Text style={styles.dateText}>
            {formatDate(article?.publishedAt)}
          </Text>

        </View>

        <Text
          numberOfLines={2}
          style={styles.articleTitle}>
          {article?.title || 'Agriculture Update'}
        </Text>

        {!!article?.description && (
          <Text
            numberOfLines={3}
            style={styles.articleDescription}>
            {article.description}
          </Text>
        )}

        <View style={styles.readMoreRow}>

          <Text style={styles.readMoreText}>
            Read More
          </Text>

          <Text style={styles.readMoreArrow}>
            →
          </Text>

        </View>

      </View>

    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------
   FEATURED ARTICLE
--------------------------------------------------------- */

function FeaturedArticle({
  article,
  onPress,
}) {
  if (!article) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.featuredCard}>

      <ArticleImage
        uri={article.imageUrl}
        featured
      />

      <View style={styles.featuredOverlay}>

        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>
            LATEST
          </Text>
        </View>

        <View>

          <View style={styles.featuredMetaRow}>

            <Text style={styles.featuredSource}>
              {article.source}
            </Text>

            <View style={styles.featuredMetaDot} />

            <Text style={styles.featuredDate}>
              {formatDate(article.publishedAt)}
            </Text>

          </View>

          <Text
            numberOfLines={3}
            style={styles.featuredTitle}>
            {article.title}
          </Text>

          <View style={styles.featuredReadMore}>

            <Text style={styles.featuredReadMoreText}>
              Read Article
            </Text>

            <Text style={styles.featuredArrow}>
              →
            </Text>

          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------
   LOADING CARD
--------------------------------------------------------- */

function LoadingCard() {
  return (
    <View style={styles.loadingCard}>

      <View style={styles.loadingImage} />

      <View style={styles.loadingContent}>

        <View style={styles.loadingSmall} />

        <View style={styles.loadingLarge} />

        <View style={styles.loadingMedium} />

        <View style={styles.loadingMediumShort} />

      </View>

    </View>
  );
}

/* ---------------------------------------------------------
   NEWS HEADER
--------------------------------------------------------- */

function NewsHeader({
  navigation,
  selectedCategory,
  onCategoryPress,
  featuredArticle,
  remainingArticles,
  loading,
  onArticlePress,
}) {
  return (
    <>
      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>

          <Text style={styles.backIcon}>
            ‹
          </Text>

        </TouchableOpacity>

        <View style={styles.headerTextContainer}>

          <Text style={styles.headerTitle}>
            Agriculture News
          </Text>

          <Text style={styles.headerSubtitle}>
            Latest updates for Indian farmers
          </Text>

        </View>

        <View style={styles.headerIcon}>

          <Text style={styles.headerIconText}>
            📰
          </Text>

        </View>

      </View>

      {/* CATEGORIES */}

      <View style={styles.categoriesContainer}>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item =>
            item.value || 'all'
          }
          renderItem={({item}) => (
            <CategoryChip
              item={item}
              selected={
                selectedCategory === item.value
              }
              onPress={() =>
                onCategoryPress(item.value)
              }
            />
          )}
          contentContainerStyle={
            styles.categoriesContent
          }
        />

      </View>

      {/* FEATURED */}

      {!loading && featuredArticle && (
        <View style={styles.featuredSection}>

          <Text style={styles.sectionTitle}>
            Latest Update
          </Text>

          <FeaturedArticle
            article={featuredArticle}
            onPress={() =>
              onArticlePress(featuredArticle)
            }
          />

        </View>
      )}

      {/* MORE UPDATES */}

      {!loading &&
        remainingArticles.length > 0 && (
          <View style={styles.latestHeader}>

            <Text style={styles.sectionTitle}>
              More Updates
            </Text>

            <Text style={styles.articleCount}>
              {remainingArticles.length} articles
            </Text>

          </View>
        )}
    </>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function AgricultureNewsScreen({
  navigation,
}) {
  const dispatch = useDispatch();

  const {
    articles = [],
    loading = false,
    refreshing = false,
    error = null,
    selectedCategory = null,
  } = useSelector(state => state.articles);

  /* -------------------------------------------------------
     INITIAL FETCH
  ------------------------------------------------------- */

  useEffect(() => {
    dispatch(
      fetchLatestArticles({
        limit: 50,
        category: selectedCategory,
      }),
    );
  }, [
    dispatch,
    selectedCategory,
  ]);

  /* -------------------------------------------------------
     REFRESH
  ------------------------------------------------------- */

  const handleRefresh = useCallback(() => {
    dispatch(
      fetchLatestArticles({
        limit: 50,
        category: selectedCategory,
        isRefresh: true,
      }),
    );
  }, [
    dispatch,
    selectedCategory,
  ]);

  /* -------------------------------------------------------
     CATEGORY
  ------------------------------------------------------- */

  const handleCategoryPress =
    useCallback(
      category => {
        if (
          category === selectedCategory
        ) {
          return;
        }

        dispatch(
          setSelectedCategory(category),
        );
      },
      [
        dispatch,
        selectedCategory,
      ],
    );

  /* -------------------------------------------------------
     ARTICLE DETAILS
  ------------------------------------------------------- */

  const handleArticlePress =
    useCallback(
      article => {
        if (!article) {
          return;
        }

        navigation.navigate(
          'ArticleDetails',
          {
            article,
          },
        );
      },
      [navigation],
    );

  /* -------------------------------------------------------
     FEATURED
  ------------------------------------------------------- */

  const featuredArticle = useMemo(
    () => articles?.[0] || null,
    [articles],
  );

  /* -------------------------------------------------------
     REMAINING
  ------------------------------------------------------- */

  const remainingArticles =
    useMemo(
      () =>
        articles?.slice(1) || [],
      [articles],
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    articles.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.header}>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}>

            <Text style={styles.backIcon}>
              ‹
            </Text>

          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }>

            <Text
              style={styles.headerTitle}>
              Agriculture News
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Latest updates for Indian farmers
            </Text>

          </View>

          <View style={styles.headerIcon}>

            <Text
              style={
                styles.headerIconText
              }>
              📰
            </Text>

          </View>

        </View>

        <View
          style={
            styles.categoriesContainer
          }>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={item =>
              item.value || 'all'
            }
            renderItem={() => (
              <View
                style={
                  styles.categorySkeleton
                }
              />
            )}
            contentContainerStyle={
              styles.categoriesContent
            }
          />

        </View>

        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={item =>
            String(item)
          }
          renderItem={() => (
            <LoadingCard />
          )}
          contentContainerStyle={
            styles.loadingList
          }
          showsVerticalScrollIndicator={
            false
          }
        />

      </SafeAreaView>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    articles.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.header}>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}>

            <Text style={styles.backIcon}>
              ‹
            </Text>

          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }>

            <Text
              style={styles.headerTitle}>
              Agriculture News
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Latest updates for Indian farmers
            </Text>

          </View>

          <View style={styles.headerIcon}>

            <Text
              style={
                styles.headerIconText
              }>
              📰
            </Text>

          </View>

        </View>

        <View
          style={
            styles.emptyContainer
          }>

          <View
            style={
              styles.emptyIconContainer
            }>

            <Text style={styles.emptyIcon}>
              ⚠️
            </Text>

          </View>

          <Text style={styles.emptyTitle}>
            Couldn't load news
          </Text>

          <Text
            style={
              styles.emptyDescription
            }>
            Please check your internet connection
            and try again.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleRefresh}
            style={styles.retryButton}>

            <Text
              style={
                styles.retryButtonText
              }>
              Try Again
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    !loading &&
    articles.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.header}>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}>

            <Text style={styles.backIcon}>
              ‹
            </Text>

          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }>

            <Text
              style={styles.headerTitle}>
              Agriculture News
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Latest updates for Indian farmers
            </Text>

          </View>

          <View style={styles.headerIcon}>

            <Text
              style={
                styles.headerIconText
              }>
              📰
            </Text>

          </View>

        </View>

        <View
          style={
            styles.categoriesContainer
          }>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={item =>
              item.value || 'all'
            }
            renderItem={({item}) => (
              <CategoryChip
                item={item}
                selected={
                  selectedCategory ===
                  item.value
                }
                onPress={() =>
                  handleCategoryPress(
                    item.value,
                  )
                }
              />
            )}
            contentContainerStyle={
              styles.categoriesContent
            }
          />

        </View>

        <View
          style={
            styles.emptyContainer
          }>

          <View
            style={
              styles.emptyIconContainer
            }>

            <Text style={styles.emptyIcon}>
              🌱
            </Text>

          </View>

          <Text style={styles.emptyTitle}>
            No updates available
          </Text>

          <Text
            style={
              styles.emptyDescription
            }>
            There are no agriculture updates in
            this category right now.
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <FlatList
        data={remainingArticles}
        keyExtractor={(item, index) =>
          item?._id ||
          item?.sourceUrl ||
          `article-${index}`
        }
        renderItem={({item}) => (
          <ArticleCard
            article={item}
            onPress={() =>
              handleArticlePress(item)
            }
          />
        )}
        ListHeaderComponent={
          <NewsHeader
            navigation={navigation}
            selectedCategory={
              selectedCategory
            }
            onCategoryPress={
              handleCategoryPress
            }
            featuredArticle={
              featuredArticle
            }
            remainingArticles={
              remainingArticles
            }
            loading={loading}
            onArticlePress={
              handleArticlePress
            }
          />
        }
        ListFooterComponent={
          refreshing ? (
            <View
              style={
                styles.footerLoader
              }>
              <ActivityIndicator
                size="small"
                color="#075A53"
              />
            </View>
          ) : (
            <View
              style={
                styles.footerSpace
              }
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#075A53"
            colors={['#075A53']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
      />

    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  listContent: {
    paddingBottom: 20,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 36,
    color: '#344E41',
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1C2923',
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#7A8580',
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#EEF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 20,
  },

  /* CATEGORIES */

  categoriesContainer: {
    marginBottom: 18,
  },

  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#F4F6F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF0EE',
  },

  categoryChipActive: {
    backgroundColor: '#075A53',
    borderColor: '#075A53',
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#66716B',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  categorySkeleton: {
    width: 75,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#F1F3F1',
  },

  /* FEATURED */

  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C2923',
    marginBottom: 12,
  },

  featuredCard: {
    height: 285,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#344E41',
  },

  featuredArticleImage: {
    width: '100%',
    height: '100%',
  },

  featuredImageFallback: {
    width: '100%',
    height: '100%',
  },

  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 70,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#28C878',
    marginBottom: 10,
  },

  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.7,
  },

  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  featuredSource: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  featuredMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DDD8',
    marginHorizontal: 7,
  },

  featuredDate: {
    fontSize: 11,
    color: '#E1E7E3',
  },

  featuredTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  featuredReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  featuredReadMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  featuredArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 7,
  },

  /* ARTICLE LIST */

  latestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  articleCount: {
    fontSize: 12,
    color: '#89938E',
  },

  articleCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 10,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF1EF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  articleImage: {
    width: 105,
    height: 120,
    borderRadius: 13,
    backgroundColor: '#EEF2EF',
  },

  imageFallback: {
    width: 105,
    height: 120,
    borderRadius: 13,
    backgroundColor: '#EEF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageFallbackIcon: {
    fontSize: 25,
    marginBottom: 4,
  },

  imageFallbackText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5A7C6B',
  },

  articleContent: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 2,
  },

  articleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  sourceDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  sourceText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  dateText: {
    fontSize: 9,
    color: '#929B96',
  },

  articleTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    color: '#26342D',
    marginBottom: 5,
  },

  articleDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#7A8580',
  },

  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  readMoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075A53',
  },

  readMoreArrow: {
    fontSize: 15,
    fontWeight: '700',
    color: '#075A53',
    marginLeft: 5,
  },

  /* LOADING */

  loadingList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  loadingCard: {
    height: 140,
    borderRadius: 18,
    backgroundColor: '#F5F7F5',
    marginBottom: 14,
    padding: 10,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  loadingImage: {
    width: 105,
    height: 120,
    borderRadius: 13,
    backgroundColor: '#E8ECE9',
  },

  loadingContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 5,
  },

  loadingSmall: {
    width: 60,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8ECE9',
    marginBottom: 12,
  },

  loadingLarge: {
    width: '90%',
    height: 15,
    borderRadius: 7,
    backgroundColor: '#E8ECE9',
    marginBottom: 8,
  },

  loadingMedium: {
    width: '80%',
    height: 11,
    borderRadius: 6,
    backgroundColor: '#E8ECE9',
    marginBottom: 7,
  },

  loadingMediumShort: {
    width: '55%',
    height: 11,
    borderRadius: 6,
    backgroundColor: '#E8ECE9',
  },

  /* FOOTER */

  footerLoader: {
    paddingVertical: 20,
  },

  footerSpace: {
    height: 10,
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EEF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 30,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#26342D',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#7A8580',
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#075A53',
  },

  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});