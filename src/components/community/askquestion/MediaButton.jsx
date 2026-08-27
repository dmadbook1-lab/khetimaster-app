import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, rf} from '../theme';

export default function MediaButton({label, icon: Icon, active, disabled, onPress}) {
  const color = disabled ? COLORS.MUTED : COLORS.DARK_GREEN;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, active && styles.btnActive]}>
      <View style={[styles.iconBox, {backgroundColor: disabled ? '#F1F5F9' : '#EAFBF0'}]}>
        <Icon size={rf(16)} color={color} strokeWidth={2.4} />
      </View>
      <Text style={[styles.label, {color: disabled ? COLORS.MUTED : COLORS.DARK}]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    minHeight: 84,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnActive: {borderColor: COLORS.DARK_GREEN, backgroundColor: '#EAFBF0'},
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {fontSize: rf(10.5), fontWeight: '800'},
});