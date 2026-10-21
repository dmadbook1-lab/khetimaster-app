import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';

export function FormCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeading({ icon, title, subtitle, color = C.green }) {
  return (
    <View style={styles.headingRow}>
      <View style={[styles.headingIcon, { backgroundColor: `${color}1A` }]}>
        {icon}
      </View>
      <View style={styles.flex}>
        <Text style={styles.headingTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export function Field({ label, hint, children }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function FormInput({ style, ...props }) {
  return (
    <TextInput
      placeholderTextColor={C.placeholder}
      style={[styles.input, style]}
      {...props}
    />
  );
}

/*
 * Tappable field that opens a picker (date / time).
 */
export function PickerField({ icon, value, placeholder, onPress, onClear }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.input, styles.picker]}
      onPress={onPress}
    >
      {icon}
      <Text
        style={[styles.pickerText, !value && styles.placeholder]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      {!!value && !!onClear && (
        <TouchableOpacity hitSlop={10} onPress={onClear}>
          <X size={15} color={C.muted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

/*
 * Wrapping chips. multiple -> value is an array.
 */
export function SelectChips({
  options,
  value,
  onChange,
  multiple = false,
  labels = {},
}) {
  const isSelected = option =>
    multiple ? (value || []).includes(option) : value === option;

  const toggle = option => {
    if (!multiple) {
      onChange(option);
      return;
    }

    const current = value || [];
    onChange(
      current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option],
    );
  };

  return (
    <View style={styles.chips}>
      {options.map(option => {
        const selected = isSelected(option);

        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.8}
            onPress={() => toggle(option)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {labels[option] || option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/*
 * Free-text list, e.g. skills. Type and press add / return.
 */
export function TagInput({ value = [], onChange, placeholder, max = 20 }) {
  const [text, setText] = useState('');

  const add = () => {
    const tag = text.trim();

    if (tag && !value.includes(tag) && value.length < max) {
      onChange([...value, tag]);
    }

    setText('');
  };

  return (
    <View>
      <View style={styles.tagInputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          returnKeyType="done"
          blurOnSubmit={false}
          style={[styles.input, styles.flex]}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.tagAdd}
          onPress={add}
        >
          <Plus size={18} color={C.white} />
        </TouchableOpacity>
      </View>

      {value.length > 0 && (
        <View style={[styles.chips, styles.tags]}>
          {value.map(tag => (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.8}
              style={[styles.chip, styles.chipSelected, styles.tag]}
              onPress={() => onChange(value.filter(item => item !== tag))}
            >
              <Text style={[styles.chipText, styles.chipTextSelected]}>
                {tag}
              </Text>
              <X size={12} color={C.white} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export function Stepper({ value, onChange, min = 1, max = 90, suffix }) {
  const change = delta => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={value <= min}
        style={[styles.stepButton, value <= min && styles.stepDisabled]}
        onPress={() => change(-1)}
      >
        <Minus size={18} color={C.green} />
      </TouchableOpacity>
      <View style={styles.stepValue}>
        <Text style={styles.stepNumber}>{value}</Text>
        {!!suffix && <Text style={styles.stepSuffix}>{suffix}</Text>}
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={value >= max}
        style={[styles.stepButton, value >= max && styles.stepDisabled]}
        onPress={() => change(1)}
      >
        <Plus size={18} color={C.green} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    paddingTop: 4,
    marginTop: 12,
    ...MARKET_SHADOW,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  headingIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
  },
  headingSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: C.dark,
    marginTop: 14,
    marginBottom: 7,
  },
  hint: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 13.5,
    color: C.dark,
    backgroundColor: C.input,
  },
  picker: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickerText: { flex: 1, fontSize: 13.5, color: C.dark, fontWeight: '600' },
  placeholder: { color: C.placeholder, fontWeight: '400' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  chipSelected: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontSize: 12, color: C.text, fontWeight: '700' },
  chipTextSelected: { color: C.white, fontWeight: '800' },
  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagAdd: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { marginTop: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.input,
    padding: 4,
  },
  stepButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.4 },
  stepValue: { flex: 1, alignItems: 'center' },
  stepNumber: { fontSize: 18, fontWeight: '900', color: C.dark },
  stepSuffix: { fontSize: 10.5, fontWeight: '700', color: C.muted },
});
