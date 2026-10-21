import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';

import {MARKET_COLORS as C} from './theme';

export default function MarketHeader({title, subtitle, onBack, right}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.iconButton}
        onPress={onBack}>
        <ArrowLeft size={21} color={C.dark} />
      </TouchableOpacity>

      <View style={styles.titleBox}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.right}>{right || <View style={styles.spacer} />}</View>
    </View>
  );
}

export function HeaderIconButton({children, onPress, badge}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.iconButton}
      onPress={onPress}>
      {children}
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4F6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {flex: 1},
  title: {fontSize: 16, fontWeight: '900', color: C.dark, letterSpacing: -0.3},
  subtitle: {fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 1},
  right: {flexDirection: 'row', alignItems: 'center', gap: 8},
  spacer: {width: 40},
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: C.white, fontSize: 9.5, fontWeight: '900'},
});
