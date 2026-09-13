import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { ProgressBar } from '../../components/Progress';
import { colors, spacing, typography, radius } from '../../theme';
import { submitNotificationPreferences } from '../../api/endpoints';

type PrefKey = 'medication_reminders' | 'glucose_reminders' | 'meal_reminders' | 'activity_reminders';

const ROWS: { key: PrefKey; emoji: string; bg: string; title: string; subtitle: string }[] = [
  { key: 'medication_reminders', emoji: '💊', bg: colors.blueSoft, title: 'Medication Reminders', subtitle: 'Get reminded to take your meds on time' },
  { key: 'glucose_reminders', emoji: '🩸', bg: colors.redSoft, title: 'Glucose Reminders', subtitle: 'Track your blood sugar levels regularly' },
  { key: 'meal_reminders', emoji: '🍽️', bg: colors.amberSoft, title: 'Meal Reminders', subtitle: 'Stay on track with your meal plan' },
  { key: 'activity_reminders', emoji: '📈', bg: colors.tealSoft, title: 'Activity Reminders', subtitle: 'Remember to stay active throughout the day' },
];

export default function NotificationsStep3Screen({ navigation }: any) {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    medication_reminders: true,
    glucose_reminders: true,
    meal_reminders: true,
    activity_reminders: false,
  });
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await submitNotificationPreferences(prefs);
      navigation.reset({ index: 0, routes: [{ name: 'RiskFactors' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Step 3 of 3 — Notifications</Text>
        <ProgressBar progress={1} trackColor="rgba(255,255,255,0.3)" fillColor={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.intro}>Choose which reminders you want to receive.</Text>

        {ROWS.map((row) => (
          <View key={row.key} style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: row.bg }]}>
              <Text style={{ fontSize: 18 }}>{row.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
            </View>
            <Switch
              value={prefs[row.key]}
              onValueChange={(v) => setPrefs((p) => ({ ...p, [row.key]: v }))}
              trackColor={{ true: colors.tealPrimary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        ))}

        <View style={{ height: spacing.lg }} />
        <PrimaryButton label="Finish Setup 🎉" onPress={handleFinish} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { backgroundColor: colors.tealPrimary, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  title: { color: colors.white, ...typography.h2 },
  form: { padding: spacing.lg, gap: spacing.md },
  intro: { ...typography.body, color: colors.textSecondary },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md,
  },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { ...typography.bodyBold, fontSize: 14 },
  rowSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
