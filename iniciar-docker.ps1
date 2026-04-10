#!/usr/bin/env pwsh
<#
.SYNOPSIS
Inicia Docker Desktop e configura o banco PostgreSQL para Sanctum

.DESCRIPTION
Este script:
1. Inicia Docker Desktop
2. Aguarda inicialização
3. Inicia containers (PostgreSQL + Redis)
4. Executa migrações Prisma
5. Carrega dados de exemplo
6. Inicia a API
#>

Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Sanctum Backend - Inicialização Docker     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Admin
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Este script precisa ser executado como Administrador" -ForegroundColor Yellow
    Write-Host "Reiniciando como Admin..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Passo 1: Verificar Docker
Write-Host "1️⃣  Verificando Docker..." -ForegroundColor Green
$dockerVersion = docker --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Docker encontrado: $dockerVersion"
} else {
    Write-Host "   ❌ Docker não instalado. Baixe em: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Passo 2: Verificar se Docker daemon está rodando
Write-Host ""
Write-Host "2️⃣  Verificando Docker daemon..." -ForegroundColor Green
$dockerPs = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⏳ Docker não está rodando. Iniciando Docker Desktop..." -ForegroundColor Yellow

    # Tente iniciar Docker Desktop
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "   ⏳ Aguardando Docker iniciar (30 segundos)..." -ForegroundColor Yellow

        # Aguarde com barra de progresso
        for ($i = 0; $i -lt 30; $i++) {
            Write-Progress -Activity "Iniciando Docker" -PercentComplete $((($i + 1) / 30) * 100) -Status "$($i + 1)/30 segundos"
            Start-Sleep -Seconds 1
        }
        Write-Host "   ✅ Docker iniciado"
    } else {
        Write-Host "   ❌ Docker Desktop não encontrado em $dockerPath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✅ Docker daemon rodando"
}

# Passo 3: Navegar para o diretório
Write-Host ""
Write-Host "3️⃣  Navegando para diretório do projeto..." -ForegroundColor Green
Set-Location "c:/www/mguibtech/projects/Sanctum/sanctum"
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Erro ao navegar para diretório" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Diretório: $(Get-Location)"

# Passo 4: Iniciar docker-compose
Write-Host ""
Write-Host "4️⃣  Iniciando PostgreSQL e Redis..." -ForegroundColor Green
Write-Host "   (execute: docker-compose up -d)"
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Erro ao iniciar docker-compose" -ForegroundColor Red
    exit 1
}

Write-Host "   ⏳ Aguardando banco iniciar (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar se banco está pronto
Write-Host "   🔍 Verificando conexão com banco..."
$connected = $false
for ($i = 0; $i -lt 10; $i++) {
    $testConn = docker-compose exec -T postgres pg_isready -U sanctum -d sanctum 2>&1
    if ($testConn -like "*accepting*") {
        Write-Host "   ✅ PostgreSQL pronto para conexões"
        $connected = $true
        break
    }
    Write-Host "   ⏳ Tentativa $($i + 1)/10..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

if (-not $connected) {
    Write-Host "   ⚠️  Banco pode estar iniciando ainda, continuando mesmo assim..."
}

# Passo 5: Executar migrações
Write-Host ""
Write-Host "5️⃣  Executando migrações Prisma..." -ForegroundColor Green
cd apps/api
Write-Host "   (execute: npx prisma migrate deploy)"
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Erro ao executar migrações" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Migrações executadas com sucesso"

# Passo 6: Carregar seed data
Write-Host ""
Write-Host "6️⃣  Carregando dados de exemplo..." -ForegroundColor Green
Write-Host "   (execute: npx prisma db seed)"
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dados de exemplo carregados"
} else {
    Write-Host "   ⚠️  Seed pode ter dados duplicados (ok se rodou antes)"
}

# Passo 7: Iniciar API
Write-Host ""
Write-Host "7️⃣  Iniciando API Sanctum..." -ForegroundColor Green
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ Tudo pronto! Iniciando a API...         ║" -ForegroundColor Cyan
Write-Host "║                                              ║" -ForegroundColor Cyan
Write-Host "║  🌐 API rodará em: http://localhost:3000   ║" -ForegroundColor Green
Write-Host "║  📊 Studio em: http://localhost:5555       ║" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Cyan
Write-Host "║  Digite CTRL+C para parar a API             ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

npm run start:dev
