# 🎨 Sanctum - Design System

> **Um sistema de design elegante, minimalista e contemplativo para o app Sanctum**

---

## ⚡ Quick Start

### 1. Primeiros 5 minutos
```bash
# Leia isto:
1. Este arquivo (README_DESIGN.md)
2. GETTING_STARTED.md
```

### 2. Próximos 15 minutos
```bash
# Entenda o design:
1. DESIGN_SYSTEM.md — Cores, tipografia, spacing
2. CODE_STYLE_GUIDE.md — Como escrever código
```

### 3. Comece a desenvolver
```tsx
import { Button, Card, Text } from '@/components/ui';

export function MyScreen() {
  return (
    <Card variant="elevated">
      <Text variant="heading">Olá Sanctum!</Text>
      <Button variant="primary">Clique aqui</Button>
    </Card>
  );
}
```

---

## 📦 O Que Você Tem

### ✨ 13 Componentes Prontos

```
Button     →  5 variantes (primary, secondary, tertiary, ghost, danger)
Card       →  3 variantes (default, elevated, inset)
Badge      →  5 variantes (primary, accent, success, warning, error)
Checkbox   →  Com label e error
Switch     →  Animado
ProgressBar→  4 variantes de cor
Rating     →  Estrelas customizáveis
Tag        →  3 estilos (filled, outlined, subtle)
TextField  →  Completo com validação
Logo       →  3 variantes
Divider    →  Separador de seções
ActionCard →  Cartão de ação
Text       →  7 variantes tipográficas
Box        →  Layout com Restyle props
```

### 🎨 Design Tokens

```
Cores:      20+ colors definidas
Tipografia: 7 variantes (Display, Hero, Heading, Body, etc)
Spacing:    7 tokens (xs, sm, md, lg, xl, 2xl, 3xl)
Radius:     6 tamanhos (xs, sm, md, lg, xl, pill)
```

### 📚 8 Documentos

```
DESIGN_SYSTEM.md          → Tokens e componentes
CODE_STYLE_GUIDE.md       → Padrões de código
BEST_PRACTICES.md         → Melhores práticas
IMPLEMENTATION_GUIDE.md   → Como implementar
GETTING_STARTED.md        → Guia de navegação
SANCTUM_DESIGN_SUMMARY.md → Resumo executivo
IMPLEMENTATION_LOG.md     → Log de mudanças
PROJECT_STATUS.md         → Status do projeto
```

---

## 🎯 Exemplo: Criar uma Tela

### ❌ Antes (Sem Design System)
```tsx
// Hard-coded tudo, sem consistência
<View style={{ padding: 24, backgroundColor: '#16324F' }}>
  <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>
    Título
  </Text>
  <Pressable style={{ 
    padding: 12, 
    backgroundColor: '#C8A45A',
    borderRadius: 10
  }}>
    <Text style={{ color: '#16324F' }}>
      Botão
    </Text>
  </Pressable>
</View>
```

### ✅ Depois (Com Design System)
```tsx
// Clean, consistente, fácil manter
<Screen backgroundColor="background">
  <Box padding="lg">
    <Text variant="heading">Título</Text>
    <Button variant="tertiary">Botão</Button>
  </Box>
</Screen>
```

**Benefícios:**
- 60% menos código
- 100% consistente
- Fácil de manter
- Rápido de desenvolver

---

## 🚀 Componentes em Ação

### Button
```tsx
<Button variant="primary">Primário</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="tertiary">Terciário</Button>
<Button disabled>Desativado</Button>
<Button loading>Carregando...</Button>
```

### Card
```tsx
<Card variant="elevated">
  <Text>Card elegante com sombra</Text>
</Card>

<Card variant="default">
  <Text>Card simples com borda</Text>
</Card>
```

### Badge & Tag
```tsx
<Badge variant="success">Ativo</Badge>
<Badge variant="error">Erro</Badge>

<Tag label="Novo" variant="filled" />
<Tag label="Premium" variant="subtle" color="accent" />
```

