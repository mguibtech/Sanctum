import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Box } from './Box';
import { Text } from './Text';
import theme from '../../constants/theme';

export type ActivityDay = {
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  contemplated: boolean;
  xpEarned: number;
};

type Props = {
  activity: ActivityDay[];
};

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function WeeklyActivityChart({ activity }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Box>
      <Box flexDirection="row" justifyContent="space-between">
        {activity.map((day) => {
          const isToday = day.date === today;
          const dotColor = day.contemplated
            ? theme.colors.primaryLight
            : day.completed
              ? '#64C478'
              : theme.colors.border;

          const dotDate = new Date(day.date + 'T12:00:00Z');
          const dayLabel = DAY_LABELS[dotDate.getUTCDay()];

          return (
            <Box key={day.date} alignItems="center" gap="xs">
              {/* Círculo */}
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dotColor },
                  isToday && styles.dotToday,
                ]}
              />
              {/* Label do dia */}
              <Text
                variant="caption"
                style={[
                  styles.dayLabel,
                  { color: isToday ? theme.colors.accent : theme.colors.textMuted },
                  isToday && { fontWeight: '700' },
                ]}
              >
                {dayLabel}
              </Text>
              {/* Indicador de XP */}
              {day.xpEarned > 0 && (
                <Text style={styles.xpLabel}>+{day.xpEarned}</Text>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Legenda */}
      <Box flexDirection="row" gap="md" mt="sm" justifyContent="center">
        <Box flexDirection="row" alignItems="center" gap="xs">
          <View style={[styles.legendDot, { backgroundColor: '#64C478' }]} />
          <Text variant="caption" color="textMuted">Lida</Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primaryLight }]} />
          <Text variant="caption" color="textMuted">Contemplada</Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <View style={[styles.legendDot, { backgroundColor: theme.colors.border }]} />
          <Text variant="caption" color="textMuted">Não realizada</Text>
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  dayLabel: {
    fontSize: 10,
  },
  xpLabel: {
    fontSize: 9,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
