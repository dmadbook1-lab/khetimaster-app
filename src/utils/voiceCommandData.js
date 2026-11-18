import { MANDI_ROUTES } from '../constants/mandiRoutes';
import { MARKET_ROUTES } from '../constants/marketRoutes';

/*
|--------------------------------------------------------------------------
| VOICE COMMAND WORDS (every app language)
|--------------------------------------------------------------------------
|
| phrases: words/phrases in ANY script (romanised, Devanagari, Tamil, …).
|   They are transliterated at load time (voiceTransliterate), so write
|   them the way the speech recogniser of that language prints them.
|   A word of 5+ letters also matches with a suffix ("मजूर" ->
|   "मजुरांची", "பயிர்" -> "பயிருக்கு").
|
| loanwords: English words spoken in every language ("tractor").
|   Matched by consonant skeleton, so any spelling in any script works
|   ("ट्रॅक्टरसाठी", "டிராக்டர்", "ٹریکٹر"). Only list words whose
|   skeleton has 4+ consonants, or they collide with ordinary words.
|
| aiHint: what the destination is for, used when AI picks the screen.
|
| Recognisers per app language: see utils/speechLocale.js. Languages
| without their own recogniser (kok, mai, doi, sa, brx, sat, ks, sd, mni)
| are heard in Hindi / Urdu / Bengali, which are covered here.
|
*/

