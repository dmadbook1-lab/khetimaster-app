import { sendAiGuruMessageApi } from '../api/aiGuruApi';

const AI_TIMEOUT_MS = 12000;

/*
 * Last resort when the words heard do not match any option locally
 * (for example "हार्वेस्टिंग" for "Harvesting"): ask AI Guru to pick
 * the closest option. Returns the option's value, or null.
 *
 * The prompt asks for a bare number so the answer is easy to trust.
 */
export const matchOptionWithAi = async ({ question, options, text, language }) => {
  if (!options?.length || !text) return null;

  const list = options
    .map((option, index) => {
      const english =
        typeof option.value === 'string' && option.value !== option.label
          ? ` (${option.value})`
          : '';
      return `${index + 1}. ${option.label}${english}`;
    })
    .join('\n');

  const message = [
    'You are a strict matcher inside a farming app voice assistant.',
    `The farmer was asked: "${question}"`,
    `Allowed answers:\n${list}`,
    `The farmer said (speech-to-text, may be Hindi, Marathi or English, may contain mistakes): "${text}"`,
    'Reply with ONLY the number of the allowed answer that best matches what the farmer meant.',
    'If none clearly matches, reply with 0. Do not write any other word.',
  ].join('\n\n');

  try {
    const response = await Promise.race([
      sendAiGuruMessageApi({
        message,
        fieldId: 'general',
        language,
        source: 'voice',
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), AI_TIMEOUT_MS),
      ),
    ]);

    const reply = String(response?.reply?.text ?? '');
    const number = Number((reply.match(/\d+/) || [])[0]);

    return Number.isInteger(number) && number >= 1 && number <= options.length
      ? options[number - 1].value
      : null;
  } catch {
    return null;
  }
};

/*
 * Home voice assistant: when the words did not match any screen locally
 * (or a long sentence might be a question), ask AI whether the farmer
 * wants to OPEN one of the app's sections or is asking a question.
 *
 * intents: [{ id, aiHint }]
 * Returns an intent id, 'question', or null when AI could not be reached
 * (then the caller keeps its own guess).
 */
const INTENT_TIMEOUT_MS = 8000;

export const classifyVoiceIntentWithAi = async ({ text, intents, language }) => {
  if (!text || !intents?.length) return null;

  const list = intents
    .map((intent, index) => `${index + 1}. ${intent.aiHint}`)
    .join('\n');

  const message = [
    'You are the intent router of a farming app voice assistant in India.',
    `App sections:\n${list}`,
    `The farmer said (speech-to-text in any Indian language or English, may contain mistakes): "${text}"`,
    'If the farmer wants to open, use, book, buy, sell or see one of these sections, reply with ONLY its number.',
    'If the farmer is asking a question or wants advice or an explanation, reply with 0.',
    'Do not write any other word.',
  ].join('\n\n');

  try {
    const response = await Promise.race([
      sendAiGuruMessageApi({
        message,
        fieldId: 'general',
        language,
        source: 'voice',
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), INTENT_TIMEOUT_MS),
      ),
    ]);

    const reply = String(response?.reply?.text ?? '');
    const found = reply.match(/\d+/);
    if (!found) return null;

    const number = Number(found[0]);
    if (number === 0) return 'question';

    return number >= 1 && number <= intents.length ? intents[number - 1].id : null;
  } catch {
    return null;
  }
};

const ask = async (message, language) => {
  try {
    const response = await Promise.race([
      sendAiGuruMessageApi({
        message,
        fieldId: 'general',
        language,
        source: 'voice',
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), AI_TIMEOUT_MS),
      ),
    ]);
    return String(response?.reply?.text ?? '').trim();
  } catch {
    return '';
  }
};

/*
 * Dates, times and numbers the local parser could not read
 * ("परसों के बाद वाला दिन", "साडे आठ वाजता", "दोन-तीन").
 * Returns yyyy-mm-dd, HH:MM or a number, or null.
 */
export const parseWithAi = async ({ type, text, today, language }) => {
  if (!text) return null;

  const rules = {
    yesno: 'Decide whether the farmer agreed (yes) or refused (no). Reply with ONLY YES or NO, or NONE if unclear. Yes/no may be said in Hindi, Marathi or English.',
    date: `Today is ${today} (India). Convert the date the farmer said into YYYY-MM-DD. Reply with ONLY that date, or NONE if there is no date.`,
    time: 'Convert the time of day the farmer said into 24-hour HH:MM. Reply with ONLY that time, or NONE if there is no time.',
    number: 'Convert the number the farmer said into digits. Reply with ONLY the number, or NONE if there is no number.',
  }[type];
  if (!rules) return null;

  const reply = await ask(
    `You convert speech-to-text from a farming app (Hindi, Marathi or English, may contain mistakes). ${rules}\n\nFarmer said: "${text}"`,
    language,
  );

  if (type === 'yesno') {
    if (/\bYES\b/i.test(reply)) return true;
    if (/\bNO\b/i.test(reply)) return false;
    return null;
  }
  if (type === 'date') {
    const match = reply.match(/\d{4}-\d{2}-\d{2}/);
    return match && match[0] >= today ? match[0] : null;
  }
  if (type === 'time') {
    const match = reply.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null;
  }
  const number = Number((reply.match(/\d+(\.\d+)?/) || [])[0]);
  return Number.isFinite(number) ? number : null;
};
