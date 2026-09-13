import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

const TYPE_ICON_BG: Record<string, string> = {
  glucose_alert: colors.redSoft,
  medication_reminder: colors.tealSoft,
  meal_reminder: colors.amberSoft,
  achievement: colors.amberSoft,
  doctor_update: colors.purpleSoft,
};

export default function NotificationsScreen({ navigation }: any) {
  const [data, setData] = useState<{ unread_count: number; notifications: any[] }>({
    unread_count: 0,
    notifications: [],
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: res } = await apiClient.get('/api/v1/notifications');
      setData(res);
    } catch {
      // keep whatever was previously shown
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleMarkAllRead = async () => {
    setData((prev) => ({
      unread_count: 0,
      notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
    }));
    try {
      await apiClient.post('/api/v1/notifications/mark-all-read');
    } catch {
      fetchNotifications();
    }
  };

  const handleTapNotification = async (id: string) => {
    setData((prev) => ({
      unread_count: Math.max(0, prev.unread_count - 1),
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }));
    try {
      await apiClient.post(`/api/v1/notifications/${id}/read`);
    } catch {
      fetchNotifications();
    }
  };

  const grouped: Record<string, any[]> = {};
  data.notifications.forEach((n) => {
    grouped[n.day_group] = grouped[n.day_group] || [];
    grouped[n.day_group].push(n);
  });
  const groupOrder = ['Today', 'Yesterday', 'Earlier'].filter((g) => grouped[g]?.length);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Notifications 🔔</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllLink}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {groupOrder.map((group) => (
          <View key={group} style={styles.groupBlock}>
            <Text style={styles.groupLabel}>{group}</Text>
            {grouped[group].map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, !n.is_read && styles.cardUnread]}
                onPress={() => handleTapNotification(n.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: TYPE_ICON_BG[n.notification_type] || colors.background }]}>
                  <Text style={{ fontSize: 18 }}>{n.icon || '🔔'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.cardMessage}>{n.message}</Text>
                  <Text style={styles.cardTime}>{formatRelativeTime(n.created_at)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        {groupOrder.length === 0 && (
          <Text style={styles.emptyText}>You're all caught up!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  title: { ...typography.h2, fontSize: 20 },
  markAllLink: { ...typography.bodyBold, fontSize: 13, color: colors.tealPrimary },
  scroll: { padding: spacing.lg, gap: spacing.md },
  groupBlock: { gap: spacing.sm },
  groupLabel: { ...typography.bodyBold, fontSize: 13, color: colors.textSecondary },
  card: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md,
  },
  cardUnread: { borderWidth: 1.5, borderColor: colors.tealPrimary },
  iconBox: {
    width: 40, height: 40, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { ...typography.bodyBold, fontSize: 14 },
  cardMessage: { ...typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  cardTime: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
