#!/usr/bin/env python3
"""
Popula a tabela bible_chapter_cache localmente usando API.Bible.

Requisitos:
- Variaveis BIBLE_API_KEY, BIBLE_ID_PT e DATABASE_URL definidas no .env
- Driver PostgreSQL para Python:
  pip install psycopg[binary]
  ou
  pip install psycopg2-binary

Exemplos:
- py scripts/populate_bible_cache.py
- py scripts/populate_bible_cache.py --book GEN
- py scripts/populate_bible_cache.py --book GEN --chapter 22 --force
- py scripts/populate_bible_cache.py --delay 0.25
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import uuid
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"
BIBLE_DATA_PATH = ROOT / "src" / "modules" / "bible" / "bible.data.ts"
API_BIBLE_BASE_URL = "https://api.scripture.api.bible/v1"


def load_dotenv(path: Path) -> Dict[str, str]:
    env: Dict[str, str] = {}
    if not path.exists():
        return env

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        env[key] = value

    return env


def get_env(name: str, env_file: Dict[str, str]) -> str:
    value = os.environ.get(name) or env_file.get(name)
    if not value:
        raise RuntimeError(f"Variavel obrigatoria ausente: {name}")
    return value


def load_books() -> List[Tuple[str, int]]:
    source = BIBLE_DATA_PATH.read_text(encoding="utf-8")
    matches = re.findall(r"\{ id: '([A-Z0-9]+)'.*?chapters: (\d+) \}", source)
    if not matches:
        raise RuntimeError(f"Nao foi possivel extrair livros de {BIBLE_DATA_PATH}")
    return [(book_id, int(chapters)) for book_id, chapters in matches]


def load_db_driver():
    try:
        import psycopg  # type: ignore

        return "psycopg", psycopg
    except ImportError:
        try:
            import psycopg2  # type: ignore

            return "psycopg2", psycopg2
        except ImportError as exc:
            raise RuntimeError(
                "Driver PostgreSQL nao encontrado. Instale 'psycopg[binary]' ou 'psycopg2-binary'."
            ) from exc


def connect_db(database_url: str):
    driver_name, driver_module = load_db_driver()
    if driver_name == "psycopg":
        return driver_module.connect(database_url)
    return driver_module.connect(database_url)


def fetch_json(url: str, headers: Dict[str, str]) -> Dict:
    request = Request(url, headers=headers, method="GET")
    try:
        with urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)
    except HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} em {url}: {payload}") from exc
    except URLError as exc:
        raise RuntimeError(f"Falha de rede em {url}: {exc}") from exc


def extract_verses(content: object, book_id: str, chapter_num: int) -> List[Dict[str, str]]:
    items = content.get("items") if isinstance(content, dict) else None
    if not isinstance(items, list):
        return []

    verses: Dict[int, List[str]] = {}
    current_verse = 0

    def walk(nodes: Sequence[object]) -> None:
        nonlocal current_verse

        for node in nodes:
            if not isinstance(node, dict):
                continue

            node_type = node.get("type")
            attrs = node.get("attrs") if isinstance(node.get("attrs"), dict) else {}
            node_text = node.get("text")

            if node_type in ("verse", "verseNumber"):
                candidate = attrs.get("number", node_text)
                try:
                    parsed = int(str(candidate))
                except (TypeError, ValueError):
                    parsed = 0

                if parsed > 0:
                    current_verse = parsed
                    verses.setdefault(parsed, [])

            if isinstance(node_text, str) and current_verse > 0:
                clean = re.sub(r"\s+", " ", node_text).strip()
                if clean:
                    verses.setdefault(current_verse, []).append(clean)

            children = node.get("items")
            if isinstance(children, list):
                walk(children)

    walk(items)

    normalized: List[Dict[str, str]] = []
    for verse_number in sorted(verses):
        reference = f"{book_id}.{chapter_num}.{verse_number}"
        text = re.sub(r"\s+", " ", " ".join(verses[verse_number])).strip()
        if text:
            normalized.append(
                {
                    "id": reference,
                    "reference": reference,
                    "text": text,
                }
            )

    return normalized


def fetch_chapter(api_key: str, bible_id: str, book_id: str, chapter_num: int) -> List[Dict[str, str]]:
    chapter_id = f"{book_id}.{chapter_num}"
    params = urlencode(
        {
            "content-type": "json",
            "include-notes": "false",
            "include-titles": "false",
            "include-chapter-numbers": "false",
            "include-verse-numbers": "true",
            "include-verse-spans": "false",
        }
    )
    url = f"{API_BIBLE_BASE_URL}/bibles/{bible_id}/chapters/{chapter_id}?{params}"
    payload = fetch_json(url, headers={"api-key": api_key})
    verses = extract_verses(payload.get("data", {}).get("content"), book_id, chapter_num)
    if not verses:
        raise RuntimeError(f"Nenhum versiculo valido retornado para {chapter_id}")
    return verses


def chapter_exists(cursor, book_id: str, chapter_num: int) -> bool:
    cursor.execute(
        'SELECT 1 FROM "bible_chapter_cache" WHERE "bookId" = %s AND "chapterNum" = %s LIMIT 1',
        (book_id, chapter_num),
    )
    return cursor.fetchone() is not None


def upsert_chapter(cursor, book_id: str, chapter_num: int, content_json: str) -> None:
    cursor.execute(
        """
        INSERT INTO "bible_chapter_cache" ("id", "bookId", "chapterNum", "content", "fetchedAt")
        VALUES (%s, %s, %s, %s, NOW())
        ON CONFLICT ("bookId", "chapterNum")
        DO UPDATE SET
          "content" = EXCLUDED."content",
          "fetchedAt" = NOW()
        """,
        (uuid.uuid4().hex, book_id, chapter_num, content_json),
    )


def iter_targets(
    books: Iterable[Tuple[str, int]],
    selected_book: Optional[str],
    selected_chapter: Optional[int],
) -> Iterable[Tuple[str, int]]:
    for book_id, chapters in books:
        if selected_book and book_id != selected_book:
            continue

        if selected_chapter is not None:
            if selected_chapter < 1 or selected_chapter > chapters:
                raise RuntimeError(f"Capitulo invalido para {book_id}: {selected_chapter}")
            yield book_id, selected_chapter
            continue

        for chapter_num in range(1, chapters + 1):
            yield book_id, chapter_num


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Popula a tabela bible_chapter_cache.")
    parser.add_argument("--book", help="Livro especifico, ex: GEN")
    parser.add_argument("--chapter", type=int, help="Capitulo especifico, ex: 22")
    parser.add_argument("--force", action="store_true", help="Reimporta mesmo se ja existir no banco")
    parser.add_argument("--delay", type=float, default=0.10, help="Atraso entre requisicoes em segundos")
    parser.add_argument("--limit", type=int, help="Limita quantos capitulos serao processados nesta execucao")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    env_file = load_dotenv(ENV_PATH)
    if args.book:
        args.book = args.book.upper()

    api_key = get_env("BIBLE_API_KEY", env_file)
    bible_id = get_env("BIBLE_ID_PT", env_file)
    database_url = get_env("DATABASE_URL", env_file)
    books = load_books()

    processed = 0
    inserted = 0
    skipped = 0
    failed = 0

    with connect_db(database_url) as conn:
        with conn.cursor() as cursor:
            for book_id, chapter_num in iter_targets(books, args.book, args.chapter):
                if args.limit is not None and processed >= args.limit:
                    break

                processed += 1
                label = f"{book_id}.{chapter_num}"

                if not args.force and chapter_exists(cursor, book_id, chapter_num):
                    skipped += 1
                    print(f"[skip] {label} ja existe")
                    continue

                try:
                    verses = fetch_chapter(api_key, bible_id, book_id, chapter_num)
                    upsert_chapter(cursor, book_id, chapter_num, json.dumps(verses, ensure_ascii=False))
                    conn.commit()
                    inserted += 1
                    print(f"[ok]   {label} salvo com {len(verses)} versiculos")
                except Exception as exc:
                    conn.rollback()
                    failed += 1
                    print(f"[erro] {label} -> {exc}", file=sys.stderr)

                if args.delay > 0:
                    time.sleep(args.delay)

    print(
        f"Concluido. processados={processed} inseridos={inserted} ignorados={skipped} falhas={failed}"
    )
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
