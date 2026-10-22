import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addAudioMeterUpdateListener,
  addSpeechEndListener,
  addSpeechErrorListener,
  addSpeechResultListener,
  isAvailable,
  requestPermissions,
  start,
  stop,
} from '@dbkable/react-native-speech-to-text';
import Tts from 'react-native-tts';
import { Mic, RotateCcw, Square, X } from 'lucide-react-native';

import ScreenGlow from './ScreenGlow';
import { resolveVoiceCommand } from '../../utils/voiceCommandResolver';

/*
|--------------------------------------------------------------------------
| VOICE ASSISTANT
|--------------------------------------------------------------------------
|
| A full-screen overlay (not a Modal: on Android a Modal is a separate
| window, so it couldn't blur the app). The app behind is blurred and
| can't be touched, the screen border glows, and a tall panel at the
| bottom shows what is being heard.
|
| Render it last inside a screen whose SafeAreaView pads the top edge;
| it extends up behind the status bar by that inset.
|
| open -> listen (words appear live) -> final words ->
| resolveVoiceCommand -> open a screen / answer / ask again
|
| onNavigate(routeName, params)
|
*/

const STATUS = {
  STARTING: 'starting',
  LISTENING: 'listening',
  THINKING: 'thinking',
  DONE: 'done',
  ERROR: 'error',
  IDLE: 'idle',
};

// border glow colours per state
// screen-edge glow: light green only
const EDGE_GLOW = ['#86EFAC', '#4ADE80', '#BBF7D0', '#86EFAC'];

const KHETIMASTER_LOGO = require('../../assets/images/logoo.png');

const LABELS = {
  starting: 'Getting ready…',
  listening: 'Listening…',
  thinking: 'Understanding…',
  done: 'Got it',
  error: 'Didn’t get that',
  idle: 'Tap the mic to speak',
};

// colours of the orb, status pill, message and mic per state
const TONES = {
  idle: {
    orb: ['#4ADE80', '#16A34A', '#BBF7D0', '#22C55E'],
    main: '#15803D',
    soft: '#DCFCE7',
    text: '#166534',
    button: ['#16A34A', '#0EA5E9'],
  },
  listening: {
    orb: ['#4ADE80', '#16A34A', '#BBF7D0', '#22C55E'],
    main: '#15803D',
    soft: '#DCFCE7',
    text: '#166534',
    button: ['#DC2626', '#F97316'],
  },
  thinking: {
    orb: ['#4ADE80', '#16A34A', '#BBF7D0', '#22C55E'],
    main: '#4F46E5',
    soft: '#E0E7FF',
    text: '#3730A3',
    button: ['#16A34A', '#0EA5E9'],
  },
  done: {
    orb: ['#4ADE80', '#16A34A', '#BBF7D0', '#22C55E'],
    main: '#15803D',
    soft: '#DCFCE7',
    text: '#166534',
    button: ['#16A34A', '#0EA5E9'],
  },
  error: {
    orb: ['#F97316', '#EF4444', '#F59E0B'],
    main: '#C2410C',
    soft: '#FFEDD5',
    text: '#9A3412',
    button: ['#16A34A', '#0EA5E9'],
  },
};
TONES.starting = TONES.thinking;

// stop waiting when nothing at all is heard
const SILENCE_TIMEOUT_MS = 8000;
// the panel takes at least this share of the screen height
const PANEL_MIN_HEIGHT = Math.round(Dimensions.get('window').height * 0.52);

const ORB = 112;

// how long "Got it" shows before the screen opens
const NAVIGATE_DELAY_MS = 650;

/*
 * Never throws: vibration needs the VIBRATE permission on Android.
 */
const buzz = ms => {
  try {
    Vibration.vibrate(ms);
  } catch {
    // no permission or no motor
  }
};

/*
 * Stops text-to-speech without waiting; never throws.
 */
const stopSpeaking = () => {
  try {
    Tts.stop()?.catch?.(() => {});
  } catch {
    // TTS not ready
  }
};

// if the recogniser never confirms it started, give the mic back
const START_TIMEOUT_MS = 6000;

