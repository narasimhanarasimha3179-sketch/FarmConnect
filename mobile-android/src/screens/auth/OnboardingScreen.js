import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../../services/AppContext';
import CustomButton from '../../components/CustomButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const CONTENT = {
  en: {
    slides: [
      {
        icon: '🔬',
        title: 'AI Crop Disease Scanner',
        description: 'Capture foliage photos directly to detect diseases and receive instant organic and chemical treatment advice.',
      },
      {
        icon: '📊',
        title: 'APMC Mandi Intelligence',
        description: 'Access live regional APMC price trends and track modal rates across grain and produce markets.',
      },
      {
        icon: '🤝',
        title: 'Direct Farmer Marketplace',
        description: 'List your harvests with zero middleman commissions and receive live competitive bids from certified buyers.',
      },
    ],
    next: 'Continue',
    start: 'Get Started',
    skip: 'Skip to Login',
  },
  kn: {
    slides: [
      {
        icon: '🔬',
        title: 'AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಯಂತ್ರ',
        description: 'ಎಲೆಗಳ ಚಿತ್ರವನ್ನು ತೆಗೆಯುವ ಮೂಲಕ ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ ಹಾಗೂ ತಕ್ಷಣವೇ ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಪರಿಹಾರ ಪಡೆಯಿರಿ.',
      },
      {
        icon: '📊',
        title: 'APMC ಮಾರುಕಟ್ಟೆ ದರಗಳು',
        description: 'ನೇರ ಎಪಿಎಂಸಿ ದರಗಳು ಮತ್ತು ವಿವಿಧ ಕೃಷಿ ಮಾರುಕಟ್ಟೆಗಳ ಸರಾಸರಿ ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.',
      },
      {
        icon: '🤝',
        title: 'ರೈತರ ನೇರ ಮಾರುಕಟ್ಟೆ',
        description: 'ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ ಮತ್ತು ಖರೀದಿದಾರರಿಂದ ಸ್ಪರ್ಧಾತ್ಮಕ ದರಗಳನ್ನು ಪಡೆಯಿರಿ.',
      },
    ],
    next: 'ಮುಂದುವರಿಯಿರಿ',
    start: 'ಪ್ರಾರಂಭಿಸಿ',
    skip: 'ಲಾಗಿನ್‌ಗೆ ತೆರಳಿ',
  },
  hi: {
    slides: [
      {
        icon: '🔬',
        title: 'AI फसल रोग विश्लेषक',
        description: 'पत्तियों की फोटो खींचकर बीमारियों की पहचान करें और तुरंत जैविक और रासायनिक उपचार प्राप्त करें।',
      },
      {
        icon: '📊',
        title: 'APMC मंडी भाव',
        description: 'लाइव एपीएमसी मंडी दरों की जानकारी प्राप्त करें और प्रमुख जिंसों के भाव ट्रैक करें।',
      },
      {
        icon: '🤝',
        title: 'सीधा किसान बाज़ार',
        description: 'बिना बिचौलियों के अपनी फसल सूचीबद्ध करें और सत्यापित खरीदारों से सर्वोत्तम बोलियां प्राप्त करें।',
      },
    ],
    next: 'आगे बढ़ें',
    start: 'शुरू करें',
    skip: 'सीधे लॉगिन करें',
  },
};

export default function OnboardingScreen() {
  const { setCurrentScreen } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const localizedData = CONTENT[selectedLanguage] || CONTENT.en;
  const currentItem = localizedData.slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < localizedData.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentScreen('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Selector Header */}
      <View style={styles.langContainer}>
        <TouchableOpacity
          style={[styles.langChip, selectedLanguage === 'en' && styles.langChipActive]}
          onPress={() => setSelectedLanguage('en')}
          activeOpacity={0.7}
        >
          <Text style={[styles.langText, selectedLanguage === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langChip, selectedLanguage === 'kn' && styles.langChipActive]}
          onPress={() => setSelectedLanguage('kn')}
          activeOpacity={0.7}
        >
          <Text style={[styles.langText, selectedLanguage === 'kn' && styles.langTextActive]}>ಕನ್ನಡ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langChip, selectedLanguage === 'hi' && styles.langChipActive]}
          onPress={() => setSelectedLanguage('hi')}
          activeOpacity={0.7}
        >
          <Text style={[styles.langText, selectedLanguage === 'hi' && styles.langTextActive]}>हिंदी</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.slideCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.slideIcon}>{currentItem.icon}</Text>
          </View>
          <Text style={styles.slideTitle}>{currentItem.title}</Text>
          <Text style={styles.slideDesc}>{currentItem.description}</Text>

          {/* Indicator Dots */}
          <View style={styles.indicatorContainer}>
            {localizedData.slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <CustomButton
          title={currentSlide === localizedData.slides.length - 1 ? localizedData.start : localizedData.next}
          onPress={handleNext}
        />
        {currentSlide < localizedData.slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => setCurrentScreen('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>{localizedData.skip}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  langContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  langTextActive: {
    color: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  slideIcon: {
    fontSize: 48,
  },
  slideTitle: {
    ...TYPOGRAPHY.h1,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slideDesc: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primaryLight,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.border,
  },
  footer: {
    width: '100%',
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});