import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
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
import { Check, Mic, RotateCcw, Square, Volume2, X } from 'lucide-react-native';

import {
  getVoiceLanguage,
  t as vt,
  useVoiceLanguage,
} from './flows/flowHelpers';
import { speechLocaleChain } from '../../utils/speechLocale';
import { todayInIndiaKey } from '../../utils/indiaSchedule';
import { matchOptionWithAi, parseWithAi } from '../../utils/voiceAiMatch';
import ScreenGlow from './ScreenGlow';
import {
  isBackCommand,
  isCloseCommand,
  closestOption,
  isSkipCommand,
  matchOption,
  parseChoiceIndex,
  parseClockTime,
  parseDateKey,
  parseNumber,
  parseYesNo,
} from '../../utils/voiceParsers';

/*
|--------------------------------------------------------------------------
| VOICE FLOW OVERLAY
|--------------------------------------------------------------------------
|
| A hands-free assistant that books something one question at a time:
|
|   speak the question -> listen -> understand -> next question
|   ... -> read the summary -> "yes" -> submit
|
| It speaks and listens in the app language (English, Hindi or Marathi).
| Every question can also be answered by tapping a chip, and the mic button
| works as a fallback, so a noisy field never blocks the farmer.
|
| flow = {
|   id, title,
|   steps: [{
|     key, title,                       // title is shown on the answer pill
|     type: 'choice'|'number'|'date'|'time'|'yesno'|'text'|'custom',
|     prompt: (answers, options) => string,
|     options?: (answers) => Promise<[{value, label, aliases?, spoken?}]>,
|     readOptions?: true,               // read the first options aloud
|     autoSingle?: true,                // skip the question when only one option
|     emptyPrompt?, emptyGoTo?,         // when options come back empty
|     optional?, defaultValue?,         // "skip" is accepted
|     min?, max?,                       // number limits
|     parse?: (text, {answers, options}) => value | null,  // custom
|     label?: (value, options) => string,
|     when?: (answers) => boolean,
|   }],
|   summary: (answers) => string,
|   noConfirm?: true,                 // submit right after the last answer
|   submit: async (answers) => ({ ok, message, onDone?, doneLabel? }),
| }
|
| Render it last inside a screen whose SafeAreaView pads the top edge.
|
*/


const SILENCE_TIMEOUT_MS = 10000;
const MAX_ATTEMPTS = 3;
const MAX_SPOKEN_OPTIONS = 3;

const EDGE_GLOW = ['#86EFAC', '#4ADE80', '#BBF7D0', '#86EFAC'];

const STATUS = {
  IDLE: 'idle',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  THINKING: 'thinking',
  DONE: 'done',
  ERROR: 'error',
};

const TONES = {
  idle: { main: '#15803D', soft: '#DCFCE7', button: ['#16A34A', '#0EA5E9'] },
  speaking: { main: '#0369A1', soft: '#E0F2FE', button: ['#16A34A', '#0EA5E9'] },
  listening: { main: '#15803D', soft: '#DCFCE7', button: ['#DC2626', '#F97316'] },
  thinking: { main: '#4F46E5', soft: '#E0E7FF', button: ['#16A34A', '#0EA5E9'] },
  done: { main: '#15803D', soft: '#DCFCE7', button: ['#16A34A', '#0EA5E9'] },
  error: { main: '#C2410C', soft: '#FFEDD5', button: ['#16A34A', '#0EA5E9'] },
};

const listenLocales = () => speechLocaleChain(getVoiceLanguage());

const buzz = ms => {
  try {
    Vibration.vibrate(ms);
  } catch {
    // no permission or no motor
  }
};

