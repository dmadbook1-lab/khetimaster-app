import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, MapPin, Plus, Sprout } from 'lucide-react-native';
import BottomSheet from './BottomSheet';
import { COLORS } from './theme';

/*
 * Bottom sheet to choose what AI Guru talks about: general farming or one
 * of the farmer's farms.
 *
 * onSelect(fieldId | null)
 */
export default function FarmPickerSheet({
  visible,
  farms = [],
  activeFieldId,
  onSelect,
  onAddFarm,
  onClose,
}) {
  const renderRow = ({ id, title, subtitle, Icon }) => {
    const selected = (activeFieldId || null) === id;

    return (
      <Pressable
        key={id || 'general'}
        onPress={() => onSelect(id)}
        style={({ pressed }) => [
          styles.row,
          selected && styles.selectedRow,
          pressed && styles.pressedRow,
        ]}
      >
        <View style={[styles.rowIcon, selected && styles.selectedIcon]}>
          <Icon
            size={19}
            color={selected ? '#FFFFFF' : COLORS.green}
            strokeWidth={2.3}
          />
        </View>

        <View style={styles.rowText}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        </View>

        <View style={[styles.radio, selected && styles.radioOn]}>
          {selected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
        </View>
      </Pressable>
    );
  };

  return (
    <BottomSheet
      visible={visible}
      title="Ask AI Guru about"
      subtitle="Pick a farm to get advice for that field"
      maxHeight="75%"
      onClose={onClose}
    >
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {renderRow({
          id: null,
          title: 'General farming',
          subtitle: 'Any crop, weather, prices or app help',
          Icon: Sprout,
        })}

        {farms.map(farm =>
          renderRow({
            id: String(farm._id),
            title: farm.fieldName || 'My farm',
            subtitle: `${
              farm.isBarrenLand ? 'Barren land' : farm.cropName || 'Crop'
            } • ${Number(farm.acre || 0).toFixed(2)} acre`,
            Icon: MapPin,
          }),
        )}
      </ScrollView>

      <Pressable
        onPress={onAddFarm}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.pressedRow,
        ]}
      >
        <Plus size={18} color={COLORS.green} strokeWidth={2.6} />
        <Text style={styles.addText}>Add a new farm</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 0 },
  row: {
    minHeight: 68,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedRow: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  pressedRow: { opacity: 0.6 },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: { backgroundColor: COLORS.green },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.muted,
    textTransform: 'capitalize',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.green,
  },
  addButton: {
    marginTop: 6,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addText: { fontSize: 14.5, fontWeight: '800', color: COLORS.green },
});
