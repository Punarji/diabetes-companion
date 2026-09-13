import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { ProgressBar } from '../../components/Progress';
import { PillGroup } from '../../components/PillGroup';
import { colors, spacing, typography, radius } from '../../theme';
import { submitHealthProfile } from '../../api/endpoints';

const DIABETES_STATUS_OPTIONS = [
  { label: 'Not Diagnosed', value: 'not_diagnosed' },
  { label: 'Prediabetes', value: 'prediabetes' },
  { label: 'Type 2 DM', value: 'type_2_dm' },
];

const ACTIVITY_OPTIONS = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Active', value: 'active' },
];

const FAMILY_HISTORY_OPTIONS = [
  { label: 'Yes', value: 'yes_parent' },
  { label: 'No', value: 'no' },
  { label: 'Unsure', value: 'unsure' },
];

function bmiCategory(bmi: number): { label: string; color: string; bg: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: colors.blue, bg: colors.blueSoft };
  if (bmi < 25) return { label: 'Normal', color: colors.green, bg: colors.tealSoft };
  if (bmi < 30) return { label: 'Overweight', color: colors.amber, bg: colors.amberSoft };
  return { label: 'Obese', color: colors.red, bg: colors.redSoft };
}

export default function HealthProfileStep1Screen({ navigation }: any) {
  const [diabetesStatus, setDiabetesStatus] = useState('not_diagnosed');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('light');
  const [familyHistory, setFamilyHistory] = useState('yes_parent');
  const [loading, setLoading] = useState(false);

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return null;
    return w / ((h / 100) ** 2);
  }, [weight, height]);

  const handleContinue = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) {
      Alert.alert('Missing info', 'Please enter your weight and height.');
      return;
    }
    setLoading(true);
    try {
      await submitHealthProfile({
        diabetes_status: diabetesStatus,
        weight_kg: w,
        height_cm: h,
        physical_activity_level: activity,
        family_history_diabetes: familyHistory,
      });
      navigation.navigate('LifestyleStep2');
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const category = bmi ? bmiCategory(bmi) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 3 — Health Profile</Text>
        <Text style={styles.title}>Tell us about yourself</Text>
        <ProgressBar progress={1 / 3} trackColor="rgba(255,255,255,0.3)" fillColor={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Diabetes Status</Text>
        <PillGroup options={DIABETES_STATUS_OPTIONS} value={diabetesStatus} onChange={setDiabetesStatus} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} placeholder="82" keyboardType="numeric" value={weight} onChangeText={setWeight} />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput style={styles.input} placeholder="175" keyboardType="numeric" value={height} onChangeText={setHeight} />
          </View>
        </View>

        {bmi && category && (
          <View style={styles.bmiCard}>
            <View>
              <Text style={styles.bmiLabel}>Calculated BMI</Text>
              <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
            </View>
            <View style={[styles.bmiBadge, { backgroundColor: category.bg }]}>
              <Text style={[styles.bmiBadgeText, { color: category.color }]}>{category.label}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Physical Activity</Text>
        <PillGroup options={ACTIVITY_OPTIONS} value={activity} onChange={setActivity} />

        <Text style={styles.label}>Family History of Diabetes</Text>
        <PillGroup options={FAMILY_HISTORY_OPTIONS} value={familyHistory} onChange={setFamilyHistory} />

        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Continue" onPress={handleContinue} loading={loading} />
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
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1, gap: 6 },
  input: { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, ...typography.body },
  bmiCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.tealSoft, borderRadius: radius.md, padding: spacing.md,
  },
  bmiLabel: { ...typography.caption, color: colors.textSecondary },
  bmiValue: { ...typography.h1, color: colors.tealPrimary, fontSize: 28 },
  bmiBadge: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  bmiBadgeText: { ...typography.bodyBold, fontSize: 13 },
});
