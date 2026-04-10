import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Box, Button, Icon, Screen, Text, TextField } from '../../components/ui';
import theme from '../../constants/theme';
import { useAppAlert } from '../../hooks/useAppAlert';
import { useReminders } from '../../hooks/useReminders';

const DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export default function CreateReminderScreen() {
  const { create, submitting } = useReminders();
  const { showSuccess, showError } = useAppAlert();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Seg-Sex por padrao

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showError('Validacao', 'Digite um titulo para o lembrete.');
      return;
    }

    if (selectedDays.length === 0) {
      showError('Validacao', 'Selecione pelo menos um dia da semana.');
      return;
    }

    try {
      await create({
        title: title.trim(),
        timeOfDay: time,
        timezone,
        daysOfWeek: selectedDays,
        isEnabled: true,
      });
      showSuccess('Lembrete criado', 'Voce sera notificado nos horarios configurados.');
      router.back();
    } catch {
      showError('Erro', 'Nao foi possivel criar o lembrete.');
    }
  };

  return (
    <Screen backgroundColor="background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Novo Lembrete',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Titulo do lembrete
          </Text>
          <TextField
            placeholder="Ex: Liturgia da manha"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <Text variant="caption" color="textMuted" mt="sm">
            Escolha um nome significativo para este lembrete.
          </Text>
        </Box>

        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Hora do lembrete
          </Text>
          <TextField placeholder="08:00" value={time} onChangeText={setTime} />
          <Text variant="caption" color="textMuted" mt="sm">
            Use o formato HH:mm (24h)
          </Text>
        </Box>

        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Dias da semana
          </Text>
          <Text variant="caption" color="textMuted" mb="md">
            Selecione em quais dias deseja ser notificado
          </Text>
          <View style={styles.dayGrid}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleDay(index)}
                style={[
                  styles.dayButton,
                  selectedDays.includes(index) && styles.dayButtonActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  variant="caption"
                  color={selectedDays.includes(index) ? 'accent' : 'textMuted'}
                  style={{ fontWeight: '600' }}
                >
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Box>

        <Box style={[styles.sectionCard, { backgroundColor: theme.colors.accentMuted + '15' }]} mb="lg">
          <Box flexDirection="row" gap="sm" mb="sm">
            <Icon name="info-outline" size={16} color="accent" />
            <Text variant="caption" color="accent" flex={1}>
              Os lembretes serao enviados respeitando seu fuso horario.
            </Text>
          </Box>
        </Box>

        <Button loading={submitting} size="lg" onPress={handleSubmit}>
          Criar Lembrete
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  dayGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  dayButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundSoft,
  },
  dayButtonActive: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.accent,
  },
});
