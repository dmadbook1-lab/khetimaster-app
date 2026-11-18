/*
|--------------------------------------------------------------------------
| VOICE TRANSLITERATION (any Indian script -> one rough Latin form)
|--------------------------------------------------------------------------
|
| Speech recognisers answer in the language's own script: "ट्रॅक्टर"
| (Marathi), "டிராக்டர்" (Tamil), "ٹریکٹر" (Urdu). Command words are
| matched on a common Latin form so one keyword list works for every
| script, and loanwords ("tractor", "doctor") match however they are spelt.
|
| The nine Brahmic scripts share one Unicode layout (same offset = same
| letter), so a single table keyed by offset covers Devanagari, Bengali/
| Assamese, Gurmukhi, Gujarati, Odia, Tamil, Telugu, Kannada and
| Malayalam. Perso-Arabic (Urdu, Kashmiri, Sindhi) has its own table.
|
| The output is for matching only, not for display: both the spoken text
| and the keywords go through the same functions, so they agree.
|
| No React Native imports: tested in plain Jest.
|
*/

const BRAHMIC_BLOCKS = [
  0x0900, // Devanagari: hi, mr, ne, kok, mai, doi, sa, brx
  0x0980, // Bengali / Assamese: bn, as, mni
  0x0a00, // Gurmukhi: pa
  0x0a80, // Gujarati: gu
  0x0b00, // Odia: or
  0x0b80, // Tamil: ta
  0x0c00, // Telugu: te
  0x0c80, // Kannada: kn
  0x0d00, // Malayalam: ml
];

const CONSONANTS = {
  0x15: 'k', 0x16: 'kh', 0x17: 'g', 0x18: 'gh', 0x19: 'n',
  0x1a: 'ch', 0x1b: 'chh', 0x1c: 'j', 0x1d: 'jh', 0x1e: 'n',
  0x1f: 't', 0x20: 'th', 0x21: 'd', 0x22: 'dh', 0x23: 'n',
  0x24: 't', 0x25: 'th', 0x26: 'd', 0x27: 'dh', 0x28: 'n', 0x29: 'n',
  0x2a: 'p', 0x2b: 'ph', 0x2c: 'b', 0x2d: 'bh', 0x2e: 'm',
  0x2f: 'y', 0x30: 'r', 0x31: 'r', 0x32: 'l', 0x33: 'lh', 0x34: 'zh', // ळ ಳ ള = lh (ಬೆಳೆ crop ≠ ಬೆಲೆ price)
  0x35: 'v', 0x36: 'sh', 0x37: 'sh', 0x38: 's', 0x39: 'h',
  // precomposed nukta letters (क़ ख़ ग़ ज़ ड़ ढ़ फ़ य़ and the same slots
  // in Bengali, Gurmukhi, Odia)
  0x58: 'k', 0x59: 'kh', 0x5a: 'g', 0x5b: 'z', 0x5c: 'r', 0x5d: 'rh',
  0x5e: 'f', 0x5f: 'y',
};

const VOWELS = {
  0x05: 'a', 0x06: 'aa', 0x07: 'i', 0x08: 'ii', 0x09: 'u', 0x0a: 'uu',
  0x0b: 'ri', 0x0c: 'li', 0x0d: 'e', 0x0e: 'e', 0x0f: 'e', 0x10: 'ai',
  0x11: 'o', 0x12: 'o', 0x13: 'o', 0x14: 'au', 0x60: 'rii', 0x61: 'lii',
};

const MATRAS = {
  0x3e: 'aa', 0x3f: 'i', 0x40: 'ii', 0x41: 'u', 0x42: 'uu', 0x43: 'ri',
  0x44: 'rii', 0x45: 'e', 0x46: 'e', 0x47: 'e', 0x48: 'ai', 0x49: 'o',
  0x4a: 'o', 0x4b: 'o', 0x4c: 'au', 0x62: 'li', 0x63: 'lii',
};

const VIRAMA = 0x4d;
const NUKTA = 0x3c;

// letters outside the shared layout (by full code point)
const SPECIAL = {
  0x0972: 'e', // ॲ Marathi "ॲप"
  0x09ce: 't', // ৎ Bengali khanda ta
  0x09f0: 'r', // ৰ Assamese ra
  0x09f1: 'w', // ৱ Assamese wa
  0x0b71: 'w', // ୱ Odia wa
  0x0a70: 'n', // ੰ Gurmukhi tippi
  0x0d7a: 'n', 0x0d7b: 'n', 0x0d7c: 'r', 0x0d7d: 'l', 0x0d7e: 'l',
  0x0d7f: 'k', // Malayalam chillu letters
  0x0d4e: 'r', // Malayalam dot reph
};

// a consonant written with a nukta sounds different (ज़ = z, फ़ = f)
const NUKTA_SOUND = { j: 'z', ph: 'f', k: 'k', kh: 'kh', g: 'g', d: 'r', dh: 'rh', y: 'y' };

