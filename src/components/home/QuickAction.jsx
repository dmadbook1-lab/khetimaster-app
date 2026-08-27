import React from 'react';
import {
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const SCREEN_PADDING = 16;
const GAP = 16;
const CARD_WIDTH = (width - SCREEN_PADDING * 2 - GAP * 2) / 3;
export default function QuickAction({
  image,
  title,
  onPress,
  imageStyle,
  borderColor = '#DDEBE2',
  textColor = '#1F2937',
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor,
        },
      ]}
    >
      <View style={styles.imageBox}>
        <Image
          source={image}
          resizeMode="contain"
          style={[styles.image, imageStyle]}
        />
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.title,
          {
            color: textColor,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.18,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    height: '88%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '130%',
    height: '130%',
  },
  title: {
    fontSize: rf(12),
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: rf(14),
    paddingHorizontal: 4,
    marginTop: -14,
    marginBottom: 6,
  },
});
