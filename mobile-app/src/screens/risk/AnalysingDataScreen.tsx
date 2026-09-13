import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { StepDots } from '../../components/Progress';
import { colors, spacing, typography, radius } from '../../theme';

const MESSAGES = [
  'Checking 12 risk indicators...',
  'Cross-referencing clinical models...',
  'Applying the FINDRISC algorithm...',
];

// This screen is shown momentarily while RiskQuestionScreen's background submit
// resolves and then calls navigation.replace('RiskResult', { result }).
export default function AnalysingDataScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <GradientHeader>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.brainEmoji}>🧠</Text>
          <Text style={styles.title}>Analysing Your Data</Text>
          <Text style={styles.subtitle}>
            Our AI is cross-referencing your responses with clinical risk models and the FINDRISC algorithm...
          </Text>

          <View style={{ height: spacing.lg }} />
          <StepDots total={3} activeIndex={messageIndex} activeColor={colors.tealAccent} inactiveColor="rgba(255,255,255,0.35)" />

          <View style={styles.pill}>
            <Text style={styles.pillText}>{MESSAGES[messageIndex]}</Text>
          </View>
        </View>
      </SafeAreaView>
    </GradientHeader>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'center' },
  center: { alignItems: 'center', paddingHorizontal: spacing.lg },
  brainEmoji: { fontSize: 56, marginBottom: spacing.lg },
  title: { color: colors.white, ...typography.h1, fontSize: 24, marginBottom: spacing.sm },
  subtitle: { color: 'rgba(255,255,255,0.8)', ...typography.body, textAlign: 'center' },
  pill: {
    marginTop: spacing.lg, backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: radius.pill,
  },
  pillText: { color: colors.white, ...typography.caption },
});
