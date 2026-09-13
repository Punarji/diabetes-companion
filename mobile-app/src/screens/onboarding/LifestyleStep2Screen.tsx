import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { ProgressBar } from '../../components/Progress';
import { PillGroup } from '../../components/PillGroup';
import { colors, spacing, typography } from '../../theme';
import { submitLifestyle } from '../../api/endpoints';

const SMOKING_OPTIONS = [
  { label: 'Non-smoker', value: 'non_smoker' },
  { label: 'Ex-smoker', value: 'ex_smoker' },
  { label: 'Current', value: 'current' },
];

const ALCOHOL_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Occasionally', value: 'occasionally' },
  { label: 'Regularly', value: 'regularly' },
];

const DIET_OPTIONS = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Non-Vegetarian', value: 'non_vegetarian' },
  { label: 'Vegan', value: 'vegan' },
];

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'english' },
  { label: 'Sinhala', value: 'sinhala' },
  { label: 'Tamil', value: 'tamil' },
];

export default function LifestyleStep2Screen({ navigation }: any) {
  const [smoking, setSmoking] = useState('ex_smoker');
  const [alcohol, setAlcohol] = useState('none');
  const [diet, setDiet] = useState('non_vegetarian');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await submitLifestyle({
        smoking_status: smoking,
        alcohol_use: alcohol,
        dietary_habit: diet,
        preferred_language: language,
      });
      navigation.navigate('NotificationsStep3');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 3 — Health Profile</Text>
        <Text style={styles.title}>Lifestyle & Preferences</Text>
        <ProgressBar progress={2 / 3} trackColor="rgba(255,255,255,0.3)" fillColor={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Smoking Status</Text>
        <PillGroup options={SMOKING_OPTIONS} value={smoking} onChange={setSmoking} />

        <Text style={styles.label}>Alcohol Use</Text>
        <PillGroup options={ALCOHOL_OPTIONS} value={alcohol} onChange={setAlcohol} />

        <Text style={styles.label}>Dietary Habits</Text>
        <PillGroup options={DIET_OPTIONS} value={diet} onChange={setDiet} />

        <Text style={styles.label}>Preferred Language</Text>
        <PillGroup options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />

        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Continue  →" onPress={handleContinue} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { backgroundColor: colors.tealPrimary, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  stepLabel: { color: 'rgba(255,255,255,0.85)', ...typography.caption },
  title: { color: colors.white, ...typography.h1, fontSize: 24 },
  form: { padding: spacing.lg, gap: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: -spacing.xs },
});
