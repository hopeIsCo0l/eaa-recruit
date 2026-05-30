"""
pgvector DB layer — store and query CV/JD chunk embeddings.

cv_chunks  : keyed by application_id, one row per CV sentence chunk
jd_chunks  : keyed by job_id, one row per JD requirement chunk
             (indexed once per job, reused for all applicants)
"""
from __future__ import annotations

import logging
from typing import List, Tuple

import psycopg2
import psycopg2.extras
from pgvector.psycopg2 import register_vector

from src.config import settings

logger = logging.getLogger(__name__)


def _connect():
    conn = psycopg2.connect(settings.database_url)
    register_vector(conn)
    return conn


# ─── CV CHUNKS ────────────────────────────────────────────────────────────────

def store_cv_chunks(
    application_id: int,
    chunks: List[str],
    vectors: List[List[float]],
) -> None:
    """Insert CV chunks for an application, replacing any existing ones (idempotent)."""
    if not chunks:
        return
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM cv_chunks WHERE application_id = %s",
                (application_id,),
            )
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO cv_chunks (application_id, chunk_index, chunk_text, embedding)
                VALUES %s
                """,
                [
                    (application_id, idx, text, vec)
                    for idx, (text, vec) in enumerate(zip(chunks, vectors))
                ],
                template="(%s, %s, %s, %s::vector)",
            )
        logger.info("Stored %d CV chunks for applicationId=%s", len(chunks), application_id)
    except Exception:
        logger.exception("Failed to store CV chunks applicationId=%s", application_id)
        raise


# ─── JD CHUNKS ────────────────────────────────────────────────────────────────

def jd_chunks_exist(job_id: int) -> bool:
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM jd_chunks WHERE job_id = %s LIMIT 1",
                (job_id,),
            )
            return cur.fetchone() is not None
    except Exception:
        logger.exception("Failed to check jd_chunks for jobId=%s", job_id)
        return False


def store_jd_chunks(
    job_id: int,
    chunks: List[str],
    vectors: List[List[float]],
) -> None:
    """Insert JD chunks for a job. Skips if already indexed (same job shared across applicants)."""
    if not chunks:
        return
    if jd_chunks_exist(job_id):
        logger.info("JD chunks already indexed for jobId=%s — skipping", job_id)
        return
    try:
        with _connect() as conn, conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO jd_chunks (job_id, chunk_index, chunk_text, embedding)
                VALUES %s
                """,
                [
                    (job_id, idx, text, vec)
                    for idx, (text, vec) in enumerate(zip(chunks, vectors))
                ],
                template="(%s, %s, %s, %s::vector)",
            )
        logger.info("Stored %d JD chunks for jobId=%s", len(chunks), job_id)
    except Exception:
        logger.exception("Failed to store JD chunks jobId=%s", job_id)
        raise


# ─── SIMILARITY QUERY ─────────────────────────────────────────────────────────

def query_best_matches(
    application_id: int,
    job_id: int,
) -> List[Tuple[str, str, float]]:
    """
    For each JD chunk, find the best matching CV chunk via cosine similarity.

    Returns list of (cv_chunk_text, jd_chunk_text, similarity) sorted by similarity desc.
    similarity is in [0, 1] where 1 = identical.
    """
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    cv.chunk_text   AS cv_chunk,
                    jd.chunk_text   AS jd_chunk,
                    1 - (cv.embedding <=> jd.embedding) AS similarity
                FROM jd_chunks jd
                CROSS JOIN LATERAL (
                    SELECT chunk_text, embedding
                    FROM cv_chunks
                    WHERE application_id = %s
                    ORDER BY embedding <=> jd.embedding
                    LIMIT 1
                ) cv
                WHERE jd.job_id = %s
                ORDER BY similarity DESC
                """,
                (application_id, job_id),
            )
            rows = cur.fetchall()
            return [(row[0], row[1], float(row[2])) for row in rows]
    except Exception:
        logger.exception(
            "Failed to query matches applicationId=%s jobId=%s",
            application_id, job_id,
        )
        return []
