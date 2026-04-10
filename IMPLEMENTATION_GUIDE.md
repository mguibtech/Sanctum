# Guia de Implementação - Sanctum Design System

## ✅ O que já foi implementado

### 1. Design System Documentado
- [x] DESIGN_SYSTEM.md com tokens completos
- [x] Paleta de cores
- [x] Tipografia
- [x] Spacing scale
- [x] Border radius
- [x] Componentes definidos

### 2. Componentes Criados
- [x] **Button** — Variantes: primary, secondary, tertiary, ghost, danger
- [x] **Card** — Variantes: default, elevated, inset
- [x] **TextField** — Com suporte a disabled, error, helperText
- [x] **Badge** — 5 variantes semânticas
- [x] **Divider** — Customizável
- [x] **ActionCard** — Para listas de ações
- [x] **Logo** — SVG com S + chama (3 variantes)
- [x] **LogoWithText** — Logo com SANCTUM

### 3. Telas Existentes
- [x] Home — Excelente, com hero card e stats
- [x] Bible — Funcional com progress
- [x] Rosary — Interativo com beads
- [x] Profile — Com stats e rankings
- [x] Community — Intentions e prayer requests

---

## 🚀 Próximos passos (por prioridade)

### 1. Assets de Branding (Alta Prioridade)
```
📦 assets/
  ├── icon.png (512x512) — App icon com o logo
  ├── adaptive-icon.png (108x108) — Android adaptive icon
  ├── splash.png — Tela de splash
  └── notification-icon.png — Ícone de notificação
```

**Ação:** Usar o componente Logo para gerar estes assets.

---

### 2. Melhorias nas Screens (Média Prioridade)

#### A. Screen de Onboarding
```tsx
// Adicionar
- Logo component na primeira tela
- Usar Badge para highlights
- Button refinado nos CTAs
- Card para sections
```

#### B. Screen de Bible
```tsx
// Melhorar
- Usar Card para livros
- Badge para progress
- ActionCard para quick access
- Divider entre seções
```

#### C. Screen de Profile
```tsx
// Refinar
- Card elevado para user info
- Stats com Badge
- Ranking com Card variants
- Divider entre seções
```

#### D. Screen de Rosary
```tsx
// Enhance
- Card para Mystery info
- Progress visualization melhorada
- Divider para separar seções
```

#### E. Screen de Community
```tsx
// Melhorar visual
- Card para prayer requests
- Badge para intent categories
- ActionCard para quick filters
```

---

### 3. Componentes Adicionais (Baixa Prioridade)

```tsx
// Faltam criar:
- Checkbox
- Radio Button
- Switch
- Toast (já existe XpToast, expandir)
- Modal/BottomSheet melhorado
- Tabs/SegmentedControl
- Stepper
- ProgressBar
- Rating/Stars
```

---

## 🎨 Como usar os componentes

### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Entrar
</Button>

<Button variant="secondary" size="sm">
  Cancelar
</Button>

<Button variant="tertiary" loading>
  Salvando...
</Button>
```

### Card
```tsx
import { Card } from '@/components/ui';

<Card variant="elevated">
  <Text>Conteúdo</Text>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Concluído</Badge>
<Badge variant="warning">Aviso</Badge>
```

### Logo
```tsx
import { Logo, LogoWithText } from '@/components/ui';

<Logo size={64} variant="accent" />
<LogoWithText size={48} variant="white" />
```

---

## 📱 Checklist de Implementação

### Fase 1: Assets
- [ ] Gerar icon.png (App icon)
- [ ] Gerar adaptive-icon.png
- [ ] Gerar splash.png
- [ ] Gerar notification-icon.png

### Fase 2: Onboarding
- [ ] Integrar Logo component
- [ ] Refinar Button styling
- [ ] Melhorar visual das slides

### Fase 3: Screens Principais
- [ ] Bible — Card + Badge
- [ ] Profile — Card + Divider
- [ ] Rosary — Card para mysteries
- [ ] Community — Card + Badge

### Fase 4: Componentes Adicionais
- [ ] Checkbox
- [ ] Radio Button
- [ ] Switch
- [ ] Toast melhorado

---

## 🔧 Comandos úteis

```bash
# Linter
npm run lint

# Expo start
npm start

# Build preview
expo build:web
```

---

## 📚 Arquivos Importantes

- **Design System**: `SANCTUM/DESIGN_SYSTEM.md`
- **Theme**: `apps/mobile/constants/theme.ts`
- **Components**: `apps/mobile/components/ui/`
- **App Layout**: `apps/mobile/app/_layout.tsx`

---

## 💡 Notas

1. **Cores**: Usar sempre as cores do theme para consistency
2. **Spacing**: Preferir `sm`, `md`, `lg` em vez de hard-coded pixels
3. **Border Radius**: Usar `xs`, `sm`, `md` em vez de valores absolutos
4. **Tipografia**: Sempre usar `variant` do Text, nunca fontSize direto

---

## 📞 Suporte

Dúvidas sobre os componentes? Consulte:
1. `DESIGN_SYSTEM.md` para tokens
2. Componentes em `components/ui/` para implementação
3. Theme em `constants/theme.ts` para valores

---

**Último update**: 2026-04-09
