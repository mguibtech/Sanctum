-- CreateTable UserPreferenceProfile
CREATE TABLE "user_preference_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "preferred_format" TEXT NOT NULL DEFAULT 'MIXED',
    "session_length" TEXT NOT NULL DEFAULT 'MEDIUM',
    "focus_area" TEXT NOT NULL DEFAULT 'PEACE',
    "experience_level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "notify_morning" BOOLEAN NOT NULL DEFAULT true,
    "notify_night" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preference_profiles_user_id_key" ON "user_preference_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "user_preference_profiles" ADD CONSTRAINT "user_preference_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable UserInterest
CREATE TABLE "user_interests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "interest_key" TEXT NOT NULL,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_user_id_interest_key_key" ON "user_interests"("user_id", "interest_key");

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable RecommendationQueue
CREATE TABLE "recommendation_queues" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason_key" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed_at" TIMESTAMP(3),

    CONSTRAINT "recommendation_queues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recommendation_queues_user_id_consumed_at_idx" ON "recommendation_queues"("user_id", "consumed_at");

-- AddForeignKey
ALTER TABLE "recommendation_queues" ADD CONSTRAINT "recommendation_queues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add onboardingCompleted to User
ALTER TABLE "users" ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;
