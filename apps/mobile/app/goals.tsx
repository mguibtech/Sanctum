import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Box, Button, Icon, Screen, Text, TextField } from '../components/ui';
import theme from '../constants/theme';
import { useAppAlert } from '../hooks/useAppAlert';
import { useGoals, GOAL_SUGGESTIONS, getGoalLabel, getGoalUnit, GoalType } from '../hooks/useGoals';

export default function GoalsScreen() {
  const { goals, loading, submitting, refresh, create, remove } = useGoals();
  const { showSuccess, showError } = useAppAlert();
  const [expandedType, setExpandedType] = useState<GoalType | null>(null);
  const [newGoalValue, setNewGoalValue] = useState('');

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleCreateGoal = async (type: GoalType) => {
    const value = parseInt(newGoalValue, 10);

    if (!newGoalValue.trim() || isNaN(value) || value <= 0) {
      showError('Validacao', 'Digite um valor valido');
      return;
    }

    try {
      await create({ goalType: type, targetValue: value });
      showSuccess('Goal criada', `Sua meta de ${getGoalLabel(type)} foi adicionada.`);
      setNewGoalValue('');
      setExpandedType(null);
    } catch {
      showError('Erro', 'Nao foi possivel criar a meta.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      showSuccess('Meta deletada', 'Sua meta foi removida.');
    } catch {
      showError('Erro', 'Nao foi possivel deletar a meta.');
    }
  };

  const activeGoals = goals.filter((g) => g.isActive);
  const availableGoalTypes = GOAL_SUGGESTIONS.filter(
    (s) => !goals.some((g) => g.goalType === s.type),
  );

  return (
    <Screen backgroundColor="background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Metas',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
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
              <Icon name="target-outline" size={18} color="accent" />
            </Box>
            <Text variant="overline" color="accentLight">
              Objetivos
            </Text>
          </Box>
          <Text variant="heading" color="white" mb="xs">
            Defina suas metas
          </Text>
          <Text variant="muted" color="white" opacity={0.7}>
            Crie objetivos para manter a consistencia na sua jornada.
          </Text>
        </Box>

        {activeGoals.length === 0 ? (
          <Box style={styles.sectionCard}>
            <Box alignItems="center" py="xl">
              <Icon name="target-variant" size={48} color="textMuted" />
              <Text variant="subheading" color="textMuted" mt="md" mb="sm">
                Nenhuma meta
              </Text>
              <Text variant="caption" color="textMuted" mb="lg" style={{ textAlign: 'center' }}>
                Comece adicionando uma meta para acompanhar seu progresso.
              </Text>
            </Box>
          </Box>
        ) : (
          <Box gap="md" mb="lg">
            {activeGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => setExpandedType(expandedType === goal.goalType ? null : goal.goalType)}
                activeOpacity={0.7}
              >
                <Box style={styles.goalCard}>
                  <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Box flex={1}>
                      <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                        <Icon
                          name={
                            GOAL_SUGGESTIONS.find((s) => s.type === goal.goalType)?.icon ??
                            'target-outline'
                          }
                          size={18}
                          color="accent"
                        />
                        <Text variant="bodyStrong" color="primary">
                          {getGoalLabel(goal.goalType)}
                        </Text>
                      </Box>
                      <Text variant="caption" color="textMuted">
                        Meta: {goal.targetValue} {getGoalUnit(goal.goalType)}
                      </Text>
                    </Box>
                    <Box alignItems="flex-end">
                      <Text variant="heading" color="accent">
                        {goal.targetValue}
                      </Text>
                    </Box>
                  </Box>

                  {expandedType === goal.goalType && (
                    <View style={{ paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                      <Button
                        variant="tertiary"
                        size="sm"
                        loading={submitting}
                        onPress={() => handleDelete(goal.id)}
                      >
                        Deletar meta
                      </Button>
                    </View>
                  )}
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        )}

        {availableGoalTypes.length > 0 && (
          <Box style={styles.sectionCard}>
            <Text variant="subheading" color="primary" mb="md">
              Adicionar nova meta
            </Text>
            <Box gap="sm">
              {availableGoalTypes.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.type}
                  onPress={() => setExpandedType(expandedType === suggestion.type ? null : suggestion.type)}
                  activeOpacity={0.7}
                >
                  <Box style={styles.suggestionCard}>
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                      <Box flexDirection="row" alignItems="center" gap="sm" flex={1}>
                        <Icon name={suggestion.icon} size={20} color="accent" />
                        <Box flex={1}>
                          <Text variant="body" color="primary">
                            {getGoalLabel(suggestion.type)}
                          </Text>
                        </Box>
                      </Box>
                      <Icon
                        name={expandedType === suggestion.type ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="textMuted"
                      />
                    </Box>

                    {expandedType === suggestion.type && (
                      <Box mt="md" gap="sm">
                        <Text variant="caption" color="textMuted" mb="sm">
                          Qual sera sua meta?
                        </Text>
                        <Box flexDirection="row" gap="sm">
                          <Box flex={1}>
                            <TextField
                              placeholder={suggestion.defaultValue.toString()}
                              value={newGoalValue}
                              onChangeText={setNewGoalValue}
                              keyboardType="number-pad"
                            />
                          </Box>
                          <Button
                            size="sm"
                            loading={submitting}
                            onPress={() => handleCreateGoal(suggestion.type)}
                          >
                            <Icon name="plus" size={18} color="white" />
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
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
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionCard: {
    backgroundColor: theme.colors.backgroundSoft,
    borderRadius: theme.borderRadii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
