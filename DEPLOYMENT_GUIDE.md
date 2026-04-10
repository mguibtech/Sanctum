# 🚀 Deployment Guide - Sanctum Backend

**Data:** 2026-04-10  
**Ambiente:** NestJS + Docker + PostgreSQL  
**Status:** Production Ready ✅

---

## 📋 Índice

1. [Opções de Deployment](#opções-de-deployment)
2. [Ambiente Local](#ambiente-local)
3. [Deploy no Heroku](#deploy-no-heroku)
4. [Deploy na Vercel](#deploy-na-vercel)
5. [Deploy em VPS](#deploy-em-vps)
6. [Deploy no AWS](#deploy-no-aws)
7. [Configurações de Produção](#configurações-de-produção)
8. [Monitoramento](#monitoramento)

---

## 🎯 Opções de Deployment

| Plataforma | Custo | Escalabilidade | Setup | Recomendado |
|-----------|-------|-----------------|-------|-------------|
| **Heroku** | Pago | Média | ⭐ Fácil | ✅ MVP |
| **Vercel** | Grátis | Alta | ⭐⭐ Médio | ⚡ API Serverless |
| **Railway** | Pago | Alta | ⭐ Fácil | ✅ Recomendado |
| **AWS EC2** | Pago | Alta | ⭐⭐⭐ Complexo | 🏢 Enterprise |
| **DigitalOcean** | Pago | Alta | ⭐⭐ Médio | 💪 Popular |

---

## 🏠 Ambiente Local

Já configurado! Basta rodar:

```bash
# Terminal 1: Iniciar Docker
docker-compose up -d

# Terminal 2: Executar migrações
cd apps/api
npx prisma migrate deploy

# Terminal 3: Iniciar API
npm run start:dev
```

✅ API rodando em: `http://localhost:3000`

---

## 🦸 Deploy no Heroku (Recomendado para MVP)

### Pré-requisitos
```bash
npm install -g heroku
heroku login
```

### Passo 1: Criar app no Heroku
```bash
heroku create sanctum-api
```

### Passo 2: Adicionar PostgreSQL (PostgreSQL do Heroku)
```bash
heroku addons:create heroku-postgresql:hobby-dev --app=sanctum-api
```

### Passo 3: Configurar variáveis de ambiente
```bash
heroku config:set JWT_SECRET=sua_secret_aqui --app=sanctum-api
heroku config:set JWT_EXPIRATION=15m --app=sanctum-api
heroku config:set NODE_ENV=production --app=sanctum-api
```

### Passo 4: Adicionar Procfile
```bash
# Criar na raiz do projeto
echo "web: cd apps/api && npm run start" > Procfile
```

### Passo 5: Deploy
```bash
git push heroku main
```

### Passo 6: Executar migrações
```bash
heroku run "cd apps/api && npx prisma migrate deploy" --app=sanctum-api
```

### Passo 7: Seed (opcional)
```bash
heroku run "cd apps/api && npx prisma db seed" --app=sanctum-api
```

✅ API disponível em: `https://sanctum-api.herokuapp.com`

---

## ⚡ Deploy na Vercel (Serverless)

### Passo 1: Preparar para serverless
```bash
npm install -g vercel
vercel login
```

### Passo 2: Configurar `vercel.json`
```json
{
  "buildCommand": "cd apps/api && npm run build",
  "outputDirectory": "apps/api/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

### Passo 3: Deploy
```bash
vercel --prod
```

---

## 🚂 Deploy no Railway (Recomendado)

Railway é a melhor opção para NestJS + PostgreSQL.

### Passo 1: Criar projeto no Railway
1. Ir para [railway.app](https://railway.app)
2. Conectar GitHub
3. Selecionar repositório

### Passo 2: Adicionar PostgreSQL
- Dashboard → Add Service → PostgreSQL
- Railway cria automaticamente `DATABASE_URL`

### Passo 3: Configurar variáveis
```
JWT_SECRET=sua_secret_aqui
JWT_EXPIRATION=15m
NODE_ENV=production
```

### Passo 4: Deploy automático
- Push para `main` = deploy automático
- Railway roda: `npm run build && npm run start`

---

## 🏢 Deploy em VPS (DigitalOcean/Linode)

### Passo 1: Criar droplet
```bash
# Ubuntu 22.04, 2GB RAM minimum
ssh root@seu_ip
```

### Passo 2: Instalar dependências
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Nginx (reverse proxy)
sudo apt-get install -y nginx

# PM2 (process manager)
sudo npm install -g pm2
```

### Passo 3: Clone do repositório
```bash
cd /var/www
git clone https://github.com/mguibtech/Sanctum.git sanctum
cd sanctum/apps/api
npm install --production
```

### Passo 4: Configurar PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE sanctum;
CREATE USER sanctum WITH PASSWORD 'senha_segura';
ALTER ROLE sanctum SUPERUSER;
```

### Passo 5: Variáveis de ambiente
```bash
cat > .env << EOF
DATABASE_URL=postgresql://sanctum:senha_segura@localhost:5432/sanctum
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=15m
NODE_ENV=production
EOF
```

### Passo 6: Migrações
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Passo 7: Iniciar com PM2
```bash
pm2 start "npm run start" --name "sanctum-api"
pm2 save
sudo env PATH=$PATH:/usr/local/bin pm2 startup -u root --hp /root
```

### Passo 8: Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## ☁️ Deploy no AWS

### Opção 1: EC2 + RDS
1. Criar EC2 instance (Ubuntu 22.04)
2. Criar RDS PostgreSQL
3. Seguir passos do VPS acima

### Opção 2: ECS + RDS
1. Criar ECR repository
2. Build Docker image: `docker build -t sanctum-api .`
3. Push: `docker push seu_ecr_uri/sanctum-api:latest`
4. Criar ECS cluster
5. Deploy via CloudFormation

### Opção 3: Lambda (Serverless)
```bash
npm install -g serverless
serverless config credentials --provider aws --key seu_key --secret sua_secret
```

---

## ⚙️ Configurações de Produção

### 1. Variáveis de Ambiente
```bash
# Obrigatórias
DATABASE_URL=postgresql://...
JWT_SECRET=uma_string_aleatoria_longa_e_segura
JWT_EXPIRATION=15m
NODE_ENV=production

# Opcionais
LOG_LEVEL=error
REDIS_URL=redis://...
PORT=3000
```

### 2. Build Production
```bash
npm run build
npm run start
```

### 3. Dockerfile (Exemplo)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### 4. Docker Compose Production
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: sanctum
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/sanctum
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

---

## 📊 Monitoramento

### Logs
```bash
# Heroku
heroku logs --tail --app=sanctum-api

# Docker
docker-compose logs -f api

# VPS (PM2)
pm2 logs sanctum-api
```

### Health Check
```bash
curl https://seu-dominio.com/health
```

### Métricas
- **CPU:** Monitor via plataforma (Heroku, Railway, etc)
- **Memória:** PM2 + Node monitoring
- **Database:** Prisma + PostgreSQL logs
- **API:** Endpoints retornam status codes apropriados

### Alerts
- ✅ Configurar alerts na plataforma
- ✅ Dead man's switch com Statuspage
- ✅ Notificações em Slack/Discord

---

## 🔒 Segurança

### Checklist
- [ ] `JWT_SECRET` é uma string aleatória forte
- [ ] `DATABASE_URL` não está em logs
- [ ] HTTPS habilitado (automático em Heroku/Vercel)
- [ ] Rate limiting ativo (100 req/min)
- [ ] CORS configurado corretamente
- [ ] Headers de segurança adicionados
- [ ] Senhas hasheadas (bcrypt)
- [ ] Tokens expiram corretamente

---

## 📝 Checklist de Deployment

### Antes de Deploy
- [ ] Testes passando
- [ ] Migrations testadas localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Database backup feito
- [ ] Redis/Cache configurado (opcional)

### Durante Deploy
- [ ] Usar blue-green deployment quando possível
- [ ] Executar migrações antes de reiniciar
- [ ] Monitorar logs em tempo real

### Após Deploy
- [ ] Testar health endpoint
- [ ] Verificar logs
- [ ] Testar endpoints críticos
- [ ] Confirmar rate limiting
- [ ] Check database connectivity

---

## 🆘 Troubleshooting

### "Connection refused to database"
```bash
# Verificar se database está rodando
heroku ps --app=sanctum-api

# Verificar logs
heroku logs --tail --app=sanctum-api
```

### "Out of memory"
```bash
# Aumentar dyno (Heroku)
heroku dyno:resize standard-1x --app=sanctum-api
```

### "Slow queries"
```bash
# Analisar queries
npx prisma studio

# Adicionar índices no schema.prisma
```

---

**Status:** Pronto para deployment! 🚀
