-- CreateEnum for CampaignGoalType
CREATE TYPE "CampaignGoalType" AS ENUM ('PARTICIPANTS', 'PRAYERS', 'DAYS_COMPLETED');

-- CreateEnum for GroupRole
CREATE TYPE "GroupRole" AS ENUM ('MEMBER', 'MODERATOR', 'LEADER');

-- CreateEnum for GroupVisibility
CREATE TYPE "GroupVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PARISH_ONLY');

-- CreateTable PrayerCampaign
CREATE TABLE "prayer_campaigns" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "host_type" TEXT NOT NULL,
    "host_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "goal_type" "CampaignGoalType" NOT NULL,
    "goal_value" INTEGER NOT NULL,
    "cover_image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prayer_campaigns_slug_key" ON "prayer_campaigns"("slug");
CREATE INDEX "prayer_campaigns_host_type_host_id_idx" ON "prayer_campaigns"("host_type", "host_id");
CREATE INDEX "prayer_campaigns_is_published_idx" ON "prayer_campaigns"("is_published");

-- CreateTable PrayerCampaignParticipant
CREATE TABLE "prayer_campaign_participants" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "days_completed" INTEGER NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_campaign_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prayer_campaign_participants_campaign_id_user_id_key" ON "prayer_campaign_participants"("campaign_id", "user_id");
CREATE INDEX "prayer_campaign_participants_campaign_id_idx" ON "prayer_campaign_participants"("campaign_id");

-- AddForeignKey
ALTER TABLE "prayer_campaign_participants" ADD CONSTRAINT "prayer_campaign_participants_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "prayer_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prayer_campaign_participants" ADD CONSTRAINT "prayer_campaign_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable PrayerCampaignUpdate
CREATE TABLE "prayer_campaign_updates" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_campaign_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prayer_campaign_updates_campaign_id_idx" ON "prayer_campaign_updates"("campaign_id");

-- AddForeignKey
ALTER TABLE "prayer_campaign_updates" ADD CONSTRAINT "prayer_campaign_updates_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "prayer_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prayer_campaign_updates" ADD CONSTRAINT "prayer_campaign_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable CommunityGroup
CREATE TABLE "community_groups" (
    "id" TEXT NOT NULL,
    "parish_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "GroupVisibility" NOT NULL DEFAULT 'PUBLIC',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_groups_parish_id_idx" ON "community_groups"("parish_id");
CREATE INDEX "community_groups_visibility_idx" ON "community_groups"("visibility");

-- AddForeignKey
ALTER TABLE "community_groups" ADD CONSTRAINT "community_groups_parish_id_fkey" FOREIGN KEY ("parish_id") REFERENCES "parishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "community_groups" ADD CONSTRAINT "community_groups_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable CommunityGroupMember
CREATE TABLE "community_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_group_members_group_id_user_id_key" ON "community_group_members"("group_id", "user_id");
CREATE INDEX "community_group_members_group_id_idx" ON "community_group_members"("group_id");

-- AddForeignKey
ALTER TABLE "community_group_members" ADD CONSTRAINT "community_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "community_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_group_members" ADD CONSTRAINT "community_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add campaigns relation to User
-- (done in schema.prisma separately)
