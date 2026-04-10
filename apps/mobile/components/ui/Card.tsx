import React from 'react';
import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';

type CardVariant = 'default' | 'elevated' | 'inset';

export type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: number | 'sm' | 'md' | 'lg';
  onPress?: () => void;
};

export function Card({ children, variant = 'default', padding = 'md', onPress }: CardProps) {
  const theme = useTheme<Theme>();

  const styles = getCardStyles(theme, variant);

  const paddingValue =
    typeof padding === 'number'
      ? padding
      : {
          sm: theme.spacing.sm,
          md: theme.spacing.md,
          lg: theme.spacing.lg,
        }[padding];

  return (
    <View
      style={[
        styles.card,
        {
          padding: paddingValue,
        },
      ]}
    >
      {children}
    </View>
  );
}

function getCardStyles(theme: Theme, variant: CardVariant) {
  const baseStyle = {
    borderRadius: theme.borderRadii.md,
  };

  switch (variant) {
    case 'elevated':
      return StyleSheet.create({
        card: {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceElevated,
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        },
      });
    case 'inset':
      return StyleSheet.create({
        card: {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceMuted,
        },
      });
    default:
      return StyleSheet.create({
        card: {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
        },
      });
  }
}
