import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { colors, spacing, typography, radius } from '../../theme';
import { fetchTodayMedications, logDose } from '../../api/endpoints';

const TABS_TOP = ['Today', 'Schedule', 'History'];
const NAV_TABS = [
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'meds', label: 'Meds', emoji: '💊' },
  { key: 'activity', label: 'Activity', emoji: '📈' },
  { key: 'profile', label: 'Profile', emoji: '👤' },
];

export default function MedicationsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('Today');
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    const result = await fetchTodayMedications();
    setData(result);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkTaken = async (logId: string) => {
    await logDose(logId, { skipped: false });
    load();
  };

  const openLogModal = (log: any) => {
    navigation.navigate('LogMedicationModal', { log, onDone: load });
  };

  if (!data) return <SafeAreaView style={styles.safe} />;

  // group logs by medication
  const medsWithLogs = data.medications.map((med: any) => ({
    ...med,
    logs: data.logs.filter((l: any) => l.medication_id === med.id),
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text style={styles.title}>Medications 💊</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={{ fontSize: 18, color: colors.tealPrimary }}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsRow}>
          {TABS_TOP.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.adherenceCard}>
          <View style={styles.adherenceRing}>
            <Text style={styles.adherencePercent}>{data.adherence_percent}%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adherenceLabel}>This Week's Adherence</Text>
            <Text style={styles.adherenceStatus}>On Track 👍</Text>
            <Text style={styles.adherenceSub}>{data.doses_taken} of {data.doses_total} doses taken</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Medications</Text>

        {medsWithLogs.map((med: any) => (
          <View key={med.id} style={styles.medCard}>
            <View style={styles.medHeaderRow}>
              <View style={styles.medIconBox}>
                <Text style={{ fontSize: 18 }}>{med.icon === 'syringe' ? '💉' : '💊'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{med.name} {med.dosage}</Text>
                <Text style={styles.medFrequency}>{med.frequency_label} · {med.instructions}</Text>
              </View>
            </View>

            <View style={styles.doseRow}>
              {med.logs.map((log: any) => (
                <TouchableOpacity
                  key={log.id}
                  style={[styles.doseBox, log.status === 'taken' && styles.doseBoxTaken]}
                  onPress={() => (log.status === 'taken' ? undefined : openLogModal(log))}
                >
                  <Text style={[styles.doseTime, log.status === 'taken' && styles.doseTimeTaken]}>
                    {formatTime(log.scheduled_time)}
                  </Text>
                  {log.status === 'taken' ? (
                    <View style={styles.doseCheck}>
                      <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleMarkTaken(log.id)} style={styles.markTakenButton}>
                      <Text style={styles.markTakenText}>Mark Taken</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNav tabs={NAV_TABS} activeKey="meds" onSelect={(k) => k === 'home' && navigation.navigate('HomeDashboard')} />
    </SafeAreaView>
  );
}

function formatTime(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${mm.toString().padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  title: { ...typography.h1, fontSize: 22 },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  tabsRow: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: radius.pill, marginHorizontal: spacing.lg, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.white },
  tabLabel: { ...typography.caption, color: colors.textSecondary },
  tabLabelActive: { color: colors.textPrimary, fontWeight: '700' },
  adherenceCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.navyDark, borderRadius: radius.md, padding: spacing.md,
    marginHorizontal: spacing.lg, marginTop: spacing.md,
  },
  adherenceRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: colors.tealAccent, alignItems: 'center', justifyContent: 'center' },
  adherencePercent: { color: colors.white, ...typography.bodyBold, fontSize: 16 },
  adherenceLabel: { color: 'rgba(255,255,255,0.6)', ...typography.small },
  adherenceStatus: { color: colors.white, ...typography.bodyBold, fontSize: 15 },
  adherenceSub: { color: 'rgba(255,255,255,0.6)', ...typography.small },
  sectionTitle: { ...typography.bodyBold, fontSize: 16, marginTop: spacing.lg, marginBottom: spacing.sm, marginHorizontal: spacing.lg },
  medCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  medHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  medIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  medName: { ...typography.bodyBold, fontSize: 15 },
  medFrequency: { ...typography.small, color: colors.textSecondary },
  doseRow: { flexDirection: 'row', gap: spacing.sm },
  doseBox: { flex: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', padding: spacing.sm, alignItems: 'center', gap: 6 },
  doseBoxTaken: { backgroundColor: colors.tealSoft, borderStyle: 'solid', borderColor: colors.tealSoft },
  doseTime: { ...typography.caption, color: colors.textSecondary },
  doseTimeTaken: { color: colors.tealDark, fontWeight: '700' },
  doseCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  markTakenButton: { backgroundColor: colors.purple, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill },
  markTakenText: { color: colors.white, ...typography.small, fontWeight: '700' },
});
