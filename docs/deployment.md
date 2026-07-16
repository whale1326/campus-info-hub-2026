# 部署指南

## 前置条件

1. 代码已推送到 GitHub 公开仓库
2. 已注册 Vercel 账号 (https://vercel.com)
3. 已注册 Render 账号 (https://render.com) —— 用于部署后端

---

## Step 1: 部署后端到 Render

1. 登录 https://dashboard.render.com
2. 点击 **New +** → **Web Service**
3. 连接你的 GitHub 仓库
4. 填写配置：
   - **Name**: campus-info-hub-api
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free
5. 添加环境变量：
   - `SECRET_KEY`: 你的密钥（随意一串字符）
   - `FLASK_ENV`: production
6. 点击 **Create Web Service**
7. 等待部署完成，记录分配的 URL（如 `https://campus-info-hub-api.onrender.com`）

---

## Step 2: 部署前端到 Vercel

### 方式 A：通过 Vercel 网页（推荐）

1. 登录 https://vercel.com/dashboard
2. 点击 **Add New** → **Project**
3. 导入你的 GitHub 仓库
4. 填写配置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`（默认即可）
   - **Output Directory**: `.next`（默认即可）
5. 添加环境变量：
   - `NEXT_PUBLIC_API_URL`: `https://campus-info-hub-api.onrender.com/api`
6. 点击 **Deploy**
7. 等待构建完成，获得线上 URL

### 方式 B：通过 Vercel CLI

```bash
# 设置 Node.js 路径
set "PATH=C:\Users\kikilove\.workbuddy\binaries\node\versions\22.22.2;%PATH%"

# 进入前端目录
cd D:\campus-info-hub\frontend

# 登录 Vercel（会打开浏览器）
npx vercel login

# 部署
npx vercel

# 部署到生产环境
npx vercel --prod
```

---

## Step 3: 更新后端 CORS 配置

部署完成后，需要更新后端的 CORS 配置，允许 Vercel 域名访问：

1. 在 Render 的环境变量中添加：
   - `CORS_ORIGINS`: `https://你的项目名.vercel.app`
2. 或修改 `backend/config.py` 中的 `CORS_ORIGINS` 列表

---

## Step 4: 配置 Supabase 数据库（可选，生产环境推荐）

1. 登录 https://supabase.com 创建新项目
2. 在 SQL Editor 中执行 `database/schema.sql`
3. 在 Render 后端环境变量中添加：
   - `DATABASE_URL`: Supabase 提供的 PostgreSQL 连接字符串
   - `USE_SUPABASE`: true

---

## 验证清单

- [ ] 后端 API 可访问：`https://你的后端URL/api/health` 返回 `{"status": "ok"}`
- [ ] 前端页面可访问：Vercel URL 能正常打开
- [ ] 用户注册/登录功能正常
- [ ] 信息发布功能正常
- [ ] 失物招领/二手交易列表正常显示
