import React from 'react';
import { useTheme } from '@shopify/restyle';
import { View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Text } from './Text';
import { Box } from './Box';

export type LogoProps = {
  size?: number;
  variant?: 'primary' | 'accent' | 'white';
};

/**
 * Logo do Sanctum - S com chama
 *
 * Nota: Versão simplificada sem SVG por enquanto.
 * Para versão SVG, instale react-native-svg: npm install react-native-svg
 *
 * Depois, gere os assets:
 * - icon.png (512x512)
 * - adaptive-icon.png (108x108)
 * - splash.png
 */
export function Logo({ size = 64, variant = 'accent' }: LogoProps) {
  const theme = useTheme<Theme>();

  const getColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'white':
        return theme.colors.white;
      case 'accent':
      default:
        return theme.colors.accent;
    }
  };

  const color = getColor();
  const fontSize = size / 2;

  // Versão simplificada usando "S" estilizado
  return (
    <Box
      width={size}
      height={size}
      borderRadius="md"
      alignItems="center"
      justifyContent="center"
      style={{
        backgroundColor: variant === 'white' ? theme.colors.primary : 'transparent',
      }}
    >
      <Text
        style={{
          fontSize,
          color,
          fontWeight: '800',
          letterSpacing: 2,
        }}
      >
        S
      </Text>
    </Box>
  );
}
