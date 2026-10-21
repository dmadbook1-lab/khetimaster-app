import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  AlertTriangle,
  CircleCheck,
  CircleHelp,
  CircleX,
  Info,
} from 'lucide-react-native';

/*
|--------------------------------------------------------------------------
| FEEDBACK MODAL
|--------------------------------------------------------------------------
|
| In-app replacement for Alert.alert: success / error / info / warning
| messages and confirmations.
|
|   const feedback = useFeedbackModal();
|
|   feedback.success('Listing published', 'Buyers can now see it', {
|     primaryLabel: 'View Listing',
|     onPrimary: () => navigation.navigate(...),
|   });
|
|   feedback.confirm({
|     title: 'Delete listing?',
|     message: '...',
|     confirmLabel: 'Delete',
|     destructive: true,
|     onConfirm: async () => { ... },   // spinner shown while it runs
|   });
|
|   <FeedbackModal {...feedback.modalProps} />
|
| Don't open it while another Modal (a bottom sheet) is visible - iOS
| can only present one at a time. Show errors inside the sheet instead.
|
*/

const VARIANTS = {
  success: {
    icon: CircleCheck,
    color: '#159447',
    gradient: ['#E3F7EA', '#FFFFFF'],
    bubble: '#D3F1DE',
  },
  error: {
    icon: CircleX,
    color: '#C8372A',
    gradient: ['#FDE8E6', '#FFFFFF'],
    bubble: '#FBD5D1',
  },
  warning: {
    icon: AlertTriangle,
    color: '#B7791F',
    gradient: ['#FFF3D6', '#FFFFFF'],
    bubble: '#FDE7B0',
  },
  confirm: {
    icon: CircleHelp,
    color: '#2563EB',
    gradient: ['#E6EEFF', '#FFFFFF'],
    bubble: '#D3E1FF',
  },
  info: {
    icon: Info,
    color: '#2563EB',
    gradient: ['#E6EEFF', '#FFFFFF'],
    bubble: '#D3E1FF',
  },
};

export default function FeedbackModal({
  visible,
  variant = 'info',
  title,
  message,
  primaryLabel = 'OK',
  secondaryLabel,
  destructive = false,
  loading = false,
  onPrimary,
  onSecondary,
  onClose,
}) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = destructive ? AlertTriangle : config.icon;
  const color = destructive ? '#C8372A' : config.color;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onClose}
        />

        <View style={styles.card}>
          <LinearGradient
            colors={destructive ? VARIANTS.error.gradient : config.gradient}
            style={styles.top}
          >
            <View
              style={[
                styles.iconRing,
                {
                  backgroundColor: destructive
                    ? VARIANTS.error.bubble
                    : config.bubble,
                },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: color }]}>
                <Icon size={28} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {!!title && <Text style={styles.title}>{title}</Text>}
            {!!message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.buttons}>
              {!!secondaryLabel && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={loading}
                  style={[styles.button, styles.secondary]}
                  onPress={onSecondary}
                >
                  <Text style={styles.secondaryText}>{secondaryLabel}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={loading}
                style={[styles.button, { backgroundColor: color }]}
                onPress={onPrimary}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryText}>{primaryLabel}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/*
 * State + helpers for FeedbackModal. See the usage notes above.
 */
export function useFeedbackModal() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const idRef = useRef(0);

  const show = useCallback(options => {
    idRef.current += 1;
    setLoading(false);
    setConfig({ ...options, id: idRef.current });
  }, []);

  const hide = useCallback(() => {
    setLoading(false);
    setConfig(null);
  }, []);

  const success = useCallback(
    (title, message, options = {}) =>
      show({ variant: 'success', title, message, ...options }),
    [show],
  );

  const error = useCallback(
    (title, message, options = {}) =>
      show({
        variant: 'error',
        title,
        message:
          typeof message === 'string'
            ? message
            : message?.message || 'Please try again.',
        ...options,
      }),
    [show],
  );

  const info = useCallback(
    (title, message, options = {}) =>
      show({ variant: 'info', title, message, ...options }),
    [show],
  );

  /*
   * onConfirm may return a promise; the modal shows a spinner until it
   * settles, then closes (unless the handler opened another message).
   */
  const confirm = useCallback(
    ({
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      onConfirm,
      ...options
    }) =>
      show({
        variant: 'confirm',
        primaryLabel: confirmLabel,
        secondaryLabel: cancelLabel,
        onPrimary: onConfirm,
        awaitPrimary: true,
        ...options,
      }),
    [show],
  );

  const handlePrimary = useCallback(async () => {
    if (!config) return;

    const { onPrimary, awaitPrimary, id } = config;

    if (!awaitPrimary) {
      hide();
      onPrimary?.();
      return;
    }

    setLoading(true);

    try {
      await onPrimary?.();
    } finally {
      // the handler may have replaced this message with a new one
      if (idRef.current === id) {
        hide();
      }
    }
  }, [config, hide]);

  const handleSecondary = useCallback(() => {
    const onSecondary = config?.onSecondary;
    hide();
    onSecondary?.();
  }, [config, hide]);

  return {
    show,
    hide,
    success,
    error,
    info,
    confirm,
    modalProps: {
      visible: Boolean(config),
      variant: config?.variant,
      title: config?.title,
      message: config?.message,
      primaryLabel: config?.primaryLabel,
      secondaryLabel: config?.secondaryLabel,
      destructive: config?.destructive,
      loading,
      onPrimary: handlePrimary,
      onSecondary: handleSecondary,
      onClose: config?.dismissable === false ? undefined : handleSecondary,
    },
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 15, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  top: { alignItems: 'center', paddingTop: 26, paddingBottom: 6 },
  iconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 22 },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#151C2B',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  message: {
    marginTop: 8,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#5B6470',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 22 },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: '#F0F3F1' },
  secondaryText: { fontSize: 14, fontWeight: '800', color: '#344054' },
  primaryText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
});
