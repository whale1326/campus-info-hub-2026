# 校园信息平台 (Campus Info Hub)

> AI 辅助编程与工程化实训项目

一个基于 Next.js + Flask + Supabase 的全栈校园信息平台，支持失物招领、二手交易和信息发布。

## 项目介绍

校园信息平台旨在为校园师生提供一站式的信息发布与交流服务，主要包含三大功能模块：

- **失物招领**：发布丢失/拾到物品信息，快速找到失主
- **二手交易**：发布闲置物品交易信息，支持价格展示
- **信息发布**：发布各类校园通知、活动信息

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
│   │   │   └── post/create/  # 发布信息页
│   │   ├── components/       # 公共组件 (NavBar)
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
│   └── api.md                # API 接口文档
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

后端运行在 `http://localhost:5000`，首次启动会自动创建 SQLite 数据库。

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
| `/lost-found/[id]` | 失物招领详情页 |
| `/market` | 二手交易列表（商品卡片展示） |
| `/market/[id]` | 二手交易详情页 |
| `/post/create` | 发布信息页（需登录） |

## API 接口

共提供 9 个 API 接口，详见 [docs/api.md](docs/api.md)。

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/profile` | GET | 获取用户信息 |
| `/api/posts` | GET | 获取信息列表（支持分页、筛选、搜索） |
| `/api/posts/<id>` | GET | 获取信息详情 |
| `/api/posts` | POST | 发布信息（需认证） |
| `/api/posts/<id>` | PUT | 更新信息（需认证 + 本人） |
| `/api/posts/<id>` | DELETE | 删除信息（需认证 + 本人） |
| `/api/stats` | GET | 平台统计数据 |

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

- ✅ JWT 认证与权限控制
- ✅ RESTful API 设计规范
- ✅ PyTest 单元测试（12 个测试用例）
- ✅ 环境变量配置管理
- ✅ 错误处理与日志记录
- ✅ CORS 跨域支持
- ✅ 分页查询与搜索功能

## License

MIT
