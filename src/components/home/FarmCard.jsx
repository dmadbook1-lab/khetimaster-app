import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const CARD_WIDTH = width * 0.39;

const DARK = '#111827';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmCard({
  image,
  title,
  crop,
  area,
  status,
  statusColor,
  statusBg,
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="cover" />

      <View style={styles.avatar}>
        <Image source={image} style={styles.avatarImage} resizeMode="cover" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>

        <Text style={[styles.crop, {color: statusColor}]}>• {crop}</Text>

        <Text style={styles.area}>{area}</Text>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 205, 
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'visible',

    marginBottom: 10,

    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  image: {
    width: '100%',
    height: 92, // Reduced from 108
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  avatar: {
    position: 'absolute',
    top: 68, // Reduced from 82
    left: 16,
    width: 46, // Reduced from 52
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    padding: 3,
    zIndex: 10,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  body: {
    paddingTop: 28, // Reduced from 38
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  title: {
    fontSize: rf(15),
    color: DARK,
    fontWeight: '900',
  },

  crop: {
    marginTop: 5,
    fontSize: rf(11),
    fontWeight: '800',
  },

  area: {
    marginTop: 4,
    fontSize: rf(10),
    color: '#94A3B8',
    fontWeight: '700',
  },

  status: {
    marginTop: 12,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: rf(9),
    fontWeight: '900',
  },
});