from pathlib import Path
from typing import List, Dict, Any, Optional

import faiss
import numpy as np
import json


class FaissStore:
    def __init__(self, index_path: Path, meta_path: Path, dim: int):
        self.index_path = index_path
        self.meta_path = meta_path
        self.dim = dim
        self._index: Optional[faiss.Index] = None
        self._meta: List[Dict[str, Any]] = []
        self._load()

    def _create_index(self) -> faiss.Index:
        # 使用 IndexFlatL2 作为基础索引，更简单稳定
        index = faiss.IndexFlatL2(self.dim)
        return index

    def _load(self):
        if self.index_path.exists() and self.meta_path.exists():
            self._index = faiss.read_index(str(self.index_path))
            self._meta = json.loads(self.meta_path.read_text(encoding='utf-8'))
        else:
            self._index = self._create_index()
            self._meta = []

    def _persist(self):
        faiss.write_index(self._index, str(self.index_path))
        self.meta_path.write_text(json.dumps(self._meta, ensure_ascii=False, indent=2), encoding='utf-8')

    def add(self, embeddings: np.ndarray, metadatas: List[Dict[str, Any]]):
        if self._index is None:
            raise RuntimeError('Index not initialized')
        if embeddings.dtype != np.float32:
            embeddings = embeddings.astype(np.float32)
        if embeddings.ndim != 2 or embeddings.shape[1] != self.dim:
            raise ValueError('Embedding dimension mismatch')
        # FAISS add方法只需要向量数组作为参数
        self._index.add(embeddings)  # type: ignore[misc]
        self._meta.extend(metadatas)
        self._persist()

    def delete_by_doc_ids(self, doc_ids: List[str]):
        # Rebuild index without those entries (simple approach)
        kept_vectors = []
        kept_meta = []
        for i, m in enumerate(self._meta):
            if m.get('doc_id') not in doc_ids:
                kept_meta.append(m)
        if kept_meta:
            # Need vectors in same order
            # We cannot easily delete by ids; reload from stored embeddings if persisted separately.
            # As a simple approach, we rebuild from scratch using stored embeddings in meta (if present)
            vectors = [np.array(m['embedding'], dtype=np.float32) for m in kept_meta if 'embedding' in m]
            if vectors:
                new_index = self._create_index()
                vectors_array = np.vstack(vectors)
                if vectors_array.dtype != np.float32:
                    vectors_array = vectors_array.astype(np.float32)
                new_index.add(vectors_array)  # type: ignore[misc]
                self._index = new_index
                self._meta = kept_meta
            else:
                # If no embeddings in meta, drop all
                self._index = self._create_index()
                self._meta = []
        else:
            self._index = self._create_index()
            self._meta = []
        self._persist()

    def search(self, query_embeddings: np.ndarray, top_k: int = 6, filter_doc_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self._index is None:
            raise RuntimeError('Index not initialized')
        if query_embeddings.ndim == 1:
            query_embeddings = query_embeddings.reshape(1, -1)
        if query_embeddings.dtype != np.float32:
            query_embeddings = query_embeddings.astype(np.float32)
        if self._index.ntotal == 0:
            return []
        # FAISS search方法: search(query_vectors, k) 返回 (distances, indices)
        D, I = self._index.search(query_embeddings, min(top_k * 2, self._index.ntotal))  # type: ignore[misc]
        results: List[Dict[str, Any]] = []
        for idx, dist in zip(I[0], D[0]):
            if idx < 0 or idx >= len(self._meta):
                continue
            meta = self._meta[idx]
            if filter_doc_ids and meta.get('doc_id') not in filter_doc_ids:
                continue
            r = dict(meta)
            r['score'] = float(dist)
            results.append(r)
            if len(results) >= top_k:
                break
        return results


