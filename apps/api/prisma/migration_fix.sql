-- =====================================================
--  SANCTUM — Migration: camelCase → snake_case + novas colunas
--  Aplica os @map do schema.prisma ao banco existente
-- =====================================================

-- ─── USERS ───────────────────────────────────────────
ALTER TABLE "users"
  RENAME COLUMN "parishId"  TO "parish_id";
ALTER TABLE "users"
  RENAME COLUMN "isAdmin"   TO "is_admin";
ALTER TABLE "users"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- ─── PARISHES ────────────────────────────────────────
ALTER TABLE "parishes"
  RENAME COLUMN "createdAt" TO "created_at";

-- ─── REFRESH_TOKENS ──────────────────────────────────
ALTER TABLE "refresh_tokens"
  RENAME COLUMN "userId"    TO "user_id";
ALTER TABLE "refresh_tokens"
  RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "refresh_tokens"
  RENAME COLUMN "createdAt" TO "created_at";

-- ─── STREAKS ─────────────────────────────────────────
ALTER TABLE "streaks"
  RENAME COLUMN "userId"         TO "user_id";
ALTER TABLE "streaks"
  RENAME COLUMN "currentStreak"  TO "current_streak";
ALTER TABLE "streaks"
  RENAME COLUMN "longestStreak"  TO "longest_streak";
ALTER TABLE "streaks"
  RENAME COLUMN "lastActivityAt" TO "last_activity_at";
ALTER TABLE "streaks"
  RENAME COLUMN "updatedAt"      TO "updated_at";

-- ─── DAILY_CONTENTS ──────────────────────────────────
ALTER TABLE "daily_contents"
  RENAME COLUMN "homilyAudioUrl"   TO "homily_audio_url";
ALTER TABLE "daily_contents"
  RENAME COLUMN "firstReading"     TO "first_reading";
ALTER TABLE "daily_contents"
  RENAME COLUMN "secondReading"    TO "second_reading";
ALTER TABLE "daily_contents"
  RENAME COLUMN "liturgicalSeason" TO "liturgical_season";
ALTER TABLE "daily_contents"
  RENAME COLUMN "createdAt"        TO "created_at";

-- Novas colunas (não existiam no bootstrap.sql)
ALTER TABLE "daily_contents"
  ADD COLUMN IF NOT EXISTS "gospel_reference"          TEXT,
  ADD COLUMN IF NOT EXISTS "first_reading_reference"   TEXT,
  ADD COLUMN IF NOT EXISTS "second_reading_reference"  TEXT,
  ADD COLUMN IF NOT EXISTS "psalm_reference"           TEXT;

-- ─── BIBLE_PROGRESS ──────────────────────────────────
ALTER TABLE "bible_progress"
  RENAME COLUMN "userId"      TO "user_id";
ALTER TABLE "bible_progress"
  RENAME COLUMN "bookId"      TO "book_id";
ALTER TABLE "bible_progress"
  RENAME COLUMN "bookName"    TO "book_name";
ALTER TABLE "bible_progress"
  RENAME COLUMN "chapterNum"  TO "chapter_num";
ALTER TABLE "bible_progress"
  RENAME COLUMN "lastReadAt"  TO "last_read_at";

-- ─── BIBLE_CHAPTER_CACHE ─────────────────────────────
ALTER TABLE "bible_chapter_cache"
  RENAME COLUMN "bookId"     TO "book_id";
ALTER TABLE "bible_chapter_cache"
  RENAME COLUMN "chapterNum" TO "chapter_num";
ALTER TABLE "bible_chapter_cache"
  RENAME COLUMN "fetchedAt"  TO "fetched_at";

-- ─── PRAYER_REQUESTS ─────────────────────────────────
ALTER TABLE "prayer_requests"
  RENAME COLUMN "userId"       TO "user_id";
ALTER TABLE "prayer_requests"
  RENAME COLUMN "isAnonymous"  TO "is_anonymous";
ALTER TABLE "prayer_requests"
  RENAME COLUMN "prayerCount"  TO "prayer_count";
ALTER TABLE "prayer_requests"
  RENAME COLUMN "reportCount"  TO "report_count";
ALTER TABLE "prayer_requests"
  RENAME COLUMN "isHidden"     TO "is_hidden";
ALTER TABLE "prayer_requests"
  RENAME COLUMN "createdAt"    TO "created_at";

-- ─── PRAYER_ACTIONS ──────────────────────────────────
ALTER TABLE "prayer_actions"
  RENAME COLUMN "userId"          TO "user_id";
ALTER TABLE "prayer_actions"
  RENAME COLUMN "prayerRequestId" TO "prayer_request_id";
ALTER TABLE "prayer_actions"
  RENAME COLUMN "createdAt"       TO "created_at";

-- ─── REPORTS ─────────────────────────────────────────
ALTER TABLE "reports"
  RENAME COLUMN "userId"          TO "user_id";
ALTER TABLE "reports"
  RENAME COLUMN "prayerRequestId" TO "prayer_request_id";
ALTER TABLE "reports"
  RENAME COLUMN "createdAt"       TO "created_at";

-- ─── BIBLE_VERSE_PROGRESS (nova tabela) ──────────────
CREATE TABLE IF NOT EXISTS "bible_verse_progress" (
  "id"           TEXT        NOT NULL,
  "user_id"      TEXT        NOT NULL,
  "book_id"      TEXT        NOT NULL,
  "book_name"    TEXT        NOT NULL,
  "chapter_num"  INTEGER     NOT NULL,
  "verse_num"    INTEGER     NOT NULL,
  "contemplated" BOOLEAN     NOT NULL DEFAULT false,
  "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bible_verse_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bible_verse_progress_user_book_chap_verse_key"
  ON "bible_verse_progress"("user_id", "book_id", "chapter_num", "verse_num");

CREATE INDEX IF NOT EXISTS "bible_verse_progress_user_book_chap_idx"
  ON "bible_verse_progress"("user_id", "book_id", "chapter_num");

ALTER TABLE "bible_verse_progress"
  DROP CONSTRAINT IF EXISTS "bible_verse_progress_user_id_fkey";
ALTER TABLE "bible_verse_progress"
  ADD CONSTRAINT "bible_verse_progress_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
