import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

type SectionKey = 'medication' | 'glucose' | 'meal';

const SECTIONS: { key: SectionKey; title: string; icon: string }[] = [
  { key: 'medication', title: 'Medication Reminders', icon: '💊' },
  { key: 'glucose', title: 'Glucose Reminders', icon: '🩸' },
  { key: 'meal', title: 'Meal & Activity', icon: '🍽️' },
];

const SWITCH_ITEMS: Record<SectionKey, { key: string; icon: string; label: string; subtitle: string; locked?: boolean }[]> = {
  medication: [
    { key: 'morning_dose_reminder', icon: '🌅', label: 'Morning Dose', subtitle: '8:00 AM daily' },
    { key: 'evening_dose_reminder', icon: '🌙', label: 'Evening Dose', subtitle: '8:00 PM daily' },
    { key: 'missed_dose_alert', icon: '🔔', label: 'Missed Dose Alert', subtitle: 'Alert after 30 min' },
  ],
  glucose: [
    { key: 'fasting_glucose_reminder', icon: '☀️', label: 'Fasting Reminder', subtitle: 'Before breakfast' },
    { key: 'post_meal_glucose_reminder', icon: '⏰', label: 'Post-meal Auto-reminder', subtitle: '2 hours after meals' },
    { key: 'critical_glucose_alert', icon: '🚨', label: 'Critical Glucose Alert', subtitle: 'Cannot be disabled', locked: true },
  ],
  meal: [
    { key: 'meal_log_reminder', icon: '📝', label: 'Meal Log Reminder', subtitle: 'After each meal' },
    { key: 'exercise_nudge', icon: '🏃', label: 'Exercise Nudge', subtitle: 'Afternoon suggestion' },
  ],
};

export default function ReminderSettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/api/v1/reminders');
        setSettings(data);
      } catch {
        // keep defaults (all switches will show as off until this succeeds)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await apiClient.patch('/api/v1/reminders', { [key]: value });
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reminder Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ✨ AI adapts reminder timing based on your response patterns automatically.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.key} style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{section.icon} {section.title}</Text>
            <View style={styles.card}>
              {SWITCH_ITEMS[section.key].map((item, i) => (
                <View
                  key={item.key}
                  style={[
                    styles.row,
                    i < SWITCH_ITEMS[section.key].length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={styles.iconBox}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Switch
                    value={item.locked ? true : !!settings[item.key]}
                    onValueChange={(v) => !item.locked && handleToggle(item.key, v)}
                    disabled={item.locked}
                    trackColor={{ true: colors.tealPrimary, false: colors.border }}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  banner: { backgroundColor: colors.tealSoft, borderRadius: radius.lg, padding: spacing.md },
  bannerText: { ...typography.body, fontSize: 13, color: colors.tealPrimary, lineHeight: 18 },
  sectionBlock: { gap: spacing.sm },
  sectionTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textSecondary },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.background },
  iconBox: {
    width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.tealSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { ...typography.bodyBold, fontSize: 14 },
  rowSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
