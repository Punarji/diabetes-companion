import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
};

export function PrimaryButton({ label, onPress, loading, disabled, style, labelStyle }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.primary, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={labelStyle?.color as string || colors.white} />
      ) : (
        <Text style={[styles.primaryLabel, labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress, loading, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.secondary, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.tealPrimary} />
      ) : (
        <Text style={styles.secondaryLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.tealPrimary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: { color: colors.white, ...typography.bodyBold, fontSize: 16 },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.tealPrimary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: { color: colors.tealPrimary, ...typography.bodyBold, fontSize: 16 },
  disabled: { opacity: 0.5 },
});
