-- CreateTable
CREATE TABLE "bible_saved_passages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "book_name" TEXT NOT NULL,
    "chapter_num" INTEGER NOT NULL,
    "verse_start" INTEGER NOT NULL,
    "verse_end" INTEGER NOT NULL,
    "reference" VARCHAR(120) NOT NULL,
    "text" TEXT NOT NULL,
    "note" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_saved_passages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bible_saved_passages_user_id_created_at_idx" ON "bible_saved_passages"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bible_saved_passages_user_id_book_id_chapter_num_idx" ON "bible_saved_passages"("user_id", "book_id", "chapter_num");

-- CreateIndex
CREATE UNIQUE INDEX "bible_saved_passages_user_id_book_id_chapter_num_verse_start_verse_end_key" ON "bible_saved_passages"("user_id", "book_id", "chapter_num", "verse_start", "verse_end");

-- AddForeignKey
ALTER TABLE "bible_saved_passages" ADD CONSTRAINT "bible_saved_passages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
