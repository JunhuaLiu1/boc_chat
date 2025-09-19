from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
from dotenv import load_dotenv
import os
from typing import List, Dict, Any
import uuid
from pathlib import Path

# 加载环境变量（必须在导入LLMClient之前）
# 强制覆盖系统环境变量，优先使用.env文件的设置
load_dotenv(override=True)

# 现在可以安全地导入LLMClient
from llm_client import LLMClient

# Import authentication routes
from routes.auth import router as auth_router

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="BOCAI Chat MVP", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register authentication routes
app.include_router(auth_router)

try:
    llm = LLMClient()
    logger.info("✅ LLMClient initialized successfully with valid API key")
except Exception as e:
    logger.warning(f"⚠️ LLMClient init failed ({e}); using Mock LLM for testing.")
    logger.info("💡 To use real LLM, please update DASHSCOPE_API_KEY in .env file")
    
    from mock_clients import MockLLMClient
    llm = MockLLMClient()

# -------------------------
# File storage configuration
# Use project-local relative paths so docker/host both work
BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
DATA_DIR = BASE_DIR / "data"
INDEX_PATH = DATA_DIR / "files_index.json"
CHUNKS_PATH = DATA_DIR / "chunks.jsonl"
FAISS_INDEX_PATH = DATA_DIR / "faiss.index"
FAISS_META_PATH = DATA_DIR / "faiss_meta.json"

ALLOWED_EXTENSIONS = {"pdf", "docx", "xlsx", "xls", "txt"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

def _ensure_dirs():
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

def _load_index() -> Dict[str, Any]:
    if not INDEX_PATH.exists():
        return {"files": {}}
    try:
        return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"files": {}}

def _save_index(index: Dict[str, Any]):
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

def _validate_extension(filename: str):
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

@app.on_event("startup")
async def on_startup():
    _ensure_dirs()

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/files")
async def upload_files(files: List[UploadFile] = File(...)):
    logger.info(f"Received upload request with {len(files)} files")
    _ensure_dirs()
    
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    index = _load_index()
    saved: List[Dict[str, Any]] = []
    errors: List[str] = []

    for up in files:
        try:
            logger.info(f"Processing file: {up.filename}")
            
            if not up.filename:
                raise HTTPException(status_code=400, detail="Filename is required")
            _validate_extension(up.filename)

            # Read content with size check
            content = await up.read()
            if len(content) == 0:
                raise HTTPException(status_code=400, detail=f"Empty file: {up.filename}")
            if len(content) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(status_code=400, detail=f"File too large (>{MAX_FILE_SIZE_BYTES} bytes): {up.filename}")

            doc_id = str(uuid.uuid4())
            ext = up.filename.rsplit('.', 1)[-1].lower()
            safe_name = f"{doc_id}.{ext}"
            dest_path = STORAGE_DIR / safe_name
            dest_path.write_bytes(content)
            logger.info(f"File saved to: {dest_path}")

            meta = {
                "doc_id": doc_id,
                "original_filename": up.filename,
                "stored_filename": safe_name,
                "size": len(content),
                "ext": ext,
                "path": str(dest_path.relative_to(BASE_DIR)),
                "uploaded_at": str(uuid.uuid4())  # Simple timestamp replacement
            }
            index.setdefault("files", {})[doc_id] = meta
            saved.append({"doc_id": doc_id, "filename": up.filename, "size": len(content)})

            # Parse and persist chunks metadata
            try:
                logger.info(f"Parsing file content for: {up.filename}")
                from services.ingest import parse_file_to_chunks
                chunks = parse_file_to_chunks(dest_path, ext)
                logger.info(f"Extracted {len(chunks)} chunks from {up.filename}")
            except Exception as e:
                logger.error(f"Failed to parse file {up.filename}: {e}")
                errors.append(f"Failed to parse {up.filename}: {str(e)}")
                continue

            # Save chunks to jsonl with minimal metadata
            try:
                with open(CHUNKS_PATH, 'a', encoding='utf-8') as f:
                    for i, ch in enumerate(chunks):
                        record = {
                            "doc_id": doc_id,
                            "chunk_id": f"{doc_id}_{i}",
                            "text": ch.get("text", ""),
                            "source": meta["original_filename"],
                        }
                        f.write(json.dumps(record, ensure_ascii=False) + "\n")
                logger.info(f"Saved {len(chunks)} chunks to storage")
            except Exception as e:
                logger.error(f"Failed to save chunks for {up.filename}: {e}")
                errors.append(f"Failed to save chunks for {up.filename}: {str(e)}")
                continue

            # Build embeddings and add to FAISS
            try:
                logger.info(f"Building embeddings for: {up.filename}")
                from services.embeddings import Embeddings
                from services.vector_store import FaissStore
                from mock_clients import MockEmbeddings
                
                texts = [c.get('text', '') for c in chunks if c.get('text') and str(c.get('text', '')).strip()]
                if texts:
                    try:
                        embedder = Embeddings()
                        vectors = embedder.embed_texts(texts)
                        logger.info(f"Using real Qwen embeddings")
                    except Exception as embed_error:
                        logger.warning(f"Qwen embeddings failed ({embed_error}), using Mock embeddings")
                        embedder = MockEmbeddings()
                        vectors = embedder.embed_texts(texts)
                    
                    store = FaissStore(FAISS_INDEX_PATH, FAISS_META_PATH, dim=vectors.shape[1])
                    metadatas = [{
                        'doc_id': doc_id,
                        'chunk_id': f"{doc_id}_{i}",
                        'text': texts[i],
                        'source': meta['original_filename'],
                        # persist embedding for simple rebuild on delete
                        'embedding': vectors[i].tolist()
                    } for i in range(len(texts))]
                    store.add(vectors, metadatas)
                    logger.info(f"Added {len(vectors)} vectors to FAISS index")
                else:
                    logger.warning(f"No valid text chunks found in {up.filename}")
            except Exception as e:
                logger.error(f"Failed to embed/index file {up.filename}: {e}")
                errors.append(f"Failed to embed {up.filename}: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error processing file {up.filename}: {e}")
            errors.append(f"Error processing {up.filename}: {str(e)}")
            continue

    _save_index(index)
    
    response: Dict[str, Any] = {"files": saved}
    if errors:
        response["errors"] = errors
        logger.warning(f"Upload completed with errors: {errors}")
    else:
        logger.info(f"Upload completed successfully: {len(saved)} files processed")
    
    return response