/*
 * Android reports RMS dB (about -2 to 10), iOS a 0-1 level.
 */
const normalizeLevel = raw => {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  const level = value > 1 || value < 0 ? (value + 2) / 12 : value;
  return Math.min(Math.max(level, 0), 1);
};

const speechText = result =>
  typeof result === 'string'
    ? result.trim()
    : String(
        result?.transcript ??
          result?.text ??
          result?.results?.[0]?.transcript ??
          '',
      ).trim();

export default function VoiceAssistantModal({ visible, onClose, onNavigate }) {
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState(STATUS.STARTING);
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('');

  const appear = useRef(new Animated.Value(0)).current;
  const level = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  const visibleRef = useRef(visible);
  const listeningRef = useRef(false);
  const handledRef = useRef(false);
  const closingRef = useRef(false);
  const partialRef = useRef('');
  const utteranceRef = useRef(null);
  const timersRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const handleFinalRef = useRef(null);
  const startListeningRef = useRef(null);
  const closeRef = useRef(null);

  visibleRef.current = visible;

  /* TIMERS */

  const later = useCallback((callback, ms) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter(item => item !== timer);
      callback();
    }, ms);
    timersRef.current.push(timer);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    clearSilenceTimer();
  }, [clearSilenceTimer]);

  /* SPEECH */

  const stopListening = useCallback(async () => {
    clearSilenceTimer();
    listeningRef.current = false;
    level.setValue(0);

    try {
      await stop();
    } catch {
      // already stopped
    }
  }, [clearSilenceTimer, level]);

  const requestPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
        if (await PermissionsAndroid.check(permission)) return true;

        const result = await PermissionsAndroid.request(permission, {
          title: 'Microphone permission',
          message: 'KhetiMaster needs the microphone to understand your voice.',
          buttonPositive: 'Allow',
          buttonNegative: 'Not now',
        });

        return result === PermissionsAndroid.RESULTS.GRANTED;
      }

      return (await requestPermissions()) !== false;
    } catch {
      return false;
    }
  }, []);

  const fail = useCallback(text => {
    setStatus(STATUS.ERROR);
    setMessage(text);
    buzz(40);
  }, []);

  const startListening = useCallback(async () => {
    if (!visibleRef.current || closingRef.current || listeningRef.current) {
      return;
    }

    handledRef.current = false;
    partialRef.current = '';
    setTranscript('');
    setMessage('');
    setStatus(STATUS.STARTING);

    stopSpeaking();
    later(
      () =>
        setStatus(current =>
          current === STATUS.STARTING ? STATUS.IDLE : current,
        ),
      START_TIMEOUT_MS,
    );

    if (!(await requestPermission())) {
      fail('Allow microphone access in your phone settings to use voice.');
      return;
    }

    try {
      if ((await isAvailable()) === false) {
        fail('Voice recognition is not available on this phone.');
        return;
      }
    } catch {
      // let start() report the problem
    }

    if (!visibleRef.current || closingRef.current) return;

    try {
      listeningRef.current = true;
      await start({ language: 'en-IN' });

      if (!visibleRef.current || closingRef.current) {
        stopListening();
        return;
      }

      setStatus(STATUS.LISTENING);
      buzz(20);

      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        if (listeningRef.current && !partialRef.current) {
          stopListening();
          fail('I didn’t hear anything. Tap the mic and speak again.');
        }
      }, SILENCE_TIMEOUT_MS);
    } catch (error) {
      listeningRef.current = false;
      fail(error?.message || 'Could not start listening. Please try again.');
    }
  }, [clearSilenceTimer, fail, later, requestPermission, stopListening]);

  startListeningRef.current = startListening;

  /* UNDERSTAND WHAT WAS SAID */

  const handleFinal = useCallback(
    async text => {
      const spoken = String(text || '').trim();
      if (!spoken || handledRef.current || closingRef.current) return;

      handledRef.current = true;
      setTranscript(spoken);
      setStatus(STATUS.THINKING);
      setMessage('');
      await stopListening();

      const command = resolveVoiceCommand(spoken);

      if (command.type === 'cancel') {
        setStatus(STATUS.DONE);
        setMessage('Okay, closing.');
        later(() => closeRef.current?.(), 450);
        return;
      }

      if (command.type === 'navigate') {
        setStatus(STATUS.DONE);
        setMessage(command.message || 'Opening…');
        buzz(30);

        later(() => {
          if (!visibleRef.current || closingRef.current) return;
          closingRef.current = true;
          onNavigate?.(command.route, command.params);
        }, NAVIGATE_DELAY_MS);
        return;
      }

      if (command.type === 'greeting') {
        setStatus(STATUS.DONE);
        setMessage(command.response);

        try {
          await Tts.getInitStatus();
          await Tts.setDefaultLanguage('en-IN');
          await Tts.setDefaultRate(0.48);
          if (!visibleRef.current || closingRef.current) return;
          utteranceRef.current = await Tts.speak(command.response);
        } catch {
          // couldn't speak; the answer is on screen, listen again soon
          later(() => startListeningRef.current?.(), 2500);
        }
        return;
      }

      fail('I didn’t understand. Try “mandi bhav” or “tractor chahiye”.');
    },
    [fail, later, onNavigate, stopListening],
  );

  handleFinalRef.current = handleFinal;

  /* CLOSE */

  const close = useCallback(async () => {
    closingRef.current = true;
    clearAllTimers();

    stopSpeaking();
    await stopListening();

    Animated.timing(appear, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => onClose?.());
  }, [appear, clearAllTimers, onClose, stopListening]);

  closeRef.current = close;

  /* NATIVE LISTENERS (once) */

  useEffect(() => {
    const subscriptions = [];
    const add = factory => {
      try {
        const subscription = factory();
        if (subscription) subscriptions.push(subscription);
      } catch (error) {
        console.warn('[KhetiMaster Voice] listener setup:', error?.message);
      }
    };

    add(() =>
      addSpeechResultListener(result => {
        if (!visibleRef.current || handledRef.current) return;

        const text = speechText(result);
        if (!text) return;

        partialRef.current = text;
        setTranscript(text);

        const isFinal =
          result?.isFinal === true ||
          result?.is_final === true ||
          result?.final === true;

        if (isFinal) handleFinalRef.current?.(text);
      }),
    );

    add(() =>
      addSpeechEndListener(() => {
        listeningRef.current = false;
        level.setValue(0);
        if (!visibleRef.current || handledRef.current || closingRef.current) {
          return;
        }

        // some phones end without a final result: use the last words
        if (partialRef.current) {
          handleFinalRef.current?.(partialRef.current);
        } else {
          setStatus(current =>
            current === STATUS.LISTENING ? STATUS.IDLE : current,
          );
        }
      }),
    );

    add(() =>
      addSpeechErrorListener(error => {
        listeningRef.current = false;
        level.setValue(0);
        if (!visibleRef.current || handledRef.current || closingRef.current) {
          return;
        }

        if (partialRef.current) {
          handleFinalRef.current?.(partialRef.current);
          return;
        }

        const code = String(error?.code || '');
        setStatus(STATUS.ERROR);
        setMessage(
          code.includes('NETWORK')
            ? 'No internet. Voice needs a connection.'
            : code.includes('PERMISSION')
            ? 'Allow microphone access in your phone settings.'
            : 'I didn’t catch that. Tap the mic and speak again.',
        );
      }),
    );

    add(() =>
      addAudioMeterUpdateListener(update => {
        if (!listeningRef.current) return;
        Animated.timing(level, {
          toValue: normalizeLevel(update?.level),
          duration: 100,
          useNativeDriver: true,
        }).start();
      }),
    );

    // react-native-tts' removeEventListener() calls the removed
    // NativeEventEmitter.removeListener; keep and remove() subscriptions
    add(() =>
      Tts.addEventListener('tts-finish', event => {
        if (String(event?.utteranceId) !== String(utteranceRef.current)) {
          return;
        }
        utteranceRef.current = null;
        if (visibleRef.current && !closingRef.current) {
          later(() => startListeningRef.current?.(), 300);
        }
      }),
    );

    return () => {
      subscriptions.forEach(subscription => {
        try {
          subscription?.remove?.();
        } catch {
          // already removed
        }
      });
      stop().catch(() => {});
      stopSpeaking();
    };
  }, [later, level]);

  /* OPEN / CLOSE LIFECYCLE */

  useEffect(() => {
    if (!visible) {
      clearAllTimers();
      if (listeningRef.current) stopListening();
      closingRef.current = false;
      handledRef.current = false;
      setStatus(STATUS.STARTING);
      setTranscript('');
      setMessage('');
      return undefined;
    }

    closingRef.current = false;
    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // let the overlay appear before the mic starts
    const timer = setTimeout(() => startListeningRef.current?.(), 250);
    return () => clearTimeout(timer);
  }, [visible, appear, clearAllTimers, stopListening]);

  /* ORB: always turning, faster while thinking */

  useEffect(() => {
    if (!visible) return undefined;

    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: status === STATUS.THINKING ? 1100 : 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, status, spin]);

  /* MIC RING WHILE LISTENING */

  useEffect(() => {
    if (status !== STATUS.LISTENING) {
      ring.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [status, ring]);

  /* ANDROID BACK BUTTON CLOSES THE OVERLAY */

  useEffect(() => {
    if (!visible) return undefined;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeRef.current?.();
        return true;
      },
    );

    return () => subscription.remove();
  }, [visible]);

  const toggleMic = () => {
    if (status === STATUS.LISTENING) {
      // done speaking: use what was heard so far
      if (partialRef.current) {
        handleFinal(partialRef.current);
      } else {
        stopListening();
        setStatus(STATUS.IDLE);
      }
      return;
    }

    if (status === STATUS.THINKING || status === STATUS.STARTING) return;

    clearAllTimers();
    stopSpeaking();
    utteranceRef.current = null;
    startListening();
  };

  if (!visible) return null;

  const listening = status === STATUS.LISTENING;
  const busy = status === STATUS.THINKING || status === STATUS.STARTING;
  const tone = TONES[status] || TONES.idle;

  const panelShift = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 0],
  });
  const orbScale = level.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.16],
    extrapolate: 'clamp',
  });
  const orbRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const ringStyle = (from, to) => ({
    opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [
      {
        scale: ring.interpolate({
          inputRange: [0, 1],
          outputRange: [from, to],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={[styles.overlay, { top: -insets.top, opacity: appear }]}
    >
      <StatusBar barStyle="light-content" />

      {/* light blur over the app; tapping outside the panel closes */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor="rgba(5,12,9,0.7)"
      />
      <Pressable
        style={[StyleSheet.absoluteFill, styles.tint]}
        onPress={close}
      />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ScreenGlow colors={EDGE_GLOW} level={level} />
      </View>

      <Animated.View
        style={[
          styles.panelWrap,
          {
            marginBottom: Math.max(insets.bottom, 12) + 8,
            transform: [{ translateY: panelShift }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F4FBF7', '#EAF6F0']}
          style={[styles.panel, { minHeight: PANEL_MIN_HEIGHT }]}
        >
          {/* soft colour washes in the corners */}
          <View pointerEvents="none" style={[styles.wash, styles.washLeft]} />
          <View pointerEvents="none" style={[styles.wash, styles.washRight]} />

          {/* STATUS */}
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, { backgroundColor: tone.soft }]}>
              <View
                style={[styles.statusDot, { backgroundColor: tone.main }]}
              />
              <Text style={[styles.status, { color: tone.main }]}>
                {LABELS[status]}
              </Text>
            </View>
          </View>

          {/* WORDS */}
          <View style={styles.words}>
            {transcript ? (
              <Text style={styles.transcript} numberOfLines={5}>
                “{transcript}”
              </Text>
            ) : (
              <>
                <Text style={styles.prompt}>
                  {listening ? 'Go ahead, I’m listening' : 'How can I help?'}
                </Text>
                <Text style={styles.promptHint}>
                  Try “pyaz ka bhav”, “tractor chahiye” or “pashu doctor”
                </Text>
              </>
            )}

            {!!message && (
              <View style={[styles.messageBox, { backgroundColor: tone.soft }]}>
                <Text style={[styles.message, { color: tone.text }]}>
                  {message}
                </Text>
              </View>
            )}
          </View>

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close voice assistant"
              activeOpacity={0.75}
              style={styles.sideButton}
              onPress={close}
            >
              <X size={22} color="#344054" />
            </TouchableOpacity>

            <View style={styles.micArea}>
              {listening && (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.micRing, ringStyle(1, 1.6)]}
                />
              )}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  listening ? 'Stop and use what I said' : 'Start listening'
                }
                activeOpacity={0.85}
                disabled={busy}
                onPress={toggleMic}
              >
                <LinearGradient
                  colors={tone.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.mic, busy && styles.micBusy]}
                >
                  {listening ? (
                    <Square size={22} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Mic size={28} color="#FFFFFF" strokeWidth={2.4} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Listen again"
              activeOpacity={0.75}
              disabled={busy || listening}
              style={[styles.sideButton, (busy || listening) && styles.sideOff]}
              onPress={toggleMic}
            >
              <RotateCcw size={21} color="#344054" />
            </TouchableOpacity>
          </View>

          <Text style={styles.micHint}>
            {listening
              ? 'Tap the button when you’re done'
              : busy
              ? 'Please wait…'
              : 'Tap the mic to speak'}
          </Text>
        </LinearGradient>

        {/* ORB (sits on the panel's top edge) */}
        <View style={styles.orbBox}>
          {listening && (
            <>
              <Animated.View
                pointerEvents="none"
                style={[styles.orbRing, ringStyle(1, 1.55)]}
              />
              <Animated.View
                pointerEvents="none"
                style={[styles.orbRing, ringStyle(0.9, 1.3)]}
              />
            </>
          )}
          <Animated.View
            style={[styles.orbShadow, { transform: [{ scale: orbScale }] }]}
          >
            <Animated.View
              style={[styles.orbSpin, { transform: [{ rotate: orbRotate }] }]}
            >
              <LinearGradient
                colors={tone.orb}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.orb}
              />
            </Animated.View>
            <View style={styles.logoDisc}>
              <Image
                source={KHETIMASTER_LOGO}
                resizeMode="contain"
                style={styles.logo}
                accessibilityLabel="KhetiMaster"
              />
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'flex-end',
  },
  tint: { backgroundColor: 'rgba(5,12,9,0.18)' },

  panelWrap: {
    marginHorizontal: 12,
    borderRadius: 34,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  panel: {
    borderRadius: 34,
    overflow: 'hidden',
    paddingTop: ORB / 2,
    paddingHorizontal: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  wash: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.35,
  },
  washLeft: { left: -70, bottom: -60, backgroundColor: '#BAE6FD' },
  washRight: { right: -60, top: 40, backgroundColor: '#BBF7D0' },

  orbBox: {
    position: 'absolute',
    top: -ORB / 2,
    alignSelf: 'center',
    width: ORB,
    height: ORB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    backgroundColor: '#4ADE80',
  },
  orbShadow: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#16A34A',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  orbSpin: { ...StyleSheet.absoluteFillObject },
  orb: { flex: 1 },
  // white disc inside the turning green ring
  logoDisc: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: ORB / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: ORB * 0.78, height: ORB * 0.4 },

  statusRow: { alignItems: 'center', marginTop: 14 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontSize: 13, fontWeight: '900', letterSpacing: 0.3 },

  words: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  transcript: {
    fontSize: 26,
    lineHeight: 35,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '900',
    color: '#101828',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  promptHint: {
    marginTop: 8,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
    color: '#667085',
    textAlign: 'center',
  },
  messageBox: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  message: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideOff: { opacity: 0.4 },
  micArea: { alignItems: 'center', justifyContent: 'center' },
  micRing: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#EF4444',
  },
  mic: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBusy: { opacity: 0.55 },
  micHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#667085',
    textAlign: 'center',
  },
});
