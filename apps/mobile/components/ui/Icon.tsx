import React from 'react';
import { useTheme } from '@shopify/restyle';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Theme } from '../../constants/theme';

type IconColor = keyof Theme['colors'] | string;

export type IconProps = {
  name: string;
  size?: number;
  color?: IconColor;
};

export function Icon({ name, size = 20, color = 'textMuted' }: IconProps) {
  const theme = useTheme<Theme>();
  const resolvedColor =
    color in theme.colors ? theme.colors[color as keyof Theme['colors']] : color;

  return <MaterialCommunityIcons name={name} size={size} color={resolvedColor} />;
}
