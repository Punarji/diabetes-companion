import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { fetchMyPatients } from '../../api/endpoints';
import { useAuth } from '../../store/AuthContext';

const STATUS_COLOR: Record<string, string> = {
  teal: colors.tealPrimary,
  red: colors.red,
  green: colors.green,
};

export default function PhysicianHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await fetchMyPatients();
    setData(result);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.name}>{user?.full_name ?? 'Doctor'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {data && (
        <View style={styles.statsRow}>
          <StatBox value={`${data.total_patients}`} label="Total Patients" />
          <StatBox value={`${data.alerts_today}`} label="Alerts Today" color={colors.red} />
          <StatBox value={`${data.on_track_count}`} label="On Track" color={colors.green} />
        </View>
      )}

      <Text style={styles.sectionTitle}>My Patients</Text>

      <FlatList
        data={data?.patients ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.patientCard}
            onPress={() => navigation.navigate('PatientReport', { patientId: item.id })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{item.full_name}</Text>
              <Text style={styles.patientCondition}>{item.condition_label}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[item.status_color] ?? colors.tealPrimary }]}>
                <Text style={styles.statusPillText}>{item.status_label}</Text>
              </View>
              {item.hba1c_latest != null && (
                <Text style={styles.hba1cText}>HbA1c {item.hba1c_latest}%</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          data ? <Text style={styles.emptyText}>No patients linked yet.</Text> : null
        }
      />
    </SafeAreaView>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { ...typography.caption, color: colors.textSecondary },
  name: { ...typography.h1, fontSize: 22 },
  logoutButton: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.tealSoft },
  logoutText: { color: colors.tealPrimary, ...typography.bodyBold, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.sm, alignItems: 'center' },
  statValue: { ...typography.h2, fontSize: 20, color: colors.textPrimary },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.bodyBold, fontSize: 16, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  patientCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.tealPrimary, ...typography.bodyBold },
  patientName: { ...typography.bodyBold, fontSize: 15 },
  patientCondition: { ...typography.small, color: colors.textSecondary },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
  statusPillText: { color: colors.white, ...typography.small, fontWeight: '700' },
  hba1cText: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, ...typography.body },
});
