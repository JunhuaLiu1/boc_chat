"""
Mock clients for testing and fallback when API keys are not available.
用于测试和API密钥不可用时的后备客户端。
"""

import json
import asyncio
import numpy as np
import logging
from typing import List

logger = logging.getLogger(__name__)

class MockEmbeddings:
    """Mock embeddings client for testing"""
    
    def __init__(self):
        self.dim = 1536  # 与真实的text-embedding-v3保持一致
        self.model = "mock-embedding-v1"
        logger.info(f"使用Mock嵌入模型，维度: {self.dim}")
    
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """生成Mock嵌入向量"""
        logger.info(f"正在使用Mock模型为 {len(texts)} 个文本生成嵌入向量...")
        
        # 为每个文本生成确定性的伪随机向量
        embeddings = []
        for i, text in enumerate(texts):
            # 使用文本哈希作为种子，确保相同文本产生相同向量
            np.random.seed(hash(text) % 2**32)
            vector = np.random.normal(0, 1, self.dim).astype(np.float32)
            # 标准化向量
            vector = vector / np.linalg.norm(vector)
            embeddings.append(vector)
        
        embeddings_array = np.array(embeddings, dtype=np.float32)
        logger.info(f"✅ 成功生成Mock嵌入向量，形状: {embeddings_array.shape}")
        return embeddings_array


class MockLLMClient:
    """Mock LLM client for testing"""
    
    def __init__(self):
        self.model_name = "BOCAI-Mock"  
        self.qwen_model = "mock-turbo"
        self.timeout = 30
        logger.info("使用Mock LLM客户端")
    
    def get_model_info(self):
        """获取模型信息"""
        return {
            "name": self.model_name,
            "description": "中国银行江西省分行大语言模型 (Mock版本)",
            "version": "1.0-mock",
            "status": "online"
        }
    
    async def stream(self, messages):
        """模拟流式响应"""
        logger.info(f"Mock LLM收到消息: {len(messages)} 条")
        
        # 获取最后一条用户消息
        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
        
        # 生成Mock响应
        mock_response = self._generate_mock_response(user_message)
        
        # 模拟流式输出
        words = mock_response.split()
        for i, word in enumerate(words):
            # 构造类似真实API的响应格式
            response_data = {
                "output": {
                    "choices": [{
                        "message": {
                            "content": word + " ",
                            "role": "assistant"
                        },
                        "finish_reason": "null" if i < len(words) - 1 else "stop"
                    }]
                }
            }
            
            yield json.dumps(response_data, ensure_ascii=False)
            
            # 模拟网络延迟
            await asyncio.sleep(0.1)
    
    def _generate_mock_response(self, user_message: str) -> str:
        """根据用户消息生成Mock响应"""
        user_message = user_message.lower()
        
        if "hello" in user_message or "你好" in user_message:
            return "您好！我是BOCAI，中国银行江西省分行的AI助手。很高兴为您服务！"
        elif "银行" in user_message or "bank" in user_message:
            return "作为中国银行江西省分行的AI助手，我可以为您提供银行业务相关的咨询和帮助。请问您需要了解什么信息？"
        elif "文档" in user_message or "document" in user_message:
            return "我已经收到您上传的文档。基于文档内容，我可以为您提供相关的问答服务。请告诉我您想了解文档中的哪些信息？"
        elif "总结" in user_message or "summary" in user_message:
            return "根据您上传的文档，这是一份江西师范大学软件学院的毕业实习报告。报告详细记录了实习期间的工作内容、学习收获和个人成长经历。"
        else:
            return f"感谢您的提问。这是一个Mock响应，用于测试目的。您的问题是：{user_message[:100]}{'...' if len(user_message) > 100 else ''}"