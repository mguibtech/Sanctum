import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Theme } from '../../constants/theme';
import { Box } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';

export type ActionCardProps = {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  backgroundColor?: string;
  iconBackgroundColor?: string;
  isDark?: boolean;
};

export function ActionCard({
  title,
  subtitle,
  icon,
  onPress,
  backgroundColor,
  iconBackgroundColor,
  isDark = true,
}: ActionCardProps) {
  const theme = useTheme<Theme>();

  const bg = backgroundColor || theme.colors.primary;
  const iconBg = iconBackgroundColor || 'rgba(200,164,90,0.18)';
  const textColor = isDark ? '#fff' : theme.colors.primary;
  const subtitleColor = isDark ? 'rgba(255,255,255,0.65)' : theme.colors.textMuted;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          style={[
            styles.card,
            {
              backgroundColor: bg,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
          flexDirection="row"
          alignItems="center"
          gap="md"
        >
          <Box
            width={44}
            height={44}
            borderRadius="md"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon
              name={icon}
              size={22}
              color={isDark ? 'accentLight' : 'primary'}
            />
          </Box>

          <Box flex={1}>
            <Text style={{ color: textColor, fontWeight: '600' }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{ color: subtitleColor, marginTop: 2, fontSize: 11 }}>
                {subtitle}
              </Text>
            )}
          </Box>

          <Icon
            name="chevron-right"
            size={20}
            color={isDark ? 'accentLight' : 'textMuted'}
          />
        </Box>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
