import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Box } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';
import theme from '../../constants/theme';
import type { WeeklyChallenge } from '../../hooks/useWeeklyChallenges';

type Props = {
  challenges: WeeklyChallenge[];
};

function msUntilNextMonday(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Dom .. 6=Sáb
  const daysUntilMonday = ((1 - day + 7) % 7) || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime() - now.getTime();
}

function formatCountdown(): string {
  const ms = msUntilNextMonday();
  const totalHours = Math.floor(ms / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export function WeeklyChallengesCard({ challenges }: Props) {
  if (!challenges.length) return null;

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <Box style={styles.card}>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box style={styles.iconBox}>
            <Icon name="flag-checkered" size={16} color="accent" />
          </Box>
          <Box>
            <Text variant="subheading" color="white">
              Desafios da Semana
            </Text>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {completedCount}/{challenges.length} concluídos
            </Text>
          </Box>
        </Box>
        <Box style={styles.countdownPill}>
          <Icon name="clock-outline" size={11} color="accentLight" />
          <Text variant="caption" color="accentLight" style={{ marginLeft: 3 }}>
            {formatCountdown()}
          </Text>
        </Box>
      </Box>

      {/* Lista de desafios */}
      <Box gap="sm">
        {challenges.map((challenge) => {
          const pct = Math.min(challenge.progress / challenge.goal, 1);
          return (
            <Box key={challenge.id} style={styles.challengeRow}>
              {/* Ícone */}
              <Box
                width={36}
                height={36}
                borderRadius="sm"
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: challenge.completed
                    ? 'rgba(100,196,120,0.2)'
                    : 'rgba(255,255,255,0.08)',
                }}
              >
                <Icon
                  name={challenge.completed ? 'check-circle' : challenge.icon}
                  size={18}
                  color={challenge.completed ? '#64C478' : 'accentLight'}
                />
              </Box>

              {/* Conteúdo */}
              <Box flex={1}>
                <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="xs">
                  <Text
                    variant="bodyStrong"
                    style={{
                      color: challenge.completed ? '#64C478' : '#fff',
                      fontSize: 13,
                    }}
                    numberOfLines={1}
                  >
                    {challenge.title}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}
                  >
                    {challenge.progress}/{challenge.goal}
                  </Text>
                </Box>

                {/* Barra de progresso */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct * 100}%`,
                        backgroundColor: challenge.completed ? '#64C478' : theme.colors.accent,
                      },
                    ]}
                  />
                </View>

                {/* Recompensa */}
                <Box flexDirection="row" alignItems="center" gap="xs" mt="xs">
                  <Text style={styles.rewardText}>+{challenge.xpReward} XP</Text>
                  {challenge.shieldReward && (
                    <>
                      <Text style={styles.rewardSep}>·</Text>
                      <Icon name="shield-check-outline" size={11} color="accent" />
                      <Text style={styles.rewardText}>Escudo</Text>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.2)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  challengeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  rewardText: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.85,
  },
  rewardSep: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
});
