import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider'; // npm install @react-native-community/slider
import { PrimaryButton } from '../../components/Buttons';
import { ProgressBar } from '../../components/Progress';
import { PillGroup } from '../../components/PillGroup';
import { colors, spacing, typography, radius } from '../../theme';

const FAMILY_HISTORY_OPTIONS = [
  { label: 'Yes — Parent', value: 'yes_parent' },
  { label: 'Yes — Sibling', value: 'yes_sibling' },
  { label: 'No', value: 'no' },
];

const SMOKING_OPTIONS = [
  { label: 'Non-smoker', value: 'non_smoker' },
  { label: 'Ex-smoker', value: 'ex_smoker' },
  { label: 'Current', value: 'current' },
];

function bmiCategory(bmi: number): { label: string; color: string; bg: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: colors.blue, bg: colors.blueSoft };
  if (bmi < 25) return { label: 'Normal', color: colors.green, bg: colors.tealSoft };
  if (bmi < 30) return { label: 'Overweight', color: colors.amber, bg: colors.amberSoft };
  return { label: 'Obese', color: colors.red, bg: colors.redSoft };
}

// weight_kg / height_cm should already be known from the Health Profile step (Step 1).
// Passed in via route.params, with sensible fallbacks so this screen still renders standalone.
export default function RiskFactorsScreen({ navigation, route }: any) {
  const weightKg = route?.params?.weight_kg ?? 82;
  const heightCm = route?.params?.height_cm ?? 175;

  const [age, setAge] = useState(38);
  const [familyHistory, setFamilyHistory] = useState('yes_parent');
  const [smoking, setSmoking] = useState('ex_smoker');

  const bmi = useMemo(() => weightKg / ((heightCm / 100) ** 2), [weightKg, heightCm]);
  const category = bmiCategory(bmi);

  const handleAnalyze = () => {
    navigation.navigate('RiskQuestionnaire', {
      health_profile: {
        age,
        weight_kg: weightKg,
        height_cm: heightCm,
        family_history: familyHistory,
        smoking_status: smoking,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 3 — Risk Factors</Text>
        <Text style={styles.title}>Your Health Profile</Text>
        <ProgressBar progress={2 / 3} trackColor="rgba(255,255,255,0.3)" fillColor={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Age</Text>
        <Slider
          minimumValue={18}
          maximumValue={80}
          step={1}
          value={age}
          onValueChange={setAge}
          minimumTrackTintColor={colors.tealPrimary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.tealPrimary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderEdge}>18</Text>
          <Text style={styles.sliderValue}>{age} years</Text>
          <Text style={styles.sliderEdge}>80</Text>
        </View>

        <Text style={styles.label}>BMI (auto-calculated)</Text>
        <View style={styles.bmiCard}>
          <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          <View style={[styles.bmiBadge, { backgroundColor: category.bg }]}>
            <Text style={[styles.bmiBadgeText, { color: category.color }]}>{category.label}</Text>
          </View>
        </View>

        <Text style={styles.label}>Family History</Text>
        <PillGroup options={FAMILY_HISTORY_OPTIONS} value={familyHistory} onChange={setFamilyHistory} />

        <Text style={styles.label}>Smoking Status</Text>
        <PillGroup options={SMOKING_OPTIONS} value={smoking} onChange={setSmoking} />

        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Analyze My Risk  →" onPress={handleAnalyze} />
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
  label: { ...typography.bodyBold, fontSize: 14 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm },
  sliderEdge: { ...typography.small, color: colors.textMuted },
  sliderValue: { ...typography.bodyBold, color: colors.tealPrimary },
  bmiCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.tealSoft, borderRadius: radius.md, padding: spacing.md,
  },
  bmiValue: { ...typography.h1, color: colors.tealPrimary, fontSize: 28 },
  bmiBadge: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  bmiBadgeText: { ...typography.bodyBold, fontSize: 13 },
});
