"""LRU + bulk get/put behaviour for vector_cache. Stubs Redis."""
from unittest.mock import MagicMock

import pytest


@pytest.fixture
def vc(monkeypatch):
    from src.services import vector_cache

    fake_redis = MagicMock()
    fake_store: dict[str, str] = {}

    def _setex(key, _ttl, value):
        fake_store[key] = value
    def _get(key):
        return fake_store.get(key)
    def _mget(keys):
        return [fake_store.get(k) for k in keys]

    fake_pipe = MagicMock()
    fake_pipe.setex.side_effect = _setex
    fake_pipe.execute.return_value = None
    fake_redis.setex.side_effect = _setex
    fake_redis.get.side_effect = _get
    fake_redis.mget.side_effect = _mget
    fake_redis.pipeline.return_value = fake_pipe

    monkeypatch.setattr(vector_cache, "_get_client", lambda: fake_redis)
    vector_cache._lru.clear()
    return vector_cache, fake_redis, fake_store


class TestVectorCache:
    def test_put_then_get_hits_lru(self, vc):
        cache, redis_mock, _ = vc
        cache.put("hello", [0.1, 0.2])
        # Should hit LRU, never call redis.get
        assert cache.get("hello") == [0.1, 0.2]
        redis_mock.get.assert_not_called()

    def test_get_miss_returns_none(self, vc):
        cache, _, _ = vc
        assert cache.get("absent") is None

    def test_get_falls_through_to_redis_when_lru_empty(self, vc):
        cache, redis_mock, store = vc
        import json
        store[cache._cache_key("warm")] = json.dumps([0.5, 0.6])
        result = cache.get("warm")
        assert result == [0.5, 0.6]
        redis_mock.get.assert_called_once()
        # Second call now LRU-hot
        cache.get("warm")
        assert redis_mock.get.call_count == 1

    def test_lru_evicts_oldest(self, vc, monkeypatch):
        cache, _, _ = vc
        monkeypatch.setattr(cache, "_LRU_MAX", 3)
        cache.put("a", [1.0])
        cache.put("b", [2.0])
        cache.put("c", [3.0])
        cache.put("d", [4.0])  # evicts "a"
        # All hit LRU only after re-population — but "a" should be evicted
        assert "a" not in {k for k in cache._lru}

    def test_get_many_mixes_lru_and_redis(self, vc):
        cache, redis_mock, store = vc
        import json
        cache.put("x", [1.0])  # in LRU
        store[cache._cache_key("y")] = json.dumps([2.0])  # only in redis
        out = cache.get_many(["x", "y", "z"])
        assert out["x"] == [1.0]
        assert out["y"] == [2.0]
        assert out["z"] is None
        # mget called once with only the lru-miss keys
        assert redis_mock.mget.call_count == 1

    def test_put_many_uses_pipeline(self, vc):
        cache, redis_mock, _ = vc
        cache.put_many([("p", [9.0]), ("q", [8.0])])
        assert redis_mock.pipeline.called
        # Both populated in LRU
        assert cache.get("p") == [9.0]
        assert cache.get("q") == [8.0]
