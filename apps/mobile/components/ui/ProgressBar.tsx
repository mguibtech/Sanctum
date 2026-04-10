import React from 'react';
import { useTheme } from '@shopify/restyle';
import { View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Text } from './Text';
import { Box } from './Box';

export type ProgressBarProps = {
  progress: number; // 0-100
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  animated?: boolean;
  height?: number;
};

export function ProgressBar({
  progress,
  variant = 'primary',
  showLabel = true,
  animated = true,
  height = 8,
}: ProgressBarProps) {
  const theme = useTheme<Theme>();

  const colors = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  const backgroundColor = colors[variant];
  const percentage = Math.max(0, Math.min(progress, 100));

  return (
    <Box gap="xs">
      <View
        style={{
          width: '100%',
          height,
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.borderRadii.pill,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor,
          }}
        />
      </View>

      {showLabel && (
        <Text variant="caption" color="textMuted" style={{ fontWeight: '600' }}>
          {Math.round(percentage)}%
        </Text>
      )}
    </Box>
  );
}
