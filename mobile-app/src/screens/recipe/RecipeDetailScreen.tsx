import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

export default function RecipeDetailScreen({ navigation, route }: any) {
  const foodItemId = route?.params?.foodItemId;
  const mealType = route?.params?.mealType ?? 'lunch';
  const [item, setItem] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!foodItemId) return;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/v1/meals/food-items/${foodItemId}`);
        setItem(data);
      } catch {
        // item stays null; screen shows fallback below
      } finally {
        setLoading(false);
      }
    })();
  }, [foodItemId]);

  const handleAddToMeal = async () => {
    setAdding(true);
    try {
      await apiClient.post('/api/v1/meals', {
        meal_type: mealType,
        log_date: new Date().toISOString().slice(0, 10),
        items: [{
          food_item_id: item.id,
          name: item.name,
          emoji: item.image_emoji,
          carbs_g: item.carbs_g,
          kcal: item.kcal,
        }],
      });
      navigation.goBack();
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={colors.tealPrimary} />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Text style={styles.body}>Recipe not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity onPress={() => setLiked(!liked)}>
          <Text style={styles.heart}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageBanner}>
          <Text style={{ fontSize: 56 }}>{item.image_emoji || '🍽️'}</Text>
        </View>

        <Text style={styles.recipeName}>{item.name}</Text>
        {item.description ? <Text style={styles.subtitle}>{item.description}</Text> : null}

        <View style={styles.statsRow}>
          <StatBox icon="🌾" value={`${item.carbs_g}g`} label="Carbs" color={colors.tealPrimary} />
          <StatBox icon="🔥" value={`${item.kcal ?? '--'}`} label="Calories" color={colors.amber} />
          <StatBox icon="🕐" value={`${item.prep_time_minutes ?? '--'} min`} label="Prep Time" color={colors.purple} />
        </View>

        {item.ingredients?.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Ingredients</Text>
            <View style={styles.card}>
              {item.ingredients.map((ing: string, i: number) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={styles.ingredientNumber}>
                    <Text style={styles.ingredientNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, adding && styles.addButtonDisabled]}
          onPress={handleAddToMeal}
          disabled={adding}
        >
          <Text style={styles.addButtonText}>
            {adding ? 'Adding...' : "⊕ Add to Today's Meal"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatBox({ icon, value, label, color }: any) {
  return (
    <View style={styles.statBox}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  centered: { alignItems: 'center', justifyContent: 'center' },
  body: { ...typography.body, fontSize: 14 },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  back: { fontSize: 26 },
  title: { ...typography.bodyBold, fontSize: 15, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  heart: { fontSize: 20 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120, gap: spacing.md },
  imageBanner: {
    height: 180, borderRadius: radius.lg, backgroundColor: colors.amberSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  recipeName: { ...typography.h1, fontSize: 22 },
  subtitle: { ...typography.body, color: colors.textSecondary, fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1, backgroundColor: colors.background, borderRadius: radius.lg,
    alignItems: 'center', paddingVertical: spacing.sm, gap: 2,
  },
  statValue: { ...typography.bodyBold, fontSize: 15 },
  statLabel: { ...typography.small, color: colors.textSecondary },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  ingredientNumber: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.tealSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  ingredientNumberText: { ...typography.small, color: colors.tealPrimary, fontWeight: '700' },
  ingredientText: { ...typography.body, fontSize: 14 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  addButton: { backgroundColor: colors.tealPrimary, borderRadius: radius.lg, alignItems: 'center', paddingVertical: 16 },
  addButtonDisabled: { opacity: 0.6 },
  addButtonText: { color: colors.white, ...typography.bodyBold, fontSize: 15 },
});
