import React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import theme from '../../constants/theme';

// ─── Caixa pulsante base ──────────────────────────────────────────────────────

type SkeletonBoxProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonBoxProps) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: theme.colors.surfaceMuted },
        { opacity: pulse },
        style,
      ]}
    />
  );
}

// ─── Skeleton da Home ─────────────────────────────────────────────────────────

export function HomeScreenSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.primary, padding: theme.spacing.lg, gap: theme.spacing.md }}>
      {/* Hero card */}
      <SkeletonBox height={140} borderRadius={16} style={{ backgroundColor: 'rgba(255,255,255,0.09)' }} />
      {/* Atalhos */}
      <SkeletonBox height={60} borderRadius={12} style={{ backgroundColor: 'rgba(255,255,255,0.07)', marginTop: 8 }} />
      <SkeletonBox height={60} borderRadius={12} style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <SkeletonBox height={60} borderRadius={12} style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
      {/* Liturgia card */}
      <SkeletonBox height={120} borderRadius={16} style={{ backgroundColor: 'rgba(255,255,255,0.07)', marginTop: 8 }} />
    </View>
  );
}

// ─── Skeleton do Perfil ───────────────────────────────────────────────────────

export function ProfileScreenSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: theme.colors.primary, padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md }}>
        <SkeletonBox width={72} height={72} borderRadius={36} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <SkeletonBox width="50%" height={18} borderRadius={9} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <SkeletonBox width="35%" height={14} borderRadius={7} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </View>
      {/* Stats */}
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <SkeletonBox height={80} borderRadius={12} />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <SkeletonBox height={70} borderRadius={10} style={{ flex: 1 }} />
          <SkeletonBox height={70} borderRadius={10} style={{ flex: 1 }} />
          <SkeletonBox height={70} borderRadius={10} style={{ flex: 1 }} />
          <SkeletonBox height={70} borderRadius={10} style={{ flex: 1 }} />
        </View>
        <SkeletonBox height={100} borderRadius={12} />
        <SkeletonBox height={160} borderRadius={12} />
      </View>
    </View>
  );
}

// ─── Skeleton da Bíblia ───────────────────────────────────────────────────────

export function BibleScreenSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SkeletonBox height={90} borderRadius={0} />
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {[0, 1, 2].map((i) => <SkeletonBox key={i} height={76} borderRadius={10} style={{ flex: 1 }} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {[0, 1, 2].map((i) => <SkeletonBox key={i} height={76} borderRadius={10} style={{ flex: 1 }} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {[0, 1, 2].map((i) => <SkeletonBox key={i} height={76} borderRadius={10} style={{ flex: 1 }} />)}
        </View>
      </View>
    </View>
  );
}
