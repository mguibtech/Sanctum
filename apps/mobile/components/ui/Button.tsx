import React from 'react';
import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const theme = useTheme<Theme>();

  const palette = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textColor: theme.colors.white,
    },
    secondary: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.primary,
      textColor: theme.colors.primary,
    },
    tertiary: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      textColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.transparent,
      textColor: theme.colors.textMuted,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
      textColor: theme.colors.white,
    },
  }[variant];

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadii.sm,
      minHeight: 40,
    },
    md: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadii.sm,
      minHeight: 48,
    },
    lg: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadii.md,
      minHeight: 56,
    },
  }[size];

  const borderWidth = variant === 'secondary' ? 2 : 1;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          borderWidth,
          borderRadius: sizeStyles.borderRadius,
          minHeight: sizeStyles.minHeight,
          opacity: disabled || loading ? 0.6 : pressed ? 0.8 : 1,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : typeof children === 'string' ? (
        <Text style={{ color: palette.textColor, fontWeight: '600' }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
