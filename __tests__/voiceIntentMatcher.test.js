import { matchVoiceIntent } from '../src/utils/voiceIntentMatcher';
import { skeleton, toLatin } from '../src/utils/voiceTransliterate';

const intentOf = text => {
  const result = matchVoiceIntent(text);
  return result.type === 'command' ? result.id : result.type;
};

describe('toLatin', () => {
  test.each([
    ['मंडी', 'mandii'],
    ['भाव', 'bhaav'],
    ['ट्रॅक्टर', 'trektar'],
    ['योजना', 'yojanaa'],
  ])('%s -> %s', (input, output) => {
    expect(toLatin(input)).toBe(output);
  });

  test('every script reduces "tractor" to the same skeleton', () => {
    [
      'tractor', 'ट्रैक्टर', 'ट्रॅक्टर', 'ট্রাক্টর', 'ટ્રેક્ટર', 'ਟਰੈਕਟਰ',
      'ଟ୍ରାକ୍ଟର', 'டிராக்டர்', 'ట్రాక్టర్', 'ಟ್ರ್ಯಾಕ್ಟರ್', 'ട്രാക്ടർ', 'ٹریکٹر',
    ].forEach(word => {
      expect(skeleton(toLatin(word))).toBe('trktr');
    });
  });
});

describe('book a tractor - every recogniser language', () => {
  test.each([
    ['en', 'I want to book a tractor'],
    ['hi', 'मुझे ट्रैक्टर बुक करना है'],
    ['hi (latin)', 'mujhe tractor chahiye'],
    ['mr', 'मला ट्रॅक्टर बुक करायचा आहे'],
    ['mr (suffix)', 'ट्रॅक्टरसाठी बुकिंग करा'],
    ['ne', 'मलाई ट्र्याक्टर चाहियो'],
    ['bn', 'আমি ট্রাক্টর বুক করতে চাই'],
    ['as', 'মোক ট্ৰেক্টৰ লাগে'],
    ['gu', 'મારે ટ્રેક્ટર બુક કરવું છે'],
    ['pa', 'ਮੈਨੂੰ ਟਰੈਕਟਰ ਬੁੱਕ ਕਰਨਾ ਹੈ'],
    ['or', 'ମୋତେ ଟ୍ରାକ୍ଟର ବୁକ କରିବାକୁ ଅଛି'],
    ['ta', 'எனக்கு டிராக்டர் புக் செய்ய வேண்டும்'],
    ['te', 'నాకు ట్రాక్టర్ బుక్ చేయాలి'],
    ['kn', 'ನನಗೆ ಟ್ರ್ಯಾಕ್ಟರ್ ಬುಕ್ ಮಾಡಬೇಕು'],
    ['ml', 'എനിക്ക് ട്രാക്ടർ ബുക്ക് ചെയ്യണം'],
    ['ur', 'مجھے ٹریکٹر بک کرنا ہے'],
  ])('%s', (_, text) => {
    expect(intentOf(text)).toBe('tractor');
  });
});

describe('other screens in native words', () => {
  test.each([
    ['मला शेतमजूर हवे आहेत', 'labour'],
    ['मजुरांची गरज आहे', 'labour'],
    ['மண்டி விலை காட்டு', 'mandi'],
    ['बाजारभाव दाखवा', 'mandi'],
    ['ಪಶು ವೈದ್ಯ ಬೇಕು', 'doctor'],
    ['माझ्या गायीला डॉक्टर हवा', 'doctor'],
    ['माझी गाय आजारी आहे रोग झाला', 'doctor'],
    ['डॉक्टरला बोलवा', 'doctor'],
    ['माझे शेत दाखवा', 'farms'],
    ['నా పొలం చూపించు', 'farms'],
    ['पिकावरील रोग तपासा', 'crop-monitoring'],
    ['নার্সারি খোলো', 'nursery'],
    ['ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ ਖੋਲ੍ਹੋ', 'profile'],
    ['खत आणि बियाणे खरेदी करायचे', 'agri-products'],
    ['सरकारी योजना दाखवा', 'government-schemes'],
    ['ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', 'government-schemes'],
    ['शेती बातम्या', 'knowledge-center'],
    ['मला माझे पीक विकायचे आहे', 'trade'],
    ['മണ്ടി വില', 'mandi'],
    ['مزدور چاہیے', 'labour'],
  ])('%s -> %s', (text, id) => {
    expect(intentOf(text)).toBe(id);
  });
});

describe('crop prices', () => {
  test.each([
    ['कांद्याचा भाव काय आहे', 'onion'],
    ['प्याज का भाव बताओ', 'onion'],
    ['गेहूं का रेट', 'wheat'],
    ['தக்காளி விலை', 'tomato'],
    ['పత్తి ధర', 'cotton'],
    ['cotton price today', 'cotton'],
    ['बाजरीचा भाव', 'bajra'],
  ])('%s -> %s', (text, cropId) => {
    expect(matchVoiceIntent(text)).toEqual({ type: 'crop-price', cropId });
  });
});

describe('not commands', () => {
  test('greeting', () => {
    expect(intentOf('नमस्कार')).toBe('greeting');
    expect(intentOf('வணக்கம்')).toBe('greeting');
  });

  test('cancel', () => {
    expect(intentOf('थांबा')).toBe('cancel');
    expect(intentOf('नको')).toBe('cancel');
    expect(intentOf('बंद करो')).toBe('cancel');
  });

  test('"नको" inside a command is not cancel', () => {
    expect(intentOf('ट्रॅक्टर नको मजूर हवे')).not.toBe('cancel');
  });

  test('temple is not mandi', () => {
    expect(intentOf('मंदिर कहाँ है')).toBe('unknown');
  });

  test('unmatched text is unknown (goes to AI)', () => {
    expect(intentOf('आज पाऊस पडेल का')).toBe('unknown');
  });

  test('long question naming a screen is not confident', () => {
    expect(matchVoiceIntent('गेहूं की फसल में रोग क्यों लगता है')).toMatchObject({
      type: 'command',
      confident: false,
    });
    expect(matchVoiceIntent('मला ट्रॅक्टर बुक करायचा आहे')).toMatchObject({
      confident: true,
    });
  });
});

describe('retroflex l keeps different words apart', () => {
  test('Kannada price vs crop', () => {
    expect(intentOf('ಬೆಲೆ')).toBe('mandi');
    expect(intentOf('ಬೆಳೆ ರೋಗ')).toBe('crop-monitoring');
  });
  test('Malayalam price vs crop', () => {
    expect(intentOf('വില')).toBe('mandi');
    expect(intentOf('വിളരോഗം')).toBe('crop-monitoring');
  });
});
