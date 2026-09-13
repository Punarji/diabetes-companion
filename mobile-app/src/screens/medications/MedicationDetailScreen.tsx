import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

const SEVERITY_COLORS: Record<string, string> = {
  common: colors.amber,
  uncommon: colors.textMuted,
  rare_seek_help: colors.red,
};

export default function MedicationDetailScreen({ navigation, route }: any) {
  const medicationId = route?.params?.medicationId;
  const [medication, setMedication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refillReminder, setRefillReminder] = useState(true);

  useEffect(() => {
    if (!medicationId) return;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/v1/medications/${medicationId}`);
        setMedication(data);
        setRefillReminder(data.refill_reminder_enabled);
      } catch {
        // leave medication null; screen shows empty state below
      } finally {
        setLoading(false);
      }
    })();
  }, [medicationId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={colors.tealPrimary} />
      </SafeAreaView>
    );
  }

  if (!medication) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Text style={styles.body}>Medication not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{medication.name} {medication.dosage}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.medName}>{medication.name}{'\n'}{medication.dosage}</Text>
            {medication.drug_class ? (
              <View style={styles.classPill}>
                <Text style={styles.classPillText}>{medication.drug_class}</Text>
              </View>
            ) : null}
          </View>
          {medication.description ? (
            <Text style={styles.description}>{medication.description}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Dosage Instructions</Text>
        <View style={styles.card}>
          <InstructionRow icon="💊" text={`${medication.dosage} — ${medication.frequency_label}`} />
          {medication.instructions ? <InstructionRow icon="🍽️" text={medication.instructions} /> : null}
          {medication.dose_times?.length ? (
            <InstructionRow icon="🕐" text={medication.dose_times.join(' & ')} />
          ) : null}
        </View>

        {medication.side_effects?.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Possible Side Effects</Text>
            <View style={styles.card}>
              {medication.side_effects.map((se: any, i: number) => (
                <View key={i} style={styles.sideEffectRow}>
                  <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[se.severity] }]} />
                  <Text style={styles.sideEffectLabel}>{se.label}</Text>
                  {se.severity === 'rare_seek_help' && (
                    <Text style={styles.seekHelp}>(rare, seek help)</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Refill Reminder</Text>
        <View style={[styles.card, styles.refillRow]}>
          <Text style={styles.body}>Remind me when I'm running low</Text>
          <Switch
            value={refillReminder}
            onValueChange={setRefillReminder}
            trackColor={{ true: colors.tealPrimary, false: colors.border }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InstructionRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.instructionRow}>
      <View style={styles.iconCircle}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 15 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { ...typography.h2, fontSize: 22, flex: 1 },
  classPill: { backgroundColor: colors.tealSoft, paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  classPillText: { ...typography.small, color: colors.tealPrimary, fontWeight: '700' },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  instructionText: { ...typography.body, fontSize: 14, flex: 1 },
  sideEffectRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sideEffectLabel: { ...typography.body, fontSize: 14 },
  seekHelp: { ...typography.small, color: colors.red, fontWeight: '700' },
  refillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { ...typography.body, fontSize: 14 },
});
