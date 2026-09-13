import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { fetchPatientReport, updateDoctorNotes } from '../../api/endpoints';

const STATUS_COLOR: Record<string, string> = {
  green: colors.green,
  amber: colors.amber,
  red: colors.red,
};

export default function PatientReportScreen({ route, navigation }: any) {
  const { patientId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchPatientReport(patientId);
    setReport(data);
    setNotes(data.doctor_notes ?? '');
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateDoctorNotes(patientId, notes);
      Alert.alert('Saved', 'Doctor notes updated.');
    } catch (err: any) {
      Alert.alert('Could not save notes', err?.response?.data?.detail ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!report) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.patientName}>{report.patient_name}</Text>
          <Text style={styles.reportMonth}>{report.report_month_label} Report</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.statsRow}>
          <StatBox value={report.hba1c_latest != null ? `${report.hba1c_latest}%` : '--'} label="HbA1c" />
          <StatBox value={`${report.medication_adherence_percent}%`} label="Med Adherence" />
          <StatBox value={`${report.time_in_range_percent}%`} label="Time in Range" />
        </View>

        <Text style={styles.sectionTitle}>Glucose Patterns</Text>
        {report.glucose_patterns.map((pattern: any, idx: number) => (
          <View key={idx} style={styles.patternRow}>
            <Text style={styles.patternLabel}>{pattern.label}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.patternValue}>{pattern.value}</Text>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[pattern.status_color] ?? colors.tealPrimary }]}>
                <Text style={styles.statusPillText}>{pattern.status_label}</Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Doctor Notes</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={5}
          placeholder="Add clinical notes for this patient's care plan..."
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotes} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Update Plan'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.prescriptionButton}
          onPress={() => navigation.navigate('NewPrescription', { patientId, patientName: report.patient_name })}
        >
          <Text style={styles.prescriptionButtonText}>+ New Prescription</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.white },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20 },
  patientName: { ...typography.h2, fontSize: 18 },
  reportMonth: { ...typography.small, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statBox: { flex: 1, backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  statValue: { ...typography.h2, fontSize: 18, color: colors.tealPrimary },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.bodyBold, fontSize: 16, marginBottom: spacing.sm, marginTop: spacing.md },
  patternRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm,
  },
  patternLabel: { ...typography.body },
  patternValue: { ...typography.bodyBold, fontSize: 14 },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, marginTop: 4 },
  statusPillText: { color: colors.white, ...typography.small, fontWeight: '700' },
  notesInput: {
    backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md,
    minHeight: 100, ...typography.body, marginBottom: spacing.sm,
  },
  saveButton: { backgroundColor: colors.tealPrimary, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  saveButtonText: { color: colors.white, ...typography.bodyBold },
  prescriptionButton: {
    marginTop: spacing.lg, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.tealPrimary,
  },
  prescriptionButtonText: { color: colors.tealPrimary, ...typography.bodyBold },
});
