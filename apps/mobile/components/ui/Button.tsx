import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      textVariant: 'buttonPrimary' as const,
    },
    secondary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textVariant: 'buttonInverse' as const,
    },
    outline: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.border,
      textVariant: 'bodyStrong' as const,
    },
    ghost: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.transparent,
      textVariant: 'muted' as const,
    },
    danger: {
      backgroundColor: theme.colors.errorLight,
      borderColor: theme.colors.error,
      textVariant: 'muted' as const,
    },
  }[variant];

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadii.sm,
      minHeight: 36,
    },
    md: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadii.md,
      minHeight: 48,
    },
    lg: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadii.lg,
      minHeight: 56,
    },
  }[size];

  const indicatorColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.white
        : theme.colors.accent;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          borderRadius: sizeStyles.borderRadius,
          minHeight: sizeStyles.minHeight,
          opacity: pressed || disabled || loading ? 0.72 : 1,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : typeof children === 'string' ? (
        <Text variant={palette.textVariant}>{children}</Text>
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
