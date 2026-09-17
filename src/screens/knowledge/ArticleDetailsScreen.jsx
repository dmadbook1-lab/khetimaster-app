import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const SOURCE_COLORS = {
  PIB: '#075A53',
  ICAR: '#344E41',
  FAO: '#5A7C6B',
};

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
    month: 'long',
    year: 'numeric',
  });
}

export default function ArticleDetailsScreen({
  navigation,
  route,
}) {
  const insets = useSafeAreaInsets();
  const article = route?.params?.article;

  if (!article) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Article unavailable
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sourceColor =
    SOURCE_COLORS[article.source] || '#075A53';

  const openOriginalArticle = async () => {
    if (!article.sourceUrl) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(
        article.sourceUrl,
      );

      if (!supported) {
        console.log(
          'Cannot open article URL:',
          article.sourceUrl,
        );
        return;
      }

      await Linking.openURL(article.sourceUrl);
    } catch (error) {
      console.log(
        'Unable to open article:',
        error,
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            numberOfLines={1}
            style={styles.headerTitle}>
            Agriculture News
          </Text>

          <Text
            numberOfLines={1}
            style={styles.headerSubtitle}>
            Article Details
          </Text>
        </View>

        {/* Keeps title perfectly centered */}
        <View style={styles.headerButtonPlaceholder} />
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(
              30,
              insets.bottom + 20,
            ),
          },
        ]}>

        {/* HERO IMAGE */}
        {article.imageUrl ? (
          <Image
            source={{uri: article.imageUrl}}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroFallback}>
            <Text style={styles.heroFallbackIcon}>
              🌾
            </Text>

            <Text style={styles.heroFallbackText}>
              KhetiMaster
            </Text>
          </View>
        )}

        {/* CONTENT CARD */}
        <View style={styles.content}>

          {/* SOURCE + DATE */}
          <View style={styles.metaRow}>
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
                {article.source || 'SOURCE'}
              </Text>
            </View>

            {!!formatDate(article.publishedAt) && (
              <Text style={styles.dateText}>
                {formatDate(article.publishedAt)}
              </Text>
            )}
          </View>

          {/* CATEGORY */}
          {!!article.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>
                {article.category}
              </Text>
            </View>
          )}

          {/* TITLE */}
          <Text style={styles.title}>
            {article.title || 'Agriculture Update'}
          </Text>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* DESCRIPTION */}
          <Text style={styles.description}>
            {article.description ||
              'No description is available for this article.'}
          </Text>

          {/* OFFICIAL SOURCE CARD */}
          <View style={styles.sourceCard}>

            <View style={styles.sourceCardIcon}>
              <Text style={styles.sourceCardIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.sourceCardContent}>
              <Text style={styles.sourceCardTitle}>
                Official Source
              </Text>

              <Text style={styles.sourceCardDescription}>
                This information is provided by{' '}
                {article.source || 'the original publisher'}.
                Read the complete article from the
                original source.
              </Text>
            </View>
          </View>

          {/* READ ORIGINAL BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!article.sourceUrl}
            onPress={openOriginalArticle}
            style={[
              styles.readButton,
              !article.sourceUrl &&
                styles.readButtonDisabled,
            ]}>

            <View style={styles.readButtonContent}>

              <View style={styles.readButtonIcon}>
                <Text style={styles.readButtonIconText}>
                  ↗
                </Text>
              </View>

              <View style={styles.readButtonTextContainer}>
                <Text style={styles.readButtonTitle}>
                  Read Full Article
                </Text>

                <Text style={styles.readButtonSubtitle}>
                  Open original source
                </Text>
              </View>
            </View>

            <Text style={styles.readButtonArrow}>
              →
            </Text>
          </TouchableOpacity>

          {/* DISCLAIMER */}
          <Text style={styles.disclaimer}>
            KhetiMaster displays article metadata and
            short descriptions for convenience. The
            complete article remains available on the
            original publisher's website.
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* HEADER */

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F1',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonPlaceholder: {
    width: 42,
    height: 42,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#26342D',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    color: '#8A938F',
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 36,
    color: '#344E41',
    marginTop: -4,
  },

  /* SCROLL */

  scrollContent: {
    paddingBottom: 30,
  },

  /* HERO */

  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#EEF2EF',
  },

  heroFallback: {
    width: '100%',
    height: 250,
    backgroundColor: '#EEF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroFallbackIcon: {
    fontSize: 50,
    marginBottom: 8,
  },

  heroFallbackText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5A7C6B',
  },

  /* CONTENT */

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  /* META */

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },

  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  sourceText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  dateText: {
    fontSize: 11,
    color: '#8A938F',
  },

  /* CATEGORY */

  categoryContainer: {
    alignSelf: 'flex-start',
    marginTop: 13,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F3F5F3',
  },

  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#68736D',
    textTransform: 'capitalize',
  },

  /* TITLE */

  title: {
    marginTop: 14,
    fontSize: 25,
    lineHeight: 33,
    fontWeight: '800',
    color: '#1D2A24',
    letterSpacing: -0.5,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1EF',
    marginVertical: 20,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5F6B65',
  },

  /* SOURCE CARD */

  sourceCard: {
    flexDirection: 'row',
    marginTop: 24,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#F5F8F5',
    borderWidth: 1,
    borderColor: '#EAF0EC',
  },

  sourceCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#DFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sourceCardIconText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#075A53',
  },

  sourceCardContent: {
    flex: 1,
  },

  sourceCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#26342D',
    marginBottom: 4,
  },

  sourceCardDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#7A8580',
  },

  /* READ BUTTON */

  readButton: {
    marginTop: 20,
    minHeight: 66,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: '#075A53',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  readButtonDisabled: {
    opacity: 0.5,
  },

  readButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  readButtonIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  readButtonIconText: {
    fontSize: 19,
    color: '#FFFFFF',
  },

  readButtonTextContainer: {
    flex: 1,
  },

  readButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  readButtonSubtitle: {
    fontSize: 10,
    color: '#C9DED8',
    marginTop: 2,
  },

  readButtonArrow: {
    fontSize: 21,
    color: '#FFFFFF',
    marginLeft: 10,
  },

  /* DISCLAIMER */

  disclaimer: {
    marginTop: 18,
    fontSize: 10,
    lineHeight: 15,
    color: '#9AA39E',
    textAlign: 'center',
    paddingHorizontal: 15,
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#26342D',
    marginBottom: 18,
    textAlign: 'center',
  },

  backButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#075A53',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});