const express = require('express');
const router = express.Router();

// Multilingual Agricultural Knowledge Corpus & Guardrails
const AGRI_KNOWLEDGE_BASE = [
  {
    keywords: ['blast', 'paddy blast', 'rice blast', 'ರೋಗ', 'ಬತ್ತದ ಬೆಂಕಿ ರೋಗ', 'झुलसा'],
    kannada: 'ಬತ್ತದ ಬೆಂಕಿ ರೋಗ (Paddy Blast) ನಿಯಂತ್ರಣಕ್ಕೆ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75 WP (0.6 ಗ್ರಾಂ/ಲೀಟರ್) ಅಥವಾ ಐಸೊಪ್ರೊಥಿಯೋಲೇನ್ ಸಿಂಪಡಿಸಿ. ಯೂರಿಯಾ ಗೊಬ್ಬರವನ್ನು ಅತಿಯಾಗಿ ಬಳಸಬೇಡಿ.',
    hindi: 'धान के झुलसा रोग (Blast) के नियंत्रण के लिए ट्राइसाइक्लाजोल 75 WP (0.6 ग्राम/लीटर) का छिड़काव करें। यूरिया का अत्यधिक उपयोग न करें।',
    english: 'For Paddy Blast control, spray Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane @ 1.5 ml/L. Avoid excess split doses of chemical nitrogen.'
  },
  {
    keywords: ['urea', 'nitrogen', 'fertilizer', 'ಯೂರಿಯಾ', 'ಗೊಬ್ಬರ', 'यूरिया', 'खाद'],
    kannada: 'ಯೂರಿಯಾವನ್ನು ಬಿತ್ತನೆಯ ಸಮಯದಲ್ಲಿ ಅರ್ಧ ಮತ್ತು ತೆನೆ ಒಡೆಯುವ ಹಂತದಲ್ಲಿ ಉಳಿದರ್ಧ ಭಾಗವನ್ನು ಬೇವಿನ ಎಣ್ಣೆ ಮಿಶ್ರಣ ಮಾಡಿ (Neem-coated) ಹಾಕಿ.',
    hindi: 'यूरिया का उपयोग 2 से 3 चरणों में करें। नीम लेपित यूरिया का उपयोग करें ताकि नाइट्रोजन का ह्रास कम से कम हो।',
    english: 'Always apply Neem-coated Urea in split doses (basal, tillering, panicle initiation). Never broadcast directly during heavy downpours.'
  },
  {
    keywords: ['weather', 'rain', 'ಮಳೆ', 'ಹವಾಮಾನ', 'मौसम', 'बारिश'],
    kannada: 'ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇರುವಾಗ ಯಾವುದೇ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ. ಹೊಲದಲ್ಲಿ ಹೆಚ್ಚುವರಿ ನೀರು ಹರಿದುಹೋಗಲು ಕಾಲುವೆ ಸಿದ್ಧವಾಗಿಡಿ.',
    hindi: 'बारिश के दौरान कीटनाशक का छिड़काव न करें। खेत से अतिरिक्त जल निकासी की व्यवस्था सुनिश्चित करें।',
    english: 'With precipitation anticipated, withhold foliage spraying and ensure field drainage channels are unobstructed to avoid waterlogging.'
  },
  {
    keywords: ['stem borer', 'ಕೊರಕ ಹುಳು', 'तना छेदक'],
    kannada: 'ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುವಿಗೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5 SC (0.3 ಮಿಲೀ/ಲೀಟರ್) ಅಥವಾ ಕಾರ್ಬೋಫ್ಯುರಾನ್ 3G ಹರಳುಗಳನ್ನು ಬಳಸಿ.',
    hindi: 'तना छेदक कीट के नियंत्रण के लिए क्लोरेंट्रानिलीप्रोल 18.5 SC (0.3 मिली/लीटर) पानी में मिलाकर छिड़कें।',
    english: 'For Yellow Stem Borer, spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or install pheromone lures @ 8 traps/acre.'
  }
];

// Fallback contextual advice per language
const DEFAULT_RESPONSES = {
  kannada: 'ನಮಸ್ಕಾರ ಕಿಸಾನ್ ಮಿತ್ರ. ನಿಮ್ಮ ಬೆಳೆ, ಮಣ್ಣು, ಕೀಟ ಬಾಧೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ದರಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
  hindi: 'नमस्ते किसान भाई। अपनी फसल, मिट्टी के स्वास्थ्य, कीट नियंत्रण अथवा मंडी भाव के बारे में प्रश्न पूछें।',
  english: 'Greetings Farmer. Ask any question regarding crop diagnostics, NPK balancing, organic farming, or market logistics.'
};

// AI Agronomist Query Endpoint
router.post('/query', (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Query text cannot be empty' });
    }

    const lang = (language || 'english').toLowerCase();
    const queryLower = question.toLowerCase();

    // Context matching
    const match = AGRI_KNOWLEDGE_BASE.find(entry =>
      entry.keywords.some(kw => queryLower.includes(kw.toLowerCase()))
    );

    let reply = '';
    if (match) {
      reply = match[lang] || match['english'];
    } else {
      reply = DEFAULT_RESPONSES[lang] || DEFAULT_RESPONSES['english'];
    }

    res.json({
      success: true,
      query: question,
      language: lang,
      answer: reply,
      safetyDisclaimer: 'Advisory is tailored according to ICAR & UAS Bangalore agronomic recommendations.',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI Assistant processing error' });
  }
});

module.exports = router;
