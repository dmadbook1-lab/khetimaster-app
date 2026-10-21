import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Star, X} from 'lucide-react-native';

import {MARKET_COLORS as C} from './theme';
import {MarketButton} from './MarketBits';

/*
 * Small bottom sheet with an optional note, used for reject / cancel
 * reasons and, with withRating, for reviews.
 *
 * onSubmit({text, rating})
 * serverError -> message from a failed request, shown inside the sheet
 */
export default function NoteSheet({
  visible,
  title,
  description,
  placeholder = 'Add a note (optional)',
  submitLabel = 'Submit',
  variant = 'primary',
  withRating = false,
  loading = false,
  serverError,
  onClose,
  onSubmit,
}) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setText('');
      setRating(0);
      setError(null);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (withRating && !rating) {
      setError('Please choose a rating');
      return;
    }

    onSubmit({text: text.trim(), rating});
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable hitSlop={10} onPress={onClose}>
              <X size={20} color={C.muted} />
            </Pressable>
          </View>

          {!!description && <Text style={styles.description}>{description}</Text>}

          {withRating && (
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(value => (
                <Pressable key={value} hitSlop={6} onPress={() => setRating(value)}>
                  <Star
                    size={34}
                    color={value <= rating ? '#F5A524' : '#D0D5D2'}
                    fill={value <= rating ? '#F5A524' : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>
          )}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={C.placeholder}
            style={styles.input}
            maxLength={500}
            multiline
            textAlignVertical="top"
          />

          {!!(error || serverError) && (
            <Text style={styles.error}>{error || serverError}</Text>
          )}

          <MarketButton
            label={submitLabel}
            variant={variant}
            loading={loading}
            onPress={handleSubmit}
            style={styles.submit}
          />
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
  description: {fontSize: 12, color: C.muted, fontWeight: '600', marginTop: 6, lineHeight: 18},
  stars: {flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 18},
  input: {
    marginTop: 16,
    height: 96,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 12,
    fontSize: 14,
    color: C.dark,
    backgroundColor: C.input,
  },
  error: {color: C.red, fontSize: 12, fontWeight: '700', marginTop: 10},
  submit: {marginTop: 16},
});
