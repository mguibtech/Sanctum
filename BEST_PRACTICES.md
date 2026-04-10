# ✨ Best Practices - Sanctum Development

Padrões recomendados para manter qualidade e consistência no projeto.

---

## 📱 Estrutura de Telas

### Estrutura Padrão

```tsx
// ✅ BUEN PADRÓN
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Box, Text, Card, Button, Divider } from '@/components/ui';
import theme from '@/constants/theme';

type MyScreenProps = {
  id?: string;
};

export function MyScreen({ id }: MyScreenProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Buscar dados
      const result = await fetchData(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadData} />;
  if (!data) return <EmptyScreen />;

  return (
    <Screen backgroundColor="background">
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        {/* Header */}
        <Box gap="sm">
          <Text variant="heading">Título</Text>
          <Text variant="body" color="textMuted">Subtítulo</Text>
        </Box>

        <Divider />

        {/* Conteúdo principal */}
        <Card variant="elevated">
          {/* ... */}
        </Card>

        <Divider />

        {/* Ações */}
        <Box gap="sm">
          <Button variant="primary" onPress={handleSave}>
            Ação Principal
          </Button>
        </Box>
      </ScrollView>
    </Screen>
  );
}
```

---

## 🎯 Estado e Dados

### Uso de Hooks

```tsx
// ✅ BOM: Estado simples com useState
const [count, setCount] = useState(0);

// ✅ BOM: Estado complexo consolidado
const [formState, setFormState] = useState({
  name: '',
  email: '',
  verified: false,
});

// ✅ BOM: Múltiplos estados relacionados
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ❌ RUIM: Muitos states individuais
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');
// ... etc
```

### Tratamento de Erros

```tsx
// ✅ BOM: Tratamento consistente
const handleSave = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await api.save(data);
    
    setData(result);
    showSuccessMessage('Salvo com sucesso!');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar';
    setError(message);
    showErrorMessage(message);
  } finally {
    setLoading(false);
  }
};

// ❌ RUIM: Sem tratamento de erros
const handleSave = async () => {
  const result = await api.save(data);
  setData(result);
};
```

---

## 🎨 Componentes

### Componentes Reutilizáveis

```tsx
// ✅ BOM: Componente focado e reutilizável
type UserCardProps = {
  user: { id: string; name: string; avatar?: string };
  onPress?: () => void;
};

export function UserCard({ user, onPress }: UserCardProps) {
  return (
    <Card onPress={onPress}>
      <Box flexDirection="row" gap="md" alignItems="center">
        {user.avatar && <Avatar url={user.avatar} size={48} />}
        <Box flex={1}>
          <Text variant="bodyStrong">{user.name}</Text>
        </Box>
      </Box>
    </Card>
  );
}

// ❌ RUIM: Componente muito específico
export function MyPageUserCard() {
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}
```

### Props Bem Definidas

```tsx
// ✅ BOM: Props com tipos claros
type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};

// ❌ RUIM: Props genéricas
type ButtonProps = {
  [key: string]: any;
};
```

---

## 🧹 Limpeza e Otimização

### useEffect Cleanup

```tsx
// ✅ BOM: Com cleanup
useEffect(() => {
  const subscription = api.subscribe((data) => {
    setData(data);
  });

  return () => subscription.unsubscribe();
}, []);

// ❌ RUIM: Sem cleanup
useEffect(() => {
  api.subscribe((data) => {
    setData(data);
  });
}, []);
```

### Memoização

```tsx
// ✅ BOM: Memoizar componente pesado
export const UserList = React.memo(({ users, onPress }: Props) => {
  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} onPress={onPress} />}
    />
  );
});

// ✅ BOM: Memoizar callbacks
const handlePress = useCallback(() => {
  onUserPress(userId);
}, [userId, onUserPress]);
```

---

## 📝 Nomenclatura

### Variáveis

```tsx
// ✅ BOM: Nomes descritivos
const [isLoading, setIsLoading] = useState(false);
const [usersList, setUsersList] = useState([]);
const handleSaveUser = () => {};
const validateEmail = (email: string) => {};

// ❌ RUIM: Nomes genéricos
const [loading, setLoading] = useState(false);  // loading o quê?
const [list, setList] = useState([]);            // list de o quê?
const handleClick = () => {};                    // clique em o quê?
const validate = (value: string) => {};          // validar o quê?
```

### Componentes

```tsx
// ✅ BOM: Nome claro do que o componente faz
export function UserCard() {}
export function PrayerIntentionCard() {}
export function BibleProgressBar() {}

// ❌ RUIM: Nomes genéricos
export function Card() {}      // Muito genérico
export function MyComponent() {} // Sem significado
export function Content() {}     // Vago
```

---

## 🔍 Performance

### Lists Otimizadas

```tsx
// ✅ BOM: FlatList com keyExtractor
<FlatList
  data={users}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <UserCard user={item} />}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
/>

// ❌ RUIM: ScrollView para listas grandes
<ScrollView>
  {users.map((user) => (
    <UserCard key={user.id} user={user} />
  ))}
</ScrollView>
```

### Evitar Re-renders Desnecessários

```tsx
// ✅ BOM: Memoizar subcomponentes
const Header = React.memo(({ title }: { title: string }) => (
  <Text variant="heading">{title}</Text>
));

export function Screen() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Header title="Meu Título" /> {/* Não re-renderiza quando count muda */}
      <Button onPress={() => setCount(count + 1)}>
        Contar: {count}
      </Button>
    </>
  );
}

// ❌ RUIM: Redefinir componente no render
export function Screen() {
  const Header = () => <Text variant="heading">Meu Título</Text>;
  return <Header />;
}
```

---

## 🧪 Testes (Futuramente)

### Estrutura para Testar

```tsx
// ✅ FUTURA: Função testável
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Teste
describe('calculateProgress', () => {
  it('deve calcular progresso corretamente', () => {
    expect(calculateProgress(5, 10)).toBe(50);
  });
});

// ❌ RUIM: Lógica acoplada ao componente
export function ProgressBar() {
  const [progress] = useState(() => {
    return Math.round((completed / total) * 100); // Não testável
  });
}
```

---

## 📚 Documentação

### JSDoc para Funções Públicas

```tsx
/**
 * Calcula o percentual de progresso
 * @param completed - Número de itens completados
 * @param total - Número total de itens
 * @returns Percentual de 0-100
 */
export function calculateProgress(completed: number, total: number): number {
  return Math.round((completed / total) * 100);
}

/**
 * Card reutilizável para exibir informações do usuário
 * @example
 * <UserCard user={user} onPress={() => navigate(`/users/${user.id}`)} />
 */
type UserCardProps = {
  user: User;
  onPress?: () => void;
};

export function UserCard({ user, onPress }: UserCardProps) {}
```

---

## 🎯 Checklist de Qualidade

- [ ] Tipos TypeScript definidos
- [ ] Nomes descritivos
- [ ] Tratamento de erros
- [ ] Estados bem organizados
- [ ] useEffect com cleanup
- [ ] Componentes reutilizáveis
- [ ] JSDoc para funções públicas
- [ ] Sem console.log em produção
- [ ] Performance otimizada
- [ ] Acessibilidade considerada

---

## 📚 Referências

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Docs: https://react.dev/
- React Native Best Practices: https://reactnative.dev/docs/performance
- Restyle Docs: https://shopify.github.io/restyle/

---

**Última atualização:** 2026-04-09
