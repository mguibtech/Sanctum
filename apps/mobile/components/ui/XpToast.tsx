import React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import theme from '../../constants/theme';

type XpToastProps = {
  xpGained: number;
  leveledUp?: boolean;
  newLevelName?: string | null;
  visible: boolean;
  onHide?: () => void;
};

export function XpToast({ xpGained, leveledUp, newLevelName, visible, onHide }: XpToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        onHide?.();
        translateY.setValue(20);
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Animated.Text style={styles.xpText}>+{xpGained} XP</Animated.Text>
      {leveledUp && newLevelName && (
        <Animated.Text style={styles.levelText}>
          Nível novo — {newLevelName}!
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    zIndex: 999,
  },
  xpText: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.9,
  },
});
