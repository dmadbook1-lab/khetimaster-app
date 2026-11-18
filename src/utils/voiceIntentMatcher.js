import { looseWords, skeleton } from './voiceTransliterate';
import {
  ANIMAL_WORDS,
  CANCEL_PHRASES,
  CANCEL_WHOLE_PHRASES,
  COMMANDS,
  CROP_WORDS,
  GREETING_PHRASES,
  PRICE_WORDS,
  QUESTION_WORDS,
} from './voiceCommandData';

/*
|--------------------------------------------------------------------------
| VOICE INTENT MATCHER (pure: no i18n / React Native)
|--------------------------------------------------------------------------
|
| Everything is compared as loose Latin words (voiceTransliterate), so a
| Marathi "मला ट्रॅक्टर बुक करायचा आहे", a Tamil "டிராக்டர் வேண்டும்"
| and an English "book a tractor" all reach the tractor screen.
|
| Result:
|   { type: 'empty' | 'cancel' | 'greeting' | 'unknown' }
|   { type: 'crop-price', cropId }
|   { type: 'command', id, confident }
|
| confident: false when a long sentence also has a question word
| ("गेहूं में रोग क्यों लगता है") - the caller may ask AI whether the
| farmer wants that screen or an answer.
|
*/

// a keyword of this many letters also matches with a suffix
const PREFIX_MIN = 5;
const SKELETON_MIN = 4;
const LONG_SENTENCE_WORDS = 5;

// words that start like a keyword but mean something else
const NOT_A_SUFFIX = new Set(['mandir', 'mandiro', 'mandirat', 'mandirmen']);

const compile = phrase => looseWords(phrase);

const compileList = list =>
  [...new Set(list)].map(compile).filter(words => words.length > 0);

const COMPILED = COMMANDS.map(command => ({
  command,
  phrases: compileList(command.phrases),
  skeletons: command.loanwords.map(skeleton).filter(s => s.length >= SKELETON_MIN),
}));

const CANCEL = compileList(CANCEL_PHRASES);
const CANCEL_WHOLE = new Set(compileList(CANCEL_WHOLE_PHRASES).map(w => w.join(' ')));
const GREETINGS = compileList(GREETING_PHRASES);
const ANIMALS = compileList(ANIMAL_WORDS);
const QUESTIONS = new Set(compileList(QUESTION_WORDS).map(w => w.join(' ')));
const PRICES = compileList(PRICE_WORDS);
const CROPS = Object.entries(CROP_WORDS).map(([cropId, names]) => ({
  cropId,
  names: compileList(names),
}));

const wordMatches = (keyword, spoken) =>
  keyword === spoken ||
  (keyword.length >= PREFIX_MIN &&
    spoken.startsWith(keyword) &&
    !NOT_A_SUFFIX.has(spoken));

// phrase words appear one after another in what was said
const phraseAt = (words, phrase) => {
  for (let start = 0; start + phrase.length <= words.length; start += 1) {
    if (phrase.every((word, k) => wordMatches(word, words[start + k]))) {
      return true;
    }
  }
  return false;
};

const anyPhrase = (words, phrases) => phrases.some(p => phraseAt(words, p));

// crop names change at the end in Marathi/Hindi ("कांदा" -> "कांद्याचा").
// Exact only where the stem is another word: बाजरा ~ बाजार (market).
const EXACT_CROPS = new Set(['bajra']);

const cropWordMatches = (name, spoken, cropId) => {
  if (name === spoken) return true;
  if (EXACT_CROPS.has(cropId)) return false;
  const stem = name.length > 4 ? name.replace(/[aeiou]$/, '') : name;
  return stem.length >= 4 && spoken.startsWith(stem);
};

const findCrop = words => {
  if (!anyPhrase(words, PRICES)) return null;

  for (const { cropId, names } of CROPS) {
    const found = names.some(name =>
      name.length === 1
        ? words.some(w => cropWordMatches(name[0], w, cropId))
        : phraseAt(words, name),
    );
    if (found) return cropId;
  }

  return null;
};

const scoreCommands = words => {
  const wordSkeletons = words.map(skeleton);

  return COMPILED.map(({ command, phrases, skeletons }) => {
    let score = 0;

    for (const phrase of phrases) {
      if (phraseAt(words, phrase)) {
        score = Math.max(score, phrase.join(' ').length);
      }
    }

    for (const target of skeletons) {
      if (wordSkeletons.some(s => s.startsWith(target))) {
        score = Math.max(score, target.length + 3);
      }
    }

    return { command, score };
  })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

export function matchVoiceIntent(transcript = '') {
  const words = looseWords(transcript);

  if (words.length === 0) return { type: 'empty' };

  if (CANCEL_WHOLE.has(words.join(' ')) || anyPhrase(words, CANCEL)) {
    return { type: 'cancel' };
  }

  const cropId = findCrop(words);
  if (cropId) return { type: 'crop-price', cropId };

  let ranked = scoreCommands(words);

  if (ranked.length === 0) {
    return anyPhrase(words, GREETINGS) ? { type: 'greeting' } : { type: 'unknown' };
  }

  // a sick cow is the vet's job, not crop monitoring
  if (
    anyPhrase(words, ANIMALS) &&
    ranked.some(r => ['doctor', 'crop-monitoring'].includes(r.command.id))
  ) {
    const vet = COMPILED.find(c => c.command.id === 'doctor');
    ranked = [
      { command: vet.command, score: Infinity },
      ...ranked.filter(r => !['doctor', 'crop-monitoring'].includes(r.command.id)),
    ];
  }

  const asksQuestion = words.some(w => QUESTIONS.has(w));
  const confident = !(asksQuestion && words.length >= LONG_SENTENCE_WORDS);

  return { type: 'command', id: ranked[0].command.id, confident };
}

export const commandById = id => COMMANDS.find(command => command.id === id);

export { COMMANDS };