export const COMMANDS = [
  {
    id: 'labour',
    route: 'LabourBooking',
    message: 'voice.open_labour',
    aiHint: 'hire farm labourers / workers',
    loanwords: [],
    phrases: [
      // English / romanised Hindi
      'labour', 'labor', 'workers', 'worker', 'mazdoor', 'majdur', 'majdoor',
      'mujhe labour chahiye', 'labour chahiye', 'mazdoor chahiye',
      'need labour', 'need workers', 'hire labour', 'hire workers',
      'labour hiring', 'labour booking', 'open labour', 'workers chahiye',
      'kamgar', 'shetmajur',
      // Hindi
      'मजदूर', 'मज़दूर', 'मजदूरों', 'मज़दूरों', 'लेबर', 'श्रमिक', 'कामगार',
      'मजदूर चाहिए', 'खेत मजदूर',
      // Marathi
      'मजूर', 'मजुर', 'शेतमजूर', 'शेतमजुर', 'कामगार', 'मजुरांची', 'मजूर हवे',
      // Nepali
      'मजदुर', 'ज्यामी', 'कामदार',
      // Bengali / Assamese
      'শ্রমিক', 'মজুর', 'মজদুর', 'কামলা', 'লেবার', 'শ্ৰমিক', 'বনুৱা', 'লেবাৰ',
      // Gujarati
      'મજૂર', 'મજુર', 'મજૂરો', 'કામદાર', 'શ્રમિક', 'લેબર',
      // Punjabi
      'ਮਜ਼ਦੂਰ', 'ਮਜਦੂਰ', 'ਕਾਮੇ', 'ਲੇਬਰ',
      // Odia
      'ଶ୍ରମିକ', 'ମଜୁରିଆ', 'ମୂଲିଆ', 'ଲେବର',
      // Tamil
      'தொழிலாளர்', 'தொழிலாளர்கள்', 'தொழிலாளி', 'கூலியாட்கள்', 'வேலையாட்கள்',
      'வேலையாள்', 'கூலி', 'லேபர்',
      // Telugu
      'కూలీలు', 'కూలి', 'కూలీ', 'కార్మికులు', 'పనివాళ్ళు', 'లేబర్',
      // Kannada
      'ಕೂಲಿ', 'ಕೂಲಿಗಾರರು', 'ಕಾರ್ಮಿಕರು', 'ಕೆಲಸಗಾರರು', 'ಆಳುಗಳು', 'ಲೇಬರ್',
      // Malayalam
      'തൊഴിലാളി', 'തൊഴിലാളികൾ', 'പണിക്കാർ', 'ലേബർ',
      // Urdu
      'مزدور', 'مزدوروں', 'لیبر',
    ],
  },
  {
    id: 'mandi',
    route: MANDI_ROUTES.HOME,
    message: 'voice.open_mandi',
    aiHint: 'see mandi / market prices (rates) of crops',
    loanwords: [],
    phrases: [
      'mandi', 'rates', 'prices', 'bhav', 'bhaav', 'mandi ke bhav dikhao',
      'mandi ka bhav dikhao', 'mandi ke rate dikhao', 'mandi bhav',
      'mandi rates', 'mandi rate', 'mandi price', 'mandi prices',
      'show mandi prices', 'show mandi rates', 'i want to see mandi prices',
      'mujhe mandi ke bhav dekhne hain', 'crop prices', 'fasal ka bhav',
      'open mandi', 'market rate', 'market price', 'market prices',
      'bazar bhav', 'bajar bhav',
      // Hindi
      'मंडी', 'मण्डी', 'भाव', 'मंडी भाव', 'मंडी का भाव', 'मंडी के भाव',
      'बाजार भाव', 'बाज़ार भाव', 'फसल का भाव', 'फसलों के दाम', 'रेट', 'दाम',
      // Marathi
      'बाजारभाव', 'बाजार समिती', 'मंडईत', 'मंडीतील', 'दर', 'बाजार दर',
      // Nepali
      'भाउ', 'बजार भाउ',
      // Bengali / Assamese
      'মান্ডি', 'মন্ডি', 'বাজারদর', 'বাজার দর', 'দাম', 'বজাৰ দৰ', 'মণ্ডী',
      // Gujarati
      'મંડી', 'બજાર ભાવ', 'ભાવ', 'માર્કેટ યાર્ડ',
      // Punjabi
      'ਮੰਡੀ', 'ਭਾਅ', 'ਰੇਟ',
      // Odia
      'ମଣ୍ଡି', 'ବଜାର ଦର', 'ଦର',
      // Tamil
      'மண்டி', 'சந்தை விலை', 'விலை', 'விலைகள்', 'மார்க்கெட் விலை',
      // Telugu
      'మండి', 'మార్కెట్ ధర', 'మార్కెట్ ధరలు', 'ధర', 'ధరలు',
      // Kannada
      'ಮಂಡಿ', 'ಮಾರುಕಟ್ಟೆ ದರ', 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', 'ದರ', 'ಬೆಲೆ', 'ಧಾರಣೆ',
      // Malayalam
      'മണ്ടി', 'മാർക്കറ്റ് വില', 'വില', 'വിലനിലവാരം',
      // Urdu
      'منڈی', 'بھاؤ', 'ریٹ',
    ],
  },
  {
    id: 'tractor',
    route: 'TractorBooking',
    message: 'voice.open_machinery',
    aiHint: 'book / rent a tractor or farm machinery',
    loanwords: ['tractor', 'machinery', 'harvester', 'rotavator'],
    phrases: [
      'tractor', 'machinery', 'machine', 'mashin', 'tractor book karna hai',
      'tractor booking karni hai', 'tractor chahiye', 'tractor rent par chahiye',
      'tractor kiraye par chahiye', 'book tractor', 'rent a tractor',
      'hire tractor', 'tractor booking', 'open tractor', 'machinery booking',
      'farm machinery', 'agricultural machinery', 'machine chahiye',
      // Hindi
      'ट्रैक्टर', 'मशीन', 'मशीनरी', 'कृषि यंत्र', 'यंत्र',
      // Marathi
      'ट्रॅक्टर', 'यंत्रसामग्री', 'शेती यंत्र', 'अवजारे',
      // Bengali / Assamese
      'যন্ত্র', 'মেশিন', 'যন্ত্ৰ',
      // Gujarati
      'મશીન', 'યંત્ર',
      // Punjabi
      'ਮਸ਼ੀਨ', 'ਮਸ਼ੀਨਰੀ',
      // Odia
      'ଯନ୍ତ୍ର',
      // Tamil
      'இயந்திரம்', 'இயந்திரங்கள்', 'மெஷின்',
      // Telugu
      'యంత్రం', 'యంత్రాలు', 'మెషిన్',
      // Kannada
      'ಯಂತ್ರ', 'ಯಂತ್ರಗಳು',
      // Malayalam
      'യന്ത്രം', 'യന്ത്രങ്ങൾ',
      // Urdu
      'مشین',
    ],
  },
  {
    id: 'doctor',
    route: 'DoctorMain',
    message: 'voice.open_vet',
    aiHint: 'book a veterinary doctor for cattle / animals',
    loanwords: ['doctor', 'veterinary'],
    phrases: [
      'doctor', 'vet', 'mujhe doctor chahiye', 'pashu doctor chahiye',
      'pashuon ka doctor', 'vet chahiye', 'veterinary doctor', 'need a vet',
      'animal doctor', 'open doctor', 'doctor booking',
      // Hindi
      'डॉक्टर', 'डाक्टर', 'पशु चिकित्सक', 'पशु डॉक्टर', 'जानवरों का डॉक्टर',
      // Marathi
      'पशुवैद्य', 'पशुवैद्यकीय', 'जनावरांचा डॉक्टर', 'गुरांचा डॉक्टर',
      // Bengali / Assamese
      'ডাক্তার', 'পশু চিকিৎসক', 'চিকিৎসক', 'ডাক্তৰ',
      // Gujarati
      'ડૉક્ટર', 'ડોક્ટર', 'પશુ ચિકિત્સક',
      // Punjabi
      'ਡਾਕਟਰ',
      // Odia
      'ଡାକ୍ତର', 'ପଶୁ ଚିକିତ୍ସକ',
      // Tamil
      'மருத்துவர்', 'கால்நடை மருத்துவர்',
      // Telugu
      'వైద్యుడు', 'పశు వైద్యుడు', 'పశువైద్యుడు',
      // Kannada
      'ವೈದ್ಯ', 'ಪಶು ವೈದ್ಯ', 'ಪಶುವೈದ್ಯ',
      // Malayalam
      'മൃഗഡോക്ടർ', 'മൃഗ ഡോക്ടർ', 'വെറ്ററിനറി',
      // Urdu
      'ڈاکٹر',
    ],
  },
  {
    id: 'farms',
    route: 'MyFarms',
    message: 'voice.open_farms',
    aiHint: 'see my farms / fields',
    loanwords: [],
    phrases: [
      'farm', 'farms', 'khet', 'mere khet dikhao', 'mera khet dikhao',
      'mere farm dikhao', 'my farms', 'show my farms', 'my fields',
      'open my farm', 'farm details', 'khet dikhao', 'my farm', 'shet',
      // Hindi
      'खेत', 'मेरे खेत', 'मेरा खेत', 'फार्म', 'खेतों',
      // Marathi
      'शेत', 'शेतं', 'शेते', 'माझे शेत', 'माझं शेत',
      // Nepali
      'मेरो खेत',
      // Bengali / Assamese
      'খেত', 'জমি', 'আমার জমি', 'খামার', 'ফার্ম', 'পথাৰ', 'মোৰ পথাৰ',
      // Gujarati
      'ખેતર', 'મારું ખેતર', 'ફાર્મ',
      // Punjabi
      'ਖੇਤ', 'ਮੇਰੇ ਖੇਤ', 'ਫਾਰਮ',
      // Odia
      'ଜମି', 'ଚାଷ ଜମି', 'ଫାର୍ମ',
      // Tamil
      'வயல்', 'என் வயல்', 'பண்ணை', 'நிலம்',
      // Telugu
      'పొలం', 'నా పొలం', 'ఫారం',
      // Kannada
      'ಹೊಲ', 'ನನ್ನ ಹೊಲ', 'ಜಮೀನು', 'ಫಾರ್ಮ್',
      // Malayalam
      'കൃഷിയിടം', 'എന്റെ കൃഷിയിടം', 'ഫാം', 'പാടം',
      // Urdu
      'کھیت', 'میرے کھیت', 'فارم',
    ],
  },
  {
    id: 'crop-monitoring',
    route: 'DiseaseDetection',
    message: 'voice.open_crop_services',
    aiHint: 'check crop health / detect crop disease or pests',
    loanwords: [],
    phrases: [
      'crop', 'crops', 'fasal', 'fasal ki health dikhao', 'fasal ki sehat dikhao',
      'crop health', 'check my crop', 'crop monitoring', 'satellite monitoring',
      'open crop monitoring', 'check crop health', 'disease detection',
      'fasal ki bimari', 'crop disease',
      // Hindi
      'फसल', 'फ़सल', 'फसल की सेहत', 'फसल की बीमारी', 'फसल रोग', 'बीमारी',
      'रोग', 'कीड़े', 'कीट',
      // Marathi
      'पीक', 'पिक', 'पिकाची तब्येत', 'पीक रोग', 'पिकावरील रोग', 'कीड',
      // Nepali
      'बाली', 'बालीको रोग',
      // Bengali / Assamese
      'ফসল', 'ফসলের রোগ', 'রোগ', 'পোকা', 'শস্য', 'ৰোগ',
      // Gujarati
      'પાક', 'પાકનો રોગ', 'રોગ', 'જીવાત',
      // Punjabi
      'ਫ਼ਸਲ', 'ਫਸਲ', 'ਬਿਮਾਰੀ', 'ਕੀੜੇ',
      // Odia
      'ଫସଲ', 'ଫସଲ ରୋଗ', 'ରୋଗ', 'ପୋକ',
      // Tamil
      'பயிர்', 'பயிர் நோய்', 'நோய்', 'பூச்சி',
      // Telugu
      'పంట', 'పంట తెగులు', 'తెగులు', 'పురుగు', 'పంట ఆరోగ్యం',
      // Kannada
      'ಬೆಳೆ', 'ಬೆಳೆ ರೋಗ', 'ರೋಗ', 'ಕೀಟ',
      // Malayalam
      'വിള', 'വിളരോഗം', 'രോഗം', 'കീടം',
      // Urdu
      'فصل', 'بیماری',
    ],
  },
  {
    id: 'nursery',
    route: 'NurseryHome',
    message: 'voice.open_nursery',
    aiHint: 'buy plants / saplings / seedlings from a nursery',
    loanwords: ['nursery'],
    phrases: [
      'nursery', 'plants', 'paudhe', 'paudha', 'nursery kholo',
      'nursery open karo', 'paudhe kharidne hain', 'paudhe chahiye',
      'plants kharidne hain', 'buy plants', 'open nursery', 'plant nursery',
      'saplings', 'seedlings',
      // Hindi
      'पौधे', 'पौधा', 'पौध', 'पौधशाला',
      // Marathi
      'रोपवाटिका', 'रोपे', 'रोप',
      // Nepali
      'बिरुवा',
      // Bengali / Assamese
      'চারা', 'চারাগাছ', 'পুলি',
      // Gujarati
      'રોપા', 'છોડ',
      // Punjabi
      'ਪੌਦੇ', 'ਬੂਟੇ',
      // Odia
      'ଚାରା', 'ଗଛ ଚାରା',
      // Tamil
      'நாற்று', 'நாற்றுகள்', 'செடிகள்', 'கன்று',
      // Telugu
      'మొక్కలు', 'మొక్క', 'నారు',
      // Kannada
      'ಸಸಿ', 'ಸಸಿಗಳು', 'ಗಿಡಗಳು',
      // Malayalam
      'നഴ്സറി', 'തൈകൾ', 'തൈ', 'ചെടികൾ',
      // Urdu
      'پودے',
    ],
  },
  {
    id: 'profile',
    route: 'Profile',
    message: 'voice.open_profile',
    aiHint: 'open my profile / account',
    loanwords: ['profile'],
    phrases: [
      'profile', 'meri profile kholo', 'profile kholo', 'my profile',
      'open my profile', 'open profile', 'my account',
      // Hindi / Marathi / Nepali
      'मेरा खाता', 'माझे खाते',
      // Tamil
      'சுயவிவரம்',
    ],
  },
  {
    id: 'agri-products',
    route: 'AgriProducts',
    message: 'voice.open_agri_products',
    aiHint: 'buy seeds, fertiliser, pesticides and other farm products',
    loanwords: ['products', 'pesticide', 'fertilizer'],
    phrases: [
      'products', 'product', 'agri products', 'agriculture products',
      'farming products', 'kheti ke saman', 'kheti ka saman', 'open products',
      'buy farming products', 'seeds', 'fertilizer', 'fertiliser',
      'pesticide', 'pesticides', 'khad', 'beej',
      // Hindi
      'उत्पाद', 'खाद', 'बीज', 'कीटनाशक', 'कृषि उत्पाद', 'खेती का सामान',
      // Marathi
      'उत्पादने', 'खते', 'खत', 'बियाणे', 'बी बियाणे', 'कीटकनाशक',
      'शेती साहित्य',
      // Nepali
      'मल', 'बीउ',
      // Bengali / Assamese
      'পণ্য', 'সার', 'বীজ', 'কীটনাশক', 'সাৰ',
      // Gujarati
      'ઉત્પાદનો', 'ખાતર', 'બિયારણ', 'જંતુનાશક',
      // Punjabi
      'ਉਤਪਾਦ', 'ਖਾਦ', 'ਬੀਜ', 'ਕੀਟਨਾਸ਼ਕ',
      // Odia
      'ଉତ୍ପାଦ', 'ସାର', 'ମଞ୍ଜି', 'ବିହନ', 'କୀଟନାଶକ',
      // Tamil
      'பொருட்கள்', 'உரம்', 'விதை', 'விதைகள்', 'பூச்சிக்கொல்லி',
      // Telugu
      'ఉత్పత్తులు', 'ఎరువులు', 'ఎరువు', 'విత్తనాలు', 'పురుగుమందు',
      // Kannada
      'ಉತ್ಪನ್ನಗಳು', 'ಗೊಬ್ಬರ', 'ಬೀಜ', 'ಬೀಜಗಳು', 'ಕೀಟನಾಶಕ',
      // Malayalam
      'ഉൽപ്പന്നങ്ങൾ', 'വളം', 'വിത്ത്', 'കീടനാശിനി',
      // Urdu
      'مصنوعات', 'کھاد', 'بیج',
    ],
  },
  {
    id: 'government-schemes',
    route: 'GovernmentSchemes',
    message: 'voice.open_schemes',
    aiHint: 'government schemes and subsidies for farmers',
    loanwords: ['subsidy'],
    phrases: [
      'schemes', 'scheme', 'yojana', 'yojna', 'government schemes',
      'govt schemes', 'sarkari yojana', 'sarkari yojna', 'government yojana',
      'open schemes', 'subsidy',
      // Hindi / Marathi / Nepali
      'योजना', 'योजनाएं', 'योजनाएँ', 'सरकारी योजना', 'शासकीय योजना',
      'स्कीम', 'अनुदान',
      // Bengali / Assamese
      'প্রকল্প', 'সরকারি প্রকল্প', 'যোজনা', 'স্কিম', 'ভর্তুকি', 'আঁচনি',
      // Gujarati
      'યોજના', 'સરકારી યોજના', 'સહાય',
      // Punjabi
      'ਯੋਜਨਾ', 'ਸਕੀਮ', 'ਸਕੀਮਾਂ',
      // Odia
      'ଯୋଜନା', 'ସ୍କିମ',
      // Tamil
      'திட்டம்', 'திட்டங்கள்', 'அரசு திட்டம்', 'மானியம்',
      // Telugu
      'పథకం', 'పథకాలు', 'ప్రభుత్వ పథకాలు',
      // Kannada
      'ಯೋಜನೆ', 'ಯೋಜನೆಗಳು', 'ಸರ್ಕಾರಿ ಯೋಜನೆ',
      // Malayalam
      'പദ്ധതി', 'പദ്ധതികൾ', 'സർക്കാർ പദ്ധതി',
      // Urdu
      'اسکیم', 'یوجنا',
    ],
  },
  {
    id: 'knowledge-center',
    route: 'AgricultureNews',
    message: 'voice.open_knowledge',
    aiHint: 'agriculture news and articles',
    loanwords: [],
    phrases: [
      'news', 'articles', 'knowledge center', 'agriculture news',
      'farming news', 'kheti ki jankari', 'kheti ki jaankari', 'open articles',
      'open knowledge center', 'khabar', 'samachar',
      // Hindi / Nepali
      'खबर', 'ख़बर', 'खबरें', 'समाचार', 'कृषि समाचार',
      // Marathi
      'बातम्या', 'बातमी', 'शेती बातम्या',
      // Bengali / Assamese
      'খবর', 'সংবাদ', 'কৃষি খবর', 'বাতৰি', 'খবৰ',
      // Gujarati
      'સમાચાર', 'ખબર',
      // Punjabi
      'ਖ਼ਬਰਾਂ', 'ਖਬਰਾਂ', 'ਖ਼ਬਰ', 'ਖਬਰ',
      // Odia
      'ଖବର', 'ସମ୍ବାଦ',
      // Tamil
      'செய்திகள்', 'செய்தி', 'கட்டுரைகள்',
      // Telugu
      'వార్తలు', 'వార్త',
      // Kannada
      'ಸುದ್ದಿ', 'ಸುದ್ದಿಗಳು',
      // Malayalam
      'വാർത്ത', 'വാർത്തകൾ',
      // Urdu
      'خبریں', 'خبر',
    ],
  },
  {
    id: 'trade',
    route: MARKET_ROUTES.HOME,
    message: 'voice.open_trade',
    aiHint: 'sell my crop / buy and sell commodities with traders',
    loanwords: [],
    phrases: [
      'trade', 'trading', 'trader', 'traders', 'commodity', 'commodities',
      'kheti market', 'marketplace', 'buy and sell', 'sell my crop',
      'sell crop', 'fasal bechni hai', 'fasal bechna hai', 'maal bechna hai',
      'vyapari', 'sell my produce',
      // Hindi
      'व्यापार', 'व्यापारी', 'फसल बेचनी है', 'फसल बेचना है', 'बेचना', 'बेचनी',
      'बिक्री',
      // Marathi
      'विकायचे', 'विकायचा', 'विकायची', 'विक्री', 'पीक विकायचे',
      // Nepali
      'बेच्नु',
      // Bengali / Assamese
      'ব্যবসা', 'বিক্রি', 'বেচতে', 'ব্যবসায়ী', 'বিক্ৰী',
      // Gujarati
      'વેપાર', 'વેપારી', 'વેચવું', 'વેચવો', 'વેચાણ',
      // Punjabi
      'ਵਪਾਰ', 'ਵਪਾਰੀ', 'ਵੇਚਣਾ', 'ਵੇਚਣੀ',
      // Odia
      'ବ୍ୟବସାୟ', 'ବିକ୍ରି', 'ବିକିବା',
      // Tamil
      'வர்த்தகம்', 'விற்க', 'விற்பனை', 'வியாபாரி',
      // Telugu
      'వ్యాపారం', 'అమ్మాలి', 'అమ్మకం', 'వ్యాపారి',
      // Kannada
      'ವ್ಯಾಪಾರ', 'ಮಾರಾಟ', 'ಮಾರಬೇಕು', 'ವ್ಯಾಪಾರಿ',
      // Malayalam
      'വ്യാപാരം', 'വിൽക്കണം', 'വിൽപ്പന', 'കച്ചവടം',
      // Urdu
      'تجارت', 'بیچنا', 'بیچنی', 'تاجر',
    ],
  },
];

