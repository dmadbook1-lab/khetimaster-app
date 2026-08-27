import React from 'react';
import {View, StyleSheet} from 'react-native';
import {COLORS, PAGE_PADDING} from '../theme';

export default function FooterBar({children}) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  footer: {
    padding: PAGE_PADDING,
    paddingBottom: 16,
    backgroundColor: COLORS.PAGE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
});