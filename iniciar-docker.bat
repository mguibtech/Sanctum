@echo off
REM Sanctum Backend - Inicialização Docker
REM Script para Windows

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  Sanctum Backend - Inicialização com Docker             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Verificar Docker
echo [1/6] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Docker não encontrado ou não está rodando
    echo.
    echo Solução 1: Instale Docker Desktop
    echo   👉 https://www.docker.com/products/docker-desktop
    echo.
    echo Solução 2: Se já instalou, abra "Docker Desktop" no menu Iniciar
    echo   Aguarde 30 segundos e execute este script novamente
    echo.
    pause
    exit /b 1
)
echo ✅ Docker encontrado

REM Navegar para diretório
echo.
echo [2/6] Navegando para diretório...
cd /d "c:\www\mguibtech\projects\Sanctum\sanctum"
echo ✅ Diretório: %cd%

REM Iniciar docker-compose
echo.
echo [3/6] Iniciando PostgreSQL e Redis...
docker-compose up -d
echo ✅ Containers iniciados

REM Aguardar banco
echo.
echo [4/6] Aguardando banco iniciar (30 segundos)...
timeout /t 30 /nobreak
echo ✅ Tempo aguardado

REM Executar migrações
echo.
echo [5/6] Executando migrações...
cd apps\api
call npx prisma migrate deploy
if errorlevel 1 (
    echo.
    echo ❌ Erro nas migrações. Verifique a conexão com o banco.
    pause
    exit /b 1
)
echo ✅ Migrações executadas

REM Seed data
echo.
echo [6/6] Carregando dados de exemplo...
call npx prisma db seed 2>nul
echo ✅ Dados carregados (ou já existiam)

REM Iniciar API
echo.
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✅ Tudo pronto! Iniciando a API...                      ║
echo ║                                                          ║
echo ║  🌐 API: http://localhost:3000                          ║
echo ║  📊 Studio: http://localhost:5555                       ║
echo ║                                                          ║
echo ║  Pressione CTRL+C para parar                            ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

npm run start:dev
