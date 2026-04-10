import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Box, Button, Icon, Screen, Text } from '../components/ui';
import theme from '../constants/theme';
import { useAppAlert } from '../hooks/useAppAlert';
import { useReminders, formatDaysOfWeek } from '../hooks/useReminders';

function getTimeIcon(hour: number) {
  if (hour < 12) return 'sun';
  if (hour < 17) return 'weather-partly-cloudy';
  return 'moon';
}

export default function RemindersScreen() {
  const { reminders, loading, submitting, refresh, remove, toggle } = useReminders();
  const { showSuccess, showError } = useAppAlert();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      showSuccess('Lembrete deletado', 'Seu lembrete foi removido.');
    } catch {
      showError('Erro', 'Nao foi possivel deletar o lembrete.');
    }
  };

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await toggle(id, isEnabled);
      showSuccess(
        isEnabled ? 'Desativado' : 'Ativado',
        isEnabled ? 'Lembrete desativado.' : 'Lembrete ativado.',
      );
    } catch {
      showError('Erro', 'Nao foi possivel atualizar o lembrete.');
    }
  };

  return (
    <Screen backgroundColor="background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Lembretes',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/reminders/create')}
              style={{ marginRight: theme.spacing.md }}
              hitSlop={8}
            >
              <Icon name="plus-circle-outline" size={24} color="accent" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >
        <Box style={styles.heroCard}>
          <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
            <Box style={styles.heroIcon}>
              <Icon name="bell-outline" size={18} color="accent" />
            </Box>
            <Text variant="overline" color="accentLight">
              Notificacoes
            </Text>
          </Box>
          <Text variant="heading" color="white" mb="xs">
            Lembretes personalizados
          </Text>
          <Text variant="muted" color="white" opacity={0.7}>
            Configure quando deseja ser lembrado de rezar.
          </Text>
        </Box>

        {reminders.length === 0 ? (
          <Box style={styles.sectionCard}>
            <Box alignItems="center" py="xl">
              <Icon name="bell-off-outline" size={48} color="textMuted" />
              <Text variant="subheading" color="textMuted" mt="md" mb="sm">
                Nenhum lembrete
              </Text>
              <Text variant="caption" color="textMuted" mb="lg" style={{ textAlign: 'center' }}>
                Crie seu primeiro lembrete para receber notificacoes diarias.
              </Text>
              <Button size="sm" onPress={() => router.push('/reminders/create')}>
                Criar Lembrete
              </Button>
            </Box>
          </Box>
        ) : (
          <Box gap="md">
            {reminders.map((reminder) => {
              const hour = parseInt(reminder.timeOfDay.split(':')[0], 10);
              const isExpanded = expandedId === reminder.id;

              return (
                <TouchableOpacity
                  key={reminder.id}
                  onPress={() => setExpandedId(isExpanded ? null : reminder.id)}
                  activeOpacity={0.7}
                >
                  <Box style={[styles.reminderCard, !reminder.isEnabled && styles.reminderCardDisabled]}>
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb={isExpanded ? 'md' : undefined}>
                      <Box flex={1} flexDirection="row" alignItems="center" gap="md">
                        <Box
                          width={44}
                          height={44}
                          borderRadius="md"
                          alignItems="center"
                          justifyContent="center"
                          style={{
                            backgroundColor: reminder.isEnabled
                              ? theme.colors.accentMuted
                              : theme.colors.border,
                          }}
                        >
                          <Icon
                            name={getTimeIcon(hour)}
                            size={20}
                            color={reminder.isEnabled ? 'accent' : 'textMuted'}
                          />
                        </Box>

                        <Box flex={1}>
                          <Text
                            variant="bodyStrong"
                            color={reminder.isEnabled ? 'primary' : 'textMuted'}
                            numberOfLines={1}
                          >
                            {reminder.title}
                          </Text>
                          <Text variant="caption" color="textMuted" numberOfLines={1}>
                            {reminder.timeOfDay} • {formatDaysOfWeek(reminder.daysOfWeek)}
                          </Text>
                        </Box>
                      </Box>

                      <Switch
                        value={reminder.isEnabled}
                        onValueChange={() => handleToggle(reminder.id, reminder.isEnabled)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
                        thumbColor={reminder.isEnabled ? theme.colors.accent : theme.colors.textMuted}
                      />
                    </Box>

                    {isExpanded && (
                      <View style={{ paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                        <Box mb="md">
                          <Text variant="caption" color="textMuted" mb="xs">
                            Frequencia
                          </Text>
                          <Text variant="body" color="text">
                            {formatDaysOfWeek(reminder.daysOfWeek)}
                          </Text>
                        </Box>

                        {reminder.routineId && (
                          <Box mb="md">
                            <Text variant="caption" color="textMuted" mb="xs">
                              Rotina vinculada
                            </Text>
                            <Text variant="body" color="text">
                              ID: {reminder.routineId}
                            </Text>
                          </Box>
                        )}

                        <Box flexDirection="row" gap="sm">
                          <Box flex={1}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onPress={() => router.push(`/reminders/${reminder.id}/edit`)}
                            >
                              Editar
                            </Button>
                          </Box>
                          <Box flex={1}>
                            <Button
                              variant="tertiary"
                              size="sm"
                              loading={submitting}
                              onPress={() => handleDelete(reminder.id)}
                            >
                              Deletar
                            </Button>
                          </Box>
                        </Box>
                      </View>
                    )}
                  </Box>
                </TouchableOpacity>
              );
            })}
          </Box>
        )}

        {reminders.length > 0 && (
          <Box mt="lg">
            <Button variant="secondary" onPress={() => router.push('/reminders/create')}>
              + Adicionar lembrete
            </Button>
          </Box>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  heroCard: {
    backgroundColor: theme.colors.cardBlue,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
  },
  heroIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderCardDisabled: {
    opacity: 0.6,
  },
});
