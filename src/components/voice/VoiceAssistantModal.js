import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  addSpeechResultListener,
  addSpeechErrorListener,
  addSpeechEndListener,
  isAvailable,
  requestPermissions,
  start,
  stop,
} from '@dbkable/react-native-speech-to-text';

import Tts from 'react-native-tts';

import {
  Mic,
  X,
  Volume2,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react-native';

import {
  resolveVoiceCommand,
} from '../../utils/voiceCommandResolver';

const STATUS = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function VoiceAssistantModal({
  visible,
  onClose,
  onNavigate,
}) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [transcript, setTranscript] = useState('');

  const [message, setMessage] = useState(
    'Tap the microphone and speak naturally',
  );

  const [permissionError, setPermissionError] = useState('');

  const mountedRef = useRef(false);
  const closingRef = useRef(false);
  const processingRef = useRef(false);
  const listeningRef = useRef(false);
  const visibleRef = useRef(visible);

  const handleFinalTranscriptRef = useRef(null);
  const startListeningRef = useRef(null);
  const greetingUtteranceRef = useRef(null);

  const resultSubscriptionRef = useRef(null);
  const errorSubscriptionRef = useRef(null);
  const endSubscriptionRef = useRef(null);

  const navigationTimerRef = useRef(null);
  const restartTimerRef = useRef(null);

  // Entrance animation
  const animation = useRef(
    new Animated.Value(0),
  ).current;

  // Microphone pulse animation
  const pulseAnimation = useRef(
    new Animated.Value(1),
  ).current;

  // Green glow animation
  const glowAnimation = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // ------------------------------------------
  // TIMER CLEANUP
  // ------------------------------------------

  const clearTimers = useCallback(() => {
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  // ------------------------------------------
  // SPEECH LISTENER CLEANUP
  // ------------------------------------------

  const removeSubscriptions = useCallback(() => {
    [
      resultSubscriptionRef,
      errorSubscriptionRef,
      endSubscriptionRef,
    ].forEach(subscriptionRef => {
      const subscription = subscriptionRef.current;

      if (!subscription) {
        return;
      }

      try {
        if (typeof subscription.remove === 'function') {
          subscription.remove();
        } else if (typeof subscription === 'function') {
          subscription();
        }
      } catch (error) {
        console.warn(
          '[KhetiMaster Voice] Listener cleanup error:',
          error?.message,
        );
      }

      subscriptionRef.current = null;
    });
  }, []);

  // ------------------------------------------
  // STOP LISTENING
  // ------------------------------------------

  const stopListening = useCallback(async () => {
    listeningRef.current = false;

    try {
      await stop();
    } catch (error) {
      console.log(
        '[KhetiMaster Voice] Stop recognition:',
        error?.message,
      );
    }
  }, []);

  // ------------------------------------------
  // CLOSE ASSISTANT
  // ------------------------------------------

  const closeAssistant = useCallback(async () => {
    closingRef.current = true;
    processingRef.current = true;

    clearTimers();

    setStatus(STATUS.IDLE);

    await stopListening();

    try {
      await Tts.stop();
    } catch (error) {
      console.warn(
        '[KhetiMaster Voice] Text-to-speech stop error:',
        error?.message,
      );
    }

    onClose?.();
  }, [clearTimers, onClose, stopListening]);

  // ------------------------------------------
  // MICROPHONE PERMISSION
  // ------------------------------------------

  const requestSpeechPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const permission =
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

        const alreadyGranted =
          await PermissionsAndroid.check(permission);

        if (alreadyGranted) {
          return true;
        }

        const result = await PermissionsAndroid.request(
          permission,
          {
            title: 'Microphone permission',
            message:
              'KhetiMaster needs microphone access to understand your voice commands.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );

        return (
          result === PermissionsAndroid.RESULTS.GRANTED
        );
      }

      if (typeof requestPermissions === 'function') {
        const result = await requestPermissions();
        return result !== false;
      }

      return true;
    } catch (error) {
      console.warn(
        '[KhetiMaster Voice] Permission error:',
        error?.message,
      );

      return false;
    }
  }, []);

  // ------------------------------------------
  // SPEAK RESPONSE
  // ------------------------------------------

  const speakGreeting = useCallback(
    async response => {
      setStatus(STATUS.SUCCESS);
      setMessage(response);

      await stopListening();

      try {
        await Tts.getInitStatus();

        await Tts.setDefaultLanguage('en-IN');
        await Tts.setDefaultRate(0.48);
        await Tts.setDefaultPitch(1.08);

        if (
          !mountedRef.current ||
          !visibleRef.current ||
          closingRef.current
        ) {
          return;
        }

        greetingUtteranceRef.current = await Tts.speak(
          response,
        );
      } catch (error) {
        console.error(
          '[KhetiMaster Voice] Text-to-speech error:',
          error,
        );

        greetingUtteranceRef.current = null;
        processingRef.current = false;

        setStatus(STATUS.ERROR);

        setMessage(
          'I could not speak just now. Tap the microphone to try again.',
        );
      }
    },
    [stopListening],
  );

  // ------------------------------------------
  // PROCESS FINAL TRANSCRIPT
  // ------------------------------------------

  const handleFinalTranscript = useCallback(
    async recognizedText => {
      if (
        !mountedRef.current ||
        closingRef.current ||
        processingRef.current
      ) {
        return;
      }

      const cleanTranscript = String(
        recognizedText || '',
      ).trim();

      if (!cleanTranscript) {
        return;
      }

      processingRef.current = true;

      setTranscript(cleanTranscript);
      setStatus(STATUS.PROCESSING);
      setMessage('Understanding your request…');

      console.log(
        '[KhetiMaster Voice] Recognized:',
        cleanTranscript,
      );

      const command = resolveVoiceCommand(
        cleanTranscript,
      );

      console.log(
        '[KhetiMaster Voice] Resolved command:',
        command,
      );

      // Cancel command
      if (command.type === 'cancel') {
        setMessage('Closing voice assistant…');
        setStatus(STATUS.SUCCESS);

        navigationTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            closeAssistant();
          }
        }, 350);

        return;
      }

      // Navigation command
      if (command.type === 'navigate') {
        setStatus(STATUS.SUCCESS);

        setMessage(
          command.message || 'Opening your destination…',
        );

        await stopListening();

        navigationTimerRef.current = setTimeout(() => {
          if (
            !mountedRef.current ||
            closingRef.current ||
            !visibleRef.current
          ) {
            return;
          }

          console.log(
            '[KhetiMaster Voice] Navigating to:',
            command.route,
          );

          closingRef.current = true;

          if (typeof onNavigate === 'function') {
            onNavigate(command.route);
          } else {
            console.warn(
              '[KhetiMaster Voice] Missing onNavigate callback',
            );
          }
        }, 500);

        return;
      }

      // Greeting command
      if (command.type === 'greeting') {
        await speakGreeting(command.response);
        return;
      }

      // Unknown command
      if (command.type === 'unknown') {
        setStatus(STATUS.ERROR);

        setMessage(
          'Sorry, I did not understand that. Try another command.',
        );

        processingRef.current = false;
        return;
      }

      setStatus(STATUS.ERROR);
      setMessage('Please speak a command.');

      processingRef.current = false;
    },
    [
      closeAssistant,
      onNavigate,
      speakGreeting,
      stopListening,
    ],
  );

  useEffect(() => {
    handleFinalTranscriptRef.current =
      handleFinalTranscript;
  }, [handleFinalTranscript]);

  // ------------------------------------------
  // START LISTENING
  // ------------------------------------------

  const startListening = useCallback(async () => {
    if (
      !mountedRef.current ||
      !visibleRef.current ||
      closingRef.current ||
      listeningRef.current
    ) {
      return;
    }

    try {
      setPermissionError('');

      setStatus(STATUS.IDLE);
      setMessage('Getting your voice assistant ready…');

      const granted = await requestSpeechPermission();

      if (!granted) {
        setStatus(STATUS.ERROR);

        setPermissionError(
          'Microphone permission is required. Enable it in your phone settings.',
        );

        setMessage(
          'Microphone permission was not granted.',
        );

        return;
      }

      if (
        !mountedRef.current ||
        !visibleRef.current ||
        closingRef.current
      ) {
        return;
      }

      if (typeof isAvailable === 'function') {
        const available = await isAvailable();

        if (available === false) {
          setStatus(STATUS.ERROR);

          setMessage(
            'Speech recognition is unavailable on this device.',
          );

          return;
        }
      }

      setTranscript('');
      setStatus(STATUS.LISTENING);

      setMessage(
        'Listening… Speak your command now',
      );

      listeningRef.current = true;

      await start({
        language: 'en-IN',
      });

      console.log(
        '[KhetiMaster Voice] Recognition started',
      );
    } catch (error) {
      listeningRef.current = false;

      console.error(
        '[KhetiMaster Voice] Start error:',
        error,
      );

      setStatus(STATUS.ERROR);

      setMessage(
        error?.message ||
          'Could not start speech recognition. Please try again.',
      );
    }
  }, [requestSpeechPermission]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // ------------------------------------------
  // RETRY LISTENING
  // ------------------------------------------

  const retryListening = useCallback(async () => {
    processingRef.current = false;
    closingRef.current = false;
    greetingUtteranceRef.current = null;

    clearTimers();

    try {
      await Tts.stop();
    } catch (error) {
      console.warn(
        '[KhetiMaster Voice] Text-to-speech stop error:',
        error?.message,
      );
    }

    await stopListening();

    setTranscript('');
    setPermissionError('');
    setStatus(STATUS.IDLE);

    setMessage(
      'Tap the microphone and speak naturally',
    );

    restartTimerRef.current = setTimeout(() => {
      startListening();
    }, 250);
  }, [clearTimers, startListening, stopListening]);

  // ------------------------------------------
  // SPEECH RECOGNITION EVENT LISTENERS
  // ------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    // react-native-tts' removeEventListener() calls
    // NativeEventEmitter.removeListener, which no longer exists in
    // React Native 0.86. Keep the subscriptions and remove() them instead.
    const ttsSubscriptions = [];

    const handleTtsFinish = event => {
      if (
        String(event?.utteranceId) !==
          String(greetingUtteranceRef.current) ||
        !greetingUtteranceRef.current
      ) {
        return;
      }

      greetingUtteranceRef.current = null;

      if (
        !mountedRef.current ||
        closingRef.current ||
        !visibleRef.current
      ) {
        return;
      }

      processingRef.current = false;

      setStatus(STATUS.IDLE);

      setMessage(
        'I’m listening again. Say another screen name.',
      );

      restartTimerRef.current = setTimeout(() => {
        startListeningRef.current?.();
      }, 350);
    };

    const handleTtsError = event => {
      if (
        String(event?.utteranceId) !==
          String(greetingUtteranceRef.current) ||
        !greetingUtteranceRef.current
      ) {
        return;
      }

      console.error(
        '[KhetiMaster Voice] Speech playback error:',
        event,
      );

      greetingUtteranceRef.current = null;
      processingRef.current = false;

      setStatus(STATUS.ERROR);

      setMessage(
        'I could not speak just now. Tap the microphone to try again.',
      );
    };

    try {
      ttsSubscriptions.push(
        Tts.addEventListener(
          'tts-finish',
          handleTtsFinish,
        ),
        Tts.addEventListener(
          'tts-error',
          handleTtsError,
        ),
      );

      resultSubscriptionRef.current =
        addSpeechResultListener(result => {
          if (
            !mountedRef.current ||
            closingRef.current ||
            processingRef.current
          ) {
            return;
          }

          console.log(
            '[KhetiMaster Voice] Raw speech result:',
            result,
          );

          const recognizedText =
            typeof result === 'string'
              ? result.trim()
              : String(
                  result?.transcript ??
                    result?.text ??
                    result?.results?.[0]?.transcript ??
                    result?.results?.[0]?.text ??
                    '',
                ).trim();

          if (!recognizedText) {
            return;
          }

          setTranscript(recognizedText);

          const isFinal =
            result?.isFinal === true ||
            result?.is_final === true ||
            result?.final === true;

          if (isFinal) {
            handleFinalTranscriptRef.current?.(
              recognizedText,
            );
          }
        });

      errorSubscriptionRef.current =
        addSpeechErrorListener(error => {
          console.error(
            '[KhetiMaster Voice] Speech error:',
            error,
          );

          listeningRef.current = false;

          if (
            !mountedRef.current ||
            closingRef.current ||
            processingRef.current
          ) {
            return;
          }

          setStatus(STATUS.ERROR);

          setMessage(
            error?.message ||
              error?.error ||
              'Speech recognition encountered an error.',
          );
        });

      endSubscriptionRef.current =
        addSpeechEndListener(() => {
          console.log(
            '[KhetiMaster Voice] Speech recognition ended',
          );

          listeningRef.current = false;

          if (
            !mountedRef.current ||
            closingRef.current ||
            processingRef.current ||
            !visibleRef.current
          ) {
            return;
          }

          setStatus(current =>
            current === STATUS.LISTENING
              ? STATUS.IDLE
              : current,
          );

          setMessage(current =>
            current ===
            'Listening… Speak your command now'
              ? 'Tap the microphone to try again'
              : current,
          );
        });
    } catch (error) {
      console.error(
        '[KhetiMaster Voice] Listener setup error:',
        error,
      );
    }

    return () => {
      mountedRef.current = false;
      visibleRef.current = false;

      clearTimers();
      removeSubscriptions();

      ttsSubscriptions.forEach(subscription => {
        try {
          subscription?.remove?.();
        } catch (error) {
          console.warn(
            '[KhetiMaster Voice] TTS listener cleanup error:',
            error?.message,
          );
        }
      });

      stop().catch(() => {});

      Tts.stop().catch(error => {
        console.warn(
          '[KhetiMaster Voice] TTS cleanup error:',
          error?.message,
        );
      });
    };
  }, [clearTimers, removeSubscriptions]);

  // ------------------------------------------
  // MODAL OPEN / CLOSE LIFECYCLE
  // ------------------------------------------

  useEffect(() => {
    if (!visible) {
      closingRef.current = false;
      processingRef.current = false;
      listeningRef.current = false;

      clearTimers();

      setStatus(STATUS.IDLE);
      setTranscript('');
      setPermissionError('');

      setMessage(
        'Tap the microphone and speak naturally',
      );

      stopListening();

      return;
    }

    closingRef.current = false;
    processingRef.current = false;

    animation.setValue(0);

    Animated.timing(animation, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    startListening();

    return () => {
      clearTimers();
      stopListening();
    };
  }, [
    visible,
    animation,
    clearTimers,
    startListening,
    stopListening,
  ]);

  // ------------------------------------------
  // MICROPHONE PULSE AND GLOW ANIMATION
  // ------------------------------------------

  useEffect(() => {
    if (
      visible &&
      status === STATUS.LISTENING
    ) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.13,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),

          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );

      pulse.start();
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();

        pulseAnimation.setValue(1);
        glowAnimation.setValue(0);
      };
    }

    pulseAnimation.setValue(1);
    glowAnimation.setValue(0);
  }, [
    visible,
    status,
    pulseAnimation,
    glowAnimation,
  ]);

  if (!visible) {
    return null;
  }

  const isListening =
    status === STATUS.LISTENING;

  const isProcessing =
    status === STATUS.PROCESSING;

  const isSuccess =
    status === STATUS.SUCCESS;

  const isError =
    status === STATUS.ERROR;

  const micScale = pulseAnimation.interpolate({
    inputRange: [1, 1.13],
    outputRange: [1, 1.13],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.48],
  });

  const entranceTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [90, 0],
  });

  // ------------------------------------------
  // KhetiMaster LIGHT VOICE ASSISTANT UI
  // ------------------------------------------

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeAssistant}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.container}>
        {/* Translucent app backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeAssistant}
          style={styles.backdrop}
        />

        {/* Animated bottom sheet */}
        <Animated.View
          style={[
            styles.panel,
            {
              opacity: animation,
              transform: [
                {translateY: entranceTranslateY},
              ],
            },
          ]}>
          <View
            pointerEvents="none"
            style={styles.topGlow}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Volume2
                  size={19}
                  color="#16883E"
                />
              </View>

              <View>
                <Text style={styles.brandTitle}>
                  KhetiMaster
                </Text>

                <Text style={styles.brandSubtitle}>
                  YOUR FARMING ASSISTANT
                </Text>
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close voice assistant"
              onPress={closeAssistant}
              activeOpacity={0.7}
              style={styles.closeButton}>
              <X
                size={20}
                color="#31523B"
              />
            </TouchableOpacity>
          </View>

          {/* Listening status */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isError
                    ? '#DC4B4B'
                    : isSuccess
                      ? '#16883E'
                      : '#16883E',
                },
              ]}
            />

            <Text style={styles.statusText}>
              {isListening
                ? 'LISTENING'
                : isProcessing
                  ? 'UNDERSTANDING'
                  : isSuccess
                    ? 'COMMAND RECOGNIZED'
                    : isError
                      ? 'TRY AGAIN'
                      : 'READY TO HELP'}
            </Text>
          </View>

          {/* Main assistant content */}
          <View style={styles.centerContent}>
            {/* Animated green voice orb */}
            <View style={styles.orbArea}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.orbGlow,
                  {
                    opacity: glowOpacity,
                    transform: [{scale: micScale}],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.orb,
                  {
                    transform: [{scale: micScale}],
                  },
                ]}>
                <View style={styles.orbInner}>
                  {isProcessing ? (
                    <LoaderCircle
                      size={35}
                      color="#FFFFFF"
                    />
                  ) : isSuccess ? (
                    <CheckCircle2
                      size={38}
                      color="#FFFFFF"
                    />
                  ) : isError ? (
                    <AlertCircle
                      size={35}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Mic
                      size={38}
                      color="#FFFFFF"
                      strokeWidth={1.8}
                    />
                  )}
                </View>
              </Animated.View>
            </View>

            <Text style={styles.heading}>
              {isListening
                ? 'I’m listening'
                : isProcessing
                  ? 'One moment…'
                  : isSuccess
                    ? 'Got it!'
                    : isError
                      ? 'Let’s try again'
                      : 'How can I help you?'}
            </Text>

            <Text style={styles.description}>
              {permissionError ||
                (isListening
                  ? 'Speak naturally in Hindi, Hinglish or English'
                  : message)}
            </Text>

            {/* Recognized speech */}
            <View style={styles.transcriptBox}>
              <Text
                numberOfLines={3}
                style={[
                  styles.transcript,
                  !transcript &&
                    styles.placeholderTranscript,
                ]}>
                {transcript
                  ? `“${transcript}”`
                  : 'Ask anything about your farm…'}
              </Text>
            </View>

            {/* Main microphone button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tap to speak again"
              activeOpacity={0.85}
              onPress={retryListening}
              style={[
                styles.micButton,
                isError && styles.micButtonError,
              ]}>
              {isProcessing ? (
                <LoaderCircle
                  size={24}
                  color="#FFFFFF"
                />
              ) : (
                <Mic
                  size={25}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>

            <Text style={styles.micHint}>
              {isListening
                ? 'Listening to your voice'
                : 'Tap the microphone to speak'}
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Retry voice recognition"
              activeOpacity={0.75}
              onPress={retryListening}
              style={styles.bottomControl}>
              <Mic
                size={18}
                color="#4E6855"
              />
            </TouchableOpacity>

            <View style={styles.bottomCenter}>
              <View style={styles.homeIndicator} />

              <Text style={styles.footerText}>
                Powered by KhetiMaster
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close voice assistant"
              activeOpacity={0.75}
              onPress={closeAssistant}
              style={styles.bottomControl}>
              <X
                size={19}
                color="#4E6855"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ------------------------------------------
// LIGHT THEME STYLES
// ------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },

  // Translucent overlay keeps the underlying screen visible.
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(29, 50, 35, 0.24)',
  },

  // Off-white bottom sheet.
  panel: {
    width: '100%',
    height: '84%',
    maxHeight: 740,
    minHeight: 500,
    backgroundColor: '#FAFBF6',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(22, 136, 62, 0.18)',
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 10,
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#174D2A',
    shadowOpacity: 0.16,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: -8,
    },
    elevation: 25,
  },

  // Soft green ambient light.
  topGlow: {
    position: 'absolute',
    top: -115,
    left: '8%',
    width: '84%',
    height: 220,
    borderRadius: 150,
    backgroundColor: 'rgba(112, 190, 112, 0.13)',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  brandIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F3E6',
    borderWidth: 1,
    borderColor: '#D0E8D2',
  },

  brandTitle: {
    color: '#183D25',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  brandSubtitle: {
    color: '#7A907D',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginTop: 4,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 241, 230, 0.9)',
    borderWidth: 1,
    borderColor: '#DFE9DC',
  },

  // Status pill
  statusRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: '#EDF5EA',
    borderWidth: 1,
    borderColor: '#DDEBDD',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#49634D',
    letterSpacing: 1.3,
  },

  // Main content
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },

  // Orb
  orbArea: {
    width: 155,
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
  },

  orbGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 75,
    backgroundColor: '#83C98A',
    shadowColor: '#16883E',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
  },

  orb: {
    width: 112,
    height: 112,
    borderRadius: 60,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FBF2',
    borderWidth: 1,
    borderColor: '#B9DDBB',
    shadowColor: '#16883E',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 7,
  },

  orbInner: {
    flex: 1,
    width: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16883E',
    borderWidth: 5,
    borderColor: '#D8EED8',
  },

  heading: {
    color: '#183D25',
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginTop: 18,
  },

  description: {
    color: '#6E806F',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 9,
    paddingHorizontal: 10,
  },

  // Transcript
  transcriptBox: {
    width: '100%',
    minHeight: 54,
    maxWidth: 340,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(237, 245, 234, 0.88)',
    borderWidth: 1,
    borderColor: '#E0EBDD',
  },

  transcript: {
    color: '#294B31',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  placeholderTranscript: {
    color: '#8A9A8B',
    fontSize: 12,
  },

  // Main microphone button
  micButton: {
    width: 58,
    height: 58,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16883E',
    borderWidth: 4,
    borderColor: '#D9EEDB',
    shadowColor: '#16883E',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },

  micButtonError: {
    backgroundColor: '#C94343',
    borderColor: '#F7DEDE',
  },

  micHint: {
    color: '#829183',
    fontSize: 10,
    marginTop: 10,
  },

  // Bottom controls
  bottomBar: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E7EDE3',
    paddingTop: 10,
  },

  bottomControl: {
    width: 42,
    height: 42,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF5EC',
    borderWidth: 1,
    borderColor: '#E0E9DD',
  },

  bottomCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  homeIndicator: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#C4D3C1',
  },

  footerText: {
    color: '#899789',
    fontSize: 9,
    letterSpacing: 0.4,
  },
});