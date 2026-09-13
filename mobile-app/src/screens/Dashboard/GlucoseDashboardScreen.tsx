import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';
import { BottomNav } from '../../components/BottomNav';

const PERIODS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const STATUS_COLORS: Record<string, string> = {
  in_range: colors.green,
  high: colors.amber,
  very_high: colors.red,
  no_data: colors.border,
};

const READING_DOT_COLORS: Record<string, string> = {
  'In Range': colors.green,
  Borderline: colors.amber,
  High: colors.red,
  Low: colors.blue,
  Pending: colors.textMuted,
};

export default function GlucoseDashboardScreen({ navigation }: any) {
  const [period, setPeriod] = useState('7d');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/v1/glucose/summary', { params: { period } });
      setSummary(data);
    } catch {
      // keep previous data on failure
    } finally {
      setLoading(false);
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

  const maxAvg = summary?.chart_days?.length
    ? Math.max(...summary.chart_days.map((d: any) => d.average_value || 0), 1)
    : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Glucose 🩸</Text>
        <TouchableOpacity
          style={styles.logButton}
          onPress={() => navigation.navigate('GlucoseLog')}
        >
          <Text style={styles.logButtonText}>Log +</Text>
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

        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {summary?.average_value ?? '--'} <Text style={styles.statUnit}>mg/dL</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Time in Range</Text>
              <Text style={[styles.statValue, { color: colors.green }]}>
                {summary?.time_in_range_percent ?? '--'}%
              </Text>
            </View>
          </View>

          <View style={styles.chartRow}>
            {(summary?.chart_days ?? []).map((d: any, i: number) => (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: d.average_value ? Math.max((d.average_value / maxAvg) * 90, 6) : 4,
                        backgroundColor: STATUS_COLORS[d.status],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{d.day_label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.legendRow}>
            <LegendDot color={colors.green} label="In Range" />
            <LegendDot color={colors.amber} label="High" />
            <LegendDot color={colors.red} label="Very High" />
          </View>
        </View>

        {summary?.alert && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠️ High Reading Detected</Text>
            <Text style={styles.alertMeta}>
              {summary.alert.time_label} · {summary.alert.value_mg_dl} mg/dL
            </Text>
            <Text style={styles.alertMessage}>{summary.alert.message}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Today's Readings</Text>
        <View style={styles.readingsList}>
          {(summary?.today_readings ?? []).map((r: any, i: number) => (
            <View key={i} style={styles.readingRow}>
              <View style={[styles.readingDot, { backgroundColor: READING_DOT_COLORS[r.status_label] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.readingLabel}>
                  {r.label}
                  {r.time_label ? ` · ${r.time_label}` : ' · Pending'}
                </Text>
              </View>
              <Text style={styles.readingValue}>
                {r.value_mg_dl != null ? `${r.value_mg_dl} mg/dL` : '-- mg/dL'}
              </Text>
              {r.status_label === 'Pending' ? (
                <TouchableOpacity
                  style={styles.logNowButton}
                  onPress={() => navigation.navigate('GlucoseLog')}
                >
                  <Text style={styles.logNowText}>Log Now</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.statusPill, { backgroundColor: `${READING_DOT_COLORS[r.status_label]}22` }]}>
                  <Text style={[styles.statusPillText, { color: READING_DOT_COLORS[r.status_label] }]}>
                    {r.status_label}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav
        tabs={[
          { key: 'home', label: 'Home', emoji: '🏠' },
          { key: 'glucose', label: 'Glucose', emoji: '🩸' },
          { key: 'meals', label: 'Meals', emoji: '🍽️' },
          { key: 'profile', label: 'Profile', emoji: '👤' },
        ]}
        activeKey="glucose"
        onSelect={(key) => {
          if (key === 'home') navigation.navigate('Home');
          if (key === 'meals') navigation.navigate('Meals');
          if (key === 'profile') navigation.navigate('Profile');
        }}
      />
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  title: { ...typography.h2 },
  logButton: { backgroundColor: colors.tealPrimary, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  logButtonText: { color: colors.white, ...typography.bodyBold, fontSize: 13 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  periodRow: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: radius.pill, padding: 3, marginBottom: spacing.sm },
  periodPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill },
  periodPillActive: { backgroundColor: colors.white },
  periodLabel: { ...typography.caption, color: colors.textSecondary },
  periodLabelActive: { color: colors.textPrimary, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statValue: { ...typography.h2, fontSize: 24 },
  statUnit: { ...typography.caption, color: colors.textSecondary },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, marginBottom: spacing.sm },
  barColumn: { alignItems: 'center', flex: 1 },
  barTrack: { height: 90, justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: 6 },
  barLabel: { ...typography.small, color: colors.textMuted, marginTop: 6 },
  legendRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...typography.small, color: colors.textSecondary },
  alertCard: { backgroundColor: colors.redSoft, borderRadius: radius.lg, padding: spacing.md },
  alertTitle: { ...typography.bodyBold, color: colors.red, fontSize: 14 },
  alertMeta: { ...typography.caption, color: colors.red, marginTop: 2 },
  alertMessage: { ...typography.small, color: colors.red, marginTop: 4 },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  readingsList: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  readingRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  readingDot: { width: 8, height: 8, borderRadius: 4 },
  readingLabel: { ...typography.body, fontSize: 14 },
  readingValue: { ...typography.bodyBold, fontSize: 14, marginRight: spacing.sm },
  statusPill: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  statusPillText: { ...typography.small, fontWeight: '700' },
  logNowButton: { backgroundColor: colors.tealPrimary, paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  logNowText: { color: colors.white, ...typography.small, fontWeight: '700' },
});
