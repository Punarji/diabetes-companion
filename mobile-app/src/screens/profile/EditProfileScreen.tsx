import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { apiClient } from '../../api/client';

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

export default function EditProfileScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/api/v1/users/me/profile');
        setFullName(data.full_name || '');
        setDateOfBirth(data.date_of_birth || '');
        setGender(data.gender || 'Prefer not to say');
        setEmail(data.email || '');
        setPhone(data.phone_number || '');
      } catch {
        // form stays empty; user can still fill in and save
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.patch('/api/v1/users/me/profile', {
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        gender,
        phone_number: phone || null,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={styles.saveLink}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <View style={styles.cameraBadge}>
            <Text style={{ fontSize: 14 }}>📷</Text>
          </View>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((option) => {
            const selected = option === gender;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.genderPill, selected && styles.genderPillSelected]}
                onPress={() => setGender(option)}
              >
                <Text style={[styles.genderLabel, selected && styles.genderLabelSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+1 (555) 123-4567"
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { fontSize: 20 },
  title: { ...typography.bodyBold, fontSize: 16 },
  saveLink: { ...typography.bodyBold, fontSize: 14, color: colors.tealPrimary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  avatarBlock: { alignItems: 'center', marginBottom: spacing.lg },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: '38%',
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.tealPrimary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white,
  },
  label: { ...typography.bodyBold, fontSize: 13, color: colors.textSecondary, marginBottom: 6, marginTop: spacing.md },
  input: {
    backgroundColor: colors.background, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12, ...typography.body,
  },
  inputDisabled: { color: colors.textMuted },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderPill: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
  },
  genderPillSelected: { borderColor: colors.tealPrimary, backgroundColor: colors.tealSoft },
  genderLabel: { ...typography.body, fontSize: 13, color: colors.textSecondary },
  genderLabelSelected: { color: colors.tealPrimary, fontWeight: '700' },
  saveButton: {
    backgroundColor: colors.tealPrimary, borderRadius: radius.lg,
    alignItems: 'center', paddingVertical: 16, marginTop: spacing.xl,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.white, ...typography.bodyBold, fontSize: 16 },
});
