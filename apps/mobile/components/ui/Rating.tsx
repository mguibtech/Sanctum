import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Icon } from './Icon';
import { Box } from './Box';

export type RatingProps = {
  value: number; // 0-5
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  color?: 'accent' | 'warning' | 'error';
};

export function Rating({ value, onChange, size = 'md', readonly = false, color = 'accent' }: RatingProps) {
  const theme = useTheme<Theme>();

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32,
  }[size];

  const getColor = () => {
    if (color === 'warning') return theme.colors.warning;
    if (color === 'error') return theme.colors.error;
    return theme.colors.accent;
  };

  const colorValue = getColor();

  return (
    <Box flexDirection="row" gap="xs">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          disabled={readonly}
          style={{ opacity: readonly ? 0.7 : 1 }}
        >
          <Icon
            name={star <= value ? 'star' : 'star-outline'}
            size={iconSize}
            color={
              star <= value
                ? colorValue
                : theme.colors.textMuted
            }
          />
        </Pressable>
      ))}
    </Box>
  );
}
