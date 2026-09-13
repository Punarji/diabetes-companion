import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { colors, spacing, typography, radius } from '../../theme';
import { fetchDashboard } from '../../api/endpoints';

const QUICK_LOG = [
  { key: 'glucose', label: 'Glucose', emoji: '🩸' },
  { key: 'medication', label: 'Medication', emoji: '💊' },
  { key: 'meal', label: 'Meal', emoji: '🍽️' },
  { key: 'activity', label: 'Activity', emoji: '🏃' },
];

const TABS = [
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'meds', label: 'Meds', emoji: '💊' },
  { key: 'meals', label: 'Meals', emoji: '🍽️' },
  { key: 'glucose', label: 'Glucose', emoji: '🩸' },
  { key: 'progress', label: 'Progress', emoji: '📈' },
];

export default function HomeDashboardScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await fetchDashboard();
    setData(result);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleQuickLog = (key: string) => {
    if (key === 'glucose') navigation.navigate('GlucoseLog');
    if (key === 'medication') navigation.navigate('LogMedicationModal', { log: null, onDone: load });
    if (key === 'meal') navigation.navigate('LogMeal');
    if (key === 'activity') navigation.navigate('LogExercise');
  };

  const handleTabPress = (key: string) => {
    if (key === 'home') return;
    if (key === 'meds') navigation.navigate('Medications');
    if (key === 'meals') navigation.navigate('Meals');
    if (key === 'glucose') navigation.navigate('GlucoseDashboard');
    if (key === 'progress') navigation.navigate('Progress');
  };

  if (!data) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>{data.greeting} ☀️</Text>
              <Text style={styles.name}>{data.full_name}</Text>
            </View>
            <TouchableOpacity style={styles.bellButton}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {data.unread_notifications > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <StatBox
              value={data.fasting_glucose != null ? `${data.fasting_glucose}` : '--'}
              unit={data.fasting_glucose_unit}
              label="Fasting Glucose"
            />
            <StatBox
              value={data.hba1c_last_result != null ? `${data.hba1c_last_result}` : '--'}
              unit="%"
              label="HbA1c Last Result"
            />
            <StatBox value={`${data.steps_today}`} label="Steps Today" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Health Score</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{data.health_score.score}</Text>
            </View>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <MetricBar label="Medication" percent={data.health_score.medication_percent} color={colors.tealPrimary} />
              <MetricBar label="Meals" percent={data.health_score.meals_percent} color={colors.amber} />
            </View>
          </View>
          <Text style={styles.tasksRemaining}>{data.health_score.tasks_remaining} tasks remaining</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Log</Text>
        <View style={styles.quickLogRow}>
          {QUICK_LOG.map((item) => (
            <TouchableOpacity key={item.key} style={styles.quickLogItem} onPress={() => handleQuickLog(item.key)}>
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <Text style={styles.quickLogLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Today's Reminders</Text>
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          {data.todays_reminders.map((reminder: any) => (
            <View key={reminder.id} style={styles.reminderRow}>
              <View style={[styles.reminderIcon, { backgroundColor: iconBg(reminder.icon) }]}>
                <Text style={{ fontSize: 16 }}>{iconEmoji(reminder.icon)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderSubtitle}>{reminder.time_label}{reminder.subtitle ? ` · ${reminder.subtitle}` : ''}</Text>
              </View>
              <View style={[styles.checkCircle, reminder.is_completed && styles.checkCircleDone]}>
                {reminder.is_completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </View>
          ))}
        </View>

        {data.next_appointment && (
          <View style={styles.appointmentCard}>
            <View>
              <Text style={styles.appointmentLabel}>Next Appointment</Text>
              <Text style={styles.appointmentName}>{data.next_appointment.physician_name}</Text>
              <Text style={styles.appointmentTime}>
                {new Date(data.next_appointment.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {' · '}
                {new Date(data.next_appointment.scheduled_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNav tabs={TABS} activeKey="home" onSelect={handleTabPress} />
    </SafeAreaView>
  );
}

function StatBox({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>
        {value} {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MetricBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <View>
      <View style={styles.metricLabelRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricPercent}>{percent}%</Text>
      </View>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function iconEmoji(icon: string) {
  const map: Record<string, string> = { medication: '💊', meal: '🍽️', glucose: '🩸' };
  return map[icon] ?? '🔔';
}
function iconBg(icon: string) {
  const map: Record<string, string> = { medication: colors.blueSoft, meal: colors.amberSoft, glucose: colors.redSoft };
  return map[icon] ?? colors.tealSoft;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.navyDark, padding: spacing.lg, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.7)', ...typography.caption },
  name: { color: colors.white, ...typography.h1, fontSize: 24 },
  bellButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.sm, padding: spacing.sm },
  statValue: { color: colors.white, ...typography.h2, fontSize: 18 },
  statUnit: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  statLabel: { color: 'rgba(255,255,255,0.6)', ...typography.small, marginTop: 2 },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginHorizontal: spacing.lg, marginTop: -spacing.lg, elevation: 2 },
  cardTitle: { ...typography.bodyBold, marginBottom: spacing.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scoreCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: colors.tealPrimary, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { ...typography.h1, fontSize: 22, color: colors.tealPrimary },
  metricLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { ...typography.caption, color: colors.textSecondary },
  metricPercent: { ...typography.caption, color: colors.textSecondary },
  metricTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: 2, overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: 3 },
  tasksRemaining: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  sectionTitle: { ...typography.bodyBold, fontSize: 16, marginTop: spacing.lg, marginBottom: spacing.sm, marginHorizontal: spacing.lg },
  quickLogRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  quickLogItem: { flex: 1, alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, paddingVertical: spacing.md, gap: 4 },
  quickLogLabel: { ...typography.small, color: colors.textSecondary },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md },
  reminderIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { ...typography.bodyBold, fontSize: 14 },
  reminderSubtitle: { ...typography.small, color: colors.textSecondary },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: colors.green, borderColor: colors.green },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: '700' },
  appointmentCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.tealPrimary, borderRadius: radius.md, padding: spacing.md,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
  },
  appointmentLabel: { color: 'rgba(255,255,255,0.75)', ...typography.small },
  appointmentName: { color: colors.white, ...typography.bodyBold, fontSize: 15 },
  appointmentTime: { color: 'rgba(255,255,255,0.85)', ...typography.small },
  viewButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  viewButtonText: { color: colors.white, ...typography.bodyBold, fontSize: 13 },
});
