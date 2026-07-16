# API 接口文档

> 校园信息平台后端 API 文档
> Base URL: `http://localhost:5000/api` (开发环境)

## 认证机制

除公开接口外，所有需要认证的接口请在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

Token 通过注册或登录接口获取，有效期 24 小时。

---

## 1. 健康检查

### `GET /api/health`

检查服务是否正常运行。

**响应示例：**
```json
{
  "status": "ok",
  "service": "campus-info-hub",
  "version": "1.0.0"
}
```

---

## 2. 用户注册

### `POST /api/auth/register`

**请求体：**
```json
{
  "username": "张三",
  "password": "mypassword123",
  "contact": "微信: zhangsan001"
}
```

**成功响应 (201)：**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "张三",
    "contact": "微信: zhangsan001"
  }
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 400 | 用户名或密码为空 / 长度不足 |
| 409 | 用户名已存在 |

---

## 3. 用户登录

### `POST /api/auth/login`

**请求体：**
```json
{
  "username": "张三",
  "password": "mypassword123"
}
```

**成功响应 (200)：**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "张三",
    "contact": "微信: zhangsan001"
  }
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 400 | 用户名或密码为空 |
| 401 | 用户名或密码错误 |

---

## 4. 获取用户信息

### `GET /api/auth/profile` 🔒

**成功响应：**
```json
{
  "user": {
    "id": 1,
    "username": "张三",
    "contact": "微信: zhangsan001",
    "created_at": "2026-07-17 10:30:00"
  }
}
```

---

## 5. 获取信息列表

### `GET /api/posts`

**查询参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| category | string | - | 筛选类别: lost_found / market / info |
| status | string | active | 筛选状态: active / resolved / closed |
| keyword | string | - | 搜索标题和内容 |
| page | int | 1 | 页码 |
| page_size | int | 10 | 每页数量 (最大50) |

**成功响应：**
```json
{
  "posts": [
    {
      "id": 1,
      "user_id": 1,
      "title": "在图书馆捡到一个黑色钱包",
      "content": "今天下午在三楼自习室捡到一个黑色钱包...",
      "category": "lost_found",
      "contact": "微信: zhangsan001",
      "price": 0,
      "status": "active",
      "image_url": "",
      "created_at": "2026-07-17 14:30:00",
      "updated_at": "2026-07-17 14:30:00",
      "author_name": "张三"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10
}
```

---

## 6. 获取信息详情

### `GET /api/posts/:id`

**成功响应：**
```json
{
  "post": {
    "id": 1,
    "user_id": 1,
    "title": "在图书馆捡到一个黑色钱包",
    "content": "今天下午在三楼自习室捡到一个黑色钱包...",
    "category": "lost_found",
    "contact": "微信: zhangsan001",
    "price": 0,
    "status": "active",
    "image_url": "",
    "created_at": "2026-07-17 14:30:00",
    "updated_at": "2026-07-17 14:30:00",
    "author_name": "张三",
    "author_contact": "微信: zhangsan001"
  }
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 404 | 信息不存在 |

---

## 7. 发布信息

### `POST /api/posts` 🔒

**请求体：**
```json
{
  "title": "出二手自行车，九成新",
  "content": "买了一个学期，换校区了用不上，九成新...",
  "category": "market",
  "contact": "微信: lisi002",
  "price": 199.00,
  "image_url": ""
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题 |
| content | string | 是 | 详细描述 |
| category | string | 是 | 类别: lost_found / market / info |
| contact | string | 否 | 联系方式 |
| price | float | 否 | 价格 (仅 market 类别) |
| image_url | string | 否 | 图片链接 |

**成功响应 (201)：**
```json
{
  "message": "Post created successfully",
  "post": { ... }
}
```

---

## 8. 更新信息

### `PUT /api/posts/:id` 🔒

只能更新自己发布的信息。

**请求体（部分更新）：**
```json
{
  "title": "更新后的标题",
  "status": "resolved"
}
```

**成功响应：**
```json
{
  "message": "Post updated successfully",
  "post": { ... }
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 403 | 无权限（非本人发布） |
| 404 | 信息不存在 |

---

## 9. 删除信息

### `DELETE /api/posts/:id` 🔒

只能删除自己发布的信息。

**成功响应：**
```json
{
  "message": "Post deleted successfully"
}
```

---

## 10. 平台统计

### `GET /api/stats`

**成功响应：**
```json
{
  "total_posts": 25,
  "by_category": {
    "lost_found": 10,
    "market": 8,
    "info": 7
  },
  "recent_posts": [
    {
      "id": 25,
      "title": "出二手教材",
      "category": "market",
      "created_at": "2026-07-17 16:00:00",
      "author_name": "王五"
    }
  ]
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 / Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 500 | 服务器内部错误 |
