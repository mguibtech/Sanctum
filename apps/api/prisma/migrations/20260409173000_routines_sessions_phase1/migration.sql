-- CreateEnum
CREATE TYPE "RoutineType" AS ENUM ('MORNING', 'NIGHT', 'BIBLE', 'ROSARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RoutineItemType" AS ENUM ('LITURGY', 'BIBLE_CHAPTER', 'ROSARY', 'GUIDED_SESSION', 'FREE_PRAYER', 'REFLECTION');

-- CreateEnum
CREATE TYPE "SessionSourceType" AS ENUM ('ROUTINE', 'LITURGY', 'BIBLE', 'ROSARY', 'GUIDED_SESSION', 'CAMPAIGN', 'FREE_PRAYER');

-- CreateEnum
CREATE TYPE "SessionCompletionState" AS ENUM ('STARTED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('DAILY_MINUTES', 'WEEKLY_SESSIONS', 'WEEKLY_ROUTINE_DAYS', 'BIBLE_DAYS', 'ROSARY_PER_WEEK');

-- CreateTable
CREATE TABLE "prayer_routines" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" VARCHAR(240),
    "type" "RoutineType" NOT NULL DEFAULT 'CUSTOM',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_items" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "item_type" "RoutineItemType" NOT NULL,
    "target_id" TEXT,
    "title" TEXT NOT NULL,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 0,
    "metadata_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "routine_id" TEXT,
    "title" TEXT NOT NULL,
    "time_of_day" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "days_of_week" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_session_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_type" "SessionSourceType" NOT NULL,
    "source_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "completion_state" "SessionCompletionState" NOT NULL DEFAULT 'STARTED',
    "contemplated" BOOLEAN NOT NULL DEFAULT false,
    "notes" VARCHAR(500),
    "xp_granted" INTEGER NOT NULL DEFAULT 0,
    "streak_counted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "goal_type" "GoalType" NOT NULL,
    "target_value" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_daily_summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "minutes_prayed" INTEGER NOT NULL DEFAULT 0,
    "sessions_completed" INTEGER NOT NULL DEFAULT 0,
    "routine_completed" BOOLEAN NOT NULL DEFAULT false,
    "liturgy_completed" BOOLEAN NOT NULL DEFAULT false,
    "rosary_completed" BOOLEAN NOT NULL DEFAULT false,
    "bible_completed" BOOLEAN NOT NULL DEFAULT false,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "streak_counted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prayer_routines_user_id_is_active_idx" ON "prayer_routines"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "routine_items_routine_id_position_key" ON "routine_items"("routine_id", "position");

-- CreateIndex
CREATE INDEX "routine_items_routine_id_idx" ON "routine_items"("routine_id");

-- CreateIndex
CREATE INDEX "reminders_user_id_is_enabled_idx" ON "reminders"("user_id", "is_enabled");

-- CreateIndex
CREATE INDEX "prayer_session_logs_user_id_started_at_idx" ON "prayer_session_logs"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "prayer_session_logs_user_id_completion_state_idx" ON "prayer_session_logs"("user_id", "completion_state");

-- CreateIndex
CREATE INDEX "user_goals_user_id_is_active_idx" ON "user_goals"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_summaries_user_id_date_key" ON "user_daily_summaries"("user_id", "date");

-- CreateIndex
CREATE INDEX "user_daily_summaries_user_id_date_idx" ON "user_daily_summaries"("user_id", "date");

-- AddForeignKey
ALTER TABLE "prayer_routines" ADD CONSTRAINT "prayer_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "prayer_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "prayer_routines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_session_logs" ADD CONSTRAINT "prayer_session_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_summaries" ADD CONSTRAINT "user_daily_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
