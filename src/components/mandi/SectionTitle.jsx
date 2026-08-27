import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, rf} from './theme';

export default function SectionTitle({title, right, onRightPress, style}) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {right && (
        <TouchableOpacity activeOpacity={0.7} onPress={onRightPress}>
          <Text style={styles.right}>{right}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  title: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  right: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
});