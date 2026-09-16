import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CircleCheck, Info, X } from 'lucide-react-native';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';

const DoctorFeedbackModal = ({
  visible,
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
  onConfirm,
  onClose,
}) => {
  const isSuccess = variant === 'success';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose || onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity
            accessibilityLabel="Close"
            style={styles.closeButton}
            onPress={onClose || onConfirm}
          >
            <X size={18} color={MUTED} />
          </TouchableOpacity>

          <View
            style={[
              styles.icon,
              isSuccess ? styles.successIcon : styles.infoIcon,
            ]}
          >
            {isSuccess ? (
              <CircleCheck size={28} color={GREEN} />
            ) : (
              <Info size={28} color="#2563EB" />
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.confirmButton}
            onPress={onConfirm || onClose}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 24,
    backgroundColor: WHITE,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: { backgroundColor: '#EAF7EF' },
  infoIcon: { backgroundColor: '#EFF6FF' },
  title: {
    color: DARK,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    minWidth: 130,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
  },
  confirmText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default DoctorFeedbackModal;
