import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function BibleLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="[bookId]" options={{ title: 'Capítulos' }} />
      <Stack.Screen name="[bookId]/[chapterNum]" options={{ title: 'Leitura' }} />
    </Stack>
  );
}
