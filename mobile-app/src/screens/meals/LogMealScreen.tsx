import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

type FoodItem = {
  id: string;
  name: string;
  emoji: string | null;
  cuisine_tag: string | null;
  carbs_g: number;
  kcal: number | null;
};

const TABS = [
  { key: 'recent', label: 'Recent' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'sri_lankan', label: 'Sri Lankan' },
  { key: 'ai', label: '✨ AI Suggest' },
];

export default function LogMealScreen({ navigation, route }: any) {
  const mealType = route?.params?.mealType ?? 'dinner';
  const [activeTab, setActiveTab] = useState('recent');
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, [activeTab, query]);

  const fetchFoods = async () => {
    try {
      const params: any = {};
      if (query) params.q = query;
      if (activeTab === 'sri_lankan') params.tag = 'Sri Lankan';
      if (activeTab === 'breakfast') params.meal_type = 'breakfast';
      const { data } = await apiClient.get('/api/v1/meals/food-search', { params });
      setFoods(data);
    } catch {
      // silent fail — keep whatever list was already shown
    }
  };

  const toggleSelect = (food: FoodItem) => {
    setSelected((prev) =>
      prev.find((f) => f.id === food.id) ? prev.filter((f) => f.id !== food.id) : [...prev, food]
    );
  };

  const totalCarbs = selected.reduce((sum, f) => sum + f.carbs_g, 0);
  const totalKcal = selected.reduce((sum, f) => sum + (f.kcal || 0), 0);

  const handleSaveMeal = async () => {
    if (selected.length === 0) {
      Alert.alert('No items selected', 'Add at least one food item first.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/v1/meals', {
        meal_type: mealType,
        log_date: new Date().toISOString().slice(0, 10),
        items: selected.map((f) => ({
          food_item_id: f.id,
          name: f.name,
          emoji: f.emoji,
          carbs_g: f.carbs_g,
          kcal: f.kcal,
        })),
      });
      navigation.goBack();
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log {mealLabel}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search food or scan barcode..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionLabel}>Recent Foods</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {foods.map((food) => {
          const isSelected = !!selected.find((f) => f.id === food.id);
          return (
            <View key={food.id} style={styles.foodRow}>
              <View style={styles.foodIconBox}>
                <Text style={{ fontSize: 20 }}>{food.emoji ?? '🍽️'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodCarbs}>{food.carbs_g}g carbs</Text>
              </View>
              <TouchableOpacity onPress={() => toggleSelect(food)}>
                <Text style={[styles.addIcon, isSelected && styles.addIconSelected]}>
                  {isSelected ? '✓' : '+'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{mealLabel} so far</Text>
          <Text style={styles.footerValue}>{totalCarbs}g carbs · {totalKcal} kcal</Text>
        </View>
        <PrimaryButton label="Save Meal" onPress={handleSaveMeal} loading={loading} style={{ paddingHorizontal: spacing.lg, paddingVertical: 12 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  search: { backgroundColor: colors.background, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 12, ...typography.body },
  tabsRow: { marginBottom: spacing.md, flexGrow: 0 },
  tab: { paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.tealPrimary },
  tabLabel: { ...typography.bodyBold, fontSize: 13, color: colors.textSecondary },
  tabLabelActive: { color: colors.white },
  sectionLabel: { ...typography.bodyBold, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: 100 },
  foodRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm,
  },
  foodIconBox: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  foodName: { ...typography.bodyBold, fontSize: 14 },
  foodCarbs: { ...typography.caption, color: colors.textSecondary },
  addIcon: { fontSize: 22, color: colors.tealPrimary, width: 28, textAlign: 'center' },
  addIconSelected: { color: colors.green },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.tealSoft, padding: spacing.lg,
  },
  footerLabel: { ...typography.caption, color: colors.textSecondary },
  footerValue: { ...typography.bodyBold, color: colors.tealPrimary, fontSize: 15 },
});
