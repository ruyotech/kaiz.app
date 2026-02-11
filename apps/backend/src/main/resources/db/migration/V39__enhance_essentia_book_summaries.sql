-- V39: Enhance essentia books with summary fields for Life Wheel book curation
-- Adds structured summary content, publication metadata, and admin management flags

-- ── New columns on essentia_books ────────────────────────────────────────────
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS summary_text TEXT;
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS core_methodology VARCHAR(300);
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS app_application TEXT;
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS isbn VARCHAR(20);
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE essentia_books ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- ── Related books join table (cross-recommendations) ────────────────────────
CREATE TABLE IF NOT EXISTS essentia_book_related (
    book_id      UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    related_book_id UUID NOT NULL REFERENCES essentia_books(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, related_book_id),
    CHECK (book_id <> related_book_id)
);

-- ── Performance indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_essentia_books_featured ON essentia_books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_essentia_books_published ON essentia_books(is_published);
CREATE INDEX IF NOT EXISTS idx_essentia_books_life_wheel ON essentia_books(life_wheel_area_id);
CREATE INDEX IF NOT EXISTS idx_essentia_book_related_book ON essentia_book_related(book_id);
CREATE INDEX IF NOT EXISTS idx_essentia_book_related_related ON essentia_book_related(related_book_id);
