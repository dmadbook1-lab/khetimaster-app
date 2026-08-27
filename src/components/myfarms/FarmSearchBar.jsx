import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function FarmSearchBar() {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <Search size={18} color="#98A2B3" strokeWidth={2.2} />
        <TextInput
          placeholder="Search farm by name or crop"
          placeholderTextColor="#667085"
          style={styles.searchInput}
        />
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
        <SlidersHorizontal size={22} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  searchRow: {
    marginTop: 28,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    padding: 0,
    fontSize: rf(13),
    fontWeight: '600',
    color: '#111827',
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
