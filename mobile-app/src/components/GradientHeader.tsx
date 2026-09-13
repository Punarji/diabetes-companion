import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // swap for react-native-linear-gradient if not using Expo
import { colors, radius } from '../theme';

export function GradientHeader({
  children,
  style,
  rounded = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  rounded?: boolean;
}) {
  return (
    <LinearGradient
      colors={[colors.navyDark, colors.tealPrimary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.gradient, rounded && styles.rounded, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  rounded: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
});
