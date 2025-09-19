import os
import os
import httpx
import json
import logging
from dotenv import load_dotenv

# 加载环境变量，强制覆盖系统环境变量
load_dotenv(override=True)

# 配置日志
logger = logging.getLogger(__name__)

QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

class LLMClient:
    def __init__(self):
        # 从环境变量获取API密钥，如果未设置则抛出错误
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "DASHSCOPE_API_KEY environment variable is required. "
                "Please set your API key in environment variables or .env file. "
                "Example: export DASHSCOPE_API_KEY=your_actual_api_key_here"
            )
        self.url = QWEN_API_URL
        self.model_name = "BOCAI-Turbo"  # 中国银行江西省分行大语言模型
        self.qwen_model = "qwen-turbo"  # 底层模型
        self.timeout = 60  # 设置超时时间为60秒
    
    def get_model_info(self):
        """获取模型信息"""
        return {
            "name": self.model_name,
            "description": "中国银行江西省分行大语言模型",
            "version": "1.0",
            "status": "online"
        }

    async def stream(self, messages):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-DashScope-SSE": "enable"  # 启用SSE流式输出
        }
        payload = {
            "model": self.qwen_model,
            "input": {
                "messages": messages
            },
            "parameters": {
                "result_format": "message"
            }
        }

        logger.info(f"Sending request to {self.url}")
        logger.info(f"Request headers: {headers}")
        # 只记录消息内容，不记录完整负载以保护隐私
        logger.info(f"Request messages: {messages}")

        # 配置httpx客户端，添加SSL验证和重试机制
        async with httpx.AsyncClient(
            timeout=self.timeout,
            verify=True,  # 启用SSL验证
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        ) as client:
            try:
                async with client.stream("POST", self.url, json=payload, headers=headers) as response:
                    logger.info(f"Response status: {response.status_code}")
                    
                    if response.status_code != 200:
                        # 读取错误响应内容
                        error_content = await response.aread()
                        error_text = error_content.decode() if error_content else "No response content"
                        logger.error(f"API error response: {error_text}")
                        
                        # 尝试解析错误详情
                        try:
                            error_json = json.loads(error_text)
                            error_msg = error_json.get('message', f'HTTP {response.status_code} Error')
                        except:
                            error_msg = f"API request failed with status {response.status_code}"
                            
                        yield json.dumps({"error": {"message": error_msg}})
                        return
                    
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                            
                        logger.debug(f"Received line: {line}")
                        # 处理 SSE 格式的数据
                        if line.startswith("data:"):
                            data_content = line[5:].strip()
                            if data_content and data_content != '[DONE]':  # 过滤结束标记
                                yield data_content
                        elif line.startswith("event:error"):
                            # 错误事件，读取接下来的数据行
                            async for error_line in response.aiter_lines():
                                error_line = error_line.strip()
                                if error_line.startswith("data:"):
                                    yield error_line[5:].strip() if error_line.startswith("data:") else error_line
                                    break
            except (httpx.ConnectTimeout, httpx.ReadTimeout, httpx.TimeoutException):
                logger.error("Connection timeout to API server")
                yield json.dumps({"error": {"message": "Connection timeout to API server"}})
            except (httpx.ConnectError, httpx.NetworkError) as e:
                logger.error(f"Network error during API request: {e}")
                yield json.dumps({"error": {"message": "Network connection error"}})
            except Exception as e:
                logger.error(f"Exception during API request: {e}")
                yield json.dumps({"error": {"message": f"Exception during API request: {str(e)}"}})