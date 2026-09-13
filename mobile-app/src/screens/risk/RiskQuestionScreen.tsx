import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { ProgressBar } from '../../components/Progress';
import { colors, spacing, typography, radius } from '../../theme';
import { fetchRiskQuestions, submitRiskAssessment } from '../../api/endpoints';

type Question = {
  id: string;
  order: number;
  prompt: string;
  options: { value: string; label: string }[];
};

export default function RiskQuestionScreen({ navigation, route }: any) {
  const healthProfile = route.params.health_profile;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    fetchRiskQuestions().then((data) => {
      setQuestions(data.sort((a: Question, b: Question) => a.order - b.order));
      setLoadingQuestions(false);
    });
  }, []);

  if (loadingQuestions) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.tealPrimary} size="large" />
      </SafeAreaView>
    );
  }

  const question = questions[index];
  const selected = answers[question.id];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    // last question answered -> go analyse, submitting in the background
    navigation.navigate('AnalysingData', { health_profile: healthProfile, answers });
    try {
      const result = await submitRiskAssessment({ health_profile: healthProfile, answers });
      navigation.replace('RiskResult', { result });
    } catch {
      navigation.replace('RiskQuestionnaire', { health_profile: healthProfile });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => (index > 0 ? setIndex(index - 1) : navigation.goBack())}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Risk Assessment</Text>
          <View style={{ width: 20 }} />
        </View>
        <Text style={styles.stepLabel}>Question {index + 1} of {questions.length}</Text>
        <ProgressBar progress={(index + 1) / questions.length} trackColor="rgba(255,255,255,0.3)" fillColor={colors.white} />
      </View>

      <View style={styles.body}>
        <Text style={styles.prompt}>{question.prompt}</Text>

        <View style={styles.options}>
          {question.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.85}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{opt.label}</Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <Text style={styles.check}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <PrimaryButton
          label={index === questions.length - 1 ? 'See My Result  →' : 'Next Question  →'}
          onPress={handleNext}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.tealPrimary, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: colors.white, fontSize: 20 },
  topTitle: { color: colors.white, ...typography.bodyBold, fontSize: 16 },
  stepLabel: { color: 'rgba(255,255,255,0.85)', ...typography.caption },
  body: { flex: 1, padding: spacing.lg },
  prompt: { ...typography.h2, marginBottom: spacing.lg },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md,
  },
  optionSelected: { borderColor: colors.tealPrimary, backgroundColor: colors.tealSoft },
  optionLabel: { ...typography.body, flex: 1 },
  optionLabelSelected: { color: colors.tealDark, fontWeight: '600' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.tealPrimary, backgroundColor: colors.tealPrimary },
  check: { color: colors.white, fontSize: 12, fontWeight: '700' },
});
