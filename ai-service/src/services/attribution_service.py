import logging
from dataclasses import dataclass
from typing import List

import numpy as np
from lime.lime_text import LimeTextExplainer

from src.services.embedding_service import embed

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
        scores = []
        for text in texts:
            if not text.strip():
                scores.append([0.0])
                continue
            cv_vec = np.array(embed(text), dtype=np.float32)
            cv_norm = np.linalg.norm(cv_vec)
            if cv_norm == 0 or jd_norm == 0:
                scores.append([0.0])
            else:
                cosine = float(np.dot(cv_vec, jd_vec) / (cv_norm * jd_norm))
                scaled = (cosine + 1) / 2 * 100
                scores.append([scaled])
        return np.array(scores)

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
