import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Icon, Screen, Text, TextField } from '../../../components/ui';
import theme from '../../../constants/theme';
import { useAppAlert } from '../../../hooks/useAppAlert';
import { useReminders } from '../../../hooks/useReminders';

const DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reminders, update, submitting } = useReminders();
  const { showSuccess, showError } = useAppAlert();

  const reminder = reminders.find((r) => r.id === id);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setTime(reminder.timeOfDay);
      setTimezone(reminder.timezone);
      setSelectedDays(reminder.daysOfWeek);
    }
  }, [reminder]);

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
      if (reminder) {
        await update(id!, {
          title: title.trim(),
          timeOfDay: time,
          timezone,
          daysOfWeek: selectedDays,
        });
        showSuccess('Atualizado', 'Seu lembrete foi atualizado.');
        router.back();
      }
    } catch {
      showError('Erro', 'Nao foi possivel atualizar o lembrete.');
    }
  };

  if (!reminder) {
    return (
      <Screen backgroundColor="background">
        <Box alignItems="center" justifyContent="center" flex={1}>
          <Text color="textMuted">Lembrete nao encontrado</Text>
        </Box>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor="background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Editar Lembrete',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Titulo
          </Text>
          <TextField placeholder="Ex: Liturgia da manha" value={title} onChangeText={setTitle} />
        </Box>

        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Hora
          </Text>
          <TextField placeholder="08:00" value={time} onChangeText={setTime} />
        </Box>

        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Fuso horario
          </Text>
          <TextField
            placeholder="America/Sao_Paulo"
            value={timezone}
            onChangeText={setTimezone}
            editable={false}
          />
        </Box>

        <Box style={styles.sectionCard} mb="lg">
          <Text variant="subheading" color="primary" mb="md">
            Dias da semana
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

        <Button loading={submitting} onPress={handleSubmit}>
          Salvar Lembrete
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
