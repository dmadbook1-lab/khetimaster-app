import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Star, X } from 'lucide-react-native';

import { CARE as C } from './careTheme';
import { CareButton, CareChips, CareField, CareInput } from './CareBits';
import { addDaysToKey, dayKeyOf, formatDay } from '../../utils/indiaSchedule';

const FOLLOW_UPS = [
  { key: 'none', label: 'No follow-up', days: null },
  { key: '3', label: 'In 3 days', days: 3 },
  { key: '7', label: 'In 1 week', days: 7 },
  { key: '14', label: 'In 2 weeks', days: 14 },
  { key: '30', label: 'In 1 month', days: 30 },
];

/*
 * Bottom sheet for reasons, reviews and the doctor's diagnosis.
 *
 * fields       [{key, label, placeholder, multiline, maxLength}]
 * withRating   adds 1-5 stars (required)
 * withFollowUp adds follow-up chips; submits followUpDate 'YYYY-MM-DD'
 *              or null
 * initialValues prefill for fields / followUpDate
 * onSubmit(values) -> {rating, followUpDate, [field.key]: text}
 * serverError  message from a failed request, shown inside the sheet
 *              (iOS can't show a second modal on top of this one)
 */
export default function CareSheet({
  visible,
  title,
  description,
  fields = [],
  withRating = false,
  withFollowUp = false,
  todayKey,
  initialValues = {},
  submitLabel = 'Submit',
  variant = 'primary',
  loading = false,
  serverError,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState({});
  const [rating, setRating] = useState(0);
  const [followUp, setFollowUp] = useState('none');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) return;

    setValues(
      Object.fromEntries(
        fields.map(field => [field.key, initialValues[field.key] || '']),
      ),
    );
    setRating(0);
    setFollowUp(initialValues.followUpDate ? 'keep' : 'none');
    setError(null);
    // reset only when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const existingFollowUp = dayKeyOf(initialValues.followUpDate);
  const followUpOptions = existingFollowUp
    ? [
        {
          key: 'keep',
          label: formatDay(existingFollowUp, { weekday: false, year: false }),
        },
        ...FOLLOW_UPS,
      ]
    : FOLLOW_UPS;

  const handleSubmit = () => {
    if (withRating && !rating) {
      setError('Please choose a rating');
      return;
    }

    const trimmed = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    );

    let followUpDate;
    if (withFollowUp) {
      const option = FOLLOW_UPS.find(item => item.key === followUp);
      followUpDate =
        followUp === 'keep'
          ? existingFollowUp
          : option?.days
          ? addDaysToKey(todayKey, option.days)
          : null;
    }

    onSubmit({ ...trimmed, rating, followUpDate });
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

          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.close}>
              <X size={18} color={C.muted} />
            </Pressable>
          </View>

          {!!description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            {withRating && (
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(value => (
                  <Pressable
                    key={value}
                    hitSlop={6}
                    onPress={() => setRating(value)}
                  >
                    <Star
                      size={36}
                      color={value <= rating ? C.gold : '#D0D5DD'}
                      fill={value <= rating ? C.gold : 'transparent'}
                    />
                  </Pressable>
                ))}
              </View>
            )}

            {fields.map(field => (
              <CareField key={field.key} label={field.label}>
                <CareInput
                  value={values[field.key] || ''}
                  onChangeText={text =>
                    setValues(previous => ({ ...previous, [field.key]: text }))
                  }
                  placeholder={field.placeholder}
                  multiline={field.multiline}
                  maxLength={field.maxLength || 500}
                />
              </CareField>
            ))}

            {withFollowUp && (
              <CareField label="Follow-up visit">
                <CareChips
                  options={followUpOptions}
                  value={followUp}
                  onChange={setFollowUp}
                />
              </CareField>
            )}
          </ScrollView>

          {!!(error || serverError) && (
            <Text style={styles.error}>{error || serverError}</Text>
          )}

          <CareButton
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
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,37,69,0.5)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: C.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D5DEDD',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: { flex: 1, fontSize: 18, fontWeight: '900', color: C.ink },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 18,
  },
  scroll: { flexGrow: 0 },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  error: { color: C.red, fontSize: 12, fontWeight: '700', marginTop: 10 },
  submit: { marginTop: 16 },
});
