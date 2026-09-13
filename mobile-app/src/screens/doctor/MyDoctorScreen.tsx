import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

export default function MyDoctorScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await apiClient.get('/api/v1/my-doctor');
        setData(res);
      } catch {
        // stays null; screen shows nothing gracefully below
      }
    })();
  }, []);

  if (!data || !data.doctor) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Text style={styles.body}>No doctor assigned yet.</Text>
      </SafeAreaView>
    );
  }

  const { doctor, upcoming_appointment, past_appointments } = data;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Doctor</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>🧑‍⚕️</Text>
          </View>
          <Text style={styles.doctorName}>{doctor.full_name}</Text>
          {doctor.specialization ? <Text style={styles.subtext}>{doctor.specialization}</Text> : null}
          {doctor.clinic_name ? <Text style={styles.subtext}>{doctor.clinic_name}</Text> : null}
        </View>

        <View style={styles.actionRow}>
          <ActionButton
            icon="📞"
            label="Call"
            bg={colors.tealSoft}
            color={colors.tealPrimary}
            onPress={() => doctor.phone_number && Linking.openURL(`tel:${doctor.phone_number}`)}
          />
          <ActionButton
            icon="💬"
            label="Message"
            bg={colors.blueSoft}
            color={colors.blue}
            onPress={() => navigation.navigate('Chat', { physicianId: doctor.physician_id })}
          />
          <ActionButton
            icon="✉️"
            label="Email"
            bg={colors.amberSoft}
            color={colors.amber}
            onPress={() => doctor.email && Linking.openURL(`mailto:${doctor.email}`)}
          />
        </View>

        <Text style={styles.sectionLabel}>Upcoming Appointment</Text>
        {upcoming_appointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentRow}>
              <Text style={{ fontSize: 16 }}>📅</Text>
              <Text style={styles.appointmentText}>
                {new Date(upcoming_appointment.scheduled_at).toLocaleDateString(undefined, {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.appointmentRow}>
              <Text style={{ fontSize: 16 }}>🕐</Text>
              <Text style={styles.appointmentText}>
                {new Date(upcoming_appointment.scheduled_at).toLocaleTimeString(undefined, {
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>
            <TouchableOpacity style={styles.viewDetailsLink}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.appointmentCard}>
            <Text style={styles.subtext}>No upcoming appointment scheduled.</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Past Appointments</Text>
        {past_appointments.map((appt: any) => (
          <View key={appt.id} style={styles.pastCard}>
            <Text style={styles.pastDate}>
              {new Date(appt.scheduled_at).toLocaleDateString(undefined, {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
            {appt.note ? <Text style={styles.pastNote}>{appt.note}</Text> : null}
          </View>
        ))}

        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, bg, color, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.tealSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  doctorName: { ...typography.h2, fontSize: 18 },
  subtext: { ...typography.caption, color: colors.textSecondary },
  body: { ...typography.body, fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: spacing.md, borderRadius: radius.lg,
  },
  actionLabel: { ...typography.bodyBold, fontSize: 13 },
  sectionLabel: { ...typography.bodyBold, fontSize: 15 },
  appointmentCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  appointmentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appointmentText: { ...typography.body, fontSize: 14 },
  viewDetailsLink: { alignSelf: 'flex-end' },
  viewDetailsText: { ...typography.bodyBold, fontSize: 13, color: colors.tealPrimary },
  pastCard: {
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
  },
  pastDate: { ...typography.bodyBold, fontSize: 14 },
  pastNote: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  requestButton: {
    backgroundColor: colors.tealPrimary, borderRadius: radius.lg,
    alignItems: 'center', paddingVertical: 16,
  },
  requestButtonText: { color: colors.white, ...typography.bodyBold, fontSize: 15 },
});
