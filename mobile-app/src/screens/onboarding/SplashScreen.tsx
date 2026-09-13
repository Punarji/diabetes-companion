import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { StepDots } from '../../components/Progress';
import { colors, spacing, typography } from '../../theme';

export default function SplashScreen({ navigation }: any) {
  return (
    <GradientHeader>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>🩺</Text>
          </View>
          <Text style={styles.title}>T2DM Companion</Text>
          <Text style={styles.subtitle}>Your AI diabetes{'\n'}management partner</Text>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            label="Get Started"
            onPress={() => navigation.navigate('OnboardingCarousel')}
            style={styles.whiteButton}
            labelStyle={{ color: colors.tealPrimary }}
          />
          <SecondaryButton
            label="I already have an account"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.outlineOnDark}
          />
          <View style={{ height: spacing.md }} />
          <StepDots total={3} activeIndex={0} activeColor={colors.white} inactiveColor="rgba(255,255,255,0.35)" />
        </View>
      </SafeAreaView>
    </GradientHeader>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBox: {
    width: 84, height: 84, borderRadius: 22, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  iconEmoji: { fontSize: 40 },
  title: { ...typography.h1, color: colors.white, fontSize: 28 },
  subtitle: { ...typography.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: spacing.sm },
  bottom: { gap: spacing.sm },
  whiteButton: { backgroundColor: colors.white },
  outlineOnDark: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.6)' },
});
