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

---

## Prompt 8: 登录 Bug 修复

**Prompt:**
> 用户反馈登录失败，后端报 SQLite 写入错误（unable to open database file / disk I/O error）。请帮我排查并修复。

**AI 输出摘要：**
分析原因为 D 盘沙箱限制导致 SQLite 无法创建 journal 文件。修复方案：
- 将数据库路径从项目目录改为 `~/campus_info_hub.db`（用户主目录）
- 添加 `PRAGMA journal_mode = MEMORY` 避免创建 journal 文件
- 添加 `PRAGMA foreign_keys = ON` 确保外键约束生效

**对应文件：** `backend/app.py` — `get_db()`, `app.config['DATABASE']`

---

## Prompt 9: UI 美化优化

**Prompt:**
> 优化项目前端 UI，使其更美观。需要：现代渐变色设计、玻璃态导航栏、卡片阴影效果、动画过渡、统一的配色方案。

**AI 输出摘要：**
- 全局 CSS 变量定义（`--primary-color`, `--gradient-blue`, `--card-shadow` 等）
- 导航栏：玻璃态效果 `backdrop-filter: blur(12px)`，sticky 定位
- 首页：统计卡片渐变色背景，hover 上浮动效
- 列表页：卡片网格布局，圆角 + 阴影
- 详情页：左右分栏布局，价格高亮区域
- 全局 `fade-in-up` 进场动画

**对应文件：** `frontend/src/app/globals.css`, `frontend/src/app/page.tsx`, `frontend/src/app/lost-found/page.tsx`, `frontend/src/app/market/page.tsx`, `frontend/src/app/lost-found/[id]/page.tsx`, `frontend/src/app/market/[id]/page.tsx`, `frontend/src/app/post/create/page.tsx`, `frontend/src/components/NavBar.tsx`

---

## Prompt 10: 管理员功能开发

**Prompt:**
> 为项目添加管理员功能，包括：1) 用户管理（查看/删除用户）2) 内容管理（查看/删除/审核所有帖子）3) 数据统计仪表盘。需要后端 API 和前端页面。

**AI 输出摘要：**
后端新增：
- `admin_required` 装饰器（检查 JWT 中的 `is_admin` 字段）
- 数据库添加 `is_admin` 字段和默认管理员账号 (admin/admin123)
- 6 个管理员 API：`GET /api/admin/stats`, `GET /api/admin/users`, `DELETE /api/admin/users/:id`, `GET /api/admin/posts`, `DELETE /api/admin/posts/:id`, `PUT /api/admin/posts/:id/status`

前端新增：
- `frontend/src/app/admin/page.tsx` — 仪表盘（统计卡片 + 最近用户）
- `frontend/src/app/admin/users/page.tsx` — 用户管理表格
- `frontend/src/app/admin/posts/page.tsx` — 内容管理表格（含状态审核）
- `api.ts` 新增 `adminApi` 对象和 `isAdmin()` 函数
- NavBar 添加管理后台入口按钮

**对应文件：** `backend/app.py`, `frontend/src/app/admin/`, `frontend/src/lib/api.ts`, `frontend/src/components/NavBar.tsx`

---

## Prompt 11: 个人中心功能开发

**Prompt:**
> 添加个人中心功能，包括：编辑个人资料（联系方式）、修改密码、查看我的发布。不要其他多余功能，保持简洁。

**AI 输出摘要：**
后端新增 3 个 API：
- `PUT /api/auth/profile` — 更新联系方式
- `PUT /api/auth/password` — 修改密码（验证旧密码）
- `GET /api/posts/my` — 获取当前用户发布列表（分页+筛选）

前端新增：
- `frontend/src/app/profile/page.tsx` — 3 个 Tab 页面
  - 个人信息：编辑联系方式表单
  - 修改密码：旧密码 + 新密码 + 确认密码
  - 我的发布：分页表格，支持删除，显示分类/状态/价格标签
- `api.ts` 新增 `updateProfile()`, `changePassword()`, `getMyPosts()`
- NavBar 用户菜单添加「个人中心」入口

**对应文件：** `backend/app.py`, `frontend/src/app/profile/page.tsx`, `frontend/src/lib/api.ts`, `frontend/src/components/NavBar.tsx`

---

## Prompt 12: 评论留言功能开发

**Prompt:**
> 为帖子详情页添加评论留言功能，用户可以在失物招领和二手交易详情页发表评论。

**AI 输出摘要：**
后端新增：
- `comments` 表（id, post_id, user_id, content, created_at，含外键和索引）
- 3 个 API：`GET /api/posts/:id/comments`（公开）, `POST /api/posts/:id/comments`（需登录，500字符限制）, `DELETE /api/comments/:id`（作者或管理员）
- 关闭的帖子禁止评论

前端新增：
- `frontend/src/components/CommentSection.tsx` — 通用评论组件
  - 评论列表（头像、用户名、时间、管理员标识）
  - 评论输入框（TextArea + 字数统计）
  - 删除评论（自己的或管理员删任何人的）
  - 未登录提示、已关闭帖子提示
- 集成到 `lost-found/[id]` 和 `market/[id]` 详情页

**对应文件：** `backend/app.py`, `frontend/src/components/CommentSection.tsx`, `frontend/src/app/lost-found/[id]/page.tsx`, `frontend/src/app/market/[id]/page.tsx`, `frontend/src/lib/api.ts`

---

## Prompt 13: 代码审查

**Prompt:**
> 利用 AI 对项目代码进行一次 Code Review，检查安全性、代码质量、性能、架构设计、测试覆盖等方面，给出优化建议报告。

**AI 输出摘要：**
生成 `docs/code_review.md`，共发现 18 个问题：
- 🔴 严重 1 项：密码哈希算法不安全（建议用 bcrypt 替换 SHA-256）
- 🟡 中等 5 项：硬编码密码、Secret 暴露、Debug 模式、SQL 字符串替换、测试覆盖不足
- 🟢 低 12 项：代码质量、架构优化、性能改进
- 同时列出了项目优点：参数化查询防注入、完善的权限控制、清晰的代码结构、TypeScript 类型定义等

**对应文件：** `docs/code_review.md`