/*
 * An animal word means a sick animal, not a sick crop:
 * "माझी गाय आजारी आहे" -> vet, even though "रोग"/"बीमारी" also matches.
 */
export const ANIMAL_WORDS = [
  'animal', 'animals', 'cattle', 'cow', 'buffalo', 'goat', 'pashu', 'janwar',
  'gaay', 'bhains', 'bakri',
  'पशु', 'जानवर', 'जानवरों', 'गाय', 'भैंस', 'बकरी', 'मवेशी', // hi
  'जनावर', 'जनावरे', 'जनावरांना', 'गुरे', 'म्हैस', 'शेळी', // mr
  'গরু', 'পশু', 'ছাগল', 'মহিষ', 'গৰু', // bn / as
  'ગાય', 'ભેંસ', 'પશુ', 'બકરી', // gu
  'ਗਾਂ', 'ਮੱਝ', 'ਪਸ਼ੂ', 'ਬੱਕਰੀ', // pa
  'ଗାଈ', 'ପଶୁ', 'ଛେଳି', // or
  'மாடு', 'பசு', 'கால்நடை', 'ஆடு', 'எருமை', // ta
  'ఆవు', 'గేదె', 'పశువులు', 'మేక', // te
  'ಹಸು', 'ಎಮ್ಮೆ', 'ಜಾನುವಾರು', 'ಮೇಕೆ', // kn
  'പശു', 'എരുമ', 'ആട്', 'കന്നുകാലി', // ml
  'گائے', 'بھینس', 'جانور', 'بکری', // ur
];

