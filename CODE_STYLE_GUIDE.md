# 📐 Code Style Guide - Sanctum

Guia de padrões e boas práticas para desenvolver no projeto Sanctum.

---

## 🎨 Design System

### Importações Padrão

```tsx
// ✅ BOM: Importar do ui central
import { 
  Button, Card, Badge, Text, Box, 
  Logo, TextField, Divider, Screen 
} from '@/components/ui';

// ❌ RUIM: Importar diretamente
import Button from '@/components/ui/Button';
```

### Usando Spacing

```tsx
// ✅ BOM: Use tokens de spacing
<Box padding="lg" gap="md">
  <Text>Conteúdo</Text>
</Box>

// ❌ RUIM: Hard-coded values
<Box style={{ padding: 24, gap: 16 }}>
  <Text>Conteúdo</Text>
</Box>
```

### Usando Cores

```tsx
// ✅ BOM: Use cores do theme
<Box backgroundColor="primary">
  <Text color="white">Texto</Text>
</Box>

// ✅ BOM ALTERNATIVA: Use useTheme
const theme = useTheme<Theme>();
<Box style={{ backgroundColor: theme.colors.primary }}>

// ❌ RUIM: Hard-coded colors
<Box style={{ backgroundColor: '#16324F' }}>
```

### Usando Tipografia

```tsx
// ✅ BOM: Use variant
<Text variant="heading">Título</Text>
<Text variant="body">Parágrafo</Text>
<Text variant="caption">Label pequeno</Text>

// ❌ RUIM: Font size direto
<Text style={{ fontSize: 28, fontWeight: '700' }}>Título</Text>
```

---

## 🧩 Componentes

### Button

```tsx
import { Button } from '@/components/ui';

// Variantes
<Button variant="primary">Principal</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="tertiary">Terciário</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="danger">Perigoso</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>

// Estados
<Button disabled>Desativado</Button>
<Button loading>Carregando...</Button>
<Button onPress={() => {}}>Clicável</Button>
```

### Card

```tsx
import { Card } from '@/components/ui';

// Variantes
<Card variant="default">
  <Text>Card padrão com borda</Text>
</Card>

<Card variant="elevated">
  <Text>Card elevado com sombra</Text>
</Card>

<Card variant="inset">
  <Text>Card inset com background muted</Text>
</Card>

// Com padding customizado
<Card padding="sm">
  <Text>Padding menor</Text>
</Card>
```

### Badge

```tsx
import { Badge } from '@/components/ui';

// Variantes
<Badge variant="primary">Primário</Badge>
<Badge variant="accent">Destaque</Badge>
<Badge variant="success">Sucesso</Badge>
<Badge variant="warning">Aviso</Badge>
<Badge variant="error">Erro</Badge>
```

### TextField

```tsx
import { TextField } from '@/components/ui';

// Padrão
<TextField
  label="Seu nome"
  placeholder="Digite seu nome"
  value={name}
  onChangeText={setName}
/>

// Com validação
<TextField
  label="Email"
  placeholder="seu@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

// Com ajuda
<TextField
  label="Senha"
  helperText="Mínimo 8 caracteres"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>

// Disabled
<TextField
  label="Campo desativado"
  disabled
  value="Não pode editar"
/>
```

### Checkbox

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Concorda com os termos?"
  error={hasError}
/>
```

### Switch

```tsx
import { Switch } from '@/components/ui';

<Switch
  value={isEnabled}
  onValueChange={setIsEnabled}
/>
```

### ProgressBar

```tsx
import { ProgressBar } from '@/components/ui';

// Variantes
<ProgressBar progress={75} variant="primary" />
<ProgressBar progress={50} variant="success" />
<ProgressBar progress={25} variant="warning" />

// Sem label
<ProgressBar progress={80} showLabel={false} />
```

### Rating

```tsx
import { Rating } from '@/components/ui';

<Rating
  value={rating}
  onChange={setRating}
  size="md"
/>

// Readonly
<Rating value={4} readonly />
```

### Tag

```tsx
import { Tag } from '@/components/ui';

// Variantes
<Tag label="Lido" variant="filled" color="success" />
<Tag label="Em progresso" variant="outlined" color="warning" />
<Tag label="Novo" variant="subtle" color="accent" />

// Com remove
<Tag 
  label="Remover" 
  onRemove={() => removeTag('Remover')} 
/>
```

### Logo

```tsx
import { Logo, LogoWithText } from '@/components/ui';

