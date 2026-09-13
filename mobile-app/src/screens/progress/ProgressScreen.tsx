import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';
import { BottomNav } from '../../components/BottomNav';

const PERIODS = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: '3months', label: '3 Months' },
];

const ADHERENCE_COLORS: Record<string, string> = {
  green: colors.green,
  amber: colors.amber,
  purple: colors.purple,
};

export default function ProgressScreen({ navigation }: any) {
  const [period, setPeriod] = useState('week');
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/v1/progress', { params: { period } });
      setSummary(data);
    } catch {
      // keep previous data on failure
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  if (!summary) return null;

  const maxHba1c = summary.hba1c_history.length
    ? Math.max(...summary.hba1c_history.map((h: any) => h.value_percent), summary.hba1c_target)
    : summary.hba1c_target;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Text style={styles.title}>My Progress 📊</Text>
        <TouchableOpacity style={styles.pdfButton}>
          <Text style={styles.pdfButtonText}>📄 PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => {
            const active = p.key === period;
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.periodPill, active && styles.periodPillActive]}
                onPress={() => setPeriod(p.key)}
              >
                <Text style={[styles.periodLabel, active && styles.periodLabelActive]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreValue}>{summary.health_score}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scoreLabel}>Health Score</Text>
            <Text style={styles.scoreStatus}>{summary.health_score_label} 👏</Text>
            {summary.health_score_delta !== 0 && (
              <Text style={styles.scoreDelta}>
                {summary.health_score_delta > 0 ? 'Up' : 'Down'} {Math.abs(summary.health_score_delta)} pts from last {period}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Adherence This {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Quarter'}</Text>
        <View style={styles.card}>
          {summary.adherence.map((cat: any) => (
            <View key={cat.label} style={styles.adherenceRow}>
              <View style={styles.adherenceLabelRow}>
                <Text style={styles.adherenceIcon}>{cat.icon}</Text>
                <Text style={styles.adherenceLabel}>{cat.label}</Text>
                <Text style={styles.adherencePercent}>{cat.percent}%</Text>
              </View>
              <View style={styles.adherenceTrack}>
                <View
                  style={[
                    styles.adherenceFill,
                    { width: `${cat.percent}%`, backgroundColor: ADHERENCE_COLORS[cat.color] },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>HbA1c History</Text>
        <View style={styles.card}>
          <View style={styles.hba1cHeaderRow}>
            <View>
              <Text style={styles.hba1cLabel}>Latest</Text>
              <Text style={styles.hba1cValue}>{summary.hba1c_latest ?? '--'}%</Text>
            </View>
            <View style={styles.targetPill}>
              <Text style={styles.targetPillText}>Target &lt; {summary.hba1c_target}%</Text>
            </View>
          </View>

          <View style={styles.hba1cChartRow}>
            {summary.hba1c_history.map((point: any, i: number) => (
              <View key={i} style={styles.hba1cBarColumn}>
                <View style={styles.hba1cBarTrack}>
                  <View
                    style={[
                      styles.hba1cBar,
                      { height: Math.max((point.value_percent / maxHba1c) * 90, 10) },
                    ]}
                  />
                </View>
                <Text style={styles.hba1cBarLabel}>{point.month_label}</Text>
                <Text style={styles.hba1cBarValue}>{point.value_percent}</Text>
              </View>
            ))}
          </View>

          {summary.hba1c_trend_label && (
            <View style={styles.trendBanner}>
              <Text style={styles.trendText}>📉 {summary.hba1c_trend_label}</Text>
            </View>
          )}
        </View>

        {summary.achievements.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Achievements 🏆</Text>
            {summary.achievements.map((a: any) => (
              <View key={a.id} style={styles.achievementCard}>
                <View style={styles.achievementIconBox}>
                  <Text style={{ fontSize: 20 }}>{a.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.achievementTitle}>{a.title}</Text>
                  <Text style={styles.achievementDesc}>{a.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📄 Export Doctor Report PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav
        tabs={[
          { key: 'home', label: 'Home', emoji: '🏠' },
          { key: 'progress', label: 'Progress', emoji: '📈' },
          { key: 'meals', label: 'Meals', emoji: '🍽️' },
          { key: 'profile', label: 'Profile', emoji: '👤' },
        ]}
        activeKey="progress"
        onSelect={(key) => {
          if (key === 'home') navigation.navigate('Home');
          if (key === 'meals') navigation.navigate('Meals');
          if (key === 'profile') navigation.navigate('Profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  title: { ...typography.h2, fontSize: 20 },
  pdfButton: { backgroundColor: colors.tealSoft, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill },
  pdfButtonText: { ...typography.bodyBold, fontSize: 12, color: colors.tealPrimary },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  periodRow: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: radius.pill, padding: 3 },
  periodPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill },
  periodPillActive: { backgroundColor: colors.white },
  periodLabel: { ...typography.caption, color: colors.textSecondary },
  periodLabelActive: { color: colors.textPrimary, fontWeight: '700' },
  scoreCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.navyDark, borderRadius: radius.lg, padding: spacing.lg,
  },
  scoreRing: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: colors.tealAccent,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreValue: { color: colors.white, ...typography.h1, fontSize: 24 },
  scoreLabel: { ...typography.caption, color: colors.textMuted },
  scoreStatus: { color: colors.white, ...typography.bodyBold, fontSize: 16, marginTop: 2 },
  scoreDelta: { color: colors.tealAccent, ...typography.small, marginTop: 4 },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  adherenceRow: { gap: 6 },
  adherenceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adherenceIcon: { fontSize: 14 },
  adherenceLabel: { ...typography.body, fontSize: 13, flex: 1 },
  adherencePercent: { ...typography.bodyBold, fontSize: 13 },
  adherenceTrack: { height: 6, borderRadius: 3, backgroundColor: colors.background, overflow: 'hidden' },
  adherenceFill: { height: 6, borderRadius: 3 },
  hba1cHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hba1cLabel: { ...typography.caption, color: colors.textSecondary },
  hba1cValue: { ...typography.h1, fontSize: 22, color: colors.amber },
  targetPill: { backgroundColor: colors.tealSoft, paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  targetPillText: { ...typography.small, color: colors.tealPrimary, fontWeight: '700' },
  hba1cChartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  hba1cBarColumn: { alignItems: 'center' },
  hba1cBarTrack: { height: 90, justifyContent: 'flex-end' },
  hba1cBar: { width: 28, borderRadius: 4, backgroundColor: colors.red },
  hba1cBarLabel: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  hba1cBarValue: { ...typography.small, color: colors.textSecondary },
  trendBanner: { backgroundColor: colors.tealSoft, borderRadius: radius.md, padding: spacing.sm },
  trendText: { ...typography.small, color: colors.tealPrimary, fontWeight: '700' },
  achievementCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.amberSoft, borderRadius: radius.lg, padding: spacing.md,
  },
  achievementIconBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  achievementTitle: { ...typography.bodyBold, fontSize: 14 },
  achievementDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  exportButton: {
    borderWidth: 1.5, borderColor: colors.tealPrimary, borderRadius: radius.lg,
    alignItems: 'center', paddingVertical: 14,
  },
  exportButtonText: { ...typography.bodyBold, color: colors.tealPrimary, fontSize: 14 },
});
