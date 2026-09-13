import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { colors, spacing, typography, radius } from '../../theme';
import { fetchCarePlan, toggleCarePlanTask } from '../../api/endpoints';

const NAV_TABS = [
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'plan', label: 'Plan', emoji: '📋' },
  { key: 'meals', label: 'Meals', emoji: '🍽️' },
  { key: 'glucose', label: 'Glucose', emoji: '🩸' },
  { key: 'progress', label: 'Progress', emoji: '📈' },
];

const TASK_ICON: Record<string, { emoji: string; bg: string }> = {
  glucose: { emoji: '🩸', bg: colors.redSoft },
  medication: { emoji: '💊', bg: colors.blueSoft },
  meal: { emoji: '🍽️', bg: colors.amberSoft },
  activity: { emoji: '📈', bg: colors.tealSoft },
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function CarePlanScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [plan, setPlan] = useState<any>(null);

  const load = useCallback(async (forDate: string) => {
    const result = await fetchCarePlan(forDate);
    setPlan(result);
  }, []);

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate, load]);

  const handleToggle = async (taskId: string, isCompleted: boolean) => {
    await toggleCarePlanTask(taskId, selectedDate, !isCompleted);
    load(selectedDate);
  };

  if (!plan) return <SafeAreaView style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text style={styles.title}>My Care Plan</Text>
          <View style={styles.clipboardButton}>
            <Text style={{ fontSize: 16 }}>📋</Text>
          </View>
        </View>

        <View style={styles.weekStrip}>
          {plan.week_strip.map((day: any) => {
            const isSelected = day.date === selectedDate;
            return (
              <TouchableOpacity key={day.date} style={styles.dayColumn} onPress={() => setSelectedDate(day.date)}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View style={[styles.dayCircle, dayCircleStyle(day.status, isSelected)]}>
                  <Text style={[styles.dayNumber, dayNumberStyle(day.status, isSelected)]}>
                    {day.status === 'complete' ? '✓' : day.status === 'missed' ? '✕' : day.day_number}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Week {plan.week_number} of {plan.duration_weeks}</Text>
          <Text style={styles.metaDivider}>|</Text>
          <Text style={styles.metaText}>Streak: 🔥 {plan.streak_days} days</Text>
        </View>

        <TaskSection title="Morning Plan" tasks={plan.morning_tasks} onToggle={handleToggle} />
        <TaskSection title="Afternoon Plan" tasks={plan.afternoon_tasks} onToggle={handleToggle} />
        <TaskSection title="Evening Plan" tasks={plan.evening_tasks} onToggle={handleToggle} />
      </ScrollView>

      <BottomNav tabs={NAV_TABS} activeKey="plan" onSelect={(k) => k === 'home' && navigation.navigate('HomeDashboard')} />
    </SafeAreaView>
  );
}

function TaskSection({ title, tasks, onToggle }: { title: string; tasks: any[]; onToggle: (id: string, done: boolean) => void }) {
  if (!tasks.length) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        {tasks.map((task) => {
          const iconMeta = TASK_ICON[task.task_type] ?? TASK_ICON.medication;
          return (
            <View key={task.id} style={styles.taskRow}>
              <View style={[styles.taskIcon, { backgroundColor: iconMeta.bg }]}>
                <Text style={{ fontSize: 16 }}>{iconMeta.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDetail}>{formatTime(task.scheduled_time)}{task.detail ? ` · ${task.detail}` : ''}</Text>
              </View>
              <TouchableOpacity
                style={[styles.checkCircle, task.is_completed && styles.checkCircleDone]}
                onPress={() => onToggle(task.id, task.is_completed)}
              >
                {task.is_completed && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatTime(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${mm.toString().padStart(2, '0')} ${period}`;
}

function dayCircleStyle(status: string, isSelected: boolean) {
  if (status === 'complete') return { backgroundColor: colors.green };
  if (status === 'missed') return { backgroundColor: colors.red };
  if (isSelected) return { backgroundColor: colors.navyDark };
  return { backgroundColor: colors.background };
}
function dayNumberStyle(status: string, isSelected: boolean) {
  if (status === 'complete' || status === 'missed' || isSelected) return { color: colors.white };
  return { color: colors.textPrimary };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  title: { ...typography.h1, fontSize: 22 },
  clipboardButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  dayColumn: { alignItems: 'center', gap: 6 },
  dayLabel: { ...typography.small, color: colors.textMuted },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { ...typography.bodyBold, fontSize: 13 },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border, marginHorizontal: spacing.lg },
  metaText: { ...typography.caption, color: colors.textSecondary },
  metaDivider: { color: colors.border },
  sectionTitle: { ...typography.bodyBold, fontSize: 16, marginTop: spacing.lg, marginBottom: spacing.sm, marginHorizontal: spacing.lg },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md },
  taskIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textSecondary },
  taskDetail: { ...typography.small, color: colors.textMuted },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: colors.green, borderColor: colors.green },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: '700' },
});
