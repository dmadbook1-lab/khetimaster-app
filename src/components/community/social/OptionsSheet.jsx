import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';
import { COLORS, rf } from '../theme';

/*
 * options: [{key, label, Icon, destructive, onPress}]
 */
export default function OptionsSheet({ visible, onClose, title, options }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      <View style={styles.list}>
        {options.map(option => {
          const Icon = option.Icon;
          const color = option.destructive ? COLORS.RED : COLORS.DARK;

          return (
            <Pressable
              key={option.key}
              onPress={() => {
                onClose();
                // let the sheet close before alerts / navigation
                setTimeout(option.onPress, 220);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              {Icon ? (
                <Icon size={rf(20)} color={color} strokeWidth={2} />
              ) : null}
              <Text style={[styles.label, { color }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: rf(14),
    fontWeight: '800',
    color: COLORS.DARK,
    paddingVertical: 8,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: '#F3F5F7',
  },
  label: {
    fontSize: rf(15),
    fontWeight: '600',
  },
});
