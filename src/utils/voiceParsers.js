/*
|--------------------------------------------------------------------------
| VOICE PARSERS
|--------------------------------------------------------------------------
|
| Turn what a farmer SAID (English, Hindi or Marathi, in Devanagari or
| Latin letters) into a value the booking forms understand. Pure functions,
| no React and no i18n, so they are easy to test.
|
| Every parser returns null when nothing usable was heard.
|
*/

import { addDaysToKey, todayInIndiaKey } from './labourFormat';

const DEVANAGARI_DIGITS = '०१२३४५६७८९';

export const normalizeSpeech = text =>
  String(text || '')
    .toLowerCase()
    .replace(/[०-९]/g, ch => String(DEVANAGARI_DIGITS.indexOf(ch)))
    // spelling variants of the same Devanagari sound
    .replace(/[\u093C\u200C\u200D]/g, '')
    .replace(/\u0901/g, '\u0902')
    .replace(/[.,!?।"'“”‘’()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = text => normalizeSpeech(text).split(' ').filter(Boolean);

/* YES / NO */

const YES = [
  'yes', 'yeah', 'yep', 'yup', 'ok', 'okay', 'confirm', 'sure', 'correct',
  'right', 'book', 'send', 'done', 'proceed', 'go ahead',
  'haan', 'han', 'ha', 'haa', 'ji', 'theek', 'thik', 'sahi', 'kar do',
  'हाँ', 'हां', 'हा', 'जी', 'ठीक', 'सही', 'कर दो', 'करो', 'बुक', 'पक्का',
  'हो', 'होय', 'होव', 'बरोबर', 'ठीक आहे', 'करा', 'हो बरोबर',
  // English words as Hindi / Marathi speech recognition writes them
  'यस', 'येस', 'यप', 'यैप', 'यप्प', 'ओके', 'ओके', 'ओ के', 'कन्फर्म', 'कंफर्म', 'श्योर', 'शुअर', 'करेक्ट', 'राइट', 'बुक करो', 'सेंड', 'डन',
];

const NO = [
  'no', 'nope', 'nah', 'cancel', 'stop', 'dont', "don't", 'not',
  'nahi', 'nahin', 'na', 'mat', 'ruko', 'band',
  'नहीं', 'नही', 'ना', 'मत', 'रुको', 'बंद', 'रद्द',
  'नाही', 'नको', 'थांबा', 'नाय',
  'नो', 'नोप', 'नॉट', 'नहि', 'कैंसिल', 'कॅन्सल', 'स्टॉप', 'डोंट', 'डोन्ट',
];

const hasWord = (list, text) => {
  const spoken = ` ${normalizeSpeech(text)} `;
  return list.some(item => spoken.includes(` ${item} `));
};

export const parseYesNo = text => {
  const yes = hasWord(YES, text);
  const no = hasWord(NO, text);
  if (no && !yes) return false;
  if (yes && !no) return true;
  if (yes && no) return false;
  return null;
};

/* WORDS THAT MEAN "GO BACK" / "STOP" */

const BACK = [
  'back', 'previous', 'go back', 'peeche', 'pichhe', 'wapas',
  'पीछे', 'वापस', 'मागे', 'परत',
  'बैक', 'बॅक', 'प्रीवियस', 'गो बैक',
];

const CLOSE = [
  'close', 'exit', 'quit', 'cancel', 'stop assistant', 'bye',
  'band karo', 'band kar do', 'रहने दो', 'बंद करो', 'बंद कर दो', 'बाहर',
  'बंद करा', 'राहू द्या', 'रद्द करा',
  'क्लोज', 'एग्जिट', 'एक्झिट', 'क्विट', 'बाय', 'कैंसिल', 'कॅन्सल',
];

const SKIP = [
  'skip', 'none', 'nothing', 'no notes', 'leave it', 'default', 'any',
  'chhodo', 'koi nahi', 'kuch nahi', 'koi bhi',
  'छोड़ो', 'छोड़ दो', 'कुछ नहीं', 'कोई नहीं', 'कोई भी', 'कोणताही', 'काही नाही',
  'सोडा', 'नको',
  'स्किप', 'स्कीप', 'नन', 'नथिंग', 'डिफॉल्ट', 'एनी',
];

export const isBackCommand = text => hasWord(BACK, text);
export const isCloseCommand = text => hasWord(CLOSE, text);
export const isSkipCommand = text => hasWord(SKIP, text);

/* NUMBERS */

const NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
  ek: 1, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6,
  che: 6, saat: 7, aath: 8, nau: 9, das: 10, gyarah: 11, barah: 12,
  pandrah: 15, bees: 20, tees: 30, chalis: 40, pachas: 50, sau: 100,
  एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, छः: 6, सात: 7,
  आठ: 8, नौ: 9, दस: 10, ग्यारह: 11, बारह: 12, पंद्रह: 15, बीस: 20,
  तीस: 30, चालीस: 40, पचास: 50, सौ: 100,
  दोन: 2, पाच: 5, सहा: 6, नऊ: 9,
  दहा: 10, अकरा: 11, बारा: 12, पंधरा: 15, वीस: 20, पन्नास: 50,
  शंभर: 100,
  वन: 1, टू: 2, थ्री: 3, फोर: 4, फाइव: 5, सिक्स: 6, सेवन: 7, एट: 8, नाइन: 9, टेन: 10,
  ट्वेंटी: 20, थर्टी: 30, फिफ्टी: 50, हंड्रेड: 100,
};

const ORDINALS = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
  pehla: 1, pahla: 1, doosra: 2, dusra: 2, teesra: 3, tisra: 3, chautha: 4,
  पहला: 1, पहली: 1, दूसरा: 2, दूसरी: 2, तीसरा: 3, तीसरी: 3, चौथा: 4,
  पांचवां: 5, पाँचवा: 5,
  पहिला: 1, पहिली: 1, दुसरा: 2, दुसरी: 2, तिसरा: 3, तिसरी: 3, चौथी: 4,
  पाचवा: 5,
  फर्स्ट: 1, सेकंड: 2, सेकेंड: 2, थर्ड: 3, फोर्थ: 4, फिफ्थ: 5,
};

