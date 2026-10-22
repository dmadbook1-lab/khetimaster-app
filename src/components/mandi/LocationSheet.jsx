import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Check, MapPin, Search, X } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { MARKET_COLORS as C } from '../market/theme';
import { MarketButton } from '../market/MarketBits';
import {
  fetchMandiDistricts,
  setMandiLocation,
} from '../../redux/slices/mandiSlice';

const ALL_DISTRICTS = '';

/*
 * Two steps: pick a state, then a district (or the whole state).
 * Saves to the mandi location only; the user's profile is not changed.
 */
export default function LocationSheet({ visible, onClose }) {
  const dispatch = useDispatch();
  const { states, districts, districtsLoading, location } = useSelector(
    state => state.mandi,
  );

  const [step, setStep] = useState('state');
  const [draftState, setDraftState] = useState('');
  const [draftDistrict, setDraftDistrict] = useState(ALL_DISTRICTS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;

    setDraftState(location?.state || '');
    setDraftDistrict(location?.district || ALL_DISTRICTS);
    setSearch('');
    setStep(location?.state ? 'district' : 'state');

    if (location?.state && !districts[location.state]) {
      dispatch(fetchMandiDistricts(location.state));
    }
    // reset only when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const chooseState = name => {
    setDraftState(name);
    setDraftDistrict(ALL_DISTRICTS);
    setSearch('');
    setStep('district');
    if (!districts[name]) dispatch(fetchMandiDistricts(name));
  };

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list =
      step === 'state'
        ? states.map(item => item.name)
        : [ALL_DISTRICTS, ...(districts[draftState] || [])];

    return query
      ? list.filter(name => name && name.toLowerCase().includes(query))
      : list;
  }, [step, states, districts, draftState, search]);

  const apply = () => {
    dispatch(setMandiLocation({ state: draftState, district: draftDistrict }));
    onClose();
  };

  const loadingDistricts =
    step === 'district' && districtsLoading && !districts[draftState];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            {step === 'district' ? (
              <Pressable
                hitSlop={10}
                style={styles.iconButton}
                onPress={() => {
                  setSearch('');
                  setStep('state');
                }}
              >
                <ArrowLeft size={18} color={C.dark} />
              </Pressable>
            ) : (
              <View style={styles.iconButton}>
                <MapPin size={18} color={C.green} />
              </View>
            )}
            <View style={styles.flex}>
              <Text style={styles.title}>
                {step === 'state' ? 'Choose state' : draftState}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'state'
                  ? 'Prices are shown for this place'
                  : 'Pick a district or the whole state'}
              </Text>
            </View>
            <Pressable hitSlop={10} style={styles.iconButton} onPress={onClose}>
              <X size={18} color={C.muted} />
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Search size={16} color={C.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={
                step === 'state' ? 'Search state' : 'Search district'
              }
              placeholderTextColor={C.placeholder}
              style={styles.searchInput}
            />
          </View>

          {loadingDistricts ? (
            <ActivityIndicator color={C.green} style={styles.loader} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={item => item || 'all'}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  {step === 'district'
                    ? 'No districts reported prices recently.'
                    : 'No match'}
                </Text>
              }
              renderItem={({ item }) => {
                const selected =
                  step === 'state'
                    ? item === draftState
                    : item === draftDistrict;

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.row, selected && styles.rowSelected]}
                    onPress={() =>
                      step === 'state'
                        ? chooseState(item)
                        : setDraftDistrict(item)
                    }
                  >
                    <Text
                      style={[
                        styles.rowText,
                        selected && styles.rowTextSelected,
                      ]}
                    >
                      {item || `All of ${draftState}`}
                    </Text>
                    {selected && <Check size={17} color={C.green} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {step === 'district' && (
            <MarketButton
              label={
                draftDistrict
                  ? `Show ${draftDistrict} prices`
                  : `Show ${draftState} prices`
              }
              onPress={apply}
              style={styles.apply}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    height: '78%',
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9DEDB',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '900', color: C.dark },
  subtitle: { fontSize: 11.5, fontWeight: '600', color: C.muted },
  searchBox: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.dark, paddingVertical: 0 },
  list: { flex: 1, marginTop: 8 },
  loader: { marginTop: 40 },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12.5,
    fontWeight: '600',
    color: C.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowSelected: { backgroundColor: C.lightGreen },
  rowText: { fontSize: 14, fontWeight: '700', color: C.text },
  rowTextSelected: { color: C.green, fontWeight: '900' },
  apply: { marginTop: 10 },
});
