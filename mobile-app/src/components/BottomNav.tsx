import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export type NavTab = {
  key: string;
  label: string;
  emoji: string;
};

export function BottomNav({
  tabs,
  activeKey,
  onSelect,
}: {
  tabs: NavTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onSelect(tab.key)}>
            <Text style={styles.emoji}>{tab.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            {active && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingBottom: 18,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  emoji: { fontSize: 20 },
  label: { ...typography.small, color: colors.textMuted },
  labelActive: { color: colors.tealPrimary, fontWeight: '700' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.tealPrimary, marginTop: 2 },
});
