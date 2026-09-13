import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';
import { BottomNav } from '../../components/BottomNav';

export default function NutritionScreen({ navigation }: any) {
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/v1/nutrition/summary');
      setSummary(data);
    } catch {
      // keep previous data on failure
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  if (!summary) return null;

  const carbPercent = Math.min(
    100,
    Math.round((summary.carbs_consumed_g / summary.daily_carb_limit_g) * 100)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Nutrition 🍽️</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('LogMeal')}
        >
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.limitCard}>
          <Text style={styles.limitLabel}>Daily Carbohydrate Limit</Text>
          <View style={styles.limitValueRow}>
            <Text style={styles.limitValue}>{summary.carbs_consumed_g}</Text>
            <Text style={styles.limitUnit}> / {summary.daily_carb_limit_g}g</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${carbPercent}%` }]} />
          </View>
          <View style={styles.limitFooterRow}>
            <Text style={styles.limitFooterText}>{summary.carbs_remaining_g}g remaining</Text>
            <Text style={styles.limitFooterText}>
              Calories: {summary.calories_consumed} / {summary.daily_calorie_limit}
            </Text>
          </View>
        </View>

        <View style={styles.macroRow}>
          <MacroCard label="Protein" value={summary.macros.protein_g} unit="g" color={colors.green} />
          <MacroCard label="Fat" value={summary.macros.fat_g} unit="g" color={colors.amber} />
          <MacroCard label="Fiber" value={summary.macros.fiber_g} unit="g" color={colors.purple} />
        </View>

        <Text style={styles.sectionLabel}>Today's Meals</Text>
        <View style={styles.card}>
          {summary.meals.map((meal: any, i: number) => (
            <View
              key={meal.meal_type}
              style={[styles.mealRow, i < summary.meals.length - 1 && styles.mealRowDivider]}
            >
              <View style={styles.mealIconBox}>
                <Text style={{ fontSize: 18 }}>{meal.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTypeLabel}>
                  {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                </Text>
                <Text style={meal.logged ? styles.mealName : styles.mealNamePending}>
                  {meal.label}
                </Text>
              </View>
              {meal.logged ? (
                <View style={styles.carbPill}>
                  <Text style={styles.carbPillText}>{meal.carbs_g}g</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => navigation.navigate('LogMeal', { mealType: meal.meal_type })}
                >
                  <Text style={styles.logButtonText}>Log ＋</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>AI Meal Suggestions ✨</Text>
      </ScrollView>

      <BottomNav
        tabs={[
          { key: 'home', label: 'Home', emoji: '🏠' },
          { key: 'meds', label: 'Meds', emoji: '💊' },
          { key: 'meals', label: 'Meals', emoji: '🍽️' },
          { key: 'stats', label: 'Stats', emoji: '📊' },
          { key: 'profile', label: 'Profile', emoji: '👤' },
        ]}
        activeKey="meals"
        onSelect={(key) => {
          if (key === 'home') navigation.navigate('Home');
          if (key === 'meds') navigation.navigate('Medications');
          if (key === 'stats') navigation.navigate('Progress');
          if (key === 'profile') navigation.navigate('Profile');
        }}
      />
    </SafeAreaView>
  );
}

function MacroCard({ label, value, unit, color }: any) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}{unit}</Text>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: '60%', backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  title: { ...typography.h2, fontSize: 20 },
  addButton: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.tealPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  addButtonText: { color: colors.tealPrimary, fontSize: 18, fontWeight: '700' },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  limitCard: { backgroundColor: colors.tealPrimary, borderRadius: radius.lg, padding: spacing.lg },
  limitLabel: { ...typography.body, fontSize: 13, color: colors.tealSoft },
  limitValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  limitValue: { ...typography.h1, fontSize: 40, color: colors.white },
  limitUnit: { ...typography.body, fontSize: 16, color: colors.tealSoft, marginBottom: 6 },
  progressTrack: {
    height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: spacing.sm, overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.white },
  limitFooterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  limitFooterText: { ...typography.small, color: colors.tealSoft },
  macroRow: { flexDirection: 'row', gap: spacing.sm },
  macroCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.sm },
  macroLabel: { ...typography.small, color: colors.textSecondary },
  macroValue: { ...typography.bodyBold, fontSize: 16, marginVertical: 4 },
  macroBarTrack: { height: 4, borderRadius: 2, backgroundColor: colors.background, overflow: 'hidden' },
  macroBarFill: { height: 4, borderRadius: 2 },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  mealRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.background },
  mealIconBox: {
    width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  mealTypeLabel: { ...typography.small, color: colors.textSecondary },
  mealName: { ...typography.bodyBold, fontSize: 14 },
  mealNamePending: { ...typography.body, fontSize: 14, color: colors.textMuted },
  carbPill: { backgroundColor: colors.tealSoft, paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  carbPillText: { ...typography.bodyBold, fontSize: 12, color: colors.tealPrimary },
  logButton: { backgroundColor: colors.tealPrimary, paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  logButtonText: { color: colors.white, ...typography.small, fontWeight: '700' },
});
