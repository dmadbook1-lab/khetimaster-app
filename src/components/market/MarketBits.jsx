import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {MARKET_COLORS as C} from './theme';

/*
|--------------------------------------------------------------------------
| STATUS PILL
|--------------------------------------------------------------------------
*/

export function StatusPill({meta, style}) {
  if (!meta) {
    return null;
  }

  return (
    <View style={[styles.pill, {backgroundColor: meta.bg}, style]}>
      <Text style={[styles.pillText, {color: meta.color}]}>{meta.label}</Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| CHIP ROW
|--------------------------------------------------------------------------
|
| options: [{key, label}]
|
*/

export function ChipRow({options, value, onChange, scroll = true, style}) {
  const chips = options.map(option => {
    const selected = option.key === value;

    return (
      <TouchableOpacity
        key={option.key}
        activeOpacity={0.8}
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={() => onChange(option.key)}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  });

  if (!scroll) {
    return <View style={[styles.chipWrap, style]}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.chipList, style]}>
      {chips}
    </ScrollView>
  );
}

/*
|--------------------------------------------------------------------------
| SEGMENTED TABS
|--------------------------------------------------------------------------
*/

export function SegmentTabs({options, value, onChange}) {
  return (
    <View style={styles.segment}>
      {options.map(option => {
        const selected = option.key === value;

        return (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.85}
            style={[styles.segmentItem, selected && styles.segmentSelected]}
            onPress={() => onChange(option.key)}>
            <Text
              style={[
                styles.segmentText,
                selected && styles.segmentTextSelected,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY / ERROR / LOADING STATES
|--------------------------------------------------------------------------
*/

export function EmptyState({icon, title, message, actionLabel, onAction}) {
  return (
    <View style={styles.empty}>
      {!!icon && <View style={styles.emptyIcon}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!message && <Text style={styles.emptyText}>{message}</Text>}
      {!!actionLabel && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.emptyButton}
          onPress={onAction}>
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={C.green} />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| BUTTONS
|--------------------------------------------------------------------------
|
| variant: primary | outline | danger
|
*/

export function MarketButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isPrimary = variant === 'primary';
  const color =
    variant === 'danger' ? C.red : isPrimary ? C.white : C.green;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        isPrimary && styles.buttonPrimary,
        variant === 'outline' && styles.buttonOutline,
        variant === 'danger' && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, {color}]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL ROW
|--------------------------------------------------------------------------
*/

export function InfoRow({label, value}) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pillText: {fontSize: 10, fontWeight: '900', letterSpacing: 0.2},

  chipList: {gap: 8, paddingVertical: 2},
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  chipSelected: {backgroundColor: C.green, borderColor: C.green},
  chipText: {fontSize: 12, color: C.text, fontWeight: '700'},
  chipTextSelected: {color: C.white, fontWeight: '800'},

  segment: {
    flexDirection: 'row',
    backgroundColor: '#E8EEEA',
    borderRadius: 16,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: C.white,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  segmentText: {fontSize: 12.5, fontWeight: '800', color: C.muted},
  segmentTextSelected: {color: C.green},

  empty: {alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30},
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {fontSize: 15, fontWeight: '900', color: C.dark, textAlign: 'center'},
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  emptyButton: {
    marginTop: 16,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {color: C.white, fontSize: 13, fontWeight: '900'},

  loading: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60},

  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: C.green,
    shadowColor: C.green,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 4,
  },
  buttonOutline: {borderWidth: 1.5, borderColor: C.green, backgroundColor: C.white},
  buttonDanger: {borderWidth: 1.5, borderColor: '#F4C7C3', backgroundColor: C.lightRed},
  buttonDisabled: {opacity: 0.6},
  buttonText: {fontSize: 14, fontWeight: '900'},

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F1',
    gap: 12,
  },
  infoLabel: {fontSize: 12.5, color: C.muted, fontWeight: '600'},
  infoValue: {
    flexShrink: 1,
    fontSize: 12.5,
    color: C.dark,
    fontWeight: '800',
    textAlign: 'right',
  },
});