@app.get("/files")
async def list_files():
    index = _load_index()
    return {"files": list(index.get("files", {}).values())}

@app.delete("/files/{doc_id}")
async def delete_file(doc_id: str):
    index = _load_index()
    meta = index.get("files", {}).get(doc_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        file_path = BASE_DIR / meta.get("path", "")
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.warning(f"Failed to delete file from disk: {e}")

    # Remove chunks for this doc from jsonl by rewriting file (simple approach)
    try:
        if CHUNKS_PATH.exists():
            lines = CHUNKS_PATH.read_text(encoding='utf-8').splitlines()
            kept = []
            for line in lines:
                try:
                    rec = json.loads(line)
                    if rec.get('doc_id') != doc_id:
                        kept.append(line)
                except Exception:
                    kept.append(line)
            CHUNKS_PATH.write_text("\n".join(kept) + ("\n" if kept else ""), encoding='utf-8')
    except Exception as e:
        logger.warning(f"Failed to prune chunks for {doc_id}: {e}")

    # Remove from index
    index["files"].pop(doc_id, None)
    _save_index(index)

    # Remove from FAISS index
    try:
        from services.vector_store import FaissStore
        from services.embeddings import Embeddings
        from mock_clients import MockEmbeddings
        # Get embedding dimension from the embeddings service
        try:
            embedder = Embeddings()
        except Exception:
            embedder = MockEmbeddings()
        store = FaissStore(FAISS_INDEX_PATH, FAISS_META_PATH, dim=embedder.dim)
        store.delete_by_doc_ids([doc_id])
    except Exception as e:
        logger.warning(f"Failed to delete vectors for {doc_id}: {e}")

    return {"ok": True}

@app.post("/search")
async def search(query: str, top_k: int = 6):
    try:
        from services.embeddings import Embeddings
        from services.vector_store import FaissStore
        from mock_clients import MockEmbeddings
        
        try:
            embedder = Embeddings()
            logger.info("Using real Qwen embeddings for search")
        except Exception as e:
            logger.warning(f"Qwen embeddings failed, using Mock embeddings: {e}")
            embedder = MockEmbeddings()
            
        qv = embedder.embed_texts([query])
        store = FaissStore(FAISS_INDEX_PATH, FAISS_META_PATH, dim=qv.shape[1])
        results = store.search(qv, top_k=top_k)
        # minimize text length in response
        for r in results:
            if len(r.get('text', '')) > 300:
                r['text'] = r['text'][:300] + '...'
            r.pop('embedding', None)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket connection request received")
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    history = []
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message: {repr(data)}")  # 使用 repr 查看实际内容
            
            # 尝试解析JSON消息格式
            try:
                if data.strip().startswith('{'):
                    message_data = json.loads(data.strip())
                    if isinstance(message_data, dict):
                        # 处理心跳消息
                        if message_data.get('type') == 'ping':
                            if websocket.client_state.name == "CONNECTED":
                                await websocket.send_text('pong')
                            continue
                        
                        # 处理聊天消息
                        if 'message' in message_data:
                            user_content = message_data['message']
                            use_rag = message_data.get('use_rag', False)  # 默认不使用RAG
                        else:
                            # 兼容旧格式
                            user_content = data.strip()
                            use_rag = False
                    else:
                        # 兼容旧格式
                        user_content = data.strip()
                        use_rag = False
                else:
                    # 兼容旧格式 - 纯文本消息
                    user_content = data.strip()
                    use_rag = False
            except json.JSONDecodeError:
                # 兼容旧格式 - 纯文本消息
                user_content = data.strip()
                use_rag = False
            
            if not user_content:
                continue
                
            logger.info(f"Processing message: {repr(user_content)}, use_rag: {use_rag}")
            user_message = {"role": "user", "content": user_content}

            # 根据use_rag标志决定是否进行RAG检索
            if use_rag:
                logger.info("Using RAG mode for retrieval")
                try:
                    from services.embeddings import Embeddings
                    from services.vector_store import FaissStore
                    from mock_clients import MockEmbeddings
                    
                    try:
                        embedder = Embeddings()
                        logger.info("Using real Qwen embeddings for RAG")
                    except Exception as e:
                        logger.warning(f"Qwen embeddings failed, using Mock embeddings: {e}")
                        embedder = MockEmbeddings()
                        
                    qv = embedder.embed_texts([user_content])
                    store = FaissStore(FAISS_INDEX_PATH, FAISS_META_PATH, dim=qv.shape[1])
                    retrieved = store.search(qv, top_k=6)
                    context_texts = []
                    total_chars = 0
                    max_chars = 6000
                    for r in retrieved:
                        t = r.get('text', '')
                        if not t:
                            continue
                        if total_chars + len(t) > max_chars:
                            break
                        context_texts.append(f"[Source: {r.get('source','unknown')}]\n{t}")
                        total_chars += len(t)
                    context_block = "\n\n".join(context_texts)
                    if context_block:
                        system_msg = {
                            "role": "system",
                            "content": (
                                "You are a helpful assistant. Use the provided CONTEXT to answer the user. "
                                "If the answer is not in the context, say you don't know.\n"
                                f"CONTEXT:\n{context_block}"
                            )
                        }
                        effective_history = [system_msg] + history + [user_message]
                    else:
                        effective_history = history + [user_message]
                except Exception as e:
                    logger.warning(f"RAG retrieval failed, falling back to raw chat: {e}")
                    effective_history = history + [user_message]
            else:
                logger.info("Using standard chat mode (no RAG)")
                effective_history = history + [user_message]

            full_response = ""
            async for chunk in llm.stream(effective_history):
                try:
                    logger.debug(f"Processing chunk: {chunk}")
                    parsed = json.loads(chunk)
                    # 检查是否有错误信息
                    if "error" in parsed:
                        error_msg = parsed.get("error", {})
                        logger.error(f"LLM API error: {error_msg}")
                        # 发送错误信息给前端
                        if websocket.client_state.name == "CONNECTED":
                            await websocket.send_text(f"Error: {error_msg.get('message', 'Unknown error')}")
                        break
                    
                    # 提取内容
                    choices = parsed.get("output", {}).get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content", "")
                        if content:
                            # 计算增量内容
                            delta_content = content[len(full_response):]
                            if delta_content:
                                # 发送增量内容
                                # 检查 WebSocket 连接是否仍然打开
                                if websocket.client_state.name != "CONNECTED":
                                    logger.warning("WebSocket connection is not open, breaking loop")
                                    break
                                await websocket.send_text(delta_content)
                            full_response = content  # 更新完整响应
                    else:
                        logger.warning(f"No choices in response: {parsed}")
                except json.JSONDecodeError:
                    # 如果不是JSON格式，直接发送
                    if chunk.strip():
                        logger.debug(f"Sending non-JSON chunk: {chunk}")
                        full_response += chunk
                        # 检查 WebSocket 连接是否仍然打开
                        if websocket.client_state.name != "CONNECTED":
                            logger.warning("WebSocket connection is not open, breaking loop")
                            break
                        await websocket.send_text(chunk)
                except Exception as e:
                    logger.error(f"Error parsing chunk: {e}")
                    logger.error(f"Chunk content: {chunk}")
                    # 发送错误信息给前端
                    try:
                        if websocket.client_state.name == "CONNECTED":
                            await websocket.send_text(f"Error processing response: {str(e)}")
                    except:
                        pass
                    break
            # Persist history for next turns: user first, then assistant
            history.append(user_message)
            history.append({"role": "assistant", "content": full_response})
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
    finally:
        logger.info("WebSocket connection closed")
        try:
            if websocket.client_state.name == "CONNECTED":
                await websocket.close()
        except:
            pass