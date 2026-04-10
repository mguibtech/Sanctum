import React from 'react';
import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Text } from './Text';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error';

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  const theme = useTheme<Theme>();

  const palette = {
    primary: {
      backgroundColor: theme.colors.primary,
      textColor: theme.colors.white,
    },
    accent: {
      backgroundColor: theme.colors.accent,
      textColor: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.success,
      textColor: theme.colors.white,
    },
    warning: {
      backgroundColor: theme.colors.warning,
      textColor: theme.colors.white,
    },
    error: {
      backgroundColor: theme.colors.error,
      textColor: theme.colors.white,
    },
  }[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.backgroundColor,
        },
      ]}
    >
      <Text
        style={{ color: palette.textColor, fontWeight: '600', fontSize: 11 }}
      >
        {typeof children === 'string' ? children.toUpperCase() : children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
});
