import React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = ['#C8A45A', '#58C98B', '#5882C9', '#E879A0', '#FF9C30', '#A07DE8', '#4DD9D9', '#E8C458'];
const COUNT = 38;

type Particle = {
  id: number;
  x: number;
  y: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  color: string;
  size: number;
  isCircle: boolean;
};

function makeParticles(): Particle[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: new Animated.Value(-20),
    opacity: new Animated.Value(1),
    rotate: new Animated.Value(0),
    color: COLORS[i % COLORS.length],
    size: 5 + Math.floor(Math.random() * 9),
    isCircle: Math.random() > 0.5,
  }));
}

type ConfettiOverlayProps = {
  visible: boolean;
  onHide?: () => void;
};

export function ConfettiOverlay({ visible, onHide }: ConfettiOverlayProps) {
  const particles = useRef<Particle[]>(makeParticles());
  const running = useRef(false);

  useEffect(() => {
    if (!visible) return;
    if (running.current) return;
    running.current = true;

    // Reset
    particles.current.forEach((p) => {
      p.y.setValue(-20);
      p.opacity.setValue(1);
      p.rotate.setValue(0);
    });

    const anims = particles.current.map((p, i) => {
      const delay = (i % 14) * 40;
      const duration = 1700 + Math.random() * 900;
      return Animated.parallel([
        Animated.timing(p.y, {
          toValue: H + 40,
          duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(delay + duration * 0.5),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: duration * 0.5,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.rotate, {
          toValue: 8,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(anims).start(() => {
      running.current = false;
      onHide?.();
    });

    // Safety timeout
    const timer = setTimeout(() => {
      running.current = false;
      onHide?.();
    }, 3200);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.current.map((p) => (
        <Animated.View
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: p.isCircle ? p.size / 2 : p.size / 4,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [
              { translateY: p.y },
              {
                rotate: p.rotate.interpolate({
                  inputRange: [0, 8],
                  outputRange: ['0deg', '2880deg'],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
