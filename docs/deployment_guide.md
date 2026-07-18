# 部署指南

## 前提条件
- 代码已推送到 GitHub
- 注册 Vercel 账号 (https://vercel.com) — 可用GitHub登录
- 注册 Render 账号 (https://render.com) — 可用GitHub登录

---

## 第一步：部署后端到 Render

1. 访问 https://dashboard.render.com
2. 点击 **New +** → **Web Service**
3. 连接你的 GitHub 仓库 `campus-info-hub-2026`
4. 填写配置：
   - **Name**: `campus-info-hub-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free
5. 添加环境变量：
   - `SECRET_KEY` = 随便填一个长字符串
   - `FLASK_ENV` = `production`
6. 点击 **Create Web Service**
7. 等待部署完成，记下URL（格式：`https://campus-info-hub-api.onrender.com`）
8. 测试：访问 `https://campus-info-hub-api.onrender.com/api/health`
   - 应返回 `{"service":"campus-info-hub","status":"ok","version":"1.0.0"}`

---

## 第二步：部署前端到 Vercel

1. 访问 https://vercel.com/dashboard
2. 点击 **Add New** → **Project**
3. 导入 GitHub 仓库 `campus-info-hub-2026`
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. 添加环境变量：
   - `BACKEND_URL` = `https://campus-info-hub-api.onrender.com`（替换为你的Render URL）
6. 点击 **Deploy**
7. 等待部署完成，获得URL（格式：`https://campus-info-hub-2026.vercel.app`）

---

## 第三步：更新配置

部署完成后，如果Render的服务名称不是 `campus-info-hub-api`，需要更新 `frontend/vercel.json` 中的 destination URL，然后重新部署前端。

---

## 第四步：验证

1. 访问前端URL，测试以下功能：
   - 首页加载
   - 注册/登录
   - 发布帖子
   - 评论
   - 管理员后台 (admin/admin123)
2. 在 README.md 中添加部署链接

---

## 注意事项

- Render 免费层会在15分钟无活动后休眠，首次访问可能需要等待30秒唤醒
- SQLite 数据库在 Render 重启后会重置（免费层无持久化存储），作为Demo足够使用
- 如需持久化数据，可使用 Supabase / Neon 等免费 PostgreSQL 服务
