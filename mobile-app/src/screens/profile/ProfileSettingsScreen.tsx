import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Alert,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';
import { clearTokens } from '../../api/client';

export default function ProfileSettingsScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/api/v1/users/me/profile');
        setProfile(data);
      } catch {
        // stays null; screen renders minimal fallback below
      }
    })();
  }, []);

  const handleTogglePush = async (value: boolean) => {
    setProfile((prev: any) => ({ ...prev, push_notifications_enabled: value }));
    try {
      await apiClient.patch('/api/v1/users/me/notification-channels', { push_notifications_enabled: value });
    } catch {
      setProfile((prev: any) => ({ ...prev, push_notifications_enabled: !value }));
    }
  };

  const handleToggleEmail = async (value: boolean) => {
    setProfile((prev: any) => ({ ...prev, email_alerts_enabled: value }));
    try {
      await apiClient.patch('/api/v1/users/me/notification-channels', { email_alerts_enabled: value });
    } catch {
      setProfile((prev: any) => ({ ...prev, email_alerts_enabled: !value }));
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile & Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.roleLine}>
            {profile.role === 'physician' ? 'Physician' : 'Patient'}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <SettingsRow icon="✉️" label="Email" value={profile.email} onPress={() => {}} />
          <SettingsRow
            icon="🔒"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
            divider={false}
          />
        </View>

        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.rowLabel}>📱 Push Notifications</Text>
            <Switch
              value={profile.push_notifications_enabled}
              onValueChange={handleTogglePush}
              trackColor={{ true: colors.tealPrimary, false: colors.border }}
            />
          </View>
          <View style={[styles.toggleRow, styles.noDivider]}>
            <Text style={styles.rowLabel}>🔔 Email Alerts</Text>
            <Switch
              value={profile.email_alerts_enabled}
              onValueChange={handleToggleEmail}
              trackColor={{ true: colors.tealPrimary, false: colors.border }}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={[styles.toggleRow, styles.noDivider]}>
            <Text style={styles.rowLabel}>ℹ️ App Version</Text>
            <Text style={styles.versionText}>v2.4.1</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>➜ Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, label, value, onPress, divider = true }: any) {
  return (
    <TouchableOpacity
      style={[styles.toggleRow, !divider && styles.noDivider]}
      onPress={onPress}
    >
      <Text style={{ fontSize: 16, marginRight: spacing.sm }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  avatarBlock: { alignItems: 'center', gap: 4, paddingVertical: spacing.md },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  name: { ...typography.h2, fontSize: 18 },
  roleLine: { ...typography.caption, color: colors.textSecondary },
  editButton: {
    marginTop: spacing.sm, backgroundColor: colors.tealSoft,
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill,
  },
  editButtonText: { ...typography.bodyBold, fontSize: 13, color: colors.tealPrimary },
  sectionLabel: { ...typography.bodyBold, fontSize: 13, color: colors.textSecondary },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  noDivider: { borderBottomWidth: 0 },
  rowLabel: { ...typography.body, fontSize: 14, flex: 1 },
  rowValue: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textMuted },
  versionText: { ...typography.body, color: colors.textSecondary },
  signOutButton: {
    backgroundColor: colors.redSoft, borderRadius: radius.lg,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  signOutText: { ...typography.bodyBold, color: colors.red, fontSize: 15 },
});
