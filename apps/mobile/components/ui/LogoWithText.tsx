import React from 'react';
import { View } from 'react-native';
import { Logo } from './Logo';
import { Text } from './Text';

export type LogoWithTextProps = {
  size?: number;
  variant?: 'primary' | 'accent' | 'white';
  showText?: boolean;
  textSize?: number;
};

export function LogoWithText({
  size = 48,
  variant = 'accent',
  showText = true,
  textSize = 24,
}: LogoWithTextProps) {
  const textVariantColor =
    variant === 'white'
      ? 'white'
      : variant === 'primary'
        ? 'primary'
        : 'accent';

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Logo size={size} variant={variant} />
      {showText && (
        <Text
          color={textVariantColor}
          style={{ letterSpacing: 2, fontWeight: '700', fontSize: textSize }}
        >
          SANCTUM
        </Text>
      )}
    </View>
  );
}
