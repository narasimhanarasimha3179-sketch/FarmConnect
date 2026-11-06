// FarmConnect Agricultural AI Assistant Controller (Phases 15, 16, 17)
// Context-aware chatbot, multilingual responses (EN, KN, HI) & voice speech metadata

const db = require('../config/database');

/**
 * Detect language script of prompt:
 * Kannada: unicode range 0C80-0CFF
 * Devanagari / Hindi: unicode range 0900-097F
 * Default: English
 */
function detectLanguage(text = '') {
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
}

/**
 * POST /api/ai/chat
 * Multi-domain context-aware conversational engine
 */
function handleChat(req, res) {
  try {
    const { message, preferred_language, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const query = message.trim();
    const lang = preferred_language || detectLanguage(query);
    const lowerQuery = query.toLowerCase();

    let reply = '';
    let intent = 'GENERAL';
    let quickReplies = [];

    // 1. WEATHER INTENT
    if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('temperature') || lowerQuery.includes('ಹವಾಮಾನ') || lowerQuery.includes('ಮಳೆ') || lowerQuery.includes('मौसम') || lowerQuery.includes('बारिश')) {
      intent = 'WEATHER';
      const weather = db.prepare("SELECT * FROM weather_records WHERE LOWER(district) = 'mandya' LIMIT 1").get();

      if (lang === 'kn') {
        reply = `ಮಂಡ್ಯ ಜಿಲ್ಲೆಯ ಇಂದಿನ ಹವಾಮಾನ: ತಾಪಮಾನ ${weather.temp_c}°C, ತೇವಾಂಶ ${weather.humidity}%, ಮತ್ತು ಮಳೆಯ ಸಾಧ್ಯತೆ ${weather.rainfall_chance}%. ಕೃಷಿ ಸಲಹೆ: ${weather.advisory}`;
        quickReplies = ['ನಾಳೆ ಮಳೆ ಬರುತ್ತದೆಯೇ?', 'ರಾಗಿ ಬೆಳೆ ಮಾಹಿತಿ', 'ಮಂಡಿ ದರಗಳು'];
      } else if (lang === 'hi') {
        reply = `मंड्या जिले का आज का मौसम: तापमान ${weather.temp_c}°C, आर्द्रता ${weather.humidity}%, और बारिश की संभावना ${weather.rainfall_chance}%। कृषि सलाह: ${weather.advisory}`;
        quickReplies = ['क्या कल बारिश होगी?', 'मंडी भाव', 'खाद की मात्रा'];
      } else {
        reply = `Mandya current agricultural weather: Temperature is ${weather.temp_c}°C with ${weather.humidity}% humidity and ${weather.rainfall_chance}% chance of rainfall. Field Advisory: ${weather.advisory}`;
        quickReplies = ['Will it rain tomorrow?', 'Sugarcane mandi price', 'Fertilizer calculator'];
      }
    }

    // 2. MANDI INTENT
    else if (lowerQuery.includes('price') || lowerQuery.includes('rate') || lowerQuery.includes('mandi') || lowerQuery.includes('apmc') || lowerQuery.includes('ದರ') || lowerQuery.includes('ಬೆಲೆ') || lowerQuery.includes('ಭಾವ') || lowerQuery.includes('ಮಾರುಕಟ್ಟೆ') || lowerQuery.includes('भाव')) {
      intent = 'MANDI_PRICE';
      const mandi = db.prepare('SELECT * FROM mandi_prices ORDER BY arrival_date DESC LIMIT 3').all();
      const priceList = mandi.map((m) => `${m.commodity}: ₹${m.modal_price}/Quintal (${m.market_mandi})`).join('\n• ');

      if (lang === 'kn') {
        reply = `ಇಂದಿನ ಪ್ರಮುಖ APMC ಮಂಡಿ ದರಗಳು:\n• ${priceList}\n\nಹೆಚ್ಚಿನ ಮಾರುಕಟ್ಟೆ ಹೋಲಿಕೆಗಾಗಿ ಮಂಡಿ ಟಿಕ್ಕರ್ ಅನ್ನು ಪರೀಕ್ಷಿಸಿ.`;
        quickReplies = ['ಕಬ್ಬಿನ ದರ', 'ಭತ್ತದ ಬೆಲೆ', 'ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ'];
      } else if (lang === 'hi') {
        reply = `आज के प्रमुख APMC मंडी भाव:\n• ${priceList}\n\nविस्तृत विश्लेषण के लिए मंडी स्क्रीन देखें।`;
        quickReplies = ['गन्ने का भाव', 'धान का भाव', 'मौसम की जानकारी'];
      } else {
        reply = `Today's Verified APMC Mandi Rates:\n• ${priceList}\n\nPrices updated directly from Karnataka APMC market yards.`;
        quickReplies = ['Sugarcane trend chart', 'Compare APMC mandis', 'Set price alert'];
      }
    }

    // 3. FERTILIZER & SOIL INTENT
    else if (lowerQuery.includes('fertilizer') || lowerQuery.includes('urea') || lowerQuery.includes('dap') || lowerQuery.includes('soil') || lowerQuery.includes('npk') || lowerQuery.includes('ಗೊಬ್ಬರ') || lowerQuery.includes('ಮಣ್ಣು') || lowerQuery.includes('खाद') || lowerQuery.includes('उर्वरक') || lowerQuery.includes('मिट्टी')) {
      intent = 'FERTILIZER_SOIL';

      if (lang === 'kn') {
        reply = `ಭತ್ತ ಮತ್ತು ಕಬ್ಬಿನ ಬೆಳೆಗಳಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಮಗ್ರ ಗೊಬ್ಬರದ ಪ್ರಮಾಣ: ಪ್ರತಿ ಎಕರೆಗೆ 50 ಕೆಜಿ DAP ಮೂಲಗೊಬ್ಬರವಾಗಿ ಮತ್ತು 50-70 ಕೆಜಿ ಯೂರಿಯಾವನ್ನು ನಾಟಿಯ 25 ಮತ್ತು 55 ದಿನಗಳ ನಂತರ ಎರಡು ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ. ನಿಖರ ಮಾಹಿತಿಗಾಗಿ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಬಳಸಿ.`;
        quickReplies = ['ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಕಾರ್ಡ್', 'ರೈತ ಸಿರಿ ಯೋಜನೆ', 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ'];
      } else if (lang === 'hi') {
        reply = `धान और गन्ने के लिए संतुलित खाद की सिफारिश: प्रति एकड़ 50 किलो डीएपी बुवाई के समय दें, और 50-70 किलो यूरिया 25 और 55 दिनों में दो किश्तों में दें। सटीक खुराक के लिए मृदा स्वास्थ्य कैलकुलेटर का उपयोग करें।`;
        quickReplies = ['मृदा स्वास्थ्य कार्ड', 'पीएम किसान योजना', 'रोग उपचार'];
      } else {
        reply = `Balanced Fertilizer Recommendation (RDF per acre for cereal crops): Apply 1 bag DAP (50kg) + 25kg MOP at basal land preparation. Top-dress Urea in two splits (35kg at tillering and 30kg at panicle initiation). Use our NPK Soil Calculator for custom dosage.`;
        quickReplies = ['Open NPK Calculator', 'View Soil Card', 'Organic Manure Guide'];
      }
    }

    // 4. PEST & DISEASE INTENT
    else if (lowerQuery.includes('pest') || lowerQuery.includes('disease') || lowerQuery.includes('borer') || lowerQuery.includes('blast') || lowerQuery.includes('yellow') || lowerQuery.includes('ಕೀಟ') || lowerQuery.includes('ರೋಗ') || lowerQuery.includes('ಹುಳು') || lowerQuery.includes('कीट') || lowerQuery.includes('रोग')) {
      intent = 'PEST_DISEASE';

      if (lang === 'kn') {
        reply = `ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣಾ ಸಲಹೆ: ಭತ್ತದ ಸುಳಿ ಸಾಯುವ ರೋಗ ಅಥವಾ ಕಾಂಡಕೊರಕ ಹುಳುವಿನ ಹಾನಿಗೆ ಪ್ರತಿ ಎಕರೆಗೆ 60 ಮಿಲಿ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ (ಕೋರಾಜೆನ್) ಅಥವಾ ಜೈವಿಕ ನಿಯಂತ್ರಣವಾಗಿ ಟ್ರೈಕೋಗ್ರಾಮ ಪರಾವಲಂಬಿ ಕೀಟಗಳನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿ. ಛಾಯಾಚಿತ್ರ ತೆಗೆಯಲು ಕ್ಯಾಮೆರಾ ಎಐ ಬಳಸಿ.`;
        quickReplies = ['ಕ್ಯಾಮೆರಾ ಎಐ ಸ್ಕ್ಯಾನ್', 'ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ', 'ತಜ್ಞರ ಸಲಹೆ'];
      } else if (lang === 'hi') {
        reply = `कीट एवं रोग नियंत्रण सलाह: धान के तना छेदक के लिए 60 मिली क्लोरेंट्रानिलीप्रोल (कोराजन) प्रति एकड़ छिड़कें या जैविक नियंत्रण के लिए ट्राइकोग्रामा परजीवी छोड़ें। तुरंत पहचान के लिए कैमरा एआई का प्रयोग करें।`;
        quickReplies = ['कैमरा एआई से जांचें', 'नीम का तेल छिड़काव', 'दवा की सूची'];
      } else {
        reply = `Integrated Pest Management (IPM) Guidance: For stem borer dead hearts or leaf blast, spray Chlorantraniliprole 18.5% SC @ 60 ml/acre or apply Trichoderma bio-agent. You can also upload a leaf photo to our Camera AI module for instant diagnosis.`;
        quickReplies = ['Open Camera AI Scan', 'Organic Neem Spray', 'Pest Symptoms Guide'];
      }
    }

    // 5. GOVERNMENT SCHEMES INTENT
    else if (lowerQuery.includes('scheme') || lowerQuery.includes('pm kisan') || lowerQuery.includes('subsidy') || lowerQuery.includes('krishi bhagya') || lowerQuery.includes('ಯೋಜನೆ') || lowerQuery.includes('ಸಬ್ಸಿಡಿ') || lowerQuery.includes('ರೈತ ಸಿರಿ') || lowerQuery.includes('योजना') || lowerQuery.includes('सब्सिडी')) {
      intent = 'GOVT_SCHEME';

      if (lang === 'kn') {
        reply = `ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ರೈತ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು:\n1. ರೈತ ಸಿರಿ ಯೋಜನೆ: ಸಿರಿಧಾನ್ಯ ಬೆಳೆಗಾರರಿಗೆ ಹೆಕ್ಟೇರಿಗೆ ₹10,000 ನೇರ ಪ್ರೋತ್ಸಾಹಧನ.\n2. ಕೃಷಿ ಭಾಗ್ಯ: ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಪಂಪ್‌ಸೆಟ್‌ಗಳಿಗೆ 80-90% ಸಹಾಯಧನ.\n3. ಪಿಎಂ-ಕಿಸಾನ್: ವಾರ್ಷಿಕ ₹6,000 ಮೂರು ಕಂತುಗಳಲ್ಲಿ.\nಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿಭಾಗವನ್ನು ನೋಡಿ.`;
        quickReplies = ['ಕೃಷಿ ಭಾಗ್ಯ ಅರ್ಜಿ', 'ರೈತ ಸಿರಿ ದಾಖಲೆಗಳು', 'ಪಿಎಂ-ಕಿಸಾನ್ ಅರ್ಹತೆ'];
      } else if (lang === 'hi') {
        reply = `प्रमुख सरकारी कृषि योजनाएं:\n1. पीएम-किसान: किसानों को सालाना ₹6,000 तीन किश्तों में प्रत्यक्ष लाभ।\n2. कृषि भाग्य योजना: कृषि तालाब और सोलर पंप पर 80-90% सब्सिडी।\n3. पीएम फसल बीमा: प्राकृतिक आपदाओं से फसल सुरक्षा।\nविस्तृत जानकारी के लिए योजना पोर्टल देखें।`;
        quickReplies = ['पीएम किसान पात्रता', 'कृषि भाग्य सब्सिडी', 'आवश्यक दस्तावेज'];
      } else {
        reply = `Key Government Agricultural Schemes for You:\n1. PM-KISAN: ₹6,000 annual direct benefit transfer in 3 equal installments.\n2. Krishi Bhagya: 80-90% subsidy for farm ponds and solar pumps.\n3. Raitha Siri: ₹10,000/hectare incentive for Karnataka millet farmers.\n4. PMFBY: Low-cost crop insurance against drought and flooding.`;
        quickReplies = ['Apply for Krishi Bhagya', 'PM-KISAN Eligibility', 'View Required Documents'];
      }
    }

    // 6. GENERAL GREETING / ASSISTANCE
    else {
      intent = 'GENERAL';
      if (lang === 'kn') {
        reply = `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫಾರ್ಮ್‌ಕನೆಕ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ. ಹವಾಮಾನ, ಲೈವ್ ಮಂಡಿ ಬೆಲೆಗಳು, ರೋಗ ತಪಾಸಣೆ, ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಅಥವಾ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಬಹುದು.`;
        quickReplies = ['ಇಂದಿನ ಮಂಡಿ ದರಗಳು', 'ಇಂದಿನ ಹವಾಮಾನ', 'ಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್', 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು'];
      } else if (lang === 'hi') {
        reply = `नमस्ते! मैं आपका फार्मकनेक्ट कृषि एआई सहायक हूँ। आप मौसम, ताजा मंडी भाव, फसल रोग निदान, खाद की खुराक या सरकारी योजनाओं के बारे में कुछ भी पूछ सकते हैं।`;
        quickReplies = ['आज का मंडी भाव', 'आज का मौसम', 'खाद की गणना', 'सरकारी योजनाएं'];
      } else {
        reply = `Hello! I am your FarmConnect Smart Agriculture AI Assistant. How can I help you today? You can ask me about live mandi prices, rainfall forecasts, pest diagnosis, fertilizer dosage, or government farming subsidies.`;
        quickReplies = ['Live Mandi Prices', 'Weather Forecast', 'NPK Fertilizer Calculator', 'Govt Schemes'];
      }
    }

    return res.status(200).json({
      success: true,
      query,
      language: lang,
      intent,
      reply,
      suggested_quick_replies: quickReplies,
      speech_synthesis: {
        text: reply.replace(/\n•/g, '. ').replace(/•/g, ''),
        language_code: lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('handleChat error:', err);
    return res.status(500).json({ success: false, message: 'AI Assistant processing error.' });
  }
}

/**
 * GET /api/ai/suggested-prompts
 * Quick one-tap prompts
 */
function getSuggestedPrompts(req, res) {
  const { lang = 'en' } = req.query;

  const prompts = {
    en: [
      'What is the price of Sugarcane in Mandya today?',
      'Will it rain in Mandya this week?',
      'How much Urea and DAP should I apply for 2 acres of Paddy?',
      'My paddy leaves have yellow stem borer holes, how to control?',
      'What is the eligibility for the Krishi Bhagya subsidy scheme?',
    ],
    kn: [
      'ಇಂದು ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬಿನ ದರ ಎಷ್ಟು?',
      'ಈ ವಾರ ಮಂಡ್ಯದಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ?',
      '2 ಎಕರೆ ಭತ್ತಕ್ಕೆ ಎಷ್ಟು ಯೂರಿಯಾ ಮತ್ತು ಡಿಎಪಿ ಬೇಕು?',
      'ಭತ್ತದ ಬೆಳೆ ಕೊರೆಯುವ ಹುಳು ಹತೋಟಿ ಹೇಗೆ?',
      'ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ ಸಬ್ಸಿಡಿ ಪಡೆಯುವುದು ಹೇಗೆ?',
    ],
    hi: [
      'आज मंड्या में गन्ने का भाव क्या है?',
      'क्या इस हफ्ते बारिश होगी?',
      '2 एकड़ धान के लिए कितनी खाद चाहिए?',
      'धान के तना छेदक कीट की रोकथाम कैसे करें?',
      'कृषि भाग्य योजना की सब्सिडी कैसे मिलेगी?',
    ],
  };

  return res.status(200).json({
    success: true,
    language: lang,
    prompts: prompts[lang] || prompts.en,
  });
}

module.exports = {
  handleChat,
  getSuggestedPrompts,
  detectLanguage,
};
