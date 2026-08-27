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
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function MachineryCategories({
  categories,
  activeCategory,
  onChange,
  onSeeAllPress,
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>

        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map(category => {
          const active = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.85}
              onPress={() => onChange(category.id)}
              style={styles.categoryItem}
            >
              <View style={[styles.imageBox, active && styles.activeImageBox]}>
                <Image
                  source={category.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, active && styles.activeLabel]}
              >
                {category.label}
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
    marginTop: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#121A2B',
  },
  seeAll: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
  row: {
    paddingTop: 14,
    paddingRight: 10,
    gap: 17,
  },
  categoryItem: {
    width: 69,
    alignItems: 'center',
  },
  imageBox: {
    width: 57,
    height: 57,
    borderRadius: 13,
    backgroundColor: '#F6F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeImageBox: {
    backgroundColor: '#E8F7ED',
    borderWidth: 1.3,
    borderColor: '#B8E7C8',
  },
  image: {
    width: '92%',
    height: '92%',
  },
  label: {
    marginTop: 8,
    fontSize: rf(10),
    fontWeight: '600',
    color: '#64748B',
  },
  activeLabel: {
    color: GREEN,
    fontWeight: '900',
  },
});
