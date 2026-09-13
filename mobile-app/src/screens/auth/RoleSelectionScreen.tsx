import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { PrimaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';

type Role = 'patient' | 'physician';

export default function RoleSelectionScreen({ navigation }: any) {
  const [role, setRole] = useState<Role>('patient');

  return (
    <SafeAreaView style={styles.safe}>
      <GradientHeader rounded style={styles.header}>
        <Text style={styles.emoji}>🧑</Text>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose your role to continue</Text>
      </GradientHeader>

      <View style={styles.options}>
        <RoleCard
          emoji="🧑‍⚕️"
          title="I am a Patient"
          subtitle="Manage my diabetes daily"
          selected={role === 'patient'}
          onPress={() => setRole('patient')}
        />
        <RoleCard
          emoji="🩺"
          title="I am a Doctor"
          subtitle="Manage my patients' care"
          selected={role === 'physician'}
          onPress={() => setRole('physician')}
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label={`Continue as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
          onPress={() => navigation.navigate('CreateAccount', { role })}
        />
      </View>
    </SafeAreaView>
  );
}

function RoleCard({ emoji, title, subtitle, selected, onPress }: {
  emoji: string; title: string; subtitle: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, selected && styles.cardSelected]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardIconBox}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center' },
  emoji: { fontSize: 36, marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.white },
  subtitle: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  options: { paddingHorizontal: spacing.lg, marginTop: -spacing.lg, gap: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md,
  },
  cardSelected: { borderColor: colors.tealPrimary, backgroundColor: colors.tealSoft },
  cardIconBox: {
    width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { ...typography.bodyBold },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: colors.tealPrimary },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.tealPrimary },
  bottom: { padding: spacing.lg, marginTop: 'auto' },
});
