import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { PrimaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';
import { registerUser, login } from '../../api/endpoints';

export default function CreateAccountScreen({ navigation, route }: any) {
  const role = route?.params?.role ?? 'patient';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState(''); // MM/DD/YYYY as typed on the design
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Missing info', 'Please fill in your name, email, and password.');
      return;
    }
    setLoading(true);
    try {
      const isoDob = toIsoDate(dob); // convert MM/DD/YYYY -> YYYY-MM-DD
      await registerUser({ full_name: fullName, email, password, date_of_birth: isoDob, role });
      await login(email, password);
      const target = role === 'physician' ? 'PhysicianHome' : 'HealthProfileStep1';
      navigation.reset({ index: 0, routes: [{ name: target }] });
    } catch (err: any) {
      Alert.alert('Could not create account', err?.response?.data?.detail ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <GradientHeader rounded style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your diabetes management journey</Text>
        </GradientHeader>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label="Full Name">
            <TextInput style={styles.input} placeholder="John Doe" value={fullName} onChangeText={setFullName} />
          </Field>

          <Field label="Email Address">
            <TextInput
              style={styles.input}
              placeholder="john.doe@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </Field>

          <Field label="Password">
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
                <Text>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </Field>

          <Field label="Date of Birth">
            <TextInput style={styles.input} placeholder="MM/DD/YYYY" value={dob} onChangeText={setDob} />
          </Field>

          <View style={{ height: spacing.lg }} />
          <PrimaryButton label="Create Account" onPress={handleCreateAccount} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.signInRow}>
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function toIsoDate(mmddyyyy: string): string | undefined {
  const parts = mmddyyyy.split('/');
  if (parts.length !== 3) return undefined;
  const [mm, dd, yyyy] = parts;
  if (!mm || !dd || !yyyy) return undefined;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  title: { ...typography.h1, color: colors.white },
  subtitle: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md,
    paddingVertical: 14, ...typography.body, color: colors.textPrimary,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.sm },
  eyeButton: { paddingHorizontal: spacing.md },
  signInRow: { alignItems: 'center', marginTop: spacing.md },
  signInText: { ...typography.body, color: colors.textSecondary },
  signInLink: { color: colors.tealPrimary, fontWeight: '700' },
});
