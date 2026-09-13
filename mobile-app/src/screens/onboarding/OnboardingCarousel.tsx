import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { ProgressBar, StepDots } from '../../components/Progress';
import { colors, spacing, typography, radius } from '../../theme';

const SLIDES = [
  {
    emoji: '🔬',
    title: 'Know Your Risk',
    description: 'Answer a quick questionnaire and our AI checks your diabetes risk level in seconds.',
    cta: 'Next',
  },
  {
    emoji: '📋',
    title: 'Personalized Care Plan',
    description:
      'Your doctor uploads your prescription. We turn it into a day-by-day diabetes management plan — meals, meds, and exercise included.',
    cta: 'Next',
  },
  {
    emoji: '🏃',
    title: 'Build Healthy Habits',
    description:
      'Log glucose, meals, and exercise. Get smart reminders and celebrate every milestone on your diabetes journey.',
    cta: "Let's Begin 🎉",
  },
];

export default function OnboardingCarousel({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.navigate('RoleSelection');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>{slide.emoji}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.progressRow}>
        <ProgressBar
          progress={(index + 1) / SLIDES.length}
          trackColor={colors.border}
          fillColor={colors.tealPrimary}
        />
        <Text style={styles.progressLabel}>{index + 1} / {SLIDES.length}</Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label={slide.cta} onPress={handleNext} />
        <View style={{ height: spacing.md }} />
        <StepDots total={SLIDES.length} activeIndex={index} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  skip: { color: colors.tealPrimary, ...typography.bodyBold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: colors.tealSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  iconEmoji: { fontSize: 48 },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  progressLabel: { ...typography.caption, color: colors.textMuted },
  bottom: {},
});
