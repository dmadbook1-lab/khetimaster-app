import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Tractor } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#20C55A';
const DARK = '#121A2B';
const MUTED = '#64748B';

// Scaled-up font utility
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 2));
};

export default function MachineryCategories({
  categories = [],
  activeCategory = 'all',
  onChange,
  onSeeAllPress,
}) {
  // Safe image resolver for local assets require() and remote URLs
  const getImageSource = img => {
    if (!img) return null;
    if (typeof img === 'number') return img;
    if (typeof img === 'string') return { uri: img };
    if (img.uri) return img;
    return null;
  };

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSeeAllPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.seeAll}>
            {activeCategory !== 'all' ? 'Show All' : 'See All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL CATEGORY LIST */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map(category => {
          const categoryId = category.id || category._id;
          const active = activeCategory === categoryId;
          const imageSrc = getImageSource(category.image);

          return (
            <TouchableOpacity
              key={String(categoryId)}
              activeOpacity={0.82}
              onPress={() => onChange?.(categoryId)}
              style={styles.categoryItem}
            >
              <View
                style={[
                  styles.imageBox,
                  active && styles.activeImageBox,
                ]}
              >
                {imageSrc ? (
                  <Image
                    source={imageSrc}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : (
                  <Tractor
                    size={rf(26)}
                    color={active ? GREEN : MUTED}
                    strokeWidth={2}
                  />
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, active && styles.activeLabel]}
              >
                {category.label || category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  seeAll: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  row: {
    paddingTop: 10,
    paddingBottom: 4,
    paddingRight: 10,
    gap: 16,
  },
  categoryItem: {
    width: 72,
    alignItems: 'center',
  },
  imageBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  activeImageBox: {
    backgroundColor: '#EAFBF0',
    borderWidth: 2,
    borderColor: BRIGHT_GREEN,
    shadowColor: GREEN,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: {
    width: '82%',
    height: '82%',
  },
  label: {
    marginTop: 8,
    fontSize: rf(11),
    fontWeight: '700',
    color: MUTED,
    textAlign: 'center',
  },
  activeLabel: {
    color: GREEN,
    fontWeight: '900',
  },
});