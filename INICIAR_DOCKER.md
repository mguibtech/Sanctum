# 🐳 Iniciar Docker - Guia Rápido

## Windows: Iniciar Docker Desktop

### Opção 1: Inicie Manualmente
```
1. Abra "Docker Desktop" no menu Iniciar
2. Aguarde a mensagem: "Docker is ready"
3. Feche a janela (fica rodando em background)
4. Abra um novo terminal
```

### Opção 2: Inicie via Terminal (PowerShell)
```powershell
# Como Administrador:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguarde 30 segundos até iniciar
Start-Sleep -Seconds 30

# Verifique:
docker --version
docker ps
```

### Opção 3: Inicie via WSL2
```bash
# No WSL2 ou Git Bash:
docker ps

# Se não responder, Docker não está rodando
# Inicie Docker Desktop manualmente
```

---

## Verificar Status do Docker

```bash
docker --version
# Esperado: Docker version 29.3.1, build c2be9cc

docker ps
# Esperado: CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS   NAMES
# (vazio se nenhum container rodando)
```

---

## ⏳ Aguardar Docker Iniciar

Docker leva 20-30 segundos para iniciar após ser aberto. Se receber erro:

```
error during connect: Get "http://%2F%2F.%2Fpipe%2Fdocker_engine": 
open //./pipe/docker_engine: The system cannot find the file specified.
```

**Solução:** Aguarde mais tempo e tente novamente

```bash
# Aguarde 30 segundos
Start-Sleep -Seconds 30

# Tente novamente
docker ps
```

---

## 🚀 Após Docker Iniciar

Assim que Docker estiver pronto:

```bash
cd c:/www/mguibtech/projects/Sanctum/sanctum

# Inicie os containers
docker-compose up -d

# Aguarde ~30 segundos para o banco iniciar
docker-compose logs -f postgres | grep "database system is ready"

# Quando ver "database system is ready", pressione Ctrl+C
```

---

**Próximo passo:** Depois que Docker estiver rodando, execute:

```bash
docker-compose up -d
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

