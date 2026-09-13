import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { PillGroup } from '../../components/PillGroup';
import { PrimaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

const READING_TYPES = [
  { label: 'Fasting', value: 'fasting' },
  { label: 'Post-meal', value: 'post_meal' },
  { label: 'Bedtime', value: 'bedtime' },
  { label: 'Random', value: 'random' },
];

// Mirrors backend app/crud/glucose.py TARGET_RANGES — used for instant feedback
// while typing, before the reading is actually saved.
const TARGET_RANGES: Record<string, [number, number, number]> = {
  fasting: [70, 99, 125],
  post_meal: [70, 179, 199],
  bedtime: [70, 140, 160],
  random: [70, 140, 199],
};

const TYPE_LABELS: Record<string, string> = {
  fasting: 'fasting',
  post_meal: 'post-meal',
  bedtime: 'bedtime',
  random: 'random',
};

function evaluateLocally(readingType: string, value: number) {
  const [low, normalMax, warningMax] = TARGET_RANGES[readingType];
  const typeLabel = TYPE_LABELS[readingType];
  if (value < low) return { label: `Low — below ${typeLabel} target`, severity: 'low' };
  if (value <= normalMax) return { label: `Within ${typeLabel} target`, severity: 'normal' };
  if (value <= warningMax) return { label: `Slightly above ${typeLabel} target`, severity: 'warning' };
  return { label: `High — above ${typeLabel} target`, severity: 'high' };
}

const SEVERITY_COLORS: Record<string, string> = {
  low: colors.blue,
  normal: colors.green,
  warning: colors.amber,
  high: colors.red,
};

export default function GlucoseLogScreen({ navigation }: any) {
  const [value, setValue] = useState('142');
  const [readingType, setReadingType] = useState('post_meal');
  const [mealReference, setMealReference] = useState('After Lunch');
  const [timeLabel, setTimeLabel] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const numericValue = parseFloat(value) || 0;

  const feedback = useMemo(
    () => (numericValue > 0 ? evaluateLocally(readingType, numericValue) : null),
    [readingType, numericValue]
  );

  const handleSave = async () => {
    if (!value || numericValue <= 0) {
      Alert.alert('Enter a value', 'Please enter your blood glucose reading.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/v1/glucose', {
        reading_type: readingType,
        value_mg_dl: numericValue,
        meal_reference: mealReference || null,
        notes: notes || null,
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
        <Text style={styles.title}>Log Glucose</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Blood Glucose Value</Text>
          <TextInput
            style={styles.valueInput}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            maxLength={3}
            textAlign="center"
          />
          <Text style={styles.unit}>mg/dL</Text>

          {feedback && (
            <View
              style={[
                styles.feedbackPill,
                { backgroundColor: `${SEVERITY_COLORS[feedback.severity]}22` },
              ]}
            >
              <Text style={[styles.feedbackText, { color: SEVERITY_COLORS[feedback.severity] }]}>
                ⓘ {feedback.label}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Reading Type</Text>
        <PillGroup options={READING_TYPES} value={readingType} onChange={setReadingType} />

        <Text style={styles.sectionLabel}>Meal Reference</Text>
        <TextInput
          style={styles.textInput}
          value={mealReference}
          onChangeText={setMealReference}
          placeholder="e.g. After Lunch"
        />

        <Text style={styles.sectionLabel}>Time</Text>
        <TextInput
          style={styles.textInput}
          value={timeLabel}
          onChangeText={setTimeLabel}
          placeholder="1:48 PM"
        />

        <Text style={styles.sectionLabel}>Notes</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How are you feeling?"
          multiline
        />

        <PrimaryButton
          label="Save Reading"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  valueCard: {
    backgroundColor: colors.tealSoft, borderRadius: radius.lg,
    alignItems: 'center', paddingVertical: spacing.lg, marginBottom: spacing.lg,
  },
  valueLabel: { ...typography.bodyBold, fontSize: 13, color: colors.tealPrimary, marginBottom: spacing.sm },
  valueInput: {
    ...typography.h1, fontSize: 48, color: colors.textPrimary, width: 140,
    padding: 0, marginBottom: 2,
  },
  unit: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  feedbackPill: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.pill },
  feedbackText: { ...typography.bodyBold, fontSize: 13 },
  sectionLabel: { ...typography.bodyBold, fontSize: 14, marginTop: spacing.lg, marginBottom: spacing.sm },
  textInput: {
    backgroundColor: colors.background, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12, ...typography.body,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
});
