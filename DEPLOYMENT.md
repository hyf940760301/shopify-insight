# Shopify Insight AI 生产环境部署指南

本文档详细介绍如何将 Shopify Insight AI 项目部署到生产环境。

---

## 目录

1. [部署前准备](#1-部署前准备)
2. [方式一：Vercel 部署（推荐）](#2-方式一vercel-部署推荐)
3. [方式二：Docker 部署](#3-方式二docker-部署)
4. [方式三：传统服务器部署](#4-方式三传统服务器部署)
5. [环境变量配置](#5-环境变量配置)
6. [域名与 SSL 配置](#6-域名与-ssl-配置)
7. [性能优化](#7-性能优化)
8. [监控与日志](#8-监控与日志)
9. [常见问题排查](#9-常见问题排查)

---

## 1. 部署前准备

### 1.1 系统要求

- **Node.js**: 18.17.0 或更高版本
- **npm**: 9.0.0 或更高版本（或 pnpm/yarn）
- **内存**: 最少 1GB RAM（推荐 2GB+）
- **存储**: 至少 500MB 可用空间

### 1.2 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录 Google 账号
3. 点击 "Create API Key"
4. 复制生成的 API Key（格式：`AIza...`）
5. 妥善保存，稍后配置环境变量使用

### 1.3 项目构建测试

在部署前，确保项目能在本地成功构建：

```bash
# 进入项目目录
cd shopify-insight-ai

# 安装依赖
npm install

# 构建项目
npm run build

# 本地测试（可选）
npm run start
```

如果构建成功，说明项目可以部署。

---

## 2. 方式一：Vercel 部署（推荐）

Vercel 是 Next.js 官方推荐的部署平台，配置简单，自动 CI/CD。

### 2.1 准备工作

1. 将项目推送到 GitHub/GitLab/Bitbucket
2. 注册 [Vercel](https://vercel.com) 账号

### 2.2 部署步骤

#### 方法 A：通过 Vercel 网站

1. **登录 Vercel**
   - 访问 https://vercel.com/dashboard
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择包含项目的 Git 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: 自动检测为 Next.js
   - **Root Directory**: 如果项目在子目录，填写 `shopify-insight-ai`
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: 保持默认

4. **配置环境变量**
   - 展开 "Environment Variables"
   - 添加以下变量：
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `GEMINI_API_KEY` | 你的 API Key | Production, Preview, Development |

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 1-3 分钟）

#### 方法 B：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（首次会引导配置）
vercel

# 部署到生产环境
vercel --prod
```

### 2.3 配置自定义域名

1. 进入项目 Settings → Domains
2. 添加你的域名（如 `insight.yourdomain.com`）
3. 按照提示配置 DNS 记录：
   - **CNAME**: `insight` → `cname.vercel-dns.com`
   - 或 **A 记录**: `76.76.19.19`
4. Vercel 会自动配置 SSL 证书

### 2.4 自动部署

配置完成后，每次推送代码到 main 分支都会自动触发部署。

---

## 3. 方式二：Docker 部署

适合需要完全控制部署环境的场景。

### 3.1 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 基础镜像
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3.2 配置 next.config.ts

确保 `next.config.ts` 包含 standalone 输出配置：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 其他配置...
};

export default nextConfig;
```

### 3.3 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  shopify-insight:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3.4 构建和运行

```bash
# 构建镜像
docker build -t shopify-insight-ai .

# 运行容器
docker run -d \
  --name shopify-insight \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  --restart unless-stopped \
  shopify-insight-ai

# 或使用 docker-compose
export GEMINI_API_KEY=your_api_key_here
docker-compose up -d
```

### 3.5 使用 Nginx 反向代理

创建 `/etc/nginx/sites-available/shopify-insight`：

```nginx
server {
    listen 80;
    server_name insight.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

启用站点并配置 SSL：

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/shopify-insight /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx

# 使用 Certbot 配置 SSL（推荐）
sudo certbot --nginx -d insight.yourdomain.com
```

---

## 4. 方式三：传统服务器部署

适合 VPS、云服务器等环境。

### 4.1 服务器准备

```bash
# Ubuntu/Debian 系统
sudo apt update
sudo apt install -y curl git

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v  # 应显示 v18.x.x
npm -v   # 应显示 9.x.x
```

### 4.2 部署项目

```bash
# 创建应用目录
sudo mkdir -p /var/www/shopify-insight
sudo chown $USER:$USER /var/www/shopify-insight

# 克隆项目
cd /var/www/shopify-insight
git clone https://github.com/your-username/shopify-insight-ai.git .

# 安装依赖
npm ci --production=false

# 配置环境变量
cp .env.example .env.local
nano .env.local
# 添加: GEMINI_API_KEY=your_api_key_here

# 构建项目
npm run build
```

### 4.3 使用 PM2 管理进程

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start npm --name "shopify-insight" -- start

# 设置开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status          # 查看状态
pm2 logs            # 查看日志
pm2 restart all     # 重启应用
pm2 stop all        # 停止应用
```

### 4.4 创建 PM2 生态系统文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'shopify-insight',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/shopify-insight',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_file: '.env.local',
    max_memory_restart: '1G',
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
```

启动：

```bash
pm2 start ecosystem.config.js
```

---

## 5. 环境变量配置

### 5.1 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `GEMINI_API_KEY` | Google Gemini API 密钥 | `AIza...` |

### 5.2 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3000` |
| `NODE_ENV` | 运行环境 | `production` |

### 5.3 安全注意事项

- ⚠️ **绝不要**将 API Key 提交到代码仓库
- ⚠️ 使用环境变量或密钥管理服务存储敏感信息
- ⚠️ 定期轮换 API Key
- ⚠️ 在 Vercel/服务器上设置环境变量，而非硬编码

---

## 6. 域名与 SSL 配置

### 6.1 DNS 配置示例

假设你的域名是 `yourdomain.com`，想要使用 `insight.yourdomain.com`：

**Cloudflare DNS 设置：**
| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| A | insight | 服务器 IP | 已代理 |
| 或 CNAME | insight | cname.vercel-dns.com | DNS only |

### 6.2 SSL 证书配置

**方式一：Let's Encrypt（免费）**

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d insight.yourdomain.com

# 自动续期（Certbot 自动配置）
sudo certbot renew --dry-run
```

**方式二：Cloudflare（推荐）**

1. 将域名 DNS 托管到 Cloudflare
2. 开启 Cloudflare 代理（橙色云朵）
3. SSL/TLS 设置为 "Full (strict)"
4. 自动获得免费 SSL

---

## 7. 性能优化

### 7.1 Next.js 优化配置

在 `next.config.ts` 中添加：

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  
  // 压缩
  compress: true,
  
  // 生产环境优化
  productionBrowserSourceMaps: false,
};
```

### 7.2 缓存策略

在 Nginx 中配置静态资源缓存：

```nginx
location /_next/static {
    proxy_pass http://localhost:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location /static {
    proxy_pass http://localhost:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 7.3 CDN 配置

推荐使用 Cloudflare 作为 CDN：

1. 开启 "Auto Minify"（JS、CSS、HTML）
2. 开启 "Brotli" 压缩
3. 配置页面规则缓存静态资源

---

## 8. 监控与日志

### 8.1 应用监控

**使用 PM2 监控：**

```bash
# 查看实时监控
pm2 monit

# 查看详细信息
pm2 show shopify-insight
```

**使用 Vercel Analytics（Vercel 部署）：**

1. 在 Vercel Dashboard 中启用 Analytics
2. 自动追踪性能指标

### 8.2 日志管理

**PM2 日志：**

```bash
# 查看日志
pm2 logs shopify-insight

# 清空日志
pm2 flush

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Docker 日志：**

```bash
# 查看日志
docker logs -f shopify-insight

# 限制日志大小
docker run -d \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  shopify-insight-ai
```

### 8.3 健康检查

创建健康检查端点 `app/api/health/route.ts`：

```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
```

配置监控服务（如 UptimeRobot）检查 `https://your-domain/api/health`。

---

## 9. 常见问题排查

### 9.1 构建失败

**问题：** `npm run build` 失败

**解决方案：**
```bash
# 清理缓存
rm -rf .next node_modules
npm cache clean --force
npm install
npm run build
```

### 9.2 API Key 无效

**问题：** "Gemini API Key 无效或已过期"

**解决方案：**
1. 检查环境变量是否正确设置
2. 确认 API Key 没有前后空格
3. 在 Google AI Studio 重新生成 Key
4. 重新部署应用

### 9.3 内存不足

**问题：** 构建或运行时内存溢出

**解决方案：**
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 或在 PM2 中配置
pm2 start npm --name "shopify-insight" --node-args="--max-old-space-size=4096" -- start
```

### 9.4 CORS 问题

**问题：** 跨域请求被阻止

**解决方案：** 在 `next.config.ts` 中添加：

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ];
}
```

### 9.5 Shopify API 访问被拒

**问题：** 某些店铺返回 403 错误

**说明：** 这是正常现象，部分 Shopify 店铺禁用了 products.json API。系统会自动检测并提示用户。

---

## 快速部署检查清单

- [ ] 获取 Gemini API Key
- [ ] 本地构建测试通过
- [ ] 选择部署方式（Vercel/Docker/服务器）
- [ ] 配置环境变量
- [ ] 部署应用
- [ ] 配置域名和 SSL
- [ ] 测试所有功能
- [ ] 设置监控和告警
- [ ] 配置自动备份（如需要）

---

## 技术支持

如遇到问题，请检查：

1. [Next.js 官方文档](https://nextjs.org/docs/deployment)
2. [Vercel 部署文档](https://vercel.com/docs)
3. [Google AI Studio](https://aistudio.google.com/)

---

*文档版本: 1.0.0*
*最后更新: 2026-02-06*
