import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Plus } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - width * 0.11 - 16) / 2;
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AddFarmGridCard({ onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.circle}>
        <Plus size={25} color={GREEN} strokeWidth={2.7} />
      </View>

      <Text style={styles.title}>Add Farm</Text>
      <Text style={styles.desc}>Register a new farm</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 218,
    borderRadius: 20,
    borderWidth: 1.8,
    borderStyle: 'dashed',
    borderColor: '#8FD9AE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  title: {
    fontSize: rf(14),
    fontWeight: '900',
    color: GREEN,
  },
  desc: {
    marginTop: 6,
    fontSize: rf(10),
    fontWeight: '600',
    color: '#98A2B3',
  },
});
