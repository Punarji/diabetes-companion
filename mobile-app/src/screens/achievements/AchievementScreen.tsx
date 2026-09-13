import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Share, Alert } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

export default function AchievementScreen({ navigation, route }: any) {
  const achievementId = route?.params?.achievementId;
  const [achievement, setAchievement] = useState<any>(null);

  useEffect(() => {
    fetchAchievement();
  }, []);

  const fetchAchievement = async () => {
    try {
      const { data } = await apiClient.get(`/api/v1/achievements/${achievementId}`);
      setAchievement(data);
    } catch {
      Alert.alert('Could not load achievement');
    }
  };

  const handleShare = async () => {
    if (!achievement) return;
    try {
      await Share.share({ message: `I just earned the "${achievement.title}" badge on T2DM Companion! ${achievement.emoji}` });
    } catch {
      // user cancelled share sheet — no action needed
    }
  };

  if (!achievement) return <SafeAreaView style={styles.safe} />;

  const earnedDateLabel = achievement.earned_at
    ? new Date(achievement.earned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Achievement</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
        </View>
        <Text style={styles.badgeTitle}>{achievement.title}</Text>
        {earnedDateLabel && <Text style={styles.earnedDate}>Earned {earnedDateLabel}</Text>}

        <View style={styles.descCard}>
          <Text style={styles.descText}>{achievement.description}</Text>
        </View>

        {achievement.next_milestone_hint && (
          <View style={styles.hintSection}>
            <Text style={styles.hintTitle}>How to earn more like this</Text>
            <Text style={styles.hintText}>{achievement.next_milestone_hint}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Share Badge 🎉</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white },
  back: { fontSize: 26 },
  title: { ...typography.bodyBold, fontSize: 16 },
  content: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  badgeBox: {
    width: 140, height: 140, borderRadius: radius.lg, backgroundColor: colors.amber,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  badgeEmoji: { fontSize: 64 },
  badgeTitle: { ...typography.h1, fontSize: 24 },
  earnedDate: { ...typography.caption, color: colors.textMuted },
  descCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, width: '100%' },
  descText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  hintSection: { width: '100%', marginTop: spacing.md },
  hintTitle: { ...typography.bodyBold, marginBottom: spacing.xs },
  hintText: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  shareButton: {
    margin: spacing.lg, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center',
  },
  shareButtonText: { ...typography.bodyBold, fontSize: 15 },
});