export const parseNumber = text => {
  const normalized = normalizeSpeech(text);
  const digits = normalized.match(/\d+(\.\d+)?/);
  if (digits) return Number(digits[0]);

  for (const word of words(normalized)) {
    if (word in NUMBER_WORDS) return NUMBER_WORDS[word];
  }
  return null;
};

/*
 * "the second one", "number 2", "2", "dusra" -> 2 (1-based).
 */
export const parseChoiceIndex = (text, max) => {
  for (const word of words(text)) {
    if (word in ORDINALS && ORDINALS[word] <= max) return ORDINALS[word];
  }
  const number = parseNumber(text);
  if (number !== null && Number.isInteger(number) && number >= 1 && number <= max) {
    return number;
  }
  return null;
};

/* PICKING FROM A LIST BY NAME */

const squash = text =>
  normalizeSpeech(text).replace(/[^\p{L}\p{M}\p{N}]/gu, '');

/*
 * options: [{value, label, aliases?: string[]}]
 * Matches when the spoken words contain an option label/alias (or the
 * other way round). The longest match wins so "tractor trolley" beats
 * "tractor".
 */
export const matchOption = (text, options) => {
  const spoken = squash(text);
  if (!spoken) return null;

  let best = null;
  let bestScore = 0;

  for (const option of options) {
    const names = [
      option.label,
      typeof option.value === 'string' ? option.value : null,
      ...(option.aliases || []),
    ]
      .filter(Boolean)
      .map(squash)
      .filter(name => name.length > 1);

    for (const name of names) {
      let score = 0;
      if (spoken === name) score = 1000 + name.length;
      else if (spoken.includes(name)) score = 100 + name.length;
      else if (name.includes(spoken) && spoken.length >= 4) score = spoken.length;

      if (score > bestScore) {
        best = option;
        bestScore = score;
      }
    }
  }

  return best;
};

/* DATES */

const DAY_WORDS = [
  { offset: 0, words: ['today', 'aaj', 'आज', 'आजच', 'ajach', 'aajach', 'टुडे', 'टूडे'] },
  { offset: 1, words: ['tomorrow', 'kal', 'कल', 'उद्या', 'udya', 'टुमारो', 'टुमॉरो', 'टूमारो', 'टुमोरो'] },
  { offset: 2, words: ['parso', 'parson', 'परसों', 'परसो', 'परवा', 'parva', 'day after tomorrow', 'डे आफ्टर टुमारो', 'डे आफ्टर टुमॉरो'] },
];

/*
 * Returns a yyyy-mm-dd key (India time) or null.
 *   "today", "kal", "उद्या", "in three days", "after 3 days",
 *   "5", "5th"  (day of this/next month)
 */
