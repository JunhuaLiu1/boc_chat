FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 初始化 SQLite 数据库
RUN python init_sqlite_db.py

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]