/*
 * Question words: a long sentence with one of these is probably a
 * question for AI Guru, not "open X" ("गेहूं में रोग क्यों लगता है?").
 * Then AI decides; plain short commands are never sent to AI.
 * ("का"/"के" are left out: in Hindi they mean "of".)
 */
export const QUESTION_WORDS = [
  'how', 'why', 'what', 'when', 'which', 'kaise', 'kyon', 'kyu', 'kya', 'kab',
  'कैसे', 'क्यों', 'क्या', 'कब', 'कौन', 'कितना', 'कितनी', // hi
  'कसे', 'कशी', 'काय', 'केव्हा', 'कोणते', 'कोणती', 'किती', // mr
  'कसरी', 'किन', 'कहिले', // ne
  'কিভাবে', 'কেন', 'কী', 'কখন', 'কেনেকৈ', 'কিয়', // bn / as
  'કેવી', 'કેમ', 'શું', 'ક્યારે', // gu
  'ਕਿਵੇਂ', 'ਕਿਉਂ', 'ਕਦੋਂ', // pa
  'କିପରି', 'କାହିଁକି', 'କଣ', // or
  'எப்படி', 'ஏன்', 'என்ன', 'எப்போது', // ta
  'ఎలా', 'ఎందుకు', 'ఏమిటి', 'ఎప్పుడు', // te
  'ಹೇಗೆ', 'ಏಕೆ', 'ಯಾಕೆ', 'ಏನು', 'ಯಾವಾಗ', // kn
  'എങ്ങനെ', 'എന്തുകൊണ്ട്', 'എന്ത്', 'എപ്പോൾ', // ml
  'کیسے', 'کیوں', 'کیا', 'کب', // ur
];

