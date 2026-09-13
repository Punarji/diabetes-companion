import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.85}
          >
            <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  pillSelected: { backgroundColor: colors.tealPrimary, borderColor: colors.tealPrimary },
  pillLabel: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  pillLabelSelected: { color: colors.white },
});
