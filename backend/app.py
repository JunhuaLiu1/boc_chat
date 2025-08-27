from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
from dotenv import load_dotenv
import os

# 加载环境变量（必须在导入LLMClient之前）
load_dotenv()

# 现在可以安全地导入LLMClient
from llm_client import LLMClient

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = LLMClient()

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
            # 移除可能的换行符
            cleaned_data = data.rstrip('\n')
            user_message = {"role": "user", "content": cleaned_data}
            history.append(user_message)

            full_response = ""
            async for chunk in llm.stream(history):
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