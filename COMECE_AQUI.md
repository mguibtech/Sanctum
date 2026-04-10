# 🚀 COMECE AQUI - Sanctum Backend

**Tempo estimado:** 5 minutos

---

## ⚡ Quick Start (Mais Fácil)

### Opção 1: Windows - Clique e Pronto! 🖱️

```
1. Abra "Docker Desktop" no menu Iniciar
   (ou Search → "Docker" → Abra)

2. Aguarde aparecer "Docker is ready" na notification area

3. Abra Command Prompt ou PowerShell em:
   c:\www\mguibtech\projects\Sanctum\sanctum

4. Digite EXATAMENTE:
   iniciar-docker.bat

5. Aguarde terminar (leva ~2 minutos)

6. Pronto! API rodando em http://localhost:3000
```

---

## 🐭 Se preferir Passo a Passo

### Passo 1: Inicie Docker Desktop
```
Procure por "Docker" no menu Iniciar
Clique em "Docker Desktop"
Aguarde 30 segundos até aparecer "Docker is ready"
```

### Passo 2: Abra um Terminal
```
Windows Key + R
Digite: cmd
Pressione Enter
```

### Passo 3: Navegue para o projeto
```
cd c:\www\mguibtech\projects\Sanctum\sanctum
```

### Passo 4: Inicie os containers
```
docker-compose up -d
```

Esperado:
```
Creating sanctum-postgres ... done
Creating sanctum-redis ... done
```

### Passo 5: Execute as migrações
```
cd apps\api
npx prisma migrate deploy
```

Esperado:
```
✔ Successfully applied X migrations
```

### Passo 6: Carregue dados de exemplo
```
npx prisma db seed
```

Esperado:
```
🌱 Seeding complete
```

### Passo 7: Inicie a API
```
npm run start:dev
```

Esperado:
```
[Nest] 12345  - 04/10/2026 10:30:00 LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 04/10/2026 10:30:02 LOG [NestApplication] Nest application successfully started
```

---

## ✅ Verificar se Está Funcionando

### Em outro terminal:
```bash
curl http://localhost:3000/bible/health

# Ou no navegador:
http://localhost:3000/bible/health
```

Esperado:
```json
{"ok":true,"source":"unavailable","booksCount":73,"cachedChapters":0,...}
```

---

## 🎯 URLs Importantes

| O quê | URL |
|-------|-----|
| **API** | http://localhost:3000 |
| **Prisma Studio** (banco visual) | http://localhost:5555 |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |

---

## 📚 Próximas Ações

### Ver dados no banco:
```bash
cd apps/api
npx prisma studio
# Abre http://localhost:5555
```

### Testar endpoints:
```bash
# Registre um usuário:
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test123!","name":"Teste"}'

# Resposta:
# {"accessToken":"...","refreshToken":"..."}

# Salve o token em uma variável:
set TOKEN=seu_access_token_aqui

# Teste endpoint protegido:
curl http://localhost:3000/auth/me -H "Authorization: Bearer %TOKEN%"
```

### Ver documentação completa:
```bash
# API Reference
cat API_REFERENCE.md

# Test Plan
cat TEST_PLAN.md

# Setup Guide
cat SETUP_GUIDE.md
```

---

## ❌ Se Algo der Errado

### "Docker not installed"
→ Baixe em: https://www.docker.com/products/docker-desktop

### "Can't reach database server"
→ Abra Docker Desktop, aguarde 30 segundos, tente novamente

### "Port already in use"
→ Outro processo está usando a porta 5432
```bash
# Matar processo antigo:
docker-compose down
docker-compose up -d
```

### "Authentication failed"
→ PostgreSQL não respondeu:
```bash
docker-compose logs postgres
docker-compose restart postgres
```

---

## 🎓 Estrutura do Projeto

```
c:\www\mguibtech\projects\Sanctum\sanctum\
├── apps\
│   ├── api\              ← 🔙 Backend (NestJS)
│   │   ├── src\modules\  ← 16 módulos
│   │   └── prisma\       ← Schema + migrations
│   └── mobile\           ← 📱 App mobile (React Native)
├── docker-compose.yml    ← Configuração Docker
├── iniciar-docker.bat    ← ⚡ Script automático
└── docs\                 ← 📚 Documentação
```

---

## 📞 Documentação

| Arquivo | Para Quê |
|---------|----------|
| **COMECE_AQUI.md** | Este arquivo - início rápido |
| **SETUP_GUIDE.md** | Setup detalhado (Supabase, Docker, PostgreSQL) |
| **POSTGRESQL_SETUP.md** | Setup do PostgreSQL local |
| **INICIAR_DOCKER.md** | Como iniciar Docker |
| **API_REFERENCE.md** | Documentação de todos os 108+ endpoints |
| **TEST_PLAN.md** | Casos de teste |
| **SESSION_REPORT.md** | Relatório completo da implementação |

---

## 🟢 Status

```
✅ Backend implementado
✅ Banco projetado
✅ Docker configurado
✅ Scripts de inicialização criados
✅ Documentação completa

🚀 Pronto para rodar!
```

---

## 💡 Dicas

- 🔄 Para parar a API: `CTRL+C` no terminal
- 🗑️ Para apagar containers: `docker-compose down`
- 📊 Para visualizar banco: `npx prisma studio`
- 📝 Para ver logs: `docker-compose logs -f postgres`
- 🔌 Para reconectar: `docker-compose restart postgres`

---

**Próximo passo:** Execute `iniciar-docker.bat` e aproveite! 🎉

