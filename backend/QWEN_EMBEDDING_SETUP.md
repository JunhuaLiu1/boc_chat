# Qwen Text-Embedding-v3 模型配置指南

## 概述

项目已经更新为使用阿里云Qwen的 `text-embedding-v3` 向量模型，该模型具有以下优势：

- **向量维度**: 1536维（相比之前的384维更加精确）
- **统一API**: 与Qwen-Turbo聊天模型使用相同的API密钥
- **国内访问**: 阿里云服务，国内网络环境访问更稳定
- **高质量**: 专为中文优化的向量表示

## API密钥获取

你**需要**去 [阿里云百炼平台](https://dashscope.aliyuncs.com/) 获取API密钥：

1. 访问 https://dashscope.aliyuncs.com/
2. 注册/登录阿里云账号
3. 开通百炼服务
4. 在API密钥管理页面创建新的API密钥
5. 复制生成的API密钥（格式通常为 `sk-xxxxxx`）

## 环境配置

### 1. 创建 .env 文件

在 `backend` 目录下创建 `.env` 文件：

```bash
cd backend
copy .env.example .env
```

### 2. 配置API密钥

编辑 `.env` 文件，填入你的API密钥：

```env
# API 密钥配置 - 使用Qwen模型
DASHSCOPE_API_KEY=sk-your-qwen-api-key-here

# 服务器配置
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# 文件上传配置
MAX_FILE_SIZE_BYTES=20971520
ALLOWED_EXTENSIONS=pdf,docx,xlsx,xls,txt

# 向量数据库配置 - text-embedding-v3模型
EMBEDDING_DIM=1536
SEARCH_TOP_K=6
RAG_MAX_CONTEXT_CHARS=6000

# 安全配置
CORS_ORIGINS=*
```

## 模型特性

### Text-Embedding-v3 模型

- **模型名称**: `text-embedding-v3`
- **向量维度**: 1536
- **支持语言**: 中文、英文等多语言
- **适用场景**: 文档检索、语义搜索、相似度计算

### API调用

模型通过以下端点调用：
```
https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding
```

## 测试

运行测试脚本验证配置：

```bash
cd backend
python test_qwen_embedding.py
```

如果配置正确，你应该看到：
- ✅ 成功初始化Embeddings服务
- ✅ 成功生成向量
- 📊 向量质量分析
- 🔍 文本相似度分析

## 优势对比

| 特性 | 之前（Hugging Face） | 现在（Qwen） |
|------|---------------------|-------------|
| 向量维度 | 384 | 1536 |
| 网络访问 | 国外服务器，可能较慢 | 国内服务器，访问稳定 |
| API密钥 | 需要单独申请HF Token | 与聊天模型共用密钥 |
| 中文优化 | 一般 | 专门优化 |
| 集成度 | 独立服务 | 与Qwen生态一体化 |

## 常见问题

### Q: 是否需要Hugging Face API密钥？
A: 不需要。现在使用Qwen的向量模型，只需要阿里云百炼的API密钥。

### Q: 如何获取免费API密钥？
A: 阿里云百炼提供免费额度，注册后即可获得。访问 https://dashscope.aliyuncs.com/ 了解详情。

### Q: 向量维度变化会影响已有数据吗？
A: 是的，向量维度从384变为1536，需要重新处理已上传的文档。删除旧的向量索引文件，重新上传文档即可。

### Q: 如何清理旧的向量数据？
A: 删除以下文件：
- `backend/data/faiss_index.bin`
- `backend/data/faiss_meta.json`
然后重新上传文档。