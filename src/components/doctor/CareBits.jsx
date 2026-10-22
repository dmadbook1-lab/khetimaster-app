import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CARE as C, CARE_SHADOW } from './careTheme';

/*
|--------------------------------------------------------------------------
| BUTTON
|--------------------------------------------------------------------------
|
| variant: primary | outline | danger | soft
|
*/

export function CareButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const color = {
    primary: C.white,
    outline: C.tealDark,
    danger: C.red,
    soft: C.tealDark,
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        styles[`button_${variant}`],
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, { color }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/*
 * White bar pinned to the bottom with the main actions.
 */
export function CareBottomBar({ children, style }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| PILL / CHIPS
|--------------------------------------------------------------------------
*/

export function CarePill({ meta, style }) {
  if (!meta) return null;

  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }, style]}>
      <View style={[styles.pillDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

/*
 * options: strings or [{key, label}]. multiple -> value is an array.
 * scroll -> one horizontal row, otherwise wrapping.
 */
export function CareChips({
  options,
  value,
  onChange,
  multiple = false,
  scroll = false,
  style,
}) {
  const items = options.map(option =>
    typeof option === 'string' ? { key: option, label: option } : option,
  );

  const isSelected = key =>
    multiple ? (value || []).includes(key) : value === key;

  const toggle = key => {
    if (!multiple) {
      onChange(key);
      return;
    }

    const current = value || [];
    onChange(
      current.includes(key)
        ? current.filter(item => item !== key)
        : [...current, key],
    );
  };

  const chips = items.map(item => {
    const selected = isSelected(item.key);

    return (
      <TouchableOpacity
        key={item.key}
        activeOpacity={0.8}
        onPress={() => toggle(item.key)}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipRow, style]}
      >
        {chips}
      </ScrollView>
    );
  }

  return <View style={[styles.chipWrap, style]}>{chips}</View>;
}

/*
|--------------------------------------------------------------------------
| STATES
|--------------------------------------------------------------------------
*/

export function CareEmpty({ icon, title, message, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      {!!icon && <View style={styles.emptyIcon}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!message && <Text style={styles.emptyText}>{message}</Text>}
      {!!actionLabel && (
        <CareButton
          label={actionLabel}
          onPress={onAction}
          style={styles.emptyButton}
        />
      )}
    </View>
  );
}

export function CareLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={C.teal} />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| LAYOUT
|--------------------------------------------------------------------------
*/

export function CareCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CareSectionTitle({ title, action, onAction, style }) {
  return (
    <View style={[styles.sectionRow, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!action && (
        <TouchableOpacity hitSlop={8} onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/*
 * Card heading with a tinted icon.
 */
export function CareCardTitle({ icon, title, color = C.teal }) {
  return (
    <View style={styles.cardTitleRow}>
      <View style={[styles.cardTitleIcon, { backgroundColor: `${color}1A` }]}>
        {icon}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

export function CareInfoRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

export function CareField({ label, hint, error, children }) {
  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      {children}
      {!!(error || hint) && (
        <Text style={[styles.hint, !!error && styles.hintError]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

export function CareInput({ style, invalid, multiline, ...props }) {
  return (
    <TextInput
      placeholderTextColor={C.placeholder}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        invalid && styles.inputInvalid,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  button_primary: {
    backgroundColor: C.teal,
    shadowColor: C.teal,
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  button_outline: {
    borderWidth: 1.5,
    borderColor: C.teal,
    backgroundColor: C.white,
  },
  button_danger: {
    borderWidth: 1.5,
    borderColor: '#F4C7C3',
    backgroundColor: C.redSoft,
  },
  button_soft: { backgroundColor: C.tealSoft },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontSize: 14, fontWeight: '900' },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 10.5, fontWeight: '900' },

  chipRow: { gap: 8, paddingVertical: 2 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  chipSelected: { backgroundColor: C.navy, borderColor: C.navy },
  chipText: { fontSize: 12, color: C.text, fontWeight: '700' },
  chipTextSelected: { color: C.white, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 46, paddingHorizontal: 30 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: C.ink,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  emptyButton: { marginTop: 16, height: 44, paddingHorizontal: 22 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EDF3F2',
    ...CARE_SHADOW,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.3,
  },
  sectionAction: { fontSize: 12.5, fontWeight: '900', color: C.teal },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  cardTitleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: C.ink },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4F3',
    gap: 12,
  },
  infoLabel: { fontSize: 12.5, color: C.muted, fontWeight: '600' },
  infoValue: {
    flexShrink: 1,
    fontSize: 12.5,
    color: C.ink,
    fontWeight: '800',
    textAlign: 'right',
  },

  field: { marginTop: 14 },
  label: { fontSize: 12, fontWeight: '800', color: C.ink, marginBottom: 7 },
  hint: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  hintError: { color: C.red, fontWeight: '700' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: C.ink,
    backgroundColor: C.input,
  },
  inputMultiline: { height: 96, paddingTop: 12 },
  inputInvalid: { borderColor: C.red, backgroundColor: '#FFF8F7' },
});