export const CANCEL_PHRASES = [
  'cancel', 'close assistant', 'stop listening', 'band karo', 'band kar do',
  'bas karo', 'rehne do', 'ruko',
  'बंद करो', 'बंद कर दो', 'बस करो', 'रहने दो', 'रुको', // hi
  'बंद कर', 'बंद करा', 'थांब', 'थांबा', 'राहू दे', // mr
  'बन्द गर', 'रोक', // ne
  'বন্ধ করো', 'থামো', 'থাক', 'বন্ধ কৰা', // bn / as
  'બંધ કરો', 'રહેવા દો', 'અટકો', // gu
  'ਬੰਦ ਕਰੋ', 'ਰੁਕੋ', 'ਰਹਿਣ ਦਿਓ', // pa
  'ବନ୍ଦ କର', 'ରୁହ', // or
  'நிறுத்து', 'நிறுத்துங்கள்', // ta
  'ఆపు', 'ఆపండి', // te
  'ನಿಲ್ಲಿಸು', 'ನಿಲ್ಲಿಸಿ', // kn
  'നിർത്തൂ', 'നിർത്തുക', // ml
  'بند کرو', 'رکو', 'رہنے دو', // ur
];

// "no / don't want" closes the assistant only when it is all that was said
export const CANCEL_WHOLE_PHRASES = [
  'no', 'nahi', 'nako', 'नहीं', 'नको', 'না', 'ના', 'ਨਹੀਂ', 'ନା',
  'வேண்டாம்', 'వద్దు', 'ಬೇಡ', 'വേണ്ട', 'نہیں',
];

