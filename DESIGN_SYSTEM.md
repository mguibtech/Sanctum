# SANCTUM - Design System

Um design system completo e refinado para o app de espiritualidade católica Sanctum.

## 📐 Estrutura

### 1. Colors & Palette

#### Primary Colors
- **Primary**: `#16324F` — Azul escuro, cor base do app
- **Primary Light**: `#2A5D88` — Variação clara para hover/focus
- **Primary Dark**: `#0E2135` — Variação escura para contrast

#### Accent Colors
- **Accent**: `#C8A45A` — Dourado, cor de destaque principal
- **Accent Light**: `#E6C98D` — Dourado claro para backgrounds
- **Accent Muted**: `rgba(200,164,90,0.15)` — Dourado com opacidade

#### Semantic Colors
- **Success**: `#1F8A5B` — Verde, para ações bem-sucedidas
- **Warning**: `#B7791F` — Laranja, para alertas
- **Error**: `#C24141` — Vermelho, para erros
- **Streak**: `#E07B1A` — Laranja, para streaks

#### Background Colors
- **Background**: `#F5F1E8` — Bege claro, fundo principal
- **Background Soft**: `#FBF8F2` — Bege mais claro
- **Surface**: `#FFFFFF` — Branco, cards e componentes
- **Surface Elevated**: `#FEFCF9` — Branco quente, elevation
- **Surface Muted**: `#EFE8DB` — Bege, backgrounds alternativos

#### Text Colors
- **Text**: `#1A2332` — Preto escuro, texto principal
- **Text Muted**: `#78849B` — Cinza, texto secundário
- **Text Light**: `#A0AAB8` — Cinza claro, text disabled

---

### 2. Typography

#### Text Variants

**Display**
- Size: 42px
- Weight: 800 (Bold)
- Line Height: 48px
- Letter Spacing: -0.5px
- Uso: Títulos principais de seções

**Hero**
- Size: 36px
- Weight: 700 (Bold)
- Line Height: 42px
- Letter Spacing: 0.5px
- Uso: Títulos de telas e seções grandes

**Heading**
- Size: 28px
- Weight: 700 (Bold)
- Line Height: 34px
- Uso: Títulos de subsections

**Subheading**
- Size: 20px
- Weight: 600 (Medium)
- Line Height: 26px
- Uso: Subtítulos

**Body**
- Size: 15px
- Weight: 400 (Regular)
- Line Height: 22px
- Uso: Texto principal do conteúdo

**Body Small**
- Size: 13px
- Weight: 400 (Regular)
- Line Height: 20px
- Uso: Texto auxiliar, labels

**Caption**
- Size: 11px
- Weight: 400 (Regular)
- Line Height: 16px
- Uso: Hints, descrições muito pequenas

---

### 3. Spacing Scale

Sistema baseado em 8px:

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

---

### 4. Border Radius

- **xs**: 6px
- **sm**: 10px
- **md**: 16px
- **lg**: 22px
- **xl**: 30px
- **pill**: 9999px
- **full**: 9999px

---

## 🧩 Components

### Button

#### Variants
1. **Primary** (default)
   - Background: Primary (#16324F)
   - Text: White
   - Padding: 12px 24px
   - Border Radius: sm (10px)

2. **Secondary**
   - Background: transparent
   - Border: 2px Primary
   - Text: Primary
   - Padding: 12px 24px

3. **Tertiary**
   - Background: Accent (#C8A45A)
   - Text: Primary
   - Padding: 12px 24px

#### States
- **Default**: Visual acima
- **Hover**: Opacity 0.8
- **Active**: Scale 0.98
- **Disabled**: Opacity 0.5, cursor not-allowed

#### Sizes
- **Small**: 40px height, padding 8px 16px
- **Medium**: 48px height, padding 12px 24px (default)
- **Large**: 56px height, padding 16px 32px

---

### Card

#### Variants
1. **Default**
   - Background: Surface (white)
   - Border: 1px Border (#E8DFD0)
   - Border Radius: md (16px)
   - Padding: 16px

2. **Elevated**
   - Background: Surface Elevated (#FEFCF9)
   - Shadow: 0 4px 12px rgba(0,0,0,0.08)
   - Border Radius: md (16px)
   - Padding: 16px

3. **Inset**
   - Background: Surface Muted (#EFE8DB)
   - Border Radius: md (16px)
   - Padding: 16px

---

### Text Field

#### Variants
1. **Default (Outlined)**
   - Background: Surface (white)
   - Border: 1px Border (#E8DFD0)
   - Border Radius: sm (10px)
   - Height: 48px
   - Padding: 12px 16px

2. **Filled**
   - Background: Surface Muted (#EFE8DB)
   - Border: none
   - Border Radius: sm (10px)
   - Height: 48px

#### States
- **Default**: Visual acima
- **Focused**: Border 2px Primary, outline none
- **Error**: Border 2px Error (#C24141)
- **Disabled**: Opacity 0.5, cursor not-allowed

---

### Icon Button

- Size: 44px x 44px
- Icon: 24px
- Background: transparent (hover: Surface Muted)
- Border Radius: pill (9999px)

---

### Badge / Chip

- Height: 24px
- Padding: 4px 12px
- Border Radius: pill
- Font Size: 12px

#### Variants
- **Primary**: Background Primary, Text white
- **Accent**: Background Accent, Text Primary
- **Success**: Background Success, Text white
- **Warning**: Background Warning, Text white

---

### Divider

- Height: 1px
- Background: Border (#E8DFD0)
- Margin: lg (24px) vertical

---

## 🎨 Usage Guidelines

### Color Combinations
- Use **Primary** com **Accent** para máximo contraste
- Use **Text Muted** para textos secundários
- Use **Surface** para componentes em **Background**

### Spacing
- Interior: md (16px)
- Exterior: lg (24px)
- Entre elementos: sm (8px)

### Typography Hierarchy
1. Display/Hero — Títulos principais
2. Heading — Seções
3. Body — Conteúdo
4. Body Small — Labels
5. Caption — Hints

---

## 🔗 Figma File

[Sanctum Design System](https://www.figma.com/design/IRcJDJCUSlCeBWUOmzCxLP)

---

## 📱 Implementação

Todos os tokens estão definidos em `constants/theme.ts` usando Shopify Restyle.

Componentes base em `components/ui/` com suporte completo aos tokens do design system.
