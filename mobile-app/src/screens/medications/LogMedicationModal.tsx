import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';
import { logDose } from '../../api/endpoints';

// Present with: navigation.navigate('LogMedicationModal', { log, onDone })
// `log` is a MedicationLogOut from GET /api/v1/medications/today
export default function LogMedicationModal({ navigation, route }: any) {
  const { log, onDone } = route.params;
  const [actualTime, setActualTime] = useState(formatTime(log.scheduled_time));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const close = () => navigation.goBack();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await logDose(log.id, { actual_time_taken: to24Hour(actualTime), notes, skipped: false });
      onDone?.();
      close();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await logDose(log.id, { skipped: true, notes });
      onDone?.();
      close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={close}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.center}>
            <Text style={styles.pillEmoji}>💊</Text>
            <Text style={styles.title}>Log {log.medication_name} {log.dosage}</Text>
            <Text style={styles.subtitle}>{doseLabel(log.scheduled_time)} dose · {formatTime(log.scheduled_time)}</Text>
          </View>

          <Text style={styles.fieldLabel}>Actual Time Taken</Text>
          <TextInput style={styles.input} value={actualTime} onChangeText={setActualTime} placeholder="7:14 PM" />

          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note..."
            multiline
          />

          <View style={styles.buttonRow}>
            <SecondaryButton label="Skip Dose" onPress={handleSkip} loading={loading} style={{ flex: 1 }} />
            <PrimaryButton label="Confirm ✓" onPress={handleConfirm} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatTime(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${mm.toString().padStart(2, '0')} ${period}`;
}

function doseLabel(t: string) {
  const hh = parseInt(t.split(':')[0], 10);
  return hh < 12 ? 'Morning' : hh < 17 ? 'Afternoon' : 'Evening';
}

function to24Hour(label: string): string {
  const match = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return label;
  let [, hh, mm, period] = match;
  let hour = parseInt(hh, 10);
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${mm}`;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  center: { alignItems: 'center', marginBottom: spacing.lg },
  pillEmoji: { fontSize: 36, marginBottom: spacing.sm },
  title: { ...typography.h2, textAlign: 'center' },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 6, marginTop: spacing.sm },
  input: { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, ...typography.body },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