export const parseDateKey = (text, today = todayInIndiaKey()) => {
  const spoken = ` ${normalizeSpeech(text)} `;
  if (!spoken.trim()) return null;

  if (/day after tomorrow|डे आफ्टर टु/.test(spoken)) return addDaysToKey(today, 2);

  for (const { offset, words: list } of DAY_WORDS) {
    if (list.some(word => spoken.includes(` ${word} `))) {
      return addDaysToKey(today, offset);
    }
  }

  const inDays = spoken.match(
    /(?:in|after|baad|बाद|नंतर|नंतर)?\s*(\d+)\s*(?:days?|din|दिन|दिवस)/,
  );
  if (inDays) return addDaysToKey(today, Number(inDays[1]));

  const dayNumber = spoken.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (dayNumber) {
    const day = Number(dayNumber[1]);
    if (day >= 1 && day <= 31) {
      const [year, month, currentDay] = today.split('-').map(Number);
      let target = new Date(year, month - 1, day);
      if (day < currentDay) target = new Date(year, month, day);
      if (target.getDate() === day) {
        const pad = value => String(value).padStart(2, '0');
        return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
          target.getDate(),
        )}`;
      }
    }
  }

  return null;
};

/* TIME OF DAY */

/*
 * "8", "8 am", "eight thirty", "5 pm", "subah 7", "शाम 5", "दुपारी 2"
 * -> "HH:MM" (24h) or null. Hours 1-6 without am/pm are treated as pm.
 */
export const parseClockTime = text => {
  const spoken = normalizeSpeech(text);
  const match = spoken.match(/(\d{1,2})(?::|\s)?(\d{2})?/);
  let hour;
  let minute = 0;

  if (match) {
    hour = Number(match[1]);
    minute = match[2] ? Number(match[2]) : 0;
  } else {
    const number = parseNumber(spoken);
    if (number === null) return null;
    hour = number;
  }

  if (hour > 24 || minute > 59) return null;

  const pm = /\b(pm|p m|evening|afternoon|shaam|sham|dopahar|dupahar|raat)\b|शाम|दोपहर|रात|दुपारी|संध्याकाळी|रात्री|पी एम|इवनिंग|आफ्टरनून/.test(
    spoken,
  );
  const am = /\b(am|a m|morning|subah|savere)\b|सुबह|सवेरे|सकाळी|ए एम|मॉर्निंग/.test(spoken);

  if (pm && hour < 12) hour += 12;
  else if (!am && !pm && hour >= 1 && hour <= 6) hour += 12;

  if (hour === 24) hour = 0;

  const pad = value => String(value).padStart(2, '0');
  return `${pad(hour)}:${pad(minute)}`;
};

/* MISSPELLED / MISHEARD WORDS */

const editDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }

  return previous[b.length];
};

const similarity = (a, b) => {
  const longest = Math.max(a.length, b.length);
  return longest ? 1 - editDistance(a, b) / longest : 0;
};

/*
 * Best guess for a misspelled or misheard answer ("planing" -> "Planting",
 * "harvesing" -> "Harvesting"). Compares the whole phrase and each single
 * word. Returns {option, score} when it is reasonably close, else null.
 */
export const closestOption = (text, options, minScore = 0.6) => {
  const spokenWords = words(text).map(squash).filter(word => word.length > 2);
  const whole = squash(text);
  if (!whole) return null;

  let best = null;

  for (const option of options) {
    const names = [
      option.label,
      typeof option.value === 'string' ? option.value : null,
      ...(option.aliases || []),
    ].filter(Boolean);

    for (const name of names) {
      const full = squash(name);
      if (full.length < 3) continue;

      let score = Math.max(similarity(whole, full), soundScore(text, name));

      // single words against single words ("planing" vs "planting work")
      for (const part of words(name).map(squash).filter(w => w.length > 2)) {
        for (const word of spokenWords) {
          score = Math.max(
            score,
            similarity(word, part) * 0.95,
            soundScore(word, part),
          );
        }
      }

      if (!best || score > best.score) best = { option, score };
    }
  }

  return best && best.score >= minScore ? best : null;
};


/* SOUND-ALIKE MATCHING ACROSS SCRIPTS */

// Hindi / Marathi consonants -> the Latin letter they sound like
const DEVANAGARI_CONSONANTS = {
  क: 'k', ख: 'k', ग: 'g', घ: 'g', ङ: 'n',
  च: 'c', छ: 'c', ज: 'j', झ: 'j', ञ: 'n',
  ट: 't', ठ: 't', ड: 'd', ढ: 'd', ण: 'n',
  त: 't', थ: 't', द: 'd', ध: 'd', न: 'n',
  प: 'p', फ: 'p', ब: 'b', भ: 'b', म: 'm',
  य: '', र: 'r', ल: 'l', व: 'v', ळ: 'l',
  श: 's', ष: 's', स: 's', ह: '',
  'ं': 'n',
};

/*
 * A rough "consonant skeleton" of a word in any script, so a Devanagari
 * transcription of an English word ("हार्वेस्टिंग") lines up with the
 * English option ("Harvesting"). Vowels are dropped on purpose: speech to
 * text writes them differently every time.
 */
export const soundSkeleton = text => {
  let latin = '';

  for (const ch of normalizeSpeech(text)) {
    if (ch in DEVANAGARI_CONSONANTS) latin += DEVANAGARI_CONSONANTS[ch];
    else if (/[\u0900-\u097F]/.test(ch)) continue; // vowels, matras, virama
    else latin += ch;
  }

  return latin
    .replace(/ph|f/g, 'p')
    .replace(/ch/g, 'C')
    .replace(/sh/g, 's')
    .replace(/[kgdtbc]h/g, m => m[0])
    .replace(/x/g, 'ks')
    .replace(/[wv]/g, 'v')
    .replace(/q|c/g, 'k')
    .replace(/z/g, 'j')
    .replace(/C/g, 'c')
    .replace(/[^a-z]/g, '')
    .replace(/[aeiouyh]/g, '')
    .replace(/(.)\1+/g, '$1');
};

export const soundScore = (spoken, name) => {
  const a = soundSkeleton(spoken);
  const b = soundSkeleton(name);
  if (a.length < 3 || b.length < 3) return 0;
  return similarity(a, b) * 0.92;
};
