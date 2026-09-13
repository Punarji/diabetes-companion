import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

type Entry = { day_of_week: number; meal_type: string; food_name: string; emoji: string | null; carbs_g: number };
type Day = { day_label: string; date: string; entries: Entry[] };

const MEAL_TYPE_LABEL: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function MealPlanScreen({ navigation }: any) {
  const [days, setDays] = useState<Day[]>([]);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const { data } = await apiClient.get('/api/v1/meals/plan');
      setDays(data.days);
      const todayIndex = new Date().getDay(); // 0=Sun
      setActiveDay(todayIndex === 0 ? 6 : todayIndex - 1);
    } catch {
      // no plan yet — leave empty state
    }
  };

  const currentDay = days[activeDay];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>7-Day Meal Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.daysRow}>
        {days.map((d, i) => (
          <TouchableOpacity key={d.day_label + i} onPress={() => setActiveDay(i)} style={styles.dayTab}>
            <Text style={[styles.dayLabel, i === activeDay && styles.dayLabelActive]}>{d.day_label}</Text>
            {i === activeDay && <View style={styles.dayUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {currentDay?.entries.map((entry, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 18 }}>{entry.emoji ?? '🍽️'}</Text>
              <Text style={styles.mealType}>{MEAL_TYPE_LABEL[entry.meal_type] ?? entry.meal_type}</Text>
            </View>
            <View style={styles.cardBody}>
              <View>
                <Text style={styles.foodName}>{entry.food_name}</Text>
                <TouchableOpacity>
                  <Text style={styles.swap}>Swap</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.carbs}>{entry.carbs_g}g carbs</Text>
            </View>
          </View>
        ))}
        {!currentDay?.entries.length && (
          <Text style={styles.empty}>No meal plan yet for this day.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  dayTab: { alignItems: 'center', paddingVertical: 4 },
  dayLabel: { ...typography.body, color: colors.textMuted, fontSize: 13 },
  dayLabelActive: { color: colors.tealPrimary, fontWeight: '700' },
  dayUnderline: { height: 2, width: 20, backgroundColor: colors.tealPrimary, borderRadius: 1, marginTop: 4 },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  mealType: { ...typography.bodyBold, fontSize: 15 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  foodName: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  swap: { color: colors.tealPrimary, ...typography.bodyBold, fontSize: 13 },
  carbs: { color: colors.tealPrimary, ...typography.bodyBold, fontSize: 14 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
