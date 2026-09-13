import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export function ProgressBar({ progress, trackColor = 'rgba(255,255,255,0.25)', fillColor = colors.white }: {
  progress: number; // 0..1
  trackColor?: string;
  fillColor?: string;
}) {
  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

export function StepDots({ total, activeIndex, activeColor = colors.tealAccent, inactiveColor = colors.border }: {
  total: number;
  activeIndex: number;
  activeColor?: string;
  inactiveColor?: string;
}) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === activeIndex ? activeColor : inactiveColor },
            i === activeIndex && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: radius.pill, width: '100%', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 20 },
});
