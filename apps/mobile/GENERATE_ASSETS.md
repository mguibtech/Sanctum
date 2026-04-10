# 🎨 Como Gerar Assets do Sanctum

Guia para gerar os assets (ícone, splash, etc) do app.

---

## 📋 Assets Necessários

| Arquivo | Dimensão | Uso |
|---------|----------|-----|
| **icon.png** | 512x512 | App icon (geral) |
| **adaptive-icon.png** | 108x108 | Android adaptive icon |
| **splash.png** | 1080x1920 | Splash screen |
| **notification-icon.png** | 96x96 | Notification icon |

---

## 🎨 Opção 1: Usar Figma (Recomendado)

### Passo 1: Abra o Figma
1. Acesse https://figma.com
2. Crie um novo file
3. Crie um artboard de 512x512px

### Passo 2: Desenhe o Logo
Use o "S" com chama da imagem que você passou:
```
- Cor: #C8A45A (Dourado)
- Fundo: #16324F (Azul)
- Estilo: Elegante, minimalista
```

### Passo 3: Exporte
1. Selecione o artboard
2. Menu → Export
3. PNG, 2x scale
4. Salve como `icon.png` (512x512)

### Passo 4: Crie as variações
- **Adaptive Icon** (108x108): Versão menor do logo
- **Splash** (1080x1920): Logo grande + background
- **Notification** (96x96): Logo simplificado

---

## 🎨 Opção 2: Usar Canva

1. Acesse https://canva.com
2. Crie um design de 512x512px
3. Use template: "App Icon"
4. Adicione o "S" dourado em fundo azul
5. Exporte como PNG

---

## 💻 Opção 3: Usar Script (ImageMagick)

Se tem ImageMagick instalado:

```bash
# Criar icon.png (512x512) com gradiente
convert -size 512x512 \
  gradient:#16324F-#0E2135 \
  -fill "#C8A45A" \
  -pointsize 200 \
  -gravity center \
  -annotate +0+0 "S" \
  icon.png

# Criar splash.png (1080x1920)
convert -size 1080x1920 \
  gradient:#16324F-#0E2135 \
  -fill "#C8A45A" \
  -pointsize 300 \
  -gravity center \
  -annotate +0-200 "S" \
  splash.png

# Criar adaptive-icon.png (108x108)
convert icon.png -resize 108x108 adaptive-icon.png

# Criar notification-icon.png (96x96)
convert icon.png -resize 96x96 notification-icon.png
```

---

## 🖥️ Opção 4: Usar Online Tool

### Remove.bg (Generar logo com fundo)
1. Acesse https://www.photopea.com/
2. Create → 512x512px
3. Adicione o "S" em dourado
4. Exporte como PNG

### LogoMaker Online
1. Acesse https://logomaker.online/
2. Customize o logo
3. Exporte em PNG

---

## 📁 Estrutura de Pastas

```
apps/mobile/assets/
├── icon.png              (512x512)
├── adaptive-icon.png     (108x108)
├── splash.png            (1080x1920)
├── notification-icon.png (96x96)
└── logos/
    ├── LogoAssets.tsx    (SVG)
    └── ... outros logos
```

---

## ✅ Verificar Assets

Depois de gerar, verifique:

```bash
# Verificar tamanho dos arquivos
ls -lh apps/mobile/assets/*.png

# Verificar dimensões (se tiver imagemagick)
identify apps/mobile/assets/icon.png
identify apps/mobile/assets/splash.png
```

---

## 🔄 Atualizar app.json

Os caminhos já estão configurados:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#1B3A6B"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1B3A6B"
      }
    }
  }
}
```

Nada precisa ser modificado!

---

## 🚀 Testar

Depois de gerar os assets:

```bash
npm start
npm run android
npm run ios
```

O app deve carregar com o novo logo/splash!

---

## 💡 Dicas

### Para o Logo
- Use a cor **#C8A45A** (dourado)
- Fundo: **#16324F** (azul)
- Estilo: Elegante, minimalista
- Formato: PNG com fundo transparente (para adaptive icon)

### Para o Splash
- Grande, central
- Logo ocupando ~30% da tela
- Background: gradiente azul
- Suporte para diferentes tamanhos de tela

### Para Notification Icon
- Versão simplificada
- Fundo branco
- Ícone em destaque
- Sem gradientes complexos

---

## 🎯 Checklist

- [ ] Gerei icon.png (512x512)
- [ ] Gerei adaptive-icon.png (108x108)
- [ ] Gerei splash.png (1080x1920)
- [ ] Gerei notification-icon.png (96x96)
- [ ] Coloquei os arquivos em `apps/mobile/assets/`
- [ ] Testei o app (npm start)
- [ ] Verificar logo no device/emulador
- [ ] Verificar splash screen
- [ ] Verificar notification icon

---

## 🆘 Problemas Comuns

### "Unable to resolve asset"
- Verifique se o arquivo existe
- Verifique o caminho em app.json
- Tente `npm start` novamente

### Logo fica borrado
- Verifique a dimensão (512x512 é correto)
- Exporte em 2x scale se possível
- Use PNG sem compressão

### Splash não aparece
- Verifique se a imagem é landscape/portrait correto
- Dimensão deve ser 1080x1920 mínimo
- Teste em diferentes emuladores

---

## 📚 Recursos

- **Figma:** https://figma.com
- **Canva:** https://canva.com
- **Remove.bg:** https://remove.bg
- **ImageMagick:** https://imagemagick.org/
- **Expo Docs:** https://docs.expo.dev/config/app/

---

## ✨ Resultado Final

Depois que gerar os assets corretamente:
- ✅ App icon bonito
- ✅ Splash screen elegante
- ✅ Notifications com ícone correto
- ✅ App profissional

---

**Próximo passo:** Gere os assets e teste no device!