const stopSpeaking = () => {
  try {
    Tts.stop()?.catch?.(() => {});
  } catch {
    // TTS not ready
  }
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

const normalizeLevel = raw => {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  const level = value > 1 || value < 0 ? (value + 2) / 12 : value;
  return Math.min(Math.max(level, 0), 1);
};

// bullets and line breaks read badly aloud
const toSpeech = text =>
  String(text || '')
    .replace(/[•·]/g, '')
    .replace(/₹\s?/g, `${vt('voiceFlow.rupees')} `)
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/*
 * What was heard -> the value for this step, or null.
 */
const understand = (step, text, options, answers) => {
  switch (step.type) {
    case 'choice': {
      const byName = matchOption(text, options || []);
      if (byName) return byName.value;
      const index = parseChoiceIndex(text, (options || []).length);
      return index ? options[index - 1].value : null;
    }
    case 'yesno':
      return parseYesNo(text);
    case 'number': {
      const number = parseNumber(text);
      if (number === null) return null;
      if (step.min !== undefined && number < step.min) return null;
      if (step.max !== undefined && number > step.max) return null;
      return number;
    }
    case 'date':
      return parseDateKey(text);
    case 'time':
      return parseClockTime(text);
    case 'text':
      return String(text).trim().length > 1 ? String(text).trim() : null;
    case 'custom':
      return step.parse ? step.parse(text, { answers, options }) : null;
    default:
      return null;
  }
};

const labelFor = (step, value, options) => {
  if (step.label) return step.label(value, options);
  if (step.type === 'choice') {
    return (
      options?.find(option => option.value === value)?.label ?? String(value)
    );
  }
  if (step.type === 'yesno') {
    return value ? vt('voiceFlow.yes') : vt('voiceFlow.no');
  }
  return String(value);
};

export default function VoiceFlowOverlay({ visible, flow, onClose }) {
  const insets = useSafeAreaInsets();
  const voiceLanguage = useVoiceLanguage();

  const [status, setStatus] = useState(STATUS.IDLE);
  const [question, setQuestion] = useState('');
  const [heard, setHeard] = useState('');
  const [chips, setChips] = useState([]);
  const [answerPills, setAnswerPills] = useState([]);
  const [stepPosition, setStepPosition] = useState({ index: 0, total: 0 });
  const [result, setResult] = useState(null);

  const appear = useRef(new Animated.Value(0)).current;
  const level = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  const flowRef = useRef(flow);
  const visibleRef = useRef(visible);
  const runRef = useRef(0);
  const listeningRef = useRef(false);
  const partialRef = useRef('');
  const pendingRef = useRef(null);
  const queuedTapRef = useRef(null);
  const localeIndexRef = useRef(0);
  const [micNote, setMicNote] = useState('');
  const speakRef = useRef(null);
  const utteranceRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const closeRef = useRef(null);
  const runFlowRef = useRef(null);

  flowRef.current = flow;
  visibleRef.current = visible;

  const alive = token => visibleRef.current && runRef.current === token;

  /* SPEECH OUT */

  const speak = useCallback(text => {
    const spoken = toSpeech(text);
    if (!spoken) return Promise.resolve();

    return new Promise(resolve => {
      let finished = false;
      let fallback = null;
      const done = () => {
        if (finished) return;
        finished = true;
        clearTimeout(fallback);
        speakRef.current = null;
        utteranceRef.current = null;
        resolve();
      };
      // never hang if the engine does not report back
      fallback = setTimeout(done, 2500 + spoken.length * 95);
      speakRef.current = done;

      (async () => {
        try {
          await Tts.getInitStatus();
          // the app language's voice, else the closest one the phone has
          for (const locale of listenLocales()) {
            try {
              await Tts.setDefaultLanguage(locale);
              break;
            } catch {
              // voice not installed: try the next
            }
          }
          await Tts.setDefaultRate(0.46);
          utteranceRef.current = await Tts.speak(spoken);
        } catch {
          done();
        }
      })();
    });
  }, []);

  /* SPEECH IN */

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // resolves whoever is waiting for the user (mic, chip tap or manual)
  const settle = useCallback(
    value => {
      clearSilenceTimer();
      const resolve = pendingRef.current;
      pendingRef.current = null;

      if (listeningRef.current) {
        listeningRef.current = false;
        level.setValue(0);
        stop().catch(() => {});
      }

      resolve?.(value);
    },
    [level],
  );

  const requestPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
        if (await PermissionsAndroid.check(permission)) return true;

        const outcome = await PermissionsAndroid.request(permission, {
          title: vt('voice.mic_permission'),
          message: vt('voice.mic_permission_text'),
          buttonPositive: vt('common.allow'),
          buttonNegative: vt('common.not_now'),
        });
        return outcome === PermissionsAndroid.RESULTS.GRANTED;
      }
      return (await requestPermissions()) !== false;
    } catch {
      return false;
    }
  }, []);

  const takeQueuedTap = () => {
    const queued = queuedTapRef.current;
    queuedTapRef.current = null;
    return queued;
  };

  /*
   * Listens once. Resolves {text}, {tap: value}, {mic: true} or {error}.
   */
  const listen = useCallback(
    () =>
      new Promise(resolve => {
        const queued = takeQueuedTap();
        if (queued) {
          resolve(queued);
          return;
        }

        pendingRef.current = resolve;
        partialRef.current = '';
        setHeard('');

        (async () => {
          if (!(await requestPermission())) {
            if (pendingRef.current === resolve) settle({ error: 'permission' });
            return;
          }

          try {
            if ((await isAvailable()) === false) {
              if (pendingRef.current === resolve) settle({ error: 'unavailable' });
              return;
            }
          } catch {
            // let start() report the problem
          }

          // someone tapped a chip while permission was being asked
          if (pendingRef.current !== resolve) return;

          try {
            listeningRef.current = true;

            // try the farmer's language first, then simpler recognisers
            const chain = listenLocales();
            let started = false;
            let lastError = null;

            while (!started && localeIndexRef.current < chain.length) {
              try {
                await start({ language: chain[localeIndexRef.current] });
                started = true;
              } catch (error) {
                lastError = error;
                localeIndexRef.current += 1;
              }
            }

            if (!started) throw lastError || new Error('start');

            if (pendingRef.current !== resolve) {
              listeningRef.current = false;
              stop().catch(() => {});
              return;
            }

            setStatus(STATUS.LISTENING);
            buzz(20);

            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
              if (!partialRef.current) settle({ text: '' });
            }, SILENCE_TIMEOUT_MS);
          } catch (error) {
            listeningRef.current = false;
            if (pendingRef.current === resolve) {
              settle({ error: error?.message || 'start' });
            }
          }
        })();
      }),
    [requestPermission, settle],
  );

  // waits for a chip tap or the mic button without listening
  const waitForTap = useCallback(
    () =>
      new Promise(resolve => {
        const queued = takeQueuedTap();
        if (queued) {
          resolve(queued);
          return;
        }
        pendingRef.current = resolve;
      }),
    [],
  );

  /* THE FLOW LOOP */

  const run = useCallback(async () => {
    const token = ++runRef.current;
    const current = flowRef.current;
    if (!current) return;

    const steps = current.steps;
    const answers = {};
    const history = [];
    let index = 0;
    let carry = '';

    queuedTapRef.current = null;
    setResult(null);
    setAnswerPills([]);
    setStepPosition({ index: 0, total: steps.length });

    const refreshPills = () =>
      setAnswerPills(
        history
          .filter(item => item.shown)
          .map(item => ({
            key: item.key,
            title: item.title,
            label: item.shown,
          })),
      );

    // yes / no in any of the three languages; AI Guru decides if unsure
    const readYesNo = async text => {
      const quick = parseYesNo(text);
      if (quick !== null || !text) return quick;
      return parseWithAi({
        type: 'yesno',
        text,
        today: todayInIndiaKey(),
        language: voiceLanguage,
      });
    };

    // "Did you mean X?" for a misspelled or misheard answer
    const confirmGuess = async (label, restoreChips) => {
      setChips([
        { value: true, label: vt('voiceFlow.yes') },
        { value: false, label: vt('voiceFlow.no') },
      ]);
      setQuestion(vt('voiceFlow.did_you_mean', { name: label }));
      setStatus(STATUS.SPEAKING);
      await speak(vt('voiceFlow.did_you_mean', { name: label }));
      if (!alive(token)) return null;
      await wait(450);

      let answer = null;
      for (let tries = 0; tries < 2 && answer === null; tries += 1) {
        const reply = await listen();
        if (!alive(token)) return null;

        if (reply?.tap !== undefined) {
          answer = Boolean(reply.tap);
        } else if (reply?.text) {
          setHeard(reply.text);
          answer = await readYesNo(reply.text);
        }
        if (answer === null && tries === 0) {
          setStatus(STATUS.SPEAKING);
          await speak(vt('voiceFlow.say_yes_or_no'));
          await wait(450);
        }
      }

      setChips(restoreChips);
      return answer;
    };

    localeIndexRef.current = 0;
    setMicNote('');
    await wait(350);

    // ask for the microphone before the first question so the system
    // dialog does not cut the first answer off
    await requestPermission();
    if (!alive(token)) return;

    while (index < steps.length) {
      if (!alive(token)) return;

      const step = steps[index];
      if (step.when && !step.when(answers)) {
        index += 1;
        continue;
      }

      setStepPosition({ index, total: steps.length });
      setHeard('');

      let options = null;
      if (step.options) {
        setStatus(STATUS.THINKING);
        setQuestion('');
        setChips([]);
        try {
          options = await step.options(answers);
        } catch {
          options = [];
        }
        if (!alive(token)) return;

        if (!options.length) {
          const message = step.emptyPrompt
            ? step.emptyPrompt(answers)
            : vt('voiceFlow.nothingFound');
          setQuestion(message);
          setStatus(STATUS.SPEAKING);
          await speak(message);
          if (!alive(token)) return;

          const target = steps.findIndex(item => item.key === step.emptyGoTo);
          if (target >= 0) {
            while (
              history.length &&
              history[history.length - 1].index >= target
            ) {
              const dropped = history.pop();
              delete answers[dropped.key];
            }
            refreshPills();
            index = target;
            carry = '';
            continue;
          }
          setResult({ ok: false, message });
          setStatus(STATUS.ERROR);
          return;
        }

        // only one possible answer: take it without asking
        if (step.autoSingle && options.length === 1) {
          const only = options[0];
          answers[step.key] = only.value;
          history.push({
            key: step.key,
            title: step.title,
            shown: labelFor(step, only.value, options),
            index,
          });
          refreshPills();
          index += 1;
          continue;
        }
      }

      setChips(
        step.type === 'yesno'
          ? [
              { value: true, label: vt('voiceFlow.yes') },
              { value: false, label: vt('voiceFlow.no') },
            ]
          : options
          ? options.map(option => ({
              value: option.value,
              label: option.label,
            }))
          : step.optional
          ? [{ value: '__skip__', label: vt('voiceFlow.skip') }]
          : [],
      );

      let attempts = 0;
      let lastHeard = '';
      let value = null;
      let goBack = false;

      while (value === null && !goBack) {
        if (!alive(token)) return;

        const display = step.prompt(answers, options);
        let text = display;
        if (step.readOptions && options?.length && attempts === 0) {
          const read = options
            .slice(0, MAX_SPOKEN_OPTIONS)
            .map((option, i) => `${i + 1}. ${option.spoken || option.label}`)
            .join('. ');
          text = `${display} ${read}`;
        }

        const spokenText =
          attempts > 0
            ? `${
                lastHeard
                  ? vt('voiceFlow.didnt_match', { heard: lastHeard })
                  : vt('voiceFlow.didnt_hear')
              } ${text}`
            : `${carry} ${text}`;

        setQuestion(display);
        setStatus(STATUS.SPEAKING);
        await speak(spokenText);
        carry = '';
        if (!alive(token)) return;
        // let the speaker release audio focus so the mic can start
        await wait(450);
        if (!alive(token)) return;

        let reply;
        if (attempts >= MAX_ATTEMPTS) {
          setStatus(STATUS.IDLE);
          await speak(vt('voiceFlow.tap_to_answer'));
          if (!alive(token)) return;
          reply = await waitForTap();
          attempts = 0;
          if (reply?.mic) reply = await listen();
        } else {
          reply = await listen();
        }
        if (!alive(token)) return;

        if (reply?.tap !== undefined) {
          value = reply.tap === '__skip__' ? step.defaultValue ?? '' : reply.tap;
          continue;
        }

        const spoken = reply?.text || '';
        setHeard(spoken);
        setMicNote(reply?.error ? String(reply.error) : '');

        lastHeard = spoken;
        if (!spoken) {
          attempts += 1;
          continue;
        }

        if (isCloseCommand(spoken)) {
          closeRef.current?.();
          return;
        }

        if (isBackCommand(spoken) && history.length) {
          goBack = true;
          break;
        }

        if (step.optional && isSkipCommand(spoken)) {
          value = step.defaultValue ?? '';
          break;
        }

        let understood = understand(step, spoken, options, answers);

        // not an exact match: guess the closest option (spelling first,
        // then AI Guru) and ask the farmer to confirm it
        if (
          (understood === null || understood === undefined) &&
          step.type === 'choice' &&
          options?.length
        ) {
          let guess = closestOption(spoken, options)?.option || null;

          if (!guess) {
            setStatus(STATUS.THINKING);
            const picked = await matchOptionWithAi({
              question: display,
              options,
              text: spoken,
              language: voiceLanguage,
            });
            if (!alive(token)) return;
            guess = options.find(option => option.value === picked) || null;
          }

          if (guess) {
            const yes = await confirmGuess(
              guess.label,
              options.map(option => ({
                value: option.value,
                label: option.label,
              })),
            );
            if (!alive(token)) return;
            if (yes) understood = guess.value;
          }
        }

        // dates, times and numbers the simple parser missed
        if (
          (understood === null || understood === undefined) &&
          ['date', 'time', 'number', 'yesno'].includes(step.type)
        ) {
          setStatus(STATUS.THINKING);
          const fromAi = await parseWithAi({
            type: step.type,
            text: spoken,
            today: todayInIndiaKey(),
            language: voiceLanguage,
          });
          if (!alive(token)) return;
          const inRange =
            step.type !== 'number' ||
            (fromAi !== null &&
              (step.min === undefined || fromAi >= step.min) &&
              (step.max === undefined || fromAi <= step.max));
          if (fromAi !== null && inRange) understood = fromAi;
        }

        if (understood === null || understood === undefined) {
          attempts += 1;
          continue;
        }
        value = understood;
      }

      if (goBack) {
        const previous = history.pop();
        delete answers[previous.key];
        refreshPills();
        index = previous.index;
        carry = '';
        continue;
      }

      answers[step.key] = value;
      const shown =
        value === '' || value === null ? '' : labelFor(step, value, options);
      history.push({ key: step.key, title: step.title, shown, index });
      refreshPills();
      carry = shown ? `${shown}.` : '';
      index += 1;
    }

    /* CONFIRM */

    while (alive(token)) {
      let confirmed = current.noConfirm ? true : null;
      let tries = 0;

      if (!current.noConfirm) {
        const summary = current.summary(answers);

        setQuestion(summary);
        setHeard('');
        setChips([
          { value: true, label: vt('voiceFlow.yes_book') },
          { value: false, label: vt('voiceFlow.no_change') },
        ]);
        setStepPosition({ index: steps.length, total: steps.length });

        setStatus(STATUS.SPEAKING);
        await speak(
          `${carry} ${summary} ${vt('voiceFlow.confirm_question')}`,
        );
        carry = '';
        if (!alive(token)) return;

        tries = 0;

        while (confirmed === null && tries < MAX_ATTEMPTS && alive(token)) {
          const reply = await listen();
          if (!alive(token)) return;

          if (reply?.tap !== undefined) {
            confirmed = Boolean(reply.tap);
            break;
          }

          const text = reply?.text || '';
          setHeard(text);
          if (isCloseCommand(text)) {
            closeRef.current?.();
            return;
          }
          confirmed = text ? await readYesNo(text) : null;

          if (confirmed === null) {
            tries += 1;
            setStatus(STATUS.SPEAKING);
            await speak(vt('voiceFlow.say_yes_or_no'));
          }
        }
        if (!alive(token)) return;

        if (confirmed === null) {
          setStatus(STATUS.IDLE);
          await speak(vt('voiceFlow.tap_to_answer'));
          const tapped = await waitForTap();
          if (!alive(token)) return;
          if (tapped?.tap === undefined) continue;
          confirmed = Boolean(tapped.tap);
        }

        if (!confirmed) {
          setStatus(STATUS.SPEAKING);
          await speak(vt('voiceFlow.start_again'));
          if (alive(token)) runFlowRef.current?.();
          return;
        }

      }

      /* SUBMIT */

      setStatus(STATUS.THINKING);
      setChips([]);
      setQuestion(vt('voiceFlow.booking'));

      let outcome;
      try {
        outcome = await current.submit(answers);
      } catch (error) {
        outcome = { ok: false, message: error?.message };
      }
      if (!alive(token)) return;

      const message =
        outcome?.message ||
        (outcome?.ok
          ? vt('voiceFlow.all_done')
          : vt('voiceFlow.failed'));

      setResult({ ...outcome, message });
      setQuestion(message);
      setStatus(outcome?.ok ? STATUS.DONE : STATUS.ERROR);
      buzz(outcome?.ok ? 40 : 80);
      await speak(message);
      return;
    }
  }, [listen, speak, waitForTap, voiceLanguage, requestPermission]);

  runFlowRef.current = run;

  /* CLOSE */

  const close = useCallback(() => {
    runRef.current += 1;
    stopSpeaking();
    speakRef.current?.();
    settle({ text: '' });
    Animated.timing(appear, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => onClose?.());
  }, [appear, onClose, settle]);

  closeRef.current = close;

  // booked: close, then open what was booked
  const finish = useCallback(() => {
    const onDone = result?.ok ? result.onDone : null;
    runRef.current += 1;
    stopSpeaking();
    speakRef.current?.();
    Animated.timing(appear, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
      onDone?.();
    });
  }, [appear, onClose, result]);

  /* NATIVE LISTENERS (once) */

  useEffect(() => {
    const subscriptions = [];
    const add = factory => {
      try {
        const subscription = factory();
        if (subscription) subscriptions.push(subscription);
      } catch (error) {
        console.warn('[KhetiMaster VoiceFlow] listener setup:', error?.message);
      }
    };

    add(() =>
      addSpeechResultListener(event => {
        if (!listeningRef.current) return;
        const text = speechText(event);
        if (!text) return;

        partialRef.current = text;
        setHeard(text);

        const isFinal =
          event?.isFinal === true ||
          event?.is_final === true ||
          event?.final === true;
        if (isFinal) settle({ text });
      }),
    );

    add(() =>
      addSpeechEndListener(() => {
        if (!listeningRef.current) return;
        // Android reports "end of speech" BEFORE the final words arrive;
        // settling now would throw the answer away. Give them a moment.
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(
          () => {
            if (listeningRef.current) settle({ text: partialRef.current });
          },
          partialRef.current ? 700 : 2500,
        );
      }),
    );

    add(() =>
      addSpeechErrorListener(error => {
        if (!listeningRef.current) return;
        if (partialRef.current) {
          settle({ text: partialRef.current });
          return;
        }
        const code = String(error?.code || error?.message || '');
        if (/LANGUAGE|UNSUPPORTED|NOT_SUPPORTED/i.test(code)) {
          localeIndexRef.current += 1;
        }
        settle({ text: '', error: code || 'error' });
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

    // react-native-tts' removeEventListener() calls a removed method; keep
    // the subscriptions and remove() them instead
    const onSpeechDone = event => {
      if (
        utteranceRef.current !== null &&
        String(event?.utteranceId) !== String(utteranceRef.current)
      ) {
        return;
      }
      speakRef.current?.();
    };
    add(() => Tts.addEventListener('tts-finish', onSpeechDone));
    add(() => Tts.addEventListener('tts-cancel', onSpeechDone));

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
  }, [level, settle]);

  /* OPEN / CLOSE LIFECYCLE */

  useEffect(() => {
    if (!visible) {
      runRef.current += 1;
      settle({ text: '' });
      speakRef.current?.();
      queuedTapRef.current = null;
      setStatus(STATUS.IDLE);
      setQuestion('');
      setHeard('');
      setChips([]);
      setAnswerPills([]);
      setResult(null);
      return undefined;
    }

    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => runFlowRef.current?.(), 300);
    return () => clearTimeout(timer);
  }, [visible, appear, settle]);

  /* PULSE WHILE LISTENING */

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

  /* ANDROID BACK CLOSES */

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

  const onMicPress = () => {
    if (status === STATUS.LISTENING) {
      // done speaking: use what was heard so far
      settle({ text: partialRef.current });
      return;
    }
    if (status === STATUS.SPEAKING) {
      // skip the rest of the question; listening starts right after
      stopSpeaking();
      return;
    }
    if (status === STATUS.IDLE && pendingRef.current) {
      settle({ mic: true });
    }
  };

  const onChipPress = chip => {
    stopSpeaking();
    if (pendingRef.current) {
      settle({ tap: chip.value });
    } else {
      // tapped while the question is still being read
      queuedTapRef.current = { tap: chip.value };
    }
  };

  if (!visible) return null;

  const tone = TONES[status] || TONES.idle;
  const listening = status === STATUS.LISTENING;
  const busy = status === STATUS.THINKING;
  const finished = !!result;

  const panelShift = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 0],
  });
  const ringStyle = {
    opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [
      {
        scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }),
      },
    ],
  };

  return (
    <Animated.View
      style={[styles.overlay, { top: -insets.top, opacity: appear }]}
    >
      <StatusBar barStyle="light-content" />

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
          style={styles.panel}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {flow?.title}
              </Text>
              <Text style={styles.progress}>
                {vt('voiceFlow.step_of', {
                  step: Math.min(stepPosition.index + 1, stepPosition.total),
                  total: stepPosition.total,
                })}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: tone.soft }]}>
              <View
                style={[styles.statusDot, { backgroundColor: tone.main }]}
              />
              <Text style={[styles.statusText, { color: tone.main }]}>
                {vt(`voiceFlow.status_${status}`)}
              </Text>
            </View>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.bar}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${
                    stepPosition.total
                      ? Math.min(
                          100,
                          (stepPosition.index / stepPosition.total) * 100,
                        )
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          {/* ANSWERS SO FAR */}
          {answerPills.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pills}
              style={styles.pillScroll}
            >
              {answerPills.map(pill => (
                <View key={pill.key} style={styles.pill}>
                  <Check size={11} color="#15803D" strokeWidth={3} />
                  <Text style={styles.pillText} numberOfLines={1}>
                    {pill.title ? `${pill.title}: ` : ''}
                    {pill.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* QUESTION */}
          <ScrollView
            style={styles.questionScroll}
            contentContainerStyle={styles.questionBox}
            showsVerticalScrollIndicator={false}
          >
            {status === STATUS.SPEAKING && (
              <Volume2 size={22} color={tone.main} style={styles.speakerIcon} />
            )}
            <Text style={[styles.question, finished && { color: tone.main }]}>
              {question || vt('voiceFlow.getting_ready')}
            </Text>
            {!!micNote && !finished && !heard && (
              <Text style={styles.micNote}>
                {vt('voiceFlow.mic_problem', { code: micNote })}
              </Text>
            )}
            {!!heard && !finished && (
              <Text style={styles.heard}>“{heard}”</Text>
            )}
          </ScrollView>

          {/* TAP ANSWERS */}
          {!finished && chips.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipScroll}
              keyboardShouldPersistTaps="handled"
            >
              {chips.map((chip, chipIndex) => (
                <TouchableOpacity
                  key={`${chipIndex}-${chip.label}`}
                  activeOpacity={0.8}
                  style={styles.chip}
                  onPress={() => onChipPress(chip)}
                >
                  <Text style={styles.chipText} numberOfLines={1}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* CONTROLS */}
          {finished ? (
            <View style={styles.endRow}>
              {!result.ok && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.endSecondary}
                  onPress={() => {
                    stopSpeaking();
                    speakRef.current?.();
                    run();
                  }}
                >
                  <RotateCcw size={16} color="#15803D" />
                  <Text style={styles.endSecondaryText}>
                    {vt('voiceFlow.try_again')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.endPrimary}
                onPress={result.ok ? finish : close}
              >
                <Text style={styles.endPrimaryText}>
                  {result.ok && result.doneLabel
                    ? result.doneLabel
                    : vt('voiceFlow.close')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.controls}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={vt('voice.close')}
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
                    style={[styles.micRing, ringStyle]}
                  />
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    listening
                      ? vt('voice.stop_use')
                      : vt('voice.start_listening')
                  }
                  activeOpacity={0.85}
                  disabled={busy}
                  onPress={onMicPress}
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

              <View style={styles.sideSpacer} />
            </View>
          )}

          {!finished && (
            <Text style={styles.hint}>
              {listening
                ? vt('voice.tap_when_done')
                : status === STATUS.SPEAKING
                ? vt('voiceFlow.tap_to_skip')
                : vt('voiceFlow.say_back_or_close')}
            </Text>
          )}
        </LinearGradient>
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
    borderRadius: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  panel: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 20,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { flex: 1 },
  title: { fontSize: 17, fontWeight: '900', color: '#101828' },
  progress: {
    marginTop: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#667085',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11.5, fontWeight: '900' },

  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8EBDF',
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2, backgroundColor: '#16A34A' },

  pillScroll: { flexGrow: 0, marginTop: 12 },
  pills: { gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    maxWidth: 230,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#166534',
    flexShrink: 1,
  },

  questionScroll: { maxHeight: 190, marginTop: 14 },
  questionBox: { alignItems: 'center', paddingVertical: 6 },
  speakerIcon: { marginBottom: 6 },
  question: {
    fontSize: 21,
    lineHeight: 29,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  micNote: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C2410C',
    textAlign: 'center',
  },
  heard: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },

  chipScroll: { flexGrow: 0, marginTop: 12 },
  chips: { gap: 8, paddingHorizontal: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BBE5CB',
    maxWidth: 220,
  },
  chipText: { fontSize: 13, fontWeight: '800', color: '#14532D' },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 16,
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
  sideSpacer: { width: 52 },
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
  hint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#667085',
    textAlign: 'center',
  },

  endRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  endPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  endSecondary: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endSecondaryText: { color: '#15803D', fontSize: 14, fontWeight: '900' },
});
