#!/bin/bash

# ====================================
# Sanctum Backend - Deployment Script
# ====================================
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production up
# ====================================

set -e

ENV=${1:-development}
ACTION=${2:-up}
PROJECT_NAME="sanctum"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Sanctum Backend - Deployment Script                   ║"
echo "║  Environment: $ENV                                     ║"
echo "║  Action: $ACTION                                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Load environment file
if [ -f ".env.$ENV" ]; then
    echo "📦 Loading .env.$ENV..."
    export $(cat ".env.$ENV" | grep -v '^#' | xargs)
else
    echo "❌ .env.$ENV not found!"
    echo "Please create .env.$ENV with required variables"
    exit 1
fi

# Functions
build_and_push() {
    echo "🔨 Building Docker image..."
    if [ "$ENV" = "production" ]; then
        docker build -t "sanctum-api:$ENV" ./apps/api
        docker tag "sanctum-api:$ENV" "sanctum-api:latest"
        echo "✅ Image built: sanctum-api:$ENV"
    else
        docker-compose -f docker-compose.yml build api
        echo "✅ Development image built"
    fi
}

start_services() {
    echo "🚀 Starting services..."
    if [ "$ENV" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --project-name "$PROJECT_NAME" up -d
    else
        docker-compose --project-name "$PROJECT_NAME" up -d
    fi
    echo "✅ Services started"
}

stop_services() {
    echo "🛑 Stopping services..."
    if [ "$ENV" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --project-name "$PROJECT_NAME" down
    else
        docker-compose --project-name "$PROJECT_NAME" down
    fi
    echo "✅ Services stopped"
}

run_migrations() {
    echo "🔄 Running migrations..."
    docker exec "${PROJECT_NAME}-api" npx prisma migrate deploy
    echo "✅ Migrations completed"
}

seed_database() {
    echo "🌱 Seeding database..."
    docker exec "${PROJECT_NAME}-api" npx prisma db seed
    echo "✅ Database seeded"
}

check_health() {
    echo "🏥 Checking health..."
    sleep 5
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ API is healthy"
    else
        echo "❌ API health check failed"
        exit 1
    fi
}

view_logs() {
    echo "📋 Viewing logs..."
    if [ "$ENV" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --project-name "$PROJECT_NAME" logs -f api
    else
        docker-compose --project-name "$PROJECT_NAME" logs -f api
    fi
}

backup_database() {
    echo "💾 Backing up database..."
    mkdir -p backups
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker exec "${PROJECT_NAME}-postgres" pg_dump -U "$DB_USER" "$DB_NAME" > "backups/backup_$TIMESTAMP.sql"
    echo "✅ Database backed up: backups/backup_$TIMESTAMP.sql"
}

# Execute action
case $ACTION in
    up)
        build_and_push
        start_services
        sleep 10
        run_migrations
        check_health
        echo ""
        echo "✅ Deployment complete!"
        ;;
    down)
        stop_services
        ;;
    restart)
        stop_services
        sleep 5
        start_services
        sleep 10
        run_migrations
        check_health
        ;;
    migrate)
        run_migrations
        ;;
    seed)
        seed_database
        ;;
    health)
        check_health
        ;;
    logs)
        view_logs
        ;;
    backup)
        backup_database
        ;;
    full-deployment)
        backup_database
        build_and_push
        stop_services
        sleep 5
        start_services
        sleep 10
        run_migrations
        check_health
        echo ""
        echo "✅ Full deployment complete with backup!"
        ;;
    *)
        echo "❌ Unknown action: $ACTION"
        echo ""
        echo "Available actions:"
        echo "  up              - Build and start services"
        echo "  down            - Stop services"
        echo "  restart         - Restart services"
        echo "  migrate         - Run database migrations"
        echo "  seed            - Seed database with initial data"
        echo "  health          - Check API health"
        echo "  logs            - View API logs"
        echo "  backup          - Backup database"
        echo "  full-deployment - Full deployment with backup"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"
