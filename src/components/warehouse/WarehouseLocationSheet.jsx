import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  LocateFixed,
  Search,
  X,
} from 'lucide-react-native';

import { WH } from './theme';
import {
  WAREHOUSES,
  listDistricts,
  listStates,
} from '../../utils/warehouseData';
import {useTranslation} from 'react-i18next';

const ALL_DISTRICTS = '';

/*
 * Two steps: pick a state, then one of its districts or the whole state.
 *
 * selected        {state, district} in use, or null while on GPS
 * suggestedState  directory state the phone is in; listed first
 * onApply({state, district})
 * onUseCurrent    omit when the phone's location isn't available
 */
export default function WarehouseLocationSheet({
  visible,
  selected,
  suggestedState,
  onApply,
  onUseCurrent,
  onClose,
}) {
  const {t} = useTranslation();
  const [state, setState] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) {
      setState('');
      setSearch('');
    }
  }, [visible]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (state) {
      const districts = listDistricts(state);
      const matching = districts.filter(item =>
        item.name.toLowerCase().includes(term),
      );

      return term
        ? matching
        : [
            {
              name: ALL_DISTRICTS,
              label: t('warehouseLocationSheet.allOf', {state}),
              count: WAREHOUSES.filter(item => item.state === state).length,
            },
            ...matching,
          ];
    }

    const matching = listStates().filter(item =>
      item.name.toLowerCase().includes(term),
    );

    // the phone's own state comes first
    return [
      ...matching.filter(item => item.name === suggestedState),
      ...matching.filter(item => item.name !== suggestedState),
    ];
  }, [state, search, suggestedState, t]);

  const chooseState = name => {
    setState(name);
    setSearch('');
  };

  const isSelected = item =>
    state
      ? selected?.state === state && selected?.district === item.name
      : selected?.state === item.name;

  const renderRow = ({ item }) => {
    const active = isSelected(item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.row, active && styles.rowActive]}
        onPress={() =>
          state
            ? onApply({ state, district: item.name })
            : chooseState(item.name)
        }
      >
        <View style={styles.flex}>
          <Text
            style={[styles.rowText, active && styles.rowTextActive]}
            numberOfLines={1}
          >
            {item.label || item.name}
          </Text>
          {!state && item.name === suggestedState && (
            <Text style={styles.hint}>{t('warehouseLocationSheet.yourCurrentState')}</Text>
          )}
        </View>
        <Text style={styles.count}>{item.count}</Text>
        {state ? (
          active && <Check size={18} color={WH.steel} strokeWidth={3} />
        ) : (
          <ChevronRight size={18} color={WH.placeholder} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            {!!state && (
              <Pressable
                hitSlop={10}
                onPress={() => chooseState('')}
                style={styles.close}
                accessibilityLabel={t('warehouseLocationSheet.backToStates')}
              >
                <ArrowLeft size={18} color={WH.ink} />
              </Pressable>
            )}
            <View style={styles.flex}>
              <Text style={styles.title} numberOfLines={1}>
                {state || t('warehouseLocationSheet.chooseYourState')}
              </Text>
              <Text style={styles.subtitle}>
                {state ? t('warehouseLocationSheet.chooseADistrict') : t('warehouseLocationSheet.warehousesListedPerState')}
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={onClose}
              style={styles.close}
              accessibilityLabel={t('common.close')}
            >
              <X size={18} color={WH.muted} />
            </Pressable>
          </View>

          {!state && !!onUseCurrent && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.current}
              onPress={onUseCurrent}
            >
              <View style={styles.currentIcon}>
                <LocateFixed size={18} color={WH.white} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.currentTitle}>{t('warehouseLocationSheet.useMyCurrentLocation')}</Text>
                <Text style={styles.currentText}>{t('warehouseLocationSheet.nearestWarehousesFirst')}</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.search}>
            <Search size={17} color={WH.steel} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={state ? t('warehouseLocationSheet.searchDistrict') : t('warehouseLocationSheet.searchState')}
              placeholderTextColor={WH.placeholder}
              style={styles.searchInput}
              autoCorrect={false}
            />
            {!!search && (
              <Pressable hitSlop={10} onPress={() => setSearch('')}>
                <X size={16} color={WH.muted} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={rows}
            keyExtractor={item => item.name || 'all'}
            renderItem={renderRow}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {t('warehouseLocationSheet.noMatchesInThisDirectory', {v1: state ? 'district' : 'state', search})}
              </Text>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,42,67,0.5)',
  },
  sheet: {
    height: '82%',
    backgroundColor: WH.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D6DEE6',
    marginTop: 10,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 18, fontWeight: '900', color: WH.ink },
  subtitle: { marginTop: 1, fontSize: 12, fontWeight: '600', color: WH.muted },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WH.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  current: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: WH.steelSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: WH.steel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTitle: { fontSize: 14, fontWeight: '900', color: WH.steelDark },
  currentText: { fontSize: 11.5, fontWeight: '600', color: WH.muted },
  search: {
    marginTop: 14,
    height: 46,
    borderRadius: 23,
    backgroundColor: WH.bg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 9,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    fontWeight: '600',
    color: WH.ink,
  },
  list: { flex: 1, marginTop: 8 },
  row: {
    minHeight: 52,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowActive: { backgroundColor: WH.steelSoft },
  rowText: { fontSize: 14.5, fontWeight: '700', color: WH.ink },
  rowTextActive: { color: WH.steelDark, fontWeight: '900' },
  hint: { marginTop: 1, fontSize: 11, fontWeight: '700', color: WH.amberDark },
  count: { fontSize: 12, fontWeight: '800', color: WH.muted },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: WH.muted,
  },
});
