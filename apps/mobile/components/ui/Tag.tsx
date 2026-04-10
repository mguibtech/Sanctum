import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { Box } from './Box';

export type TagProps = {
  label: string;
  variant?: 'filled' | 'outlined' | 'subtle';
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  onRemove?: () => void;
  size?: 'sm' | 'md';
};

export function Tag({
  label,
  variant = 'filled',
  color = 'primary',
  onRemove,
  size = 'md',
}: TagProps) {
  const theme = useTheme<Theme>();

  const colorMap = {
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  const baseColor = colorMap[color];

  const styles_map = {
    filled: {
      backgroundColor: baseColor,
      borderColor: baseColor,
      textColor: theme.colors.white,
    },
    outlined: {
      backgroundColor: theme.colors.transparent,
      borderColor: baseColor,
      textColor: baseColor,
    },
    subtle: {
      backgroundColor: `${baseColor}15`,
      borderColor: theme.colors.transparent,
      textColor: baseColor,
    },
  };

  const style = styles_map[variant];
  const padding = size === 'sm' ? theme.spacing.xs : theme.spacing.sm;
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <Pressable
      style={[
        styles.tag,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          paddingHorizontal: padding + 8,
          paddingVertical: padding,
        },
      ]}
    >
      <Box flexDirection="row" alignItems="center" gap="xs">
        <Text
          style={{ color: style.textColor, fontSize, fontWeight: '600' }}
        >
          {label}
        </Text>

        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={4}>
            <Icon name="close" size={14} color={style.textColor as any} />
          </Pressable>
        )}
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
