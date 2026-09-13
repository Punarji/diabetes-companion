import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { PillGroup } from '../../components/PillGroup';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

const EXERCISE_TYPES = [
  { label: 'Walking', value: 'walking' },
  { label: 'Cycling', value: 'cycling' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Strength', value: 'strength' },
];

const INTENSITY_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Vigorous', value: 'vigorous' },
];

// Mirrors the backend's MET_VALUES / INTENSITY_MULTIPLIER so the UI can preview
// calories instantly, before the authoritative server-calculated value comes back.
const MET_VALUES: Record<string, number> = { walking: 3.5, cycling: 6.0, swimming: 6.5, strength: 5.0, yoga: 2.5, custom: 4.0 };
const INTENSITY_MULT: Record<string, number> = { light: 0.8, moderate: 1.0, vigorous: 1.3 };
const ASSUMED_WEIGHT_KG = 70;

export default function LogExerciseScreen({ navigation, route }: any) {
  const [exerciseType, setExerciseType] = useState(route?.params?.exerciseType ?? 'walking');
  const [duration, setDuration] = useState('32');
  const [distance, setDistance] = useState('2.4');
  const [intensity, setIntensity] = useState('moderate');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const previewCalories = () => {
    const mins = parseFloat(duration) || 0;
    const met = MET_VALUES[exerciseType] ?? 4;
    const mult = INTENSITY_MULT[intensity] ?? 1;
    return Math.round(met * mult * ASSUMED_WEIGHT_KG * (mins / 60));
  };

  const handleSave = async () => {
    const mins = parseInt(duration, 10);
    if (!mins) {
      Alert.alert('Missing duration', 'Please enter how long you exercised.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/v1/activity/exercise', {
        exercise_type: exerciseType,
        duration_minutes: mins,
        distance_km: distance ? parseFloat(distance) : null,
        intensity,
        notes: notes || null,
        log_date: new Date().toISOString().slice(0, 10),
      });
      navigation.goBack();
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log Exercise</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Exercise Type</Text>
        <PillGroup options={EXERCISE_TYPES} value={exerciseType} onChange={setExerciseType} />

        <Text style={styles.label}>Duration</Text>
        <View style={styles.inputRow}>
          <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric" value={duration} onChangeText={setDuration} />
          <Text style={styles.unit}>minutes</Text>
        </View>

        <Text style={styles.label}>
          Distance <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={styles.inputRow}>
          <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric" value={distance} onChangeText={setDistance} />
          <Text style={styles.unit}>km</Text>
        </View>

        <Text style={styles.label}>Intensity</Text>
        <PillGroup options={INTENSITY_OPTIONS} value={intensity} onChange={setIntensity} />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="How are you feeling?"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <Text style={styles.label}>Calories Burned</Text>
        <View style={styles.caloriesRow}>
          <Text style={{ fontSize: 16 }}>🔥</Text>
          <Text style={styles.caloriesAuto}>Auto-calculated</Text>
          <Text style={styles.caloriesValue}>{previewCalories()} kcal</Text>
        </View>

        <View style={{ height: spacing.lg }} />
        <PrimaryButton label="Save Workout" onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  form: { padding: spacing.lg, gap: spacing.sm },
  label: { ...typography.bodyBold, fontSize: 14, marginTop: spacing.sm },
  optional: { color: colors.textMuted, fontWeight: '400' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md },
  input: { paddingVertical: 14, ...typography.h2, fontSize: 18 },
  unit: { ...typography.body, color: colors.textSecondary },
  notesInput: { backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.md, minHeight: 80, textAlignVertical: 'top', ...typography.body },
  caloriesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.md },
  caloriesAuto: { flex: 1, ...typography.body, color: colors.textSecondary },
  caloriesValue: { ...typography.bodyBold, fontSize: 16 },
});
