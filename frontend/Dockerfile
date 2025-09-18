FROM node:16-alpine

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制所有文件
COPY . .

# 构建应用
RUN npm run build

# 启动命令
CMD ["npm", "run", "preview"]