import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
};

export function Checkbox({ checked, onChange, label, disabled = false, error = false }: CheckboxProps) {
  const theme = useTheme<Theme>();

  const backgroundColor = disabled
    ? theme.colors.surfaceMuted
    : checked
      ? theme.colors.primary
      : theme.colors.surface;

  const borderColor = error
    ? theme.colors.error
    : disabled
      ? theme.colors.border
      : checked
        ? theme.colors.primary
        : theme.colors.border;

  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor,
            borderColor,
            borderWidth: 2,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {checked && <Icon name="check" size={16} color="white" />}
      </View>

      {label && (
        <Text
          variant="body"
          color={disabled ? 'textLight' : error ? 'error' : 'text'}
          style={{ fontWeight: '600' }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
