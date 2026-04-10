import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Box, Icon, Text } from './index';
import theme from '../../constants/theme';

export type DayHistory = {
  date: string;
  completed: boolean;
  contemplated: boolean;
  xpEarned: number;
  sessionsCompleted?: number;
  minutesPrayed?: number;
};

type Props = {
  data: DayHistory[];
};

export function DailyHistoryCalendar({ data }: Props) {
  const getDayLabel = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    const today = new Date();
    const dayOfWeek = date.toLocaleString('pt-BR', { weekday: 'short' }).substring(0, 1);
    const dayOfMonth = date.getDate();

    // Detectar se é hoje
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    return { dayOfWeek, dayOfMonth, isToday };
  };

  const getActivityColor = (day: DayHistory): string => {
    if (!day.completed) return theme.colors.border;
    if (day.contemplated) return theme.colors.accent;
    return theme.colors.accentMuted;
  };

  const getActivityIcon = (day: DayHistory): string => {
    if (!day.completed) return 'circle-outline';
    if (day.contemplated) return 'check-circle';
    return 'circle';
  };

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <View>
      <Box flexDirection="row" justifyContent="space-between" gap="xs">
        {sortedData.map((day) => {
          const { dayOfWeek, dayOfMonth, isToday } = getDayLabel(day.date);
          const color = getActivityColor(day);
          const icon = getActivityIcon(day);

          return (
            <Box key={day.date} alignItems="center" style={{ flex: 1 }}>
              <Box
                width={50}
                height={56}
                borderRadius="md"
                alignItems="center"
                justifyContent="center"
                mb="xs"
                style={{
                  backgroundColor: isToday
                    ? 'rgba(200,164,90,0.1)'
                    : theme.colors.backgroundSoft,
                  borderWidth: isToday ? 2 : 1,
                  borderColor: isToday ? theme.colors.accent : theme.colors.border,
                }}
              >
                <Icon name={icon} size={24} color={color as any} />
              </Box>

              <Text variant="caption" color="textMuted" style={{ fontWeight: '600' }}>
                {dayOfWeek}
              </Text>
              <Text variant="caption" color="text" style={{ fontWeight: '700', marginTop: 2 }}>
                {dayOfMonth}
              </Text>

              {day.completed && (
                <Box mt="xs" alignItems="center">
                  {day.xpEarned > 0 && (
                    <Text variant="caption" color="accent" style={{ fontSize: 9, fontWeight: '600' }}>
                      +{day.xpEarned}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box mt="md" gap="sm">
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Icon name="check-circle" size={14} color="accent" />
          <Text variant="caption" color="text">
            Completo + contemplado
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Icon name="circle" size={14} color="accentMuted" />
          <Text variant="caption" color="text">
            Completo
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Icon name="circle-outline" size={14} color="textMuted" />
          <Text variant="caption" color="text">
            Nao completado
          </Text>
        </Box>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({});
