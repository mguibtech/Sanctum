-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('LITURGY_READ', 'BIBLE_CHAPTERS', 'ROSARY', 'CONTEMPLATION', 'COMMUNITY_PRAYER');

-- CreateTable
CREATE TABLE "user_challenge_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "week_key" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_challenge_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_challenge_progress_user_id_week_key_idx" ON "user_challenge_progress"("user_id", "week_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_challenge_progress_user_id_challenge_id_week_key_key" ON "user_challenge_progress"("user_id", "challenge_id", "week_key");

-- AddForeignKey
ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
