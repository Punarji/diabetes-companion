import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

const EXERCISE_ICONS: Record<string, string> = {
  walking: '🚶',
  cycling: '🚴',
  swimming: '🏊',
  strength: '🏋️',
  yoga: '🧘',
  custom: '⚡',
};

export default function ActivityScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const { data } = await apiClient.get('/api/v1/activity');
      setData(data);
    } catch {
      // leave blank state
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Activity 🏃</Text>
          <TouchableOpacity style={styles.logButton} onPress={() => navigation.navigate('LogExercise')}>
            <Text style={styles.logButtonText}>Log +</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ringCard}>
          <View style={styles.ring}>
            <Text style={styles.ringValue}>{data?.today.steps ?? 0}</Text>
            <Text style={styles.ringLabel}>steps</Text>
          </View>
          <Text style={styles.goalText}>
            Goal: {data?.today.steps_goal ?? 10000} steps · <Text style={styles.goalPercent}>{data?.today.steps_percent ?? 0}% complete</Text>
          </Text>

          <View style={styles.statsRow}>
            <Stat value={`${data?.today.distance_km?.toFixed(1) ?? '0.0'} km`} label="Distance" color={colors.textPrimary} />
            <Stat value={`${Math.round(data?.today.calories_kcal ?? 0)} kcal`} label="Burned" color={colors.red} />
            <Stat value={`${data?.today.active_minutes ?? 0} min`} label="Active" color={colors.purple} />
          </View>
        </View>

        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>Weekly Exercise Goal</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalSubtitle}>{data?.weekly_goal.label ?? 'Moderate Aerobic Activity'}</Text>
            <Text style={styles.goalFraction}>
              {data?.weekly_goal.minutes_done ?? 0} / {data?.weekly_goal.minutes_goal ?? 150} min
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, ((data?.weekly_goal.minutes_done ?? 0) / (data?.weekly_goal.minutes_goal ?? 150)) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.goalHint}>
            {data?.weekly_goal.minutes_remaining ?? 150} minutes more this week to meet your goal
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Log Exercise</Text>
        <View style={styles.exerciseGrid}>
          {['walking', 'cycling', 'swimming', 'strength', 'yoga'].map((type) => (
            <TouchableOpacity key={type} style={styles.exerciseTile} onPress={() => navigation.navigate('LogExercise', { exerciseType: type })}>
              <Text style={{ fontSize: 22 }}>{EXERCISE_ICONS[type]}</Text>
              <Text style={styles.exerciseTileLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.exerciseTile, styles.exerciseTileCustom]} onPress={() => navigation.navigate('LogExercise', { exerciseType: 'custom' })}>
            <Text style={{ fontSize: 20, color: colors.tealPrimary }}>+</Text>
            <Text style={[styles.exerciseTileLabel, { color: colors.tealPrimary }]}>Custom</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Recent Workouts</Text>
        <View style={{ gap: spacing.sm }}>
          {(data?.recent_workouts ?? []).map((w: any) => (
            <View key={w.id} style={styles.workoutRow}>
              <View style={styles.workoutIconBox}>
                <Text style={{ fontSize: 18 }}>{EXERCISE_ICONS[w.exercise_type] ?? '⚡'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutName}>
                  {w.exercise_type.charAt(0).toUpperCase() + w.exercise_type.slice(1)}
                </Text>
                <Text style={styles.workoutMeta}>
                  {new Date(w.logged_at).toLocaleDateString()} · {w.duration_minutes} min
                </Text>
                <Text style={styles.workoutMeta}>
                  {w.distance_km ? `${w.distance_km} km   ` : ''}{Math.round(w.calories_kcal)} kcal
                </Text>
              </View>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav
        tabs={[
          { key: 'home', label: 'Home', emoji: '🏠' },
          { key: 'progress', label: 'Progress', emoji: '📈' },
          { key: 'meals', label: 'Meals', emoji: '🍽️' },
          { key: 'profile', label: 'Profile', emoji: '👤' },
        ]}
        activeKey="progress"
        onSelect={(key) => navigation.navigate(key === 'home' ? 'HomeDashboard' : key)}
      />
    </SafeAreaView>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2 },
  logButton: { backgroundColor: colors.tealPrimary, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  logButtonText: { color: colors.white, ...typography.bodyBold, fontSize: 13 },
  ringCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  ring: { width: 160, height: 160, borderRadius: 80, borderWidth: 6, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  ringValue: { ...typography.h1, fontSize: 30 },
  ringLabel: { ...typography.caption, color: colors.textSecondary },
  goalText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  goalPercent: { color: colors.tealPrimary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: spacing.md },
  statValue: { ...typography.h2, fontSize: 18 },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  goalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md },
  goalTitle: { ...typography.bodyBold, marginBottom: spacing.sm },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalSubtitle: { ...typography.body, color: colors.textSecondary, fontSize: 13 },
  goalFraction: { ...typography.bodyBold, color: colors.tealPrimary, fontSize: 13 },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.tealPrimary },
  goalHint: { ...typography.small, color: colors.textMuted, marginTop: 6 },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  exerciseTile: {
    width: '31%', aspectRatio: 1, backgroundColor: colors.white, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  exerciseTileCustom: { borderWidth: 1.5, borderColor: colors.tealPrimary, borderStyle: 'dashed', backgroundColor: 'transparent' },
  exerciseTileLabel: { ...typography.caption, fontSize: 12 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.sm },
  workoutIconBox: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  workoutName: { ...typography.bodyBold, fontSize: 14 },
  workoutMeta: { ...typography.small, color: colors.textSecondary },
  completedBadge: { backgroundColor: colors.tealSoft, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  completedBadgeText: { color: colors.tealPrimary, ...typography.small, fontWeight: '700' },
});
