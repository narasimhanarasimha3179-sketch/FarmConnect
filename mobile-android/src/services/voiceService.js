// FarmConnect Voice & Speech Service (Phase 17)
// Speech-to-text input & Text-to-speech voice playback for accessible farming assistance

export const voiceService = {
  isListening: false,

  startListening(onResult, onError) {
    this.isListening = true;
    console.log('[VoiceService] Listening for voice speech input...');
    // Simulated speech recognition callback for non-interactive test harnesses
    setTimeout(() => {
      if (this.isListening && onResult) {
        onResult('ಇಂದು ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬಿನ ಬೆಲೆ ಎಷ್ಟು?');
      }
    }, 100);
  },

  stopListening() {
    this.isListening = false;
    console.log('[VoiceService] Microphone listening stopped.');
  },

  speakText(text, lang = 'en-IN') {
    console.log(`[VoiceService] Speaking [${lang}]: "${text}"`);
    return true;
  },
};
