import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { colors, spacing, typography, radius } from '../../theme';
import { forgotPassword } from '../../api/endpoints';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert('Check your inbox', 'If that email exists, a reset link has been sent.', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') },
      ]);
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Forgot Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.center}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.description}>Enter your email and we will send you a reset link.</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <PrimaryButton label="Send Reset Link" onPress={handleSend} loading={loading} style={{ width: '100%' }} />

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={{ marginTop: spacing.md }}>
          <Text style={styles.backToLogin}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  back: { fontSize: 20 },
  topTitle: { ...typography.bodyBold, fontSize: 16 },
  center: { alignItems: 'center', paddingTop: spacing.xl },
  lockEmoji: { fontSize: 44, marginBottom: spacing.md },
  title: { ...typography.h1, textAlign: 'center' },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  field: { width: '100%', marginBottom: spacing.lg },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 14, ...typography.body },
  backToLogin: { color: colors.tealPrimary, ...typography.bodyBold },
});
