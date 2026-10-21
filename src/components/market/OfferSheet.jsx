import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Send, X} from 'lucide-react-native';

import {MARKET_COLORS as C} from './theme';
import {ChipRow, MarketButton} from './MarketBits';
import {
  formatPricePerUnit,
  formatQuantity,
  formatRupees,
  isDiscreteUnit,
  validateOfferQuantity,
} from '../../utils/marketFormat';

/*
 * Make an offer (buyer) or a counter offer (either side).
 *
 * terms: {unit, available, minOrderQuantity, listedPrice, deliveryAvailable}
 * priceLocked: buyer on a fixed price listing
 * serverError / errorAction: failed request message and an optional
 * {label, onPress} link shown with it
 */
export default function OfferSheet({
  visible,
  mode = 'offer',
  terms,
  initialQuantity,
  initialPrice,
  priceLocked = false,
  loading = false,
  serverError,
  errorAction,
  onClose,
  onSubmit,
}) {
  const isOffer = mode === 'offer';

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [fulfilment, setFulfilment] = useState('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setQuantity(initialQuantity ? String(initialQuantity) : '');
      setPrice(initialPrice ? String(initialPrice) : '');
      setMessage('');
      setFulfilment('PICKUP');
      setDeliveryAddress('');
      setError(null);
    }
  }, [visible, initialQuantity, initialPrice]);

  const total = useMemo(() => {
    const value = Number(quantity) * Number(price);
    return Number.isFinite(value) ? value : 0;
  }, [quantity, price]);

  const handleSubmit = () => {
    const quantityError = validateOfferQuantity(quantity, terms);

    if (quantityError) {
      setError(quantityError);
      return;
    }

    const priceValue = Number(price);

    if (!String(price).trim() || !Number.isFinite(priceValue) || priceValue <= 0) {
      setError('Enter a valid price per unit');
      return;
    }

    if (isOffer && fulfilment === 'DELIVERY' && !deliveryAddress.trim()) {
      setError('Enter the delivery address');
      return;
    }

    if (
      !isOffer &&
      Number(quantity) === Number(initialQuantity) &&
      priceValue === Number(initialPrice)
    ) {
      setError('Change the price or quantity, or accept the current offer instead');
      return;
    }

    setError(null);

    onSubmit({
      quantity: Number(quantity),
      pricePerUnit: priceValue,
      message: message.trim(),
      ...(isOffer && {
        fulfilment,
        deliveryAddress: fulfilment === 'DELIVERY' ? deliveryAddress.trim() : '',
      }),
    });
  };

  const unit = terms?.unit;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>{isOffer ? 'Make an Offer' : 'Counter Offer'}</Text>
            <Pressable hitSlop={10} onPress={onClose}>
              <X size={20} color={C.muted} />
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Listed at {formatPricePerUnit(terms?.listedPrice, unit)} ·{' '}
            {formatQuantity(terms?.available, unit)} available
            {terms?.minOrderQuantity
              ? ` · Min order ${formatQuantity(terms.minOrderQuantity, unit)}`
              : ''}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Quantity ({unit})</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType={isDiscreteUnit(unit) ? 'number-pad' : 'decimal-pad'}
                  placeholder="0"
                  placeholderTextColor={C.placeholder}
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Price per {unit}</Text>
                <View style={[styles.input, styles.priceBox, priceLocked && styles.locked]}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    editable={!priceLocked}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={C.placeholder}
                    style={styles.priceInput}
                  />
                </View>
              </View>
            </View>

            {priceLocked && (
              <Text style={styles.note}>The seller has fixed the price of this listing.</Text>
            )}

            {isOffer && (
              <>
                <Text style={styles.label}>Pickup or delivery</Text>
                <ChipRow
                  scroll={false}
                  value={fulfilment}
                  onChange={setFulfilment}
                  options={[
                    {key: 'PICKUP', label: 'I will pick up'},
                    ...(terms?.deliveryAvailable
                      ? [{key: 'DELIVERY', label: 'Deliver to me'}]
                      : []),
                  ]}
                />

                {fulfilment === 'DELIVERY' && (
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Village, taluka, district, landmark"
                    placeholderTextColor={C.placeholder}
                    style={[styles.input, styles.textArea, styles.addressInput]}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              </>
            )}

            <Text style={styles.label}>Message (optional)</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={isOffer ? 'e.g. I can pick up on Sunday' : 'Add a note'}
              placeholderTextColor={C.placeholder}
              style={[styles.input, styles.textArea]}
              maxLength={500}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total amount</Text>
              <Text style={styles.totalValue}>{formatRupees(total)}</Text>
            </View>

            {!!(error || serverError) && (
              <View style={styles.errorBox}>
                <Text style={styles.error}>{error || serverError}</Text>
                {!error && !!errorAction && (
                  <Pressable hitSlop={8} onPress={errorAction.onPress}>
                    <Text style={styles.errorAction}>{errorAction.label}</Text>
                  </Pressable>
                )}
              </View>
            )}

            <MarketButton
              label={isOffer ? 'Send Offer' : 'Send Counter Offer'}
              icon={<Send size={17} color={C.white} />}
              loading={loading}
              onPress={handleSubmit}
              style={styles.submit}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)'},
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingBottom: 28,
    maxHeight: '88%',
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
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 18, fontWeight: '900', color: C.dark},
  hint: {fontSize: 11.5, color: C.muted, fontWeight: '600', marginTop: 4, lineHeight: 17},
  row: {flexDirection: 'row', gap: 12},
  half: {flex: 1},
  label: {fontSize: 12, fontWeight: '800', color: C.dark, marginTop: 14, marginBottom: 7},
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 14,
    color: C.dark,
    backgroundColor: C.input,
  },
  priceBox: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0},
  locked: {backgroundColor: '#F0F2F1'},
  rupee: {paddingLeft: 13, fontSize: 14.5, fontWeight: '800', color: C.green},
  priceInput: {flex: 1, height: '100%', paddingHorizontal: 8, fontSize: 14, color: C.dark},
  note: {fontSize: 11, color: C.amber, fontWeight: '700', marginTop: 6},
  textArea: {height: 76, paddingTop: 12},
  addressInput: {marginTop: 10},
  totalRow: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {fontSize: 13, fontWeight: '800', color: C.text},
  totalValue: {fontSize: 18, fontWeight: '900', color: C.green},
  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightRed,
  },
  error: {color: C.red, fontSize: 12.5, fontWeight: '700'},
  errorAction: {color: C.red, fontSize: 12.5, fontWeight: '900', marginTop: 6, textDecorationLine: 'underline'},
  submit: {marginTop: 16},
});
