// FarmConnect AI Agricultural Assistant Chat Screen (Phases 15, 16, 17)
// Multi-turn conversational interface, multilingual translation (EN, KN, HI) & voice speech-to-text

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button, Header } from '../../components/common';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { voiceService } from '../../services/voiceService';
import { apiClient } from '../../services/apiClient';

export default function AiAssistantScreen({ onBack }) {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { showInfo, showError } = useNotification();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'ನಮಸ್ಕಾರ! Hello! I am your FarmConnect Agriculture AI Assistant. Ask me about mandi rates, weather, crop fertilizers, pest diagnosis, or government subsidies.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    loadSuggestedPrompts();
  }, [currentLanguage]);

  async function loadSuggestedPrompts() {
    try {
      const res = await apiClient.get(`/ai/suggested-prompts?lang=${currentLanguage}`);
      if (res.data?.success) {
        setPrompts(res.data.prompts);
      }
    } catch (err) {
      console.log('Prompts load err:', err);
    }
  }

  async function handleSendMessage(msgToSend) {
    const text = msgToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: text.trim(),
        preferred_language: currentLanguage,
      });

      if (res.data?.success) {
        const aiMsg = {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: res.data.reply,
          intent: res.data.intent,
          quickReplies: res.data.suggested_quick_replies,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Trigger voice audio synthesis if speech metadata returned
        if (res.data.speech_synthesis) {
          voiceService.speakText(res.data.speech_synthesis.text, res.data.speech_synthesis.language_code);
        }
      }
    } catch (err) {
      showError('Failed to get answer from AI Assistant.', 'Network Error');
    } finally {
      setSending(false);
    }
  }

  function handleVoiceInput() {
    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      showInfo('Listening for speech... Speak now in Kannada, Hindi, or English.', 'Microphone Active');
      voiceService.startListening((recognizedText) => {
        setIsRecording(false);
        setInputText(recognizedText);
        handleSendMessage(recognizedText);
      });
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title={t('ai_assistant')}
        subtitle="24/7 Context-aware Smart Agricultural Companion"
        onBack={onBack}
        rightAction={
          <View style={styles.langPills}>
            {['en', 'kn', 'hi'].map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.langBtn, currentLanguage === l && styles.activeLangBtn]}
                onPress={() => changeLanguage(l)}
              >
                <Text style={[styles.langText, currentLanguage === l && styles.activeLangText]}>
                  {l === 'en' ? 'EN' : l === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      {/* Suggested Quick Prompts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptsScroll}
      >
        {prompts.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.promptChip}
            onPress={() => handleSendMessage(p)}
          >
            <Text style={styles.promptChipText}>💡 {p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages Stream */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatStream}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={[styles.messageBubble, m.sender === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            <View style={styles.bubbleHeader}>
              <Text style={styles.senderName}>{m.sender === 'user' ? 'You (Farmer)' : 'FarmConnect AI 🤖'}</Text>
              <Text style={styles.msgTime}>{m.timestamp}</Text>
            </View>

            <Text style={styles.msgBody}>{m.text}</Text>

            {m.quickReplies && m.quickReplies.length > 0 && (
              <View style={styles.quickRepliesBox}>
                {m.quickReplies.map((qr, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.qrPill}
                    onPress={() => handleSendMessage(qr)}
                  >
                    <Text style={styles.qrText}>👉 {qr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {sending && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.thinkingText}>Consulting agricultural science models...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Bar with Voice Microphone */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.activeMicBtn]}
          onPress={handleVoiceInput}
        >
          <Text style={styles.micEmoji}>{isRecording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Ask in English, ಕನ್ನಡ, or हिन्दी..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
          placeholderTextColor="#9ca3af"
        />

        <Button
          title="Send"
          size="sm"
          variant="primary"
          disabled={!inputText.trim() || sending}
          onPress={() => handleSendMessage()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  langPills: {
    flexDirection: 'row',
    gap: 4,
  },
  langBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  activeLangBtn: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: 10,
    color: '#4b5563',
  },
  activeLangText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  promptsScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  promptChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  promptChipText: {
    fontSize: typography.sizes.xs,
    color: '#166534',
  },
  chatStream: {
    padding: spacing.sm,
    paddingBottom: spacing.lg,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#e0f2fe',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#6b7280',
  },
  msgTime: {
    fontSize: 9,
    color: '#9ca3af',
  },
  msgBody: {
    fontSize: typography.sizes.sm,
    color: '#111827',
    lineHeight: 20,
  },
  quickRepliesBox: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  qrPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  qrText: {
    fontSize: typography.sizes.xs,
    color: '#4b5563',
  },
  thinkingText: {
    fontSize: typography.sizes.xs,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    gap: spacing.xs,
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeMicBtn: {
    backgroundColor: '#ef4444',
  },
  micEmoji: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.sizes.sm,
    color: '#111827',
  },
});