// Apenas logo
<Logo size={48} variant="accent" />
<Logo size={64} variant="primary" />
<Logo size={32} variant="white" />

// Logo com texto
<LogoWithText size={48} variant="accent" />
```

### Divider

```tsx
import { Divider } from '@/components/ui';

// Padrão
<Divider />

// Customizado
<Divider marginVertical="lg" variant="muted" />
```

---

## 📱 Estrutura de Screens

### Padrão de Layout

```tsx
import { Screen, Box, Text, Button, Card, Divider } from '@/components/ui';
import { ScrollView } from 'react-native';

export function MyScreen() {
  return (
    <Screen backgroundColor="background">
      <ScrollView 
        contentContainerStyle={{ 
          padding: 24,
          gap: 16,
        }}
      >
        {/* Header */}
        <Box gap="md">
          <Text variant="heading">Título</Text>
          <Text variant="body" color="textMuted">Descrição</Text>
        </Box>

        <Divider />

        {/* Content */}
        <Card variant="elevated">
          <Text variant="bodyStrong">Seção 1</Text>
          <Text variant="body">Conteúdo</Text>
        </Card>

        <Card variant="elevated">
          <Text variant="bodyStrong">Seção 2</Text>
          <Text variant="body">Conteúdo</Text>
        </Card>

        <Divider />

        {/* Actions */}
        <Box gap="sm">
          <Button variant="primary" onPress={handleSave}>
            Salvar
          </Button>
          <Button variant="secondary" onPress={handleCancel}>
            Cancelar
          </Button>
        </Box>
      </ScrollView>
    </Screen>
  );
}
```

---

## 🎯 Padrões Específicos

### Validação de Formulário

```tsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState<string | null>(null);

const handleValidate = () => {
  if (!email.includes('@')) {
    setEmailError('Email inválido');
    return false;
  }
  setEmailError(null);
  return true;
};

return (
  <TextField
    label="Email"
    value={email}
    onChangeText={setEmail}
    error={emailError}
    helperText="Digite um email válido"
  />
);
```

### Lista com Cards

```tsx
const items = [
  { id: 1, title: 'Item 1', description: 'Descrição' },
  { id: 2, title: 'Item 2', description: 'Descrição' },
];

return (
  <Box gap="md">
    {items.map((item) => (
      <Card key={item.id} variant="default">
        <Text variant="bodyStrong">{item.title}</Text>
        <Text variant="body" color="textMuted">{item.description}</Text>
      </Card>
    ))}
  </Box>
);
```

### Status Badge

```tsx
const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
};

return (
  <Card>
    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
      <Text>{title}</Text>
      <Badge variant={statusColors[status]}>
        {status}
      </Badge>
    </Box>
  </Card>
);
```

---

## ✅ Checklist de Implementação

- [ ] Usar componentes do `@/components/ui`
- [ ] Aplicar spacing via props (`padding`, `gap`, `margin`)
- [ ] Usar cores via theme ou color props
- [ ] Usar `variant` do Text
- [ ] Envolver em `Box` para layout (não `View`)
- [ ] Usar `Screen` como wrapper de telas
- [ ] Adicionar dividers entre seções
- [ ] Testar em múltiplos tamanhos
- [ ] Testar acessibilidade
- [ ] Documentar props customizadas

---

## 🚫 Anti-patterns

```tsx
// ❌ NÃO FAÇA ISSO

// 1. Hard-coded padding
<View style={{ padding: 24 }}>

// 2. Hard-coded colors
<View style={{ backgroundColor: '#16324F' }}>

// 3. Font size direto
<Text style={{ fontSize: 28 }}>

// 4. Nesting Views desnecessários
<View>
  <View>
    <View>
      <Text>Muito aninhado</Text>
    </View>
  </View>
</View>

// 5. Usar View em vez de Box
<View gap={16}>  // ❌ View não tem gap prop

// 6. StyleSheet para componentes simples
const styles = StyleSheet.create({
  container: { padding: 24 },  // Usar Box padding prop
});

// 7. Cores inline
<Text style={{ color: '#1A2332' }}>  // Use color prop
```

---

## 📚 Comandos Úteis

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Rodar linter
npm run lint

# Testar no device
npm start
npm run android
npm run ios
```

---

## 🔗 Referências

- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — Tokens e design
- [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) — Como implementar
- `components/ui/` — Código dos componentes
- `components/showcase/ComponentShowcase.tsx` — Exemplos

---

**Última atualização:** 2026-04-09