const PERSO_ARABIC = {
  'ا': 'a', 'آ': 'aa', 'أ': 'a', 'إ': 'i', 'ب': 'b', 'پ': 'p', 'ت': 't',
  'ٹ': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd',
  'ڈ': 'd', 'ذ': 'z', 'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's',
  'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': '', 'غ': 'gh',
  'ف': 'f', 'ق': 'k', 'ک': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
  'ن': 'n', 'ں': 'n', 'و': 'o', 'ؤ': 'o', 'ہ': 'h', 'ه': 'h', 'ۃ': 'h',
  'ھ': 'h', 'ء': '', 'ی': 'i', 'ي': 'i', 'ى': 'i', 'ئ': 'i', 'ے': 'e',
  'ۓ': 'e', '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5',
  '۶': '6', '۷': '7', '۸': '8', '۹': '9',
};

const brahmicInfo = code => {
  for (const base of BRAHMIC_BLOCKS) {
    if (code >= base && code < base + 0x80) return { base, offset: code - base };
  }
  return null;
};

const isBrahmicLetterish = code => {
  const info = brahmicInfo(code);
  if (!info) return false;
  const { offset } = info;
  return (
    CONSONANTS[offset] !== undefined ||
    VOWELS[offset] !== undefined ||
    MATRAS[offset] !== undefined ||
    offset === VIRAMA ||
    offset === NUKTA ||
    (offset >= 0x01 && offset <= 0x03) ||
    SPECIAL[code] !== undefined
  );
};

/*
 * Any mix of scripts -> lowercase Latin letters, digits and spaces.
 * Word-final inherent "a" is dropped (मंडी -> mandi, भाव -> bhaav).
 */
export function toLatin(text = '') {
  const chars = Array.from(String(text));
  let out = '';

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    const code = char.codePointAt(0);

    if (SPECIAL[code] !== undefined) {
      out += SPECIAL[code];
      continue;
    }

    if (PERSO_ARABIC[char] !== undefined) {
      out += PERSO_ARABIC[char];
      continue;
    }

    const info = brahmicInfo(code);

    if (!info) {
      out += char;
      continue;
    }

    const { offset } = info;

    if (offset >= 0x66 && offset <= 0x6f) {
      out += String(offset - 0x66); // native digits
      continue;
    }

    if (VOWELS[offset] !== undefined) {
      out += VOWELS[offset];
      continue;
    }

    if (MATRAS[offset] !== undefined) {
      out += MATRAS[offset]; // stray matra (shouldn't happen)
      continue;
    }

    if (offset === 0x01) {
      out += 'n'; // chandrabindu
      continue;
    }

    if (offset === 0x02) {
      // anusvara: "m" before p/b/m or at the end of a word, else "n"
      const next = chars[i + 1] ? brahmicInfo(chars[i + 1].codePointAt(0)) : null;
      const nextSound = next ? CONSONANTS[next.offset] : undefined;
      out += !nextSound || /^[pbm]/.test(nextSound) ? 'm' : 'n';
      continue;
    }

    if (offset === 0x03) {
      out += 'h'; // visarga
      continue;
    }

    let sound = CONSONANTS[offset];

    if (sound === undefined) continue; // virama, nukta, accents, addak

    let j = i + 1;
    const nextOffset = () =>
      chars[j] ? brahmicInfo(chars[j].codePointAt(0))?.offset : undefined;

    if (nextOffset() === NUKTA) {
      sound = NUKTA_SOUND[sound] || sound;
      j += 1;
    }

    out += sound;

    const after = nextOffset();

    if (after === VIRAMA) {
      i = j; // no vowel
      continue;
    }

    if (after !== undefined && MATRAS[after] !== undefined) {
      out += MATRAS[after];
      i = j;
      continue;
    }

    // inherent "a", except at the end of a word
    const nextChar = chars[j];
    const endOfWord = !nextChar || !isBrahmicLetterish(nextChar.codePointAt(0));
    if (!endOfWord) out += 'a';
    i = j - 1;
  }

  return out
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/*
 * One Latin word -> a forgiving spelling, so "need"/"nid", "farm"/"phaarm"
 * (फार्म), "yojana"/"yojanaa" (योजना) and "tractor"/"traktor" agree.
 */
export function looseWord(word = '') {
  let w = String(word)
    .replace(/ck/g, 'k')
    .replace(/c(?!h)/g, 'k')
    .replace(/q/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/f/g, 'ph')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/(.)\1+/g, '$1');

  if (w.length > 2 && w.endsWith('a')) w = w.slice(0, -1);

  return w;
}

/*
 * Consonant skeleton: vowels dropped, voiced = voiceless, aspiration
 * dropped. "tractor", "ट्रॅक्टर", "டிராக்டர்", "ٹریکٹر" -> "trktr".
 * Only used for loanwords listed on purpose (see voiceCommandData).
 */
export function skeleton(word = '') {
  return looseWord(word)
    .replace(/h/g, '')
    .replace(/[aeiouy]/g, '')
    .replace(/g/g, 'k')
    .replace(/d/g, 't')
    .replace(/b/g, 'p')
    .replace(/j/g, 'c')
    .replace(/(.)\1+/g, '$1');
}

// whole utterance -> list of loose words
export function looseWords(text = '') {
  return toLatin(text)
    .split(' ')
    .map(looseWord)
    .filter(Boolean);
}
