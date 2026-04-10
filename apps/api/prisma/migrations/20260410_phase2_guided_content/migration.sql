-- CreateTable ContentSeries
CREATE TABLE "content_series" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "estimated_days" INTEGER NOT NULL DEFAULT 7,
    "image_url" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_series_slug_key" ON "content_series"("slug");
CREATE INDEX "content_series_is_published_priority_idx" ON "content_series"("is_published", "priority");

-- CreateTable AudioAsset
CREATE TABLE "audio_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "voice_name" TEXT,
    "transcript" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable ContentSession
CREATE TABLE "content_sessions" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "session_type" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL DEFAULT 1,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "script_text" TEXT,
    "audio_asset_id" TEXT,
    "liturgical_season" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_sessions_series_id_day_number_key" ON "content_sessions"("series_id", "day_number");
CREATE INDEX "content_sessions_series_id_idx" ON "content_sessions"("series_id");

-- AddForeignKey
ALTER TABLE "content_sessions" ADD CONSTRAINT "content_sessions_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "content_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_sessions" ADD CONSTRAINT "content_sessions_audio_asset_id_fkey" FOREIGN KEY ("audio_asset_id") REFERENCES "audio_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable ContentTag
CREATE TABLE "content_tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "content_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_tags_slug_key" ON "content_tags"("slug");

-- CreateTable ContentSessionTag
CREATE TABLE "content_session_tags" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "content_session_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_session_tags_session_id_tag_id_key" ON "content_session_tags"("session_id", "tag_id");

-- AddForeignKey
ALTER TABLE "content_session_tags" ADD CONSTRAINT "content_session_tags_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "content_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_session_tags" ADD CONSTRAINT "content_session_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable UserSeriesProgress
CREATE TABLE "user_series_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "current_day" INTEGER NOT NULL DEFAULT 1,
    "completed_sessions" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "last_session_at" TIMESTAMP(3),

    CONSTRAINT "user_series_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_series_progress_user_id_series_id_key" ON "user_series_progress"("user_id", "series_id");
CREATE INDEX "user_series_progress_user_id_completed_idx" ON "user_series_progress"("user_id", "completed");

-- AddForeignKey
ALTER TABLE "user_series_progress" ADD CONSTRAINT "user_series_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_series_progress" ADD CONSTRAINT "user_series_progress_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "content_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
