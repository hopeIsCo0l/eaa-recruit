"""Stub heavy ML dependencies so tests run without GPU or large model downloads."""
import sys
from unittest.mock import MagicMock

# Stub sentence_transformers before any src.* import
_st = MagicMock()
_st.SentenceTransformer = MagicMock
sys.modules.setdefault("sentence_transformers", _st)

# Stub kafka-python
_kafka = MagicMock()
sys.modules.setdefault("kafka", _kafka)
sys.modules.setdefault("kafka.errors", MagicMock())

# Stub torch (GPU checks in health router)
_torch = MagicMock()
_torch.cuda.is_available.return_value = False
sys.modules.setdefault("torch", _torch)
