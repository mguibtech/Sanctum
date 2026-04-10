import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Box, Button, Icon, Screen, Text, XpToast } from '../components/ui';
import theme from '../constants/theme';
import { useAppAlert } from '../hooks/useAppAlert';
import { useRoutines } from '../hooks/useRoutines';
import { useState } from 'react';

export default function RoutinesScreen() {
  const { routines, loading, submitting, refresh, createFromTemplate, completeRoutine } = useRoutines();
  const { showSuccess } = useAppAlert();
  const [xpToast, setXpToast] = useState({
    xpGained: 0,
    leveledUp: false,
    newLevelName: null as string | null,
    visible: false,
  });

  const handleCreate = async (key: 'morning' | 'night' | 'rosary') => {
    try {
      await createFromTemplate(key);
      showSuccess('Rotina criada', 'Sua rotina ja esta pronta para uso.');
    } catch {
      // falha silenciosa por enquanto
    }
  };

  const handleComplete = async (routineId: string) => {
    try {
      const result = await completeRoutine(routineId);
      const session = result?.session;
      if (session) {
        showSuccess('Rotina concluida', 'Seu resumo diario foi atualizado.');
      }
      if (session?.xpGranted) {
        setXpToast({
          xpGained: session.xpGranted,
          leveledUp: false,
          newLevelName: null,
          visible: true,
        });
      }
    } catch {
      // falha silenciosa por enquanto
    }
  };

  return (
    <Screen backgroundColor="background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Rotinas',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <Box style={styles.heroCard}>
          <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
            <Box style={styles.heroIcon}>
              <Icon name="calendar-clock-outline" size={18} color="accent" />
            </Box>
            <Text variant="overline" color="accentLight">
              Hito diario
            </Text>
          </Box>
          <Text variant="heading" color="white" mb="xs">
            Rotinas para sustentar constancia
          </Text>
          <Text variant="muted" color="white" opacity={0.7}>
            Monte um fluxo simples de oracao e conclua com um toque.
          </Text>
        </Box>

        {routines.length === 0 && (
          <Box style={styles.sectionCard}>
            <Text variant="subheading" color="primary" mb="sm">
              Comece com um modelo
            </Text>
            <Text variant="muted" color="textMuted" mb="md">
              Crie uma rotina inicial e ajuste depois, quando o editor estiver mais completo.
            </Text>
            <Box gap="sm">
              <Button loading={submitting} onPress={() => handleCreate('morning')}>
                Rotina da manha
              </Button>
              <Button variant="secondary" loading={submitting} onPress={() => handleCreate('night')}>
                Rotina da noite
              </Button>
              <Button variant="tertiary" loading={submitting} onPress={() => handleCreate('rosary')}>
                Rotina mariana
              </Button>
            </Box>
          </Box>
        )}

        {routines.length > 0 && (
          <Box gap="md">
            {/* Minhas Rotinas Header */}
            <Box flexDirection="row" alignItems="center" gap="md" px="sm">
              <Icon name="list-box-outline" size={24} color="primary" />
              <Text variant="heading" color="primary">
                Minhas Rotinas
              </Text>
            </Box>

            {/* Rotinas List */}
            {routines.map((routine) => (
              <Box key={routine.id} style={styles.sectionCard}>
                {/* Header da Rotina */}
                <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between" mb="md">
                  <Box flex={1}>
                    <Box flexDirection="row" alignItems="center" gap="xs" mb="xs">
                      <Icon
                        name={
                          routine.name.toLowerCase().includes('manha')
                            ? 'sun'
                            : routine.name.toLowerCase().includes('noite')
                              ? 'moon'
                              : 'lotus'
                        }
                        size={20}
                        color="accent"
                      />
                      <Text variant="subheading" color="primary">
                        {routine.name}
                      </Text>
                    </Box>
                    {routine.description ? (
                      <Text variant="caption" color="textMuted">
                        {routine.description}
                      </Text>
                    ) : null}
                  </Box>
                  <Box style={styles.minutePill}>
                    <Icon name="clock-outline" size={13} color="accent" />
                    <Text variant="caption" color="accent" ml="xs">
                      {routine.estimatedMinutes || 0}m
                    </Text>
                  </Box>
                </Box>

                {/* Items da Rotina */}
                {routine.items.length > 0 && (
                  <Box
                    style={styles.itemsContainer}
                    mb="md"
                    p="md"
                    borderRadius="md"
                    gap="sm"
                  >
                    {routine.items.map((item, index) => (
                      <Box key={item.id} flexDirection="row" alignItems="center" gap="sm">
                        <Box
                          width={24}
                          height={24}
                          borderRadius="full"
                          alignItems="center"
                          justifyContent="center"
                          style={{ backgroundColor: theme.colors.accentMuted }}
                        >
                          <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>
                            {index + 1}
                          </Text>
                        </Box>
                        <Box flex={1}>
                          <Text variant="body" color="text">
                            {item.title}
                          </Text>
                          <Text variant="caption" color="textMuted">
                            {item.itemType} • {item.estimatedMinutes || 0} min
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Actions */}
                <Box gap="sm">
                  <Button loading={submitting} onPress={() => handleComplete(routine.id)}>
                    Concluir Rotina
                  </Button>
                  <Box flexDirection="row" gap="sm">
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      activeOpacity={0.6}
                    >
                      <Icon name="pencil-outline" size={18} color="accent" />
                      <Text variant="body" color="accent" ml="xs">
                        Editar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      activeOpacity={0.6}
                    >
                      <Icon name="trash-can-outline" size={18} color="error" />
                      <Text variant="body" color="error" ml="xs">
                        Deletar
                      </Text>
                    </TouchableOpacity>
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Adicionar mais rotinas */}
            <Box style={styles.sectionCard} gap="md">
              <Box>
                <Text variant="subheading" color="primary" mb="xs">
                  Adicionar outra rotina
                </Text>
                <Text variant="caption" color="textMuted">
                  Crie mais rotinas baseadas em templates
                </Text>
              </Box>
              <Box gap="sm">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={submitting}
                  onPress={() => handleCreate('morning')}
                >
                  + Rotina da Manhã
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={submitting}
                  onPress={() => handleCreate('night')}
                >
                  + Rotina da Noite
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={submitting}
                  onPress={() => handleCreate('rosary')}
                >
                  + Rotina Mariana
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </ScrollView>

      <XpToast
        xpGained={xpToast.xpGained}
        leveledUp={xpToast.leveledUp}
        newLevelName={xpToast.newLevelName}
        visible={xpToast.visible}
        onHide={() => setXpToast((prev) => ({ ...prev, visible: false }))}
      />
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
  minutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.accentMuted,
  },
  itemsContainer: {
    backgroundColor: theme.colors.backgroundSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadii.sm,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.accent,
  },
  deleteButton: {
    backgroundColor: theme.colors.errorLight,
    borderColor: theme.colors.error,
  },
});
