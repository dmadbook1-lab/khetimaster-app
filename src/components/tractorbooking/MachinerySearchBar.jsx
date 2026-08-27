import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Search,
  Mic,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function MachinerySearchBar({
  value,
  onChangeText,
  onFilterPress,
  onMicPress,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.searchBox}>
        <Search
          size={rf(20)}
          color="#94A3B8"
          strokeWidth={2.2}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search tractors, rotavators, harvesters..."
          placeholderTextColor="#7E8798"
          style={styles.input}
        />

        {!!value && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onChangeText?.('')}
            style={styles.clearButton}>
            <X
              size={rf(17)}
              color="#64748B"
              strokeWidth={2.3}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onMicPress}
          style={styles.micButton}>
          <Mic
            size={rf(19)}
            color={GREEN}
            strokeWidth={2.4}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onFilterPress}
        style={styles.filterButton}>
        <SlidersHorizontal
          size={rf(23)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 17,
    flexDirection: 'row',
    gap: 9,
  },

  searchBox: {
    flex: 1,
    height: 47,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: '100%',
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: rf(12),
    fontWeight: '600',
    color: '#111827',
  },

  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  micButton: {
    width: 27,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});