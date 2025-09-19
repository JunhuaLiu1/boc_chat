from typing import List
import requests
import numpy as np
import time
import logging
import os
from dotenv import load_dotenv

# 加载环境变量，强制覆盖系统环境变量
load_dotenv(override=True)

# 设置日志
logger = logging.getLogger(__name__)

class Embeddings:
    def __init__(self):
        self.api_url = "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding"
        self.dim = 1536  # text-embedding-v3 的嵌入维度
        self.model = "text-embedding-v3"
        
        # 从环境变量中读取API Key
        self.api_key = os.getenv('DASHSCOPE_API_KEY')
        if not self.api_key:
            raise ValueError("请设置DASHSCOPE_API_KEY环境变量")
            
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        logger.info(f"使用Qwen {self.model} 向量模型，维度: {self.dim}")
    
    def embed_texts(self, texts: List[str], max_retries: int = 3) -> np.ndarray:
        """使用Qwen text-embedding-v3模型生成文本嵌入"""
        logger.info(f"正在使用Qwen {self.model}为 {len(texts)} 个文本生成嵌入向量...")
        
        # 构建请求数据
        payload = {
            "model": self.model,
            "input": {
                "texts": texts
            },
            "parameters": {
                "text_type": "document"  # 文档类型
            }
        }
        
        for attempt in range(max_retries):
            try:
                logger.debug(f"发送请求到Qwen API (尝试 {attempt + 1}/{max_retries})...")
                response = requests.post(self.api_url, headers=self.headers, json=payload)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # 解析Qwen API的响应格式
                    if "output" in result and "embeddings" in result["output"]:
                        embeddings_data = result["output"]["embeddings"]
                        
                        # 提取嵌入向量
                        embeddings = []
                        for item in embeddings_data:
                            if "embedding" in item:
                                embeddings.append(item["embedding"])
                        
                        if embeddings:
                            embeddings_array = np.array(embeddings, dtype=np.float32)
                            logger.info(f"✅ 成功生成嵌入向量，形状: {embeddings_array.shape}")
                            return embeddings_array
                        else:
                            raise ValueError("API响应中未找到嵌入向量数据")
                    else:
                        raise ValueError(f"API返回了意外的格式: {result}")
                
                elif response.status_code == 429:
                    # 速率限制
                    wait_time = 2 ** attempt  # 指数退避
                    logger.warning(f"遇到速率限制，等待 {wait_time} 秒后重试... (尝试 {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                    
                elif response.status_code == 401:
                    raise Exception("API密钥无效，请检查DASHSCOPE_API_KEY环境变量")
                    
                else:
                    error_msg = f"Qwen API请求失败: HTTP {response.status_code}"
                    try:
                        error_detail = response.json()
                        if "message" in error_detail:
                            error_msg += f" - {error_detail['message']}"
                        else:
                            error_msg += f" - {error_detail}"
                    except:
                        error_msg += f" - {response.text}"
                    
                    if attempt == max_retries - 1:
                        raise Exception(error_msg)
                    else:
                        logger.warning(f"{error_msg}, 将重试...")
                        time.sleep(2)
                        continue
                        
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise Exception(f"网络请求失败: {str(e)}")
                else:
                    logger.warning(f"网络请求失败: {str(e)}, 将重试...")
                    time.sleep(2)
                    continue
                    
        raise Exception(f"在 {max_retries} 次尝试后仍然失败")


