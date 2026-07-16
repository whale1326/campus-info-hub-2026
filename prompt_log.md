# AI Prompt 日志

> 记录项目中使用 AI 辅助编程的 Prompt 及对应产出

---

## Prompt 1: 项目架构设计

**Prompt:**
> 我需要做一个校园信息平台全栈项目，技术栈是 Next.js + Ant Design + Python Flask + Supabase。要求：前端至少3个路由页面，后端至少3个API接口，包含用户认证、CRUD功能。请帮我设计项目架构和目录结构。

**AI 输出摘要：**
设计了以下架构：
- 前端：7个路由页面（首页、登录、失物招领列表/详情、二手交易列表/详情、发布页）
- 后端：9个API接口（健康检查、注册、登录、用户信息、信息CRUD、统计）
- 数据库：users + posts 两张表，支持外键关联
- 认证：JWT token 方案

**对应文件：** 整个项目目录结构

---

## Prompt 2: Flask 后端 API 实现

**Prompt:**
> 用 Python Flask 实现校园信息平台的后端 API，包括：1) 用户注册/登录（JWT认证）2) 信息的增删改查 3) 分页查询和搜索功能 4) 错误处理和日志。数据库用 SQLite 开发，后续可切换 Supabase。

**AI 输出摘要：**
生成了 `backend/app.py`，包含：
- SQLite 数据库初始化（users, posts 表）
- JWT 认证装饰器 `@login_required`
- 9个 RESTful API 端点
- 分页、筛选、搜索功能
- 统一错误处理（400/401/403/404/409/500）

**对应文件：** `backend/app.py`, `backend/config.py`

---

## Prompt 3: Next.js 前端页面开发

**Prompt:**
> 用 Next.js 15 App Router + Ant Design 5 实现校园信息平台前端。需要：首页统计面板、登录/注册页（Tabs切换）、失物招领列表（卡片网格+搜索筛选）、二手交易列表（商品卡片+价格展示）、信息详情页、发布信息表单。使用 TypeScript。

**AI 输出摘要：**
生成了以下页面：
- `src/app/page.tsx` - 首页（统计卡片 + 最新信息列表）
- `src/app/login/page.tsx` - 登录/注册（Tabs切换，表单验证）
- `src/app/lost-found/page.tsx` - 失物招领列表（搜索+筛选+卡片网格）
- `src/app/lost-found/[id]/page.tsx` - 详情页（信息展示+删除/标记已解决）
- `src/app/market/page.tsx` - 二手交易列表（商品卡片+价格）
- `src/app/market/[id]/page.tsx` - 商品详情页
- `src/app/post/create/page.tsx` - 发布信息表单（动态字段切换）

**对应文件：** `frontend/src/app/` 下所有页面文件

---

## Prompt 4: API 请求封装

**Prompt:**
> 帮我封装一个 TypeScript API 客户端，用于前端调用 Flask 后端接口。需要：自动携带 JWT token、统一错误处理、类型定义、支持所有 CRUD 操作。

**AI 输出摘要：**
生成了 `frontend/src/lib/api.ts`，包含：
- Post、User、StatsResponse 等 TypeScript 类型定义
- `authApi` 对象：register, login, getProfile
- `postsApi` 对象：list, get, create, update, delete
- `statsApi` 对象：get
- 自动从 localStorage 读取 token 并添加到请求头

**对应文件：** `frontend/src/lib/api.ts`

---

## Prompt 5: 单元测试编写

**Prompt:**
> 为 Flask 后端编写 PyTest 单元测试，覆盖：健康检查、用户注册/登录、信息CRUD、权限控制、分页查询等场景。

**AI 输出摘要：**
生成了 `backend/tests/test_api.py`，包含 12 个测试用例：
- test_health_check - 健康检查
- test_register / test_register_duplicate - 注册
- test_login_success / test_login_wrong_password - 登录
- test_create_post_without_auth - 未认证创建
- test_create_post_with_auth - 认证创建
- test_get_posts - 列表查询
- test_get_single_post - 详情查询
- test_update_post - 更新
- test_delete_post - 删除
- test_stats - 统计

**对应文件：** `backend/tests/test_api.py`

---

## Prompt 6: 数据库 Schema 设计

**Prompt:**
> 为校园信息平台设计 Supabase PostgreSQL 数据库 Schema，需要支持用户表、信息表、分类、状态、索引优化。

**AI 输出摘要：**
生成了 `database/schema.sql`，包含：
- users 表：id, username, password_hash, contact, created_at
- posts 表：id, user_id, title, content, category, contact, price, status, image_url, created_at, updated_at
- 索引：category, status, created_at
- 外键约束：posts.user_id -> users.id
- CHECK 约束：category 和 status 枚举值校验

**对应文件：** `database/schema.sql`

---

## Prompt 7: 项目文档编写

**Prompt:**
> 为校园信息平台编写完整的项目文档，包括 README.md（项目介绍、技术栈、安装运行指南）、API 接口文档（所有接口的请求/响应格式）。

**AI 输出摘要：**
生成了：
- `README.md` - 项目介绍、技术栈表格、目录结构、安装步骤、路由表、API表、部署指南
- `docs/api.md` - 10个接口的详细文档，含请求/响应示例、错误码说明

**对应文件：** `README.md`, `docs/api.md`
