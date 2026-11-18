jest.mock('i18next', () => ({ t: k => k, language: 'en' }));
jest.mock('../src/utils/indiaSchedule', () => {
  const actual = jest.requireActual('../src/utils/indiaSchedule');
  return actual;
});

const {
  parseYesNo,
  parseNumber,
  parseDateKey,
  parseClockTime,
  matchOption,
  parseChoiceIndex,
  isBackCommand,
  isCloseCommand,
} = require('../src/utils/voiceParsers');

describe('voiceParsers', () => {
  it('understands yes / no in three languages', () => {
    expect(parseYesNo('yes please')).toBe(true);
    expect(parseYesNo('हाँ कर दो')).toBe(true);
    expect(parseYesNo('होय')).toBe(true);
    expect(parseYesNo('नाही')).toBe(false);
    expect(parseYesNo('nahi')).toBe(false);
    expect(parseYesNo('blah')).toBeNull();
  });

  it('parses numbers', () => {
    expect(parseNumber('3 days')).toBe(3);
    expect(parseNumber('तीन')).toBe(3);
    expect(parseNumber('पाच दिवस')).toBe(5);
    expect(parseNumber('२')).toBe(2);
    expect(parseNumber('hello')).toBeNull();
  });

  it('parses dates', () => {
    const today = '2026-11-13';
    expect(parseDateKey('today', today)).toBe('2026-11-13');
    expect(parseDateKey('कल', today)).toBe('2026-11-14');
    expect(parseDateKey('उद्या', today)).toBe('2026-11-14');
    expect(parseDateKey('day after tomorrow', today)).toBe('2026-11-15');
    expect(parseDateKey('in 3 days', today)).toBe('2026-11-16');
    expect(parseDateKey('20', today)).toBe('2026-11-20');
    expect(parseDateKey('nothing', today)).toBeNull();
  });

  it('parses clock times', () => {
    expect(parseClockTime('9 am')).toBe('09:00');
    expect(parseClockTime('सुबह 7')).toBe('07:00');
    expect(parseClockTime('5')).toBe('17:00');
    expect(parseClockTime('10:30')).toBe('10:30');
    expect(parseClockTime('शाम 5')).toBe('17:00');
  });

  it('matches options by name, alias or index', () => {
    const options = [
      { value: 'a', label: 'Tractor', aliases: ['ट्रैक्टर'] },
      { value: 'b', label: 'Tractor Trolley' },
    ];
    expect(matchOption('tractor trolley please', options).value).toBe('b');
    expect(matchOption('ट्रैक्टर', options).value).toBe('a');
    expect(parseChoiceIndex('the second one', 3)).toBe(2);
    expect(parseChoiceIndex('दूसरा', 3)).toBe(2);
  });

  it('detects back and close', () => {
    expect(isBackCommand('go back')).toBe(true);
    expect(isCloseCommand('बंद करो')).toBe(true);
    expect(isCloseCommand('hello')).toBe(false);
  });
});

describe('closestOption', () => {
  const { closestOption } = require('../src/utils/voiceParsers');
  const options = [
    { value: 'Planting', label: 'Planting' },
    { value: 'Harvesting', label: 'Harvesting' },
    { value: 'Spraying', label: 'Spraying' },
  ];
  it('guesses misspelled words', () => {
    expect(closestOption('planing', options).option.value).toBe('Planting');
    expect(closestOption('harvesing work', options).option.value).toBe('Harvesting');
    expect(closestOption('sprayin', options).option.value).toBe('Spraying');
    expect(closestOption('xyz', options)).toBeNull();
  });
});

describe('Hindi / Marathi sound-alike matching', () => {
  const { closestOption } = require('../src/utils/voiceParsers');
  const options = [
    { value: 'Planting', label: 'रोपाई' },
    { value: 'Harvesting', label: 'कटाई' },
    { value: 'Spraying', label: 'छिड़काव' },
  ];
  it('matches Devanagari spellings of English words', () => {
    expect(closestOption('हार्वेस्टिंग', options).option.value).toBe('Harvesting');
    expect(closestOption('प्लांटिंग', options).option.value).toBe('Planting');
    expect(closestOption('स्प्रेइंग', options).option.value).toBe('Spraying');
    expect(closestOption('हारवेस्टींग', options).option.value).toBe('Harvesting');
  });
  it('matches misspelled Hindi / Marathi labels', () => {
    expect(closestOption('कटाइ', options).option.value).toBe('Harvesting');
    expect(closestOption('रोपई', options).option.value).toBe('Planting');
  });
});

describe('English said while Hindi / Marathi is selected', () => {
  const p = require('../src/utils/voiceParsers');
  it('understands English words written in Devanagari', () => {
    expect(p.parseYesNo('यस')).toBe(true);
    expect(p.parseYesNo('ओके')).toBe(true);
    expect(p.parseYesNo('नो')).toBe(false);
    expect(p.parseDateKey('टुमारो', '2026-11-13')).toBe('2026-11-14');
    expect(p.parseNumber('थ्री')).toBe(3);
    expect(p.parseClockTime('9 ए एम')).toBe('09:00');
    expect(p.isBackCommand('बैक')).toBe(true);
  });
  it('still understands Hindi and English', () => {
    expect(p.parseYesNo('haan')).toBe(true);
    expect(p.parseYesNo('हाँ')).toBe(true);
    expect(p.parseYesNo('yes')).toBe(true);
  });
});
