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

## 11. 更新个人资料

### `PUT /api/auth/profile` 🔒

更新当前登录用户的联系方式。

**请求体：**
```json
{
  "contact": "微信: zhangsan_new"
}
```

**成功响应：**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "张三",
    "contact": "微信: zhangsan_new",
    "is_admin": false,
    "created_at": "2026-07-17 10:30:00"
  }
}
```

---

## 12. 修改密码

### `PUT /api/auth/password` 🔒

修改当前登录用户的密码，需验证旧密码。

**请求体：**
```json
{
  "old_password": "mypassword123",
  "new_password": "newpassword456"
}
```

**成功响应：**
```json
{
  "message": "Password changed successfully"
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 400 | 旧密码和新密码为空 / 新密码长度不足6位 |
| 401 | 旧密码错误 |

---

## 13. 我的发布列表

### `GET /api/posts/my` 🔒

获取当前登录用户发布的帖子列表。

**查询参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| category | string | - | 筛选类别: lost_found / market / info |
| status | string | - | 筛选状态: active / resolved / closed |
| page | int | 1 | 页码 |
| page_size | int | 10 | 每页数量 (最大50) |

**成功响应：**
```json
{
  "posts": [ ... ],
  "total": 5,
  "page": 1,
  "page_size": 10
}
```

---

## 14. 获取评论列表

### `GET /api/posts/:id/comments`

获取指定帖子的评论列表。公开接口，无需认证。

**成功响应：**
```json
{
  "comments": [
    {
      "id": 1,
      "post_id": 5,
      "user_id": 2,
      "content": "这个物品还在吗？",
      "created_at": "2026-07-19 01:39:24",
      "author_name": "李四",
      "author_is_admin": false
    }
  ]
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 404 | 帖子不存在 |

---

## 15. 发表评论

### `POST /api/posts/:id/comments` 🔒

在指定帖子下发表评论。已关闭 (closed) 的帖子不允许评论。

**请求体：**
```json
{
  "content": "这个物品还在吗？"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 评论内容，最多500字符 |

**成功响应 (201)：**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": 2,
    "post_id": 5,
    "user_id": 2,
    "content": "这个物品还在吗？",
    "created_at": "2026-07-19 01:40:00",
    "author_name": "李四",
    "author_is_admin": false
  }
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 400 | 评论内容为空 / 超过500字符 / 帖子已关闭 |
| 404 | 帖子不存在 |

---

## 16. 删除评论

### `DELETE /api/comments/:id` 🔒

删除评论。只有评论作者和管理员可以删除。

**成功响应：**
```json
{
  "message": "Comment deleted successfully"
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 403 | 无权限（非作者且非管理员） |
| 404 | 评论不存在 |

---

## 17. 管理员统计数据

### `GET /api/admin/stats` 🔒 🔑

获取管理员仪表盘统计数据。仅管理员可访问。

**成功响应：**
```json
{
  "total_users": 15,
  "total_posts": 42,
  "active_posts": 35,
  "by_category": {
    "lost_found": 18,
    "market": 15,
    "info": 9
  },
  "by_status": {
    "active": 35,
    "resolved": 5,
    "closed": 2
  },
  "recent_users": [
    {
      "id": 15,
      "username": "新用户",
      "contact": "微信: newuser",
      "is_admin": false,
      "created_at": "2026-07-19 00:00:00"
    }
  ]
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 401 | 未认证 / Token 过期 |
| 403 | 非管理员用户 |

---

## 18. 用户列表

### `GET /api/admin/users` 🔒 🔑

获取所有用户列表。仅管理员可访问。

**查询参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| keyword | string | - | 按用户名搜索 |
| page | int | 1 | 页码 |
| page_size | int | 20 | 每页数量 (最大50) |

**成功响应：**
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "contact": "System Administrator",
      "is_admin": true,
      "created_at": "2026-07-17 10:00:00"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

## 19. 删除用户

### `DELETE /api/admin/users/:id` 🔒 🔑

删除指定用户及其所有帖子。仅管理员可访问。不能删除自己。

**成功响应：**
```json
{
  "message": "User and all associated posts deleted successfully"
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 400 | 不能删除自己 |
| 404 | 用户不存在 |

---

## 20. 管理员帖子列表

### `GET /api/admin/posts` 🔒 🔑

获取所有帖子列表（包含所有状态）。仅管理员可访问。

**查询参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| category | string | - | 筛选类别: lost_found / market / info |
| status | string | - | 筛选状态: active / resolved / closed |
| keyword | string | - | 搜索标题和内容 |
| page | int | 1 | 页码 |
| page_size | int | 20 | 每页数量 (最大50) |

**成功响应：**
```json
{
  "posts": [ ... ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

---

## 21. 删除帖子（管理员）

### `DELETE /api/admin/posts/:id` 🔒 🔑

管理员删除任意帖子。仅管理员可访问。

**成功响应：**
```json
{
  "message": "Post deleted by admin successfully"
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 404 | 帖子不存在 |

---

## 22. 审核帖子状态

### `PUT /api/admin/posts/:id/status` 🔒 🔑

管理员修改帖子状态（内容审核）。仅管理员可访问。

**请求体：**
```json
{
  "status": "closed"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 新状态: active / resolved / closed |

**成功响应：**
```json
{
  "message": "Post status updated successfully",
  "post": { ... }
}
```

**错误响应：**
| 状态码 | 说明 |
|--------|------|
| 400 | 状态值为空或无效 |
| 404 | 帖子不存在 |

---

## 接口标识说明

| 标识 | 说明 |
|------|------|
| - | 公开接口，无需认证 |
| 🔒 | 需要登录认证（携带 JWT Token） |
| 🔑 | 需要管理员权限 |

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
