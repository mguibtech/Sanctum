# 🔧 Troubleshooting - Sanctum

Soluções para problemas comuns do projeto.

---

## ✅ Problemas Resolvidos

### 1. "Unable to resolve asset './assets/splash.png'"

**Problema:** App.json referencia assets que não existem.

**Solução:**
- ✅ Criados arquivos placeholder em `apps/mobile/assets/`
- ✅ Guia de como gerar assets: [`GENERATE_ASSETS.md`](./apps/mobile/GENERATE_ASSETS.md)

**Próximo passo:** Gere os assets corretamente (ícones, splash)

---

### 2. "Unable to resolve 'react-native-svg'"

**Problema:** Componente Logo usava SVG mas a biblioteca não estava instalada.

**Solução:**
- ✅ Instalado: `npm install react-native-svg`
- ✅ Logo simplificado (versão sem SVG)

**Próximo passo:** Pode usar SVG quando quiser, a biblioteca está disponível

---

## 🚀 Próximas Ações

1. **Gere os Assets**
   ```bash
   # Siga GENERATE_ASSETS.md para criar:
   # - icon.png (512x512)
   # - adaptive-icon.png (108x108)
   # - splash.png (1080x1920)
   # - notification-icon.png (96x96)
   ```

2. **Teste o App**
   ```bash
   npm start
   npm run android
   npm run ios
   ```

3. **Atualize o Logo se necessário**
   ```tsx
   // Se quiser usar SVG versão completa:
   // Descomente o código SVG em components/ui/Logo.tsx
   ```

---

## 📋 Checklist de Setup

- [x] Design system criado
- [x] Componentes implementados
- [x] Documentação escrita
- [x] react-native-svg instalado
- [x] Assets placeholders criados
- [ ] Assets finais gerados
- [ ] App testado no device
- [ ] Publicado na app store

---

## 🎯 Status Atual

```
✅ Documentação:       COMPLETA
✅ Componentes:        PRONTOS
✅ Dependências:       INSTALADAS
⏳ Assets:             PLACEHOLDER (gere os reais)
⏳ Testes:             PENDENTE
⏳ Publicação:         PENDENTE
```

---

## 💡 Dicas

### Para Gerar Assets Rapidamente
1. Use Figma (melhor opção)
2. Use Canva (mais rápido)
3. Use script ImageMagick (se tiver instalado)

### Para Testar Rapidinho
```bash
npm start
# Escaneia o QR code com seu device
# Ou pressiona 'a' para Android, 'i' para iOS
```

### Para Debugar
```bash
# Ver logs detalhados
npm start -- --clear

# Reset cache
npm start -- --clear

# Ver erros de TypeScript
npx tsc --noEmit
```

---

## ❓ Problemas Frequentes

### App não carrega
```bash
# Limpe o cache
npm start -- --clear

# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Verifique tipos
npx tsc --noEmit

# Veja erros em arquivo
npx tsc --noEmit > errors.txt
```

### Assets não aparecem
- Verifique o caminho em `app.json`
- Verifique se o arquivo existe
- Tente fazer build clean

---

## 📞 Suporte

**Precisa de ajuda com:**
- **Assets:** Leia `GENERATE_ASSETS.md`
- **Componentes:** Veja `ComponentShowcase.tsx`
- **Código:** Leia `CODE_STYLE_GUIDE.md`
- **Design:** Leia `DESIGN_SYSTEM.md`

---

## ✨ Pronto!

Tudo está configurado. Agora é só:
1. Gerar assets (Figma/Canva)
2. Testar no device
3. Publicar!

---

**Última atualização:** 09 de Abril de 2026
