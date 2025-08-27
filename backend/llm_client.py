import os
import httpx
import json
import logging

# 配置日志
logger = logging.getLogger(__name__)

QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

class LLMClient:
    def __init__(self):
        # 从环境变量获取API密钥，如果未设置则抛出错误
        self.api_key = os.getenv("API_KEY")
        if not self.api_key:
            raise ValueError(
                "API_KEY environment variable is required. "
                "Please set your API key in environment variables or .env file. "
                "Example: export API_KEY=your_actual_api_key_here"
            )
        self.url = QWEN_API_URL
        self.model_name = "BOCAI-Turbo"  # 中国银行江西省分行大语言模型
        self.qwen_model = "qwen-turbo"  # 底层模型
    
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

        async with httpx.AsyncClient() as client:
            try:
                async with client.stream("POST", self.url, json=payload, headers=headers) as response:
                    logger.info(f"Response status: {response.status_code}")
                    
                    if response.status_code != 200:
                        # 读取错误响应内容
                        error_content = await response.aread()
                        logger.error(f"API error response: {error_content.decode()}")
                        yield json.dumps({"error": {"message": f"API request failed with status {response.status_code}"}})
                        return
                    
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                            
                        logger.debug(f"Received line: {line}")
                        # 处理 SSE 格式的数据
                        if line.startswith("data:"):
                            data_content = line[5:].strip()
                            if data_content:
                                yield data_content
                        elif line.startswith("event:error"):
                            # 错误事件，读取接下来的数据行
                            async for error_line in response.aiter_lines():
                                error_line = error_line.strip()
                                if error_line.startswith("data:"):
                                    yield error_line[5:].strip() if error_line.startswith("data:") else error_line
                                    break
            except Exception as e:
                logger.error(f"Exception during API request: {e}")
                yield json.dumps({"error": {"message": f"Exception during API request: {str(e)}"}})