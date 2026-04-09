import { useState } from 'react';
import { useTheme } from '@shopify/restyle';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Box } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  dark?: boolean;
  leftIconName?: string;
};

export function TextField({
  label,
  error,
  dark = false,
  leftIconName,
  multiline,
  style,
  secureTextEntry = false,
  ...props
}: TextFieldProps) {
  const theme = useTheme<Theme>();
  const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry);
  const textColor = dark ? theme.colors.white : theme.colors.text;
  const mutedColor = dark ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted;
  const backgroundColor = dark ? 'rgba(255,255,255,0.12)' : theme.colors.surface;
  const borderColor = error
    ? theme.colors.error
    : dark
      ? 'rgba(255,255,255,0.2)'
      : theme.colors.border;
  const isPasswordField = secureTextEntry;
  const iconColor = dark ? 'accentLight' : 'textMuted';

  return (
    <Box>
      {label ? (
        <Text variant="caption" color={dark ? 'accentLight' : 'textMuted'} mb="xs">
          {label}
        </Text>
      ) : null}
      <View style={styles.fieldWrapper}>
        {leftIconName ? (
          <View style={styles.leftIcon}>
            <Icon name={leftIconName} size={20} color={iconColor} />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={mutedColor}
          multiline={multiline}
          secureTextEntry={isPasswordField ? isPasswordHidden : secureTextEntry}
          style={[
            styles.inputBase,
            {
              backgroundColor,
              borderColor,
              borderRadius: theme.borderRadii.md,
              color: textColor,
              minHeight: multiline ? 120 : undefined,
              padding: theme.spacing.md,
              paddingLeft: leftIconName ? 48 : theme.spacing.md,
              paddingRight: isPasswordField ? 56 : theme.spacing.md,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
          ]}
          {...props}
        />
        {isPasswordField ? (
          <Pressable
            accessibilityLabel={isPasswordHidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={8}
            onPress={() => setIsPasswordHidden((current) => !current)}
            style={styles.toggleButton}
          >
            <Icon
              name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={iconColor}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color="error" mt="xs">
          {error}
        </Text>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {
    justifyContent: 'center',
    position: 'relative',
  },
  inputBase: {
    borderWidth: 1,
    fontSize: 16,
  },
  leftIcon: {
    left: 16,
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 1,
  },
  toggleButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
});
