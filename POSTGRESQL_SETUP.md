# 🐘 Configuração PostgreSQL - Sanctum

**Objetivo:** Configurar PostgreSQL localmente e iniciar o banco de dados

---

## 🪟 Windows Setup

### Opção 1: PostgreSQL via Windows Terminal (WSL2) - Recomendado

Se você tem WSL2 instalado:

```bash
# Abra Windows Terminal como Administrador

# Instale PostgreSQL no WSL2
wsl
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Inicie o serviço
sudo service postgresql start

# Crie o usuário e banco
sudo -u postgres psql -c "CREATE USER sanctum WITH PASSWORD 'sanctum';"
sudo -u postgres createdb -O sanctum sanctum

# Verifique a conexão
psql -U sanctum -h localhost -d sanctum -c "SELECT 1;"
```

### Opção 2: PostgreSQL Standalone (Sem WSL2)

1. **Baixe o instalador:**
   - Acesse: https://www.postgresql.org/download/windows/
   - Baixe PostgreSQL 16 (ou mais recente)

2. **Execute o instalador:**
   ```
   PostgreSQL Setup Wizard
   ├─ Installation Directory: C:\Program Files\PostgreSQL\16
   ├─ Password (postgres user): sanctum
   ├─ Port: 5432
   └─ Locale: Portuguese (Brazil)
   ```

3. **Verifique a instalação:**
   ```bash
   # Adicione ao PATH (PowerShell como Admin)
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
   
   # Teste
   psql --version
   ```

4. **Crie o banco de dados:**
   ```bash
   # Abra Command Prompt como Administrador
   psql -U postgres
   
   # No prompt PostgreSQL:
   postgres=# CREATE USER sanctum WITH PASSWORD 'sanctum';
   postgres=# CREATE DATABASE sanctum OWNER sanctum;
   postgres=# \q
   ```

5. **Verifique a conexão:**
   ```bash
   psql -U sanctum -h localhost -d sanctum -c "SELECT 1;"
   ```

---

## 🔧 Configuração do Prisma

### Passo 1: Verifique o .env
```bash
# Abra: apps/api/.env
# Verifique:
DATABASE_URL="postgresql://sanctum:sanctum@localhost:5432/sanctum?schema=public"
```

Se o port está diferente (ex: 55432), atualize:
```bash
DATABASE_URL="postgresql://sanctum:sanctum@localhost:5432/sanctum?schema=public"
```

### Passo 2: Execute as Migrações
```bash
cd apps/api

# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma migrate deploy

# Verifique o sucesso
npx prisma migrate status
```

### Passo 3: Carregue os Dados de Exemplo
```bash
# Seed data
npx prisma db seed

# Verifique
npx prisma studio
# Abre em http://localhost:5555
```

---

## 🚀 Inicie a API

### Terminal 1: Inicie o Servidor
```bash
cd apps/api
npm run start:dev

# Esperado:
# [Nest] 12345  - 04/10/2026 10:30:00 LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - 04/10/2026 10:30:02 LOG [NestApplication] Nest application successfully started
```

### Terminal 2: Teste a API
```bash
# Teste simples
curl http://localhost:3000/bible/health

# Esperado:
# {"ok":true,"source":"local-cache","booksCount":73,...}
```

---

## ✅ Checklist de Configuração

- [ ] PostgreSQL instalado
- [ ] Serviço PostgreSQL rodando
- [ ] Banco `sanctum` criado
- [ ] Usuário `sanctum` criado
- [ ] Conexão verificada (`psql -U sanctum...`)
- [ ] .env configurado com CONNECTION_URL correto
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Seed data carregado (`npx prisma db seed`)
- [ ] API iniciada (`npm run start:dev`)
- [ ] Endpoints respondendo (`curl http://localhost:3000/...`)

---

## 🔍 Diagnosticar Problemas

### Erro: "Can't reach database server"
```bash
# Verifique se PostgreSQL está rodando
psql -U postgres -h localhost -c "SELECT 1;"

# Se não funcionar:
# Windows: Procure por "Services" → PostgreSQL → Inicie
# WSL2: sudo service postgresql start
```

### Erro: "Authentication failed"
```bash
# Verifique o .env
cat apps/api/.env | grep DATABASE_URL

# Teste com psql
psql -U sanctum -h localhost -d sanctum -c "SELECT 1;"

# Resetar senha do postgres:
psql -U postgres
ALTER USER sanctum WITH PASSWORD 'sanctum';
\q
```

### Erro: "Port already in use"
```bash
# Altere o port em .env para 5433
DATABASE_URL="postgresql://sanctum:sanctum@localhost:5433/sanctum?schema=public"

# Ou mate o processo PostgreSQL existente:
# Windows: taskkill /F /IM postgres.exe
# WSL2: sudo killall postgres
```

---

## 📊 Verificar Dados no Banco

### Opção 1: Prisma Studio (Recomendado)
```bash
cd apps/api
npx prisma studio
# Abre: http://localhost:5555
```

### Opção 2: psql Direto
```bash
psql -U sanctum -h localhost -d sanctum

# Listar tabelas
\dt

# Ver usuários
SELECT id, email, name FROM users;

# Ver conteúdo de séries
SELECT * FROM content_series;

# Sair
\q
```

### Opção 3: DBeaver (GUI)
```bash
# Baixe: https://dbeaver.io/download/
# Crie conexão:
# - Host: localhost
# - Port: 5432
# - Database: sanctum
# - User: sanctum
# - Password: sanctum
```

---

## 🎯 Próximos Passos

1. ✅ PostgreSQL configurado
2. ✅ Migrações executadas
3. ✅ Seed data carregado
4. 🚀 Inicie a API: `npm run start:dev`
5. 🧪 Teste os endpoints
6. 📱 Integre com app mobile

---

**Quando terminar a configuração, a API estará rodando em http://localhost:3000**

