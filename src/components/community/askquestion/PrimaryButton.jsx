import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {COLORS, rf} from '../theme';

export default function PrimaryButton({label, icon: Icon, onPress, iconRight}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.btn}>
      {Icon && !iconRight && (
        <Icon size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
      )}
      <Text style={styles.text}>{label}</Text>
      {Icon && iconRight && (
        <Icon size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },
  text: {fontSize: rf(13.5), fontWeight: '900', color: '#FFFFFF'},
});