export const GREETING_PHRASES = [
  'hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning',
  'good afternoon', 'good evening', 'how are you', 'ram ram',
  'नमस्ते', 'नमस्कार', 'राम राम', 'कैसे हो', 'कसे आहात', // hi / mr
  'নমস্কার', 'নমস্কাৰ', // bn / as
  'નમસ્તે', 'કેમ છો', // gu
  'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'ਨਮਸਤੇ', // pa
  'ନମସ୍କାର', // or
  'வணக்கம்', // ta
  'నమస్కారం', 'నమస్తే', // te
  'ನಮಸ್ಕಾರ', // kn
  'നമസ്കാരം', // ml
  'السلام علیکم', 'آداب', // ur
];

/*
 * "<crop> + price word" opens that crop's mandi page.
 * Keys are mandi crop ids (data/mandiCrops.js).
 */
export const CROP_WORDS = {
  onion: ['onion', 'pyaz', 'pyaaz', 'pyaj', 'kanda', 'प्याज', 'प्याज़', 'कांदा', 'পেঁয়াজ', 'ડુંગળી', 'ਪਿਆਜ਼', 'ପିଆଜ', 'வெங்காயம்', 'ఉల్లిపాయ', 'ఉల్లి', 'ಈರುಳ್ಳಿ', 'ഉള്ളി', 'پیاز'],
  tomato: ['tomato', 'tamatar', 'टमाटर', 'टोमॅटो', 'টমেটো', 'ટામેટા', 'ਟਮਾਟਰ', 'ଟମାଟୋ', 'தக்காளி', 'టమాటా', 'ಟೊಮೆಟೊ', 'തക്കാളി', 'ٹماٹر'],
  potato: ['potato', 'aloo', 'alu', 'batata', 'आलू', 'बटाटा', 'আলু', 'બટાકા', 'ਆਲੂ', 'ଆଳୁ', 'உருளைக்கிழங்கு', 'బంగాళదుంప', 'ಆಲೂಗಡ್ಡೆ', 'ഉരുളക്കിഴങ്ങ്', 'آلو'],
  wheat: ['wheat', 'gehun', 'gehu', 'gahu', 'गेहूं', 'गेहूँ', 'गेहू', 'गहू', 'গম', 'ઘઉં', 'ਕਣਕ', 'ଗହମ', 'கோதுமை', 'గోధుమ', 'గోధుమలు', 'ಗೋಧಿ', 'ഗോതമ്പ്', 'گندم'],
  rice: ['rice', 'chawal', 'चावल', 'तांदूळ', 'চাল', 'ચોખા', 'ਚੌਲ', 'ଚାଉଳ', 'அரிசி', 'బియ్యం', 'ಅಕ್ಕಿ', 'അരി', 'چاول'],
  paddy: ['paddy', 'dhan', 'धान', 'भात', 'ধান', 'ડાંગર', 'ਝੋਨਾ', 'ଧାନ', 'நெல்', 'వరి', 'ಭತ್ತ', 'നെല്ല്', 'دھان'],
  maize: ['maize', 'makka', 'corn', 'मक्का', 'मका', 'ভুট্টা', 'મકાઈ', 'ਮੱਕੀ', 'ମକା', 'மக்காச்சோளம்', 'మొక్కజొన్న', 'ಮೆಕ್ಕೆಜೋಳ', 'مکئی'],
  soybean: ['soybean', 'soyabean', 'soya', 'सोयाबीन', 'সয়াবিন', 'સોયાબીન', 'ਸੋਇਆਬੀਨ', 'சோயாபீன்', 'సోయాబీన్', 'ಸೋಯಾಬೀನ್', 'സോയാബീൻ'],
  cotton: ['cotton', 'kapas', 'kapus', 'कपास', 'कापूस', 'তুলা', 'કપાસ', 'ਕਪਾਹ', 'କପା', 'பருத்தி', 'పత్తి', 'ಹತ್ತಿ', 'പരുത്തി', 'کپاس'],
  gram: ['chana', 'gram', 'harbhara', 'चना', 'हरभरा', 'ছোলা', 'ચણા', 'ਛੋਲੇ', 'ଚଣା', 'கொண்டைக்கடலை', 'శనగలు', 'ಕಡಲೆ', 'കടല', 'چنا'],
  arhar: ['arhar', 'tur', 'toor', 'अरहर', 'तूर', 'तुअर', 'তুর', 'તુવેર', 'ਅਰਹਰ', 'ହରଡ଼', 'துவரை', 'కందులు', 'ತೊಗರಿ', 'തുവര', 'ارہر'],
  moong: ['moong', 'mung', 'मूंग', 'मूग', 'মুগ', 'મગ', 'ਮੂੰਗੀ', 'ମୁଗ', 'பாசிப்பயறு', 'పెసలు', 'ಹೆಸರು', 'ചെറുപയർ', 'مونگ'],
  urad: ['urad', 'उड़द', 'उडद', 'उडीद', 'কলাই', 'અડદ', 'ਮਾਂਹ', 'ବିରି', 'உளுந்து', 'మినుములు', 'ಉದ್ದು', 'ഉഴുന്ന്', 'ماش'],
  groundnut: ['groundnut', 'moongphali', 'shengdana', 'peanut', 'मूंगफली', 'शेंगदाणा', 'भुईमूग', 'চিনাবাদাম', 'મગફળી', 'ਮੂੰਗਫਲੀ', 'ଚିନାବାଦାମ', 'நிலக்கடலை', 'வேர்க்கடலை', 'వేరుశనగ', 'ಕಡಲೆಕಾಯಿ', 'നിലക്കടല', 'مونگ پھلی'],
  mustard: ['mustard', 'sarson', 'सरसों', 'मोहरी', 'সরিষা', 'રાઈ', 'ਸਰ੍ਹੋਂ', 'ସୋରିଷ', 'கடுகு', 'ఆవాలు', 'ಸಾಸಿವೆ', 'കടുക്', 'سرسوں'],
  sugarcane: ['sugarcane', 'ganna', 'गन्ना', 'ऊस', 'আখ', 'શેરડી', 'ਗੰਨਾ', 'ଆଖୁ', 'கரும்பு', 'చెరకు', 'ಕಬ್ಬು', 'കരിമ്പ്', 'گنا'],
  chilli: ['chilli', 'mirchi', 'मिर्च', 'मिर्ची', 'मिरची', 'লঙ্কা', 'মরিচ', 'મરચું', 'ਮਿਰਚ', 'ଲଙ୍କା', 'மிளகாய்', 'మిరప', 'ಮೆಣಸಿನಕಾಯಿ', 'മുളക്', 'مرچ'],
  turmeric: ['turmeric', 'haldi', 'halad', 'हल्दी', 'हळद', 'হলুদ', 'હળદર', 'ਹਲਦੀ', 'ହଳଦୀ', 'மஞ்சள்', 'పసుపు', 'ಅರಿಶಿನ', 'മഞ്ഞൾ', 'ہلدی'],
  garlic: ['garlic', 'lahsun', 'lasun', 'लहसुन', 'लसूण', 'রসুন', 'લસણ', 'ਲਸਣ', 'ରସୁଣ', 'பூண்டு', 'వెల్లుల్లి', 'ಬೆಳ್ಳುಳ್ಳಿ', 'വെളുത്തുള്ളി', 'لہسن'],
  bajra: ['bajra', 'bajri', 'बाजरी', 'बाजरे', 'बाजरीचा', 'બાજરી', 'கம்பு', 'సజ్జలు', 'ಸಜ್ಜೆ', 'باجرا'],
  jowar: ['jowar', 'jwari', 'ज्वार', 'ज्वारी', 'জোয়ার', 'જુવાર', 'ਜਵਾਰ', 'జొన్న', 'జొన్నలు', 'ಜೋಳ', 'جوار'],
  banana: ['banana', 'kela', 'keli', 'केला', 'केळी', 'কলা', 'કેળા', 'ਕੇਲਾ', 'କଦଳୀ', 'வாழைப்பழம்', 'అరటి', 'ಬಾಳೆಹಣ್ಣು', 'വാഴപ്പഴം', 'کیلا'],
  grapes: ['grapes', 'angoor', 'draksha', 'अंगूर', 'द्राक्ष', 'द्राक्षे', 'আঙুর', 'દ્રાક્ષ', 'ਅੰਗੂਰ', 'ଅଙ୍ଗୁର', 'திராட்சை', 'ద్రాక్ష', 'ದ್ರಾಕ್ಷಿ', 'മുന്തിരി', 'انگور'],
  pomegranate: ['pomegranate', 'anar', 'dalimb', 'अनार', 'डाळिंब', 'ডালিম', 'દાડમ', 'ਅਨਾਰ', 'ଡାଳିମ୍ବ', 'மாதுளை', 'దానిమ్మ', 'ದಾಳಿಂಬೆ', 'മാതളം', 'انار'],
  cauliflower: ['cauliflower', 'gobi', 'फूलगोभी', 'गोभी', 'फुलकोबी', 'ফুলকপি', 'ફ્લાવર', 'ਗੋਭੀ', 'ଫୁଲକୋବି', 'காலிஃபிளவர்', 'కాలీఫ్లవర్', 'ಹೂಕೋಸು', 'കോളിഫ്ലവർ', 'گوبھی'],
  brinjal: ['brinjal', 'baingan', 'बैंगन', 'वांगी', 'वांगे', 'বেগুন', 'રીંગણ', 'ਬੈਂਗਣ', 'ବାଇଗଣ', 'கத்திரிக்காய்', 'వంకాయ', 'ಬದನೆಕಾಯಿ', 'വഴുതന', 'بینگن'],
};

export const PRICE_WORDS = [
  'bhav', 'bhaav', 'bhao', 'rate', 'rates', 'price', 'prices', 'daam', 'dam',
  'kimat', 'keemat', 'mandi', 'dar',
  'भाव', 'दाम', 'कीमत', 'क़ीमत', 'रेट', 'मंडी', 'दर', 'बाजारभाव', 'भाउ', 'मूल्य',
  'দাম', 'দর', 'দৰ', 'ભાવ', 'કિંમત', 'ਭਾਅ', 'ਕੀਮਤ', 'ਰੇਟ', 'ଦର', 'ଦାମ',
  'விலை', 'ధర', 'ధరలు', 'ದರ', 'ಬೆಲೆ', 'ಧಾರಣೆ', 'വില', 'بھاؤ', 'قیمت', 'ریٹ',
];

export const CROP_NAMES = {
  arhar: 'Arhar / Tur',
  gram: 'Gram (Chana)',
};