### Formulários
```tsx
<TextField
  label="Nome"
  placeholder="Seu nome"
  value={name}
  onChangeText={setName}
/>

<Checkbox
  checked={agreed}
  onChange={setAgreed}
  label="Concordo com os termos"
/>

<Switch
  value={notifications}
  onValueChange={setNotifications}
/>
```

### Progresso & Avaliação
```tsx
<ProgressBar progress={75} variant="success" />

<Rating
  value={rating}
  onChange={setRating}
/>
```

---

## 📐 Design Tokens

### Cores Principais
```
🔵 Primary (Azul):    #16324F
✨ Accent (Dourado):  #C8A45A  
🟤 Background (Bege): #F5F1E8
```

### Tipografia
```
Display   → 42px, bold   (Títulos grandes)
Hero      → 36px, bold   (Títulos telas)
Heading   → 28px, bold   (Seções)
Subheading→ 20px, medium (Subsections)
Body      → 15px, regular(Conteúdo)
Small     → 13px, regular(Auxiliar)
Caption   → 11px, regular(Hints)
```

### Spacing
```
xs  → 4px   (Mínimo)
sm  → 8px   (Pequeno)
md  → 16px  (Médio)
lg  → 24px  (Grande)
xl  → 32px  (Extra)
2xl → 48px  (Duplo)
3xl → 64px  (Triplo)
```

---

## ✅ Padrões (Do's & Don'ts)

### ✅ FAÇA ISTO

```tsx
// Cores do theme
<Box backgroundColor="primary">

// Spacing via props
<Box padding="lg" gap="md">

// Text variants
<Text variant="heading">Título</Text>

// Box para layout
<Box flexDirection="row">
```

### ❌ NÃO FAÇA ISTO

```tsx
// Hard-coded colors
<Box style={{ backgroundColor: '#16324F' }}>

// Hard-coded spacing
<Box style={{ padding: 24, gap: 16 }}>

// Font size direto
<Text style={{ fontSize: 28 }}>

// View em vez de Box
<View gap={16}>  // View não tem gap!
```

---

## 📱 Estrutura de Tela Padrão

```tsx
import { Screen, Box, Text, Card, Button, Divider } from '@/components/ui';

export function MyScreen() {
  return (
    <Screen backgroundColor="background">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        {/* Header */}
        <Box gap="sm">
          <Text variant="heading">Título</Text>
          <Text variant="body" color="textMuted">Descrição</Text>
        </Box>

        <Divider />

        {/* Conteúdo */}
        <Card variant="elevated">
          <Text variant="bodyStrong">Seção 1</Text>
        </Card>

        <Card variant="elevated">
          <Text variant="bodyStrong">Seção 2</Text>
        </Card>

        <Divider />

        {/* Ações */}
        <Box gap="sm">
          <Button variant="primary">Ação</Button>
        </Box>
      </ScrollView>
    </Screen>
  );
}
```

---

## 🎯 Checklist de Desenvolvimento

- [ ] Li GETTING_STARTED.md
- [ ] Li CODE_STYLE_GUIDE.md
- [ ] Usei componentes do @/components/ui
- [ ] Usei spacing tokens (lg, md, sm)
- [ ] Usei color props (não hard-code)
- [ ] Usei Text variants (não fontSize)
- [ ] Estruturei a tela com Box (não View)
- [ ] Adicionei Dividers entre seções
- [ ] Testei responsividade
- [ ] Não deixei console.log em produção

---

## 📚 Documentos Importantes

| Documento | Para Quem | Leia Se... |
|-----------|-----------|-----------|
| **GETTING_STARTED.md** | Todos | Primeira vez usando |
| **CODE_STYLE_GUIDE.md** | Devs | Vai desenvolver |
| **DESIGN_SYSTEM.md** | Designers | Precisa de specs |
| **BEST_PRACTICES.md** | Devs | Quer boas práticas |
| **IMPLEMENTATION_GUIDE.md** | Product | Planejar implementação |

