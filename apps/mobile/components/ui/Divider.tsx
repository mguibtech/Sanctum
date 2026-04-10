import React from 'react';
import { useTheme } from '@shopify/restyle';
import { StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';

export type DividerProps = {
  variant?: 'default' | 'muted';
  marginVertical?: number | 'sm' | 'md' | 'lg';
};

export function Divider({ variant = 'default', marginVertical = 'md' }: DividerProps) {
  const theme = useTheme<Theme>();

  const marginValue =
    typeof marginVertical === 'number'
      ? marginVertical
      : {
          sm: theme.spacing.sm,
          md: theme.spacing.md,
          lg: theme.spacing.lg,
        }[marginVertical];

  const borderColor = variant === 'muted' ? theme.colors.borderLight : theme.colors.border;

  return (
    <View
      style={[
        styles.divider,
        {
          marginVertical: marginValue,
          borderColor,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 1,
    width: '100%',
  },
});
