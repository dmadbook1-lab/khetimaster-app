import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Sprout, MapPin, ChevronDown } from 'lucide-react-native';
import { COLORS, Glass, PressableScale, rf, width } from './theme';

/*
 * Glass pill showing what AI Guru is talking about; tap to change.
 * farm: the selected farm, or null for general farming.
 */
export default function CurrentFarmCard({ farm, onSwitchFarm }) {
  const cropName = farm?.isBarrenLand ? 'Barren land' : farm?.cropName;
  const Icon = farm ? MapPin : Sprout;

  return (
    <PressableScale
      accessibilityLabel="Change farm"
      onPress={onSwitchFarm}
      scaleTo={0.96}
      style={styles.touch}
    >
      <Glass tint={0.7} style={styles.pill}>
        <Icon size={rf(15)} color={COLORS.green} strokeWidth={2.4} />
        <Text numberOfLines={1} style={styles.text}>
          {farm ? (
            <>
              <Text style={styles.strong}>{farm.fieldName}</Text>
              {cropName ? ` · ${cropName}` : ''}
            </>
          ) : (
            <Text style={styles.strong}>General farming</Text>
          )}
        </Text>
        <ChevronDown size={rf(15)} color={COLORS.muted} strokeWidth={2.4} />
      </Glass>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  touch: {
    alignSelf: 'center',
    marginTop: 4,
  },
  pill: {
    maxWidth: width * 0.8,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderColor: COLORS.greenBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  text: {
    flexShrink: 1,
    fontSize: rf(13),
    color: COLORS.muted,
    textTransform: 'capitalize',
  },
  strong: {
    fontWeight: '700',
    color: COLORS.text,
  },
});
