import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';

type RiskResult = {
  risk_score: number;
  risk_score_max: number;
  risk_level: 'low' | 'moderate' | 'high' | 'likely_t2dm';
  risk_factors: string[];
  recommended_actions: string[];
};

const LEVEL_META: Record<RiskResult['risk_level'], { label: string; color: string; bg: string }> = {
  low: { label: 'Low Risk', color: colors.green, bg: colors.tealSoft },
  moderate: { label: 'Moderate Risk', color: colors.amber, bg: colors.amberSoft },
  high: { label: 'High Risk', color: '#EA580C', bg: '#FFE9DA' },
  likely_t2dm: { label: 'Likely Type 2 DM', color: colors.red, bg: colors.redSoft },
};

const FACTOR_STYLES: Record<string, { color: string; bg: string }> = {
  default_red: { color: colors.red, bg: colors.redSoft },
  default_amber: { color: '#B45309', bg: colors.amberSoft },
  default_teal: { color: colors.tealPrimary, bg: colors.tealSoft },
};

export default function RiskResultScreen({ navigation, route }: any) {
  const result: RiskResult = route.params.result;
  const meta = LEVEL_META[result.risk_level];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.center}>
          <Text style={styles.warnEmoji}>⚠️</Text>
          <View style={[styles.levelBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.levelBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.scoreLabel}>Your diabetes risk score is</Text>
          <Text style={styles.scoreValue}>
            {result.risk_score} <Text style={styles.scoreMax}>/ {result.risk_score_max}</Text>
          </Text>
          <Text style={styles.scoreCaption}>Based on FINDRISC Algorithm + AI Analysis</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Risk Factors Identified</Text>
          <View style={styles.factorsWrap}>
            {result.risk_factors.map((factor, i) => {
              const styleKey = i % 3 === 0 ? 'default_red' : i % 3 === 1 ? 'default_amber' : 'default_teal';
              const s = FACTOR_STYLES[styleKey];
              return (
                <View key={factor} style={[styles.factorPill, { backgroundColor: s.bg }]}>
                  <Text style={[styles.factorText, { color: s.color }]}>{factor}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>⚡ Recommended Actions</Text>
          {result.recommended_actions.map((action) => (
            <View key={action} style={styles.actionRow}>
              <Text style={styles.actionBullet}>•</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.lg }} />
        <PrimaryButton label="Get My Prevention Plan" onPress={() => navigation.navigate('HomeDashboard')} />
        <View style={{ height: spacing.sm }} />
        <SecondaryButton label="Consult a Doctor" onPress={() => navigation.navigate('HomeDashboard')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.lg },
  center: { alignItems: 'center', marginBottom: spacing.lg },
  warnEmoji: { fontSize: 40, marginBottom: spacing.sm },
  levelBadge: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, marginBottom: spacing.md },
  levelBadgeText: { ...typography.bodyBold, fontSize: 13 },
  scoreLabel: { ...typography.h2, textAlign: 'center' },
  scoreValue: { ...typography.h1, fontSize: 34, color: colors.amber, marginTop: 2 },
  scoreMax: { color: colors.textMuted, fontSize: 22 },
  scoreCaption: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  card: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { ...typography.bodyBold, marginBottom: spacing.sm },
  factorsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  factorPill: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  factorText: { ...typography.small, fontWeight: '700' },
  actionsCard: { backgroundColor: colors.amberSoft, borderRadius: radius.md, padding: spacing.md },
  actionsTitle: { ...typography.bodyBold, color: '#92400E', marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 4 },
  actionBullet: { color: '#92400E' },
  actionText: { ...typography.body, color: '#78350F', flex: 1 },
});
