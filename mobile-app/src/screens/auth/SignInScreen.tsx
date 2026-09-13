import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';
import { login } from '../../api/endpoints';
import { useAuth } from '../../store/AuthContext';

export default function SignInScreen({ navigation }: any) {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      const me = await refreshUser();
      const target = me?.role === 'physician' ? 'PhysicianHome' : 'HomeDashboard';
      navigation.reset({ index: 0, routes: [{ name: target }] });
    } catch (err: any) {
      Alert.alert('Sign in failed', err?.response?.data?.detail ?? 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <GradientHeader rounded style={styles.header}>
          <Text style={styles.wave}>👋</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </GradientHeader>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={{ height: spacing.xl }} />
          <PrimaryButton label="Sign In" onPress={handleSignIn} loading={loading} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <SecondaryButton label="🔒  Biometric Sign In" onPress={() => Alert.alert('Biometric sign-in coming soon')} />

          <TouchableOpacity onPress={() => navigation.navigate('CreateAccount', { role: 'patient' })} style={styles.signUpRow}>
            <Text style={styles.signUpText}>
              New user? <Text style={styles.signUpLink}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  wave: { fontSize: 28, marginBottom: spacing.xs },
  title: { ...typography.h1, color: colors.white },
  subtitle: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 6, marginTop: spacing.md },
  input: {
    backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md,
    paddingVertical: 14, ...typography.body,
  },
  forgotRow: { alignItems: 'flex-end', marginTop: spacing.sm },
  forgotText: { color: colors.tealPrimary, ...typography.bodyBold, fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.sm, color: colors.textMuted, ...typography.caption },
  signUpRow: { alignItems: 'center', marginTop: spacing.md },
  signUpText: { ...typography.body, color: colors.textSecondary },
  signUpLink: { color: colors.tealPrimary, fontWeight: '700' },
});
