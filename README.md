# 校园信息平台 (Campus Info Hub)

> AI 辅助编程与工程化实训项目

一个基于 Next.js + Flask + SQLite 的全栈校园信息平台，支持失物招领、二手交易、信息发布、评论留言，并包含管理员后台和个人中心。

## 项目介绍

校园信息平台旨在为校园师生提供一站式的信息发布与交流服务，主要包含以下功能模块：

- **失物招领**：发布丢失/拾到物品信息，快速找到失主
- **二手交易**：发布闲置物品交易信息，支持价格展示
- **信息发布**：发布各类校园通知、活动信息
- **评论留言**：在帖子详情页发表评论，支持用户互动
- **个人中心**：编辑个人资料、修改密码、管理我的发布
- **管理员后台**：用户管理、内容审核、数据统计

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 15 + React 19 | App Router, TypeScript |
| UI 组件库 | Ant Design 5 | 企业级 React 组件库 |
| 后端框架 | Python Flask 3 | 轻量级 Web 框架 |
| 数据库 | SQLite (开发) / Supabase PostgreSQL (生产) | 本地开发用 SQLite，生产环境用 Supabase |
| 认证方案 | JWT (PyJWT) | 无状态 token 认证 |
| 部署平台 | Vercel (前端) + Render (后端) | 自动化部署 |

## 项目结构

```
campus-info-hub/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/              # App Router 页面
│   │   │   ├── layout.tsx    # 根布局
│   │   │   ├── page.tsx      # 首页（统计面板 + 最新信息）
│   │   │   ├── login/        # 登录/注册页
│   │   │   ├── lost-found/   # 失物招领列表 + 详情
│   │   │   ├── market/       # 二手交易列表 + 详情
│   │   │   ├── post/create/  # 发布信息页
│   │   │   ├── profile/      # 个人中心
│   │   │   └── admin/        # 管理员后台
│   │   ├── components/       # 公共组件 (NavBar, CommentSection)
│   │   └── lib/api.ts        # API 请求封装
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── backend/                  # Flask 后端
│   ├── app.py                # 主应用（路由 + API + 数据库）
│   ├── config.py             # 配置文件
│   ├── requirements.txt      # Python 依赖
│   └── tests/test_api.py     # 单元测试
├── database/
│   └── schema.sql            # Supabase 数据库 Schema
├── docs/
│   ├── api.md                # API 接口文档
│   ├── code_review.md        # AI 代码审查报告
│   ├── deployment.md         # 部署指南
│   └── summary_report.md     # 个人总结报告
├── README.md
├── prompt_log.md             # AI Prompt 日志
└── .gitignore
```

## 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.10
- npm 或 yarn

### 1. 启动后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

后端运行在 `http://localhost:5000`，首次启动会自动创建 SQLite 数据库和默认管理员账号 (admin/admin123)。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:3000`，API 请求自动代理到后端。

### 3. 运行测试

```bash
cd backend
pip install pytest
python -m pytest tests/test_api.py -v
```

## 前端路由

| 路由 | 说明 |
|------|------|
| `/` | 首页 — 统计面板 + 最新信息列表 |
| `/login` | 登录 / 注册页 |
| `/lost-found` | 失物招领列表（支持搜索 + 筛选） |
| `/lost-found/[id]` | 失物招领详情页（含评论区） |
| `/market` | 二手交易列表（商品卡片展示） |
| `/market/[id]` | 二手交易详情页（含评论区） |
| `/post/create` | 发布信息页（需登录） |
| `/profile` | 个人中心（资料编辑 / 修改密码 / 我的发布） |
| `/admin` | 管理员仪表盘（统计 + 最近用户） |
| `/admin/users` | 用户管理（查看 / 删除用户） |
| `/admin/posts` | 内容管理（查看 / 删除 / 审核帖子） |

## API 接口

共提供 22 个 API 接口，详见 [docs/api.md](docs/api.md)。

### 认证 API (5个)

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/profile` | GET | 获取用户信息 |
| `/api/auth/profile` | PUT | 更新联系方式 |
| `/api/auth/password` | PUT | 修改密码 |

### 帖子 API (5个)

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 获取信息列表（分页、筛选、搜索） |
| `/api/posts/<id>` | GET | 获取信息详情 |
| `/api/posts` | POST | 发布信息（需认证） |
| `/api/posts/<id>` | PUT | 更新信息（需认证 + 本人） |
| `/api/posts/<id>` | DELETE | 删除信息（需认证 + 本人） |
| `/api/posts/my` | GET | 我的发布列表（需认证） |

### 评论 API (3个)

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts/<id>/comments` | GET | 获取评论列表 |
| `/api/posts/<id>/comments` | POST | 发表评论（需认证） |
| `/api/comments/<id>` | DELETE | 删除评论（作者或管理员） |

### 管理员 API (6个)

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/stats` | GET | 管理员统计数据 |
| `/api/admin/users` | GET | 用户列表（分页、搜索） |
| `/api/admin/users/<id>` | DELETE | 删除用户 |
| `/api/admin/posts` | GET | 所有帖子列表（含所有状态） |
| `/api/admin/posts/<id>` | DELETE | 删除任意帖子 |
| `/api/admin/posts/<id>/status` | PUT | 审核帖子状态 |

### 其他 API (3个)

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/stats` | GET | 平台公开统计数据 |

## 默认账号

首次启动后端时会自动创建管理员账号：

| 用户名 | 密码 | 权限 |
|--------|------|------|
| admin | admin123 | 管理员 |

> 生产环境请务必修改默认密码。

## 部署

### 前端部署 (Vercel)

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目，选择 `frontend` 目录
3. 设置环境变量 `BACKEND_URL` 为后端地址
4. 自动部署完成

### 后端部署 (Render)

1. 在 Render 创建 Web Service
2. 选择 `backend` 目录
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`

### 数据库 (Supabase)

1. 在 [Supabase](https://supabase.com) 创建项目
2. 执行 `database/schema.sql` 创建表
3. 设置环境变量 `DATABASE_PATH` 或切换到 Supabase 连接

## 工程化特性

- ✅ JWT 认证与多层级权限控制（普通用户 / 管理员）
- ✅ RESTful API 设计规范（22 个接口）
- ✅ PyTest 单元测试（12 个测试用例）
- ✅ 环境变量配置管理
- ✅ 统一错误处理与日志记录（400/401/403/404/409/500）
- ✅ CORS 跨域支持
- ✅ 分页查询与全文搜索
- ✅ TypeScript 类型安全
- ✅ AI 代码审查 ([docs/code_review.md](docs/code_review.md))
- ✅ GitHub Actions CI/CD

## License

MIT
