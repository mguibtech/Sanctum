# 🎨 Bem-vindo ao Design System do Sanctum

> Um sistema de design elegante, minimalista e contemplativo para o app Sanctum

---

## 📖 Como navegar este projeto

### 🔵 Primeiro: Entender o Design System
1. Leia: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
   - Cores, tipografia, espaçamento
   - Componentes e suas variantes
   - Guidelines de uso

### 🧩 Segundo: Explorar os Componentes
2. Veja: `apps/mobile/components/ui/`
   - Button.tsx
   - Card.tsx
   - Badge.tsx
   - Logo.tsx
   - e mais...

### 🎯 Terceiro: Implementação
3. Use: [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)
   - Checklist de tarefas
   - Como usar cada componente
   - Próximas prioridades

### 📋 Quarto: Demo
4. Teste: `apps/mobile/components/showcase/ComponentShowcase.tsx`
   - Visualize todos os componentes
   - Veja comportamentos e variantes

### 📊 Referência Rápida
5. Consulte: [`SANCTUM_DESIGN_SUMMARY.md`](./SANCTUM_DESIGN_SUMMARY.md)
   - Resumo executivo
   - Links úteis
   - Estrutura do projeto

---

## 🎨 O que foi criado?

### 📄 Documentação (3 arquivos)
```
✅ DESIGN_SYSTEM.md           — Documentação completa dos tokens
✅ IMPLEMENTATION_GUIDE.md    — Guia de implementação e checklist
✅ SANCTUM_DESIGN_SUMMARY.md  — Resumo executivo do projeto
```

### 🧩 Componentes (8 novos)
```
✅ Button        — primary, secondary, tertiary, ghost, danger
✅ Card          — default, elevated, inset
✅ Badge         — primary, accent, success, warning, error
✅ Divider       — Separador simples
✅ TextField     — com error, disabled, helperText
✅ ActionCard    — Cartão de ação reutilizável
✅ Logo          — SVG com S + chama (3 variantes)
✅ LogoWithText  — Logo com "SANCTUM"
```

### 🎯 Showcase
```
✅ ComponentShowcase.tsx — Demo interativa de todos os componentes
```

---

## 🚀 Como começar

### 1. Entender a Paleta
```
🔵 Azul: #16324F       (Primary)
✨ Dourado: #C8A45A    (Accent)
🟤 Bege: #F5F1E8       (Background)
```

### 2. Importar Componentes
```tsx
import { Button, Card, Badge, Logo, Text } from '@/components/ui';
```

### 3. Usar em uma Tela
```tsx
export function MyScreen() {
  return (
    <Box padding="lg" gap="md">
      <Logo size={48} variant="accent" />
      
      <Card variant="elevated">
        <Text variant="heading">Título</Text>
        <Badge variant="success">Status</Badge>
      </Card>
      
      <Button variant="primary">Entrar</Button>
    </Box>
  );
}
```

---

## 📁 Estrutura de Arquivos

```
sanctum/
├── 📄 DESIGN_SYSTEM.md              ← COMECE AQUI
├── 📄 IMPLEMENTATION_GUIDE.md       ← Depois, veja isso
├── 📄 SANCTUM_DESIGN_SUMMARY.md     ← Resumo executivo
│
├── apps/mobile/
│   ├── 📄 constants/theme.ts        ← Tokens de design
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx           ← Componentes
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── LogoWithText.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── ActionCard.tsx
│   │   │   ├── TextField.tsx
│   │   │   └── index.ts             ← Export central
│   │   │
│   │   └── showcase/
│   │       └── ComponentShowcase.tsx ← Demo interativa
│   │
│   └── app/
│       ├── (tabs)/                  ← Telas principais
│       ├── onboarding.tsx           ← Onboarding
│       └── _layout.tsx              ← Root layout
```

---

## 🎯 Próximas Ações

### Semana 1
- [ ] Gerar app icon usando o Logo
- [ ] Integrar Logo no splash screen
- [ ] Adicionar LogoWithText no onboarding

### Semana 2
- [ ] Refinar Bible screen com Cards
- [ ] Refinar Profile screen com Dividers
- [ ] Testar ComponentShowcase

### Semana 3
- [ ] Melhorar Rosary screen
- [ ] Melhorar Community screen
- [ ] Criar componentes adicionais (Checkbox, Radio, etc)

---

## 💡 Dicas Importantes

### ✅ Boas práticas
```tsx
// ✅ BOM: Use spacing do theme
<Box padding="lg" gap="md">

// ❌ RUIM: Hard-coded values
<Box style={{ padding: 24, gap: 16 }}>

// ✅ BOM: Use variant do Text
<Text variant="body">Conteúdo</Text>

// ❌ RUIM: Font size direto
<Text style={{ fontSize: 15 }}>Conteúdo</Text>

// ✅ BOM: Use cores do theme
<Box backgroundColor="primary">

// ❌ RUIM: Hard-coded colors
<Box style={{ backgroundColor: '#16324F' }}>
```

### 📚 Imports Úteis
```tsx
// Theme
import theme from '@/constants/theme';
import { useTheme } from '@shopify/restyle';

// Componentes
import { 
  Button, Card, Badge, Logo, 
  Text, Box, Screen 
} from '@/components/ui';
```

---

## 🔍 Explorar Mais

### Documentação
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — Tokens completos
- [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) — Guia de uso
- Arquivo: `components/ui/index.ts` — Exports centrais

### Componentes
- Arquivo: `components/ui/Button.tsx` — Exemplo de implementação
- Arquivo: `components/ui/Card.tsx` — Exemplo de variantes
- Arquivo: `constants/theme.ts` — Tokens e valores

### Telas
- Arquivo: `app/(tabs)/index.tsx` — Home (excelente exemplo)
- Arquivo: `app/onboarding.tsx` — Onboarding visual
- Arquivo: `components/showcase/ComponentShowcase.tsx` — Demo

---

## ❓ Dúvidas Comuns

**P: Como adicionar um novo componente?**  
R: Veja `IMPLEMENTATION_GUIDE.md` → Componentes Adicionais

**P: Como mudar as cores?**  
R: Edite `constants/theme.ts` → colors object

**P: Como testar os componentes?**  
R: Abra `ComponentShowcase.tsx` no app

**P: Como usar o Logo em diferentes lugares?**  
R: Veja exemplos em `ComponentShowcase.tsx` → Logo Section

---

## 🎓 Aprender Mais

### Sobre Restyle
- Documentação: https://shopify.github.io/restyle/

### Sobre React Native
- Documentação: https://reactnative.dev/

### Sobre Expo
- Documentação: https://docs.expo.dev/

---

## 🎉 Pronto para começar?

1. ✅ Leia [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
2. ✅ Explore `components/ui/`
3. ✅ Veja `ComponentShowcase.tsx`
4. ✅ Implemente usando [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)
5. ✅ Consulte [`SANCTUM_DESIGN_SUMMARY.md`](./SANCTUM_DESIGN_SUMMARY.md) quando precisar

---

**Criado com ❤️ para o Sanctum**

*Um app católico feito para ritmo, presença e constância*