---

## 🎨 Paleta Completa

```
Primary Suite
├── Primary:       #16324F (Azul escuro)
├── Primary Light: #2A5D88 (Azul claro)
└── Primary Dark:  #0E2135 (Azul muito escuro)

Accent Suite
├── Accent:        #C8A45A (Dourado)
├── Accent Light:  #E6C98D (Dourado claro)
└── Accent Muted:  rgba(200,164,90,0.15)

Semantic
├── Success:       #1F8A5B (Verde)
├── Warning:       #B7791F (Laranja)
├── Error:         #C24141 (Vermelho)
└── Streak:        #E07B1A (Laranja queimado)

Neutrals
├── Background:    #F5F1E8 (Bege)
├── Surface:       #FFFFFF (Branco)
├── Text:          #1A2332 (Preto)
└── Text Muted:    #78849B (Cinza)
```

---

## 🔗 Links Úteis

### Documentação Interna
- 📖 [Getting Started](./GETTING_STARTED.md)
- 🎨 [Design System](./DESIGN_SYSTEM.md)
- 📝 [Code Style Guide](./CODE_STYLE_GUIDE.md)
- ✨ [Best Practices](./BEST_PRACTICES.md)

### Componentes
- 📦 [Todos os Componentes](./apps/mobile/components/ui/)
- 🎯 [Component Showcase](./apps/mobile/components/showcase/ComponentShowcase.tsx)
- 🎨 [Theme Tokens](./apps/mobile/constants/theme.ts)

### Ferramentas
- 📱 [React Native Docs](https://reactnative.dev/)
- 🎨 [Restyle Docs](https://shopify.github.io/restyle/)
- 🔷 [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

## 🎓 Aprender Mais

### Passo 1: Explore o Design System
```bash
# Leia os documentos em ordem
1. GETTING_STARTED.md (5 min)
2. DESIGN_SYSTEM.md (10 min)
3. CODE_STYLE_GUIDE.md (10 min)
```

### Passo 2: Teste os Componentes
```bash
# Rode o ComponentShowcase
npm start
# Navegue para o showcase
```

### Passo 3: Desenvolva
```bash
# Use os componentes em suas telas
# Siga o CODE_STYLE_GUIDE
# Consulte BEST_PRACTICES
```

---

## 💡 Dicas Pro

1. **Use memo para grandes listas**
   ```tsx
   const UserList = React.memo(({ users }) => (...));
   ```

2. **Memoize callbacks quando necessário**
   ```tsx
   const handlePress = useCallback(() => {...}, [deps]);
   ```

3. **Sempre defina keyExtractor em FlatList**
   ```tsx
   <FlatList keyExtractor={(item) => item.id} />
   ```

4. **Use Restyle useTheme para valores dinâmicos**
   ```tsx
   const theme = useTheme<Theme>();
   ```

5. **Componentes focados são reutilizáveis**
   ```tsx
   // ✅ BOM: UserCard sabe mostrar um usuário
   // ❌ RUIM: MyPageUserCard é muito específico
   ```

---

## 🎉 Pronto!

**Você tem tudo o que precisa para desenvolver com Sanctum!**

### Próximas ações:
1. ✅ Leia GETTING_STARTED.md
2. ✅ Explore DESIGN_SYSTEM.md
3. ✅ Estude CODE_STYLE_GUIDE.md
4. ✅ Comece a desenvolver!

---

## 📞 Precisa de Ajuda?

- **Design?** → `DESIGN_SYSTEM.md`
- **Código?** → `CODE_STYLE_GUIDE.md`
- **Padrões?** → `BEST_PRACTICES.md`
- **Como começar?** → `GETTING_STARTED.md`
- **Componentes?** → `ComponentShowcase.tsx`

---

**Criado com ❤️ para Sanctum**

*Um app católico feito para ritmo, presença e constância*

---

**Versão:** 2.0  
**Status:** ✅ Pronto para Produção  
**Data:** 09 de Abril de 2026
