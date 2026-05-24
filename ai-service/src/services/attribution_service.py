import logging
from dataclasses import dataclass
from typing import List

import numpy as np
from lime.lime_text import LimeTextExplainer

from src.services.embedding_service import embed, embed_batch

logger = logging.getLogger(__name__)

TOP_N = 10

_explainer: LimeTextExplainer | None = None


def _get_explainer() -> LimeTextExplainer:
    global _explainer
    if _explainer is None:
        _explainer = LimeTextExplainer(
            class_names=["relevance"],
            bow=True,
            random_state=42,
        )
    return _explainer


@dataclass
class AttributionResult:
    top_positive: List[tuple[str, float]]   # [(word, weight), ...] boosted score
    top_negative: List[tuple[str, float]]   # [(word, weight), ...] lowered score
    raw_weights: List[tuple[str, float]]    # full list, sorted by abs weight


def explain_cv(cv_text: str, job_description: str, num_samples: int = 300) -> AttributionResult:
    jd_vec = np.array(embed(job_description), dtype=np.float32)
    jd_norm = np.linalg.norm(jd_vec)

    def predict_fn(texts: List[str]) -> np.ndarray:
        # LIME hands us a batch of perturbed texts. Encode them in one model
        # pass via embed_batch instead of N sequential calls — order of magnitude
        # faster for the default num_samples=300.
        n = len(texts)
        scores = np.zeros((n, 1), dtype=np.float32)
        non_empty_idx = [i for i, t in enumerate(texts) if t.strip()]
        if not non_empty_idx or jd_norm == 0:
            return scores

        batch_texts = [texts[i] for i in non_empty_idx]
        vectors = embed_batch(batch_texts)
        mat = np.asarray(vectors, dtype=np.float32)
        norms = np.linalg.norm(mat, axis=1)
        # Guard zero-norm rows
        safe = norms > 0
        cosines = np.zeros(len(batch_texts), dtype=np.float32)
        cosines[safe] = (mat[safe] @ jd_vec) / (norms[safe] * jd_norm)
        scaled = (cosines + 1.0) / 2.0 * 100.0
        for k, i in enumerate(non_empty_idx):
            scores[i, 0] = scaled[k]
        return scores

    explainer = _get_explainer()
    explanation = explainer.explain_instance(
        cv_text,
        predict_fn,
        num_features=TOP_N * 2,
        num_samples=num_samples,
        labels=[0],
    )

    weights: List[tuple[str, float]] = explanation.as_list(label=0)
    weights_sorted = sorted(weights, key=lambda x: abs(x[1]), reverse=True)

    top_positive = [(w, s) for w, s in weights_sorted if s > 0][:TOP_N]
    top_negative = [(w, s) for w, s in weights_sorted if s < 0][:TOP_N]

    logger.info(
        "Attribution complete: %d positive, %d negative contributors",
        len(top_positive), len(top_negative),
    )
    return AttributionResult(
        top_positive=top_positive,
        top_negative=top_negative,
        raw_weights=weights_sorted,
    )
