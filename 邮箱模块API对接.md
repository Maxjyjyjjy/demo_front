# 邮箱模块 API 对接

本文档用于前端对接邮箱相关接口（绑定邮箱 / 邮箱白名单 / 触发同步）。

## 统一返回体约定

成功/失败均返回：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {}
}
```

- `code` 通常与 HTTP 状态码一致（例如成功创建资源返回 `201`）
- `data` 为业务载荷；无载荷可为 `""`

## 认证

所有邮箱模块接口均使用 `Authorization: Bearer <token>`（`@require_auth`）。

## 1. 绑定/查询邮箱（IMAP）

### 1.1 查询已绑定邮箱

`GET /api/homework/bind-email`

#### 成功响应（200）
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "id": 1,
    "userId": 1,
    "imapHost": "imap.163.com",
    "imapPort": 993,
    "username": "you@example.com",
    "folder": "INBOX",
    "timeoutSeconds": 15,
    "timezone": "Asia/Shanghai",
    "defaultColor": "pink",
    "defaultIcon": "mail",
    "createdAt": "2026-04-29T03:20:00Z",
    "updatedAt": "2026-04-29T03:20:00Z"
  }
}
```

字段说明：
- `password` 不会在响应中返回（仅用于服务器侧 IMAP 登录）。

未绑定时：
```json
{ "code": 404, "msg": "未绑定邮箱", "data": "" }
```

### 1.2 绑定/更新邮箱

`POST /api/homework/bind-email`

#### 请求体（JSON）
```json
{
  "imapHost": "imap.163.com",
  "imapPort": 993,
  "username": "you@example.com",
  "password": "your_imap_password",
  "folder": "INBOX",
  "timeoutSeconds": 15,
  "timezone": "Asia/Shanghai",
  "defaultColor": "pink",
  "defaultIcon": "mail"
}
```

必填：
- `imapHost`, `username`, `password`

成功响应：
- 首次绑定：HTTP `201` / `code: 201`
- 已存在则更新：HTTP `200` / `code: 200`

返回体示例同 1.1（不返回 `password`）。


## 2. 邮箱白名单（允许的发件人）

### 2.1 查询白名单邮箱

`GET /api/homework/email-whitelist`

成功（200）：
```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    { "id": 1, "email": "a@example.com", "createdAt": "2026-04-29T03:20:00Z" },
    { "id": 2, "email": "b@example.com", "createdAt": "2026-04-29T03:21:00Z" }
  ]
}
```

若未设置白名单：
- 返回 `data: []`

### 2.2 保存白名单（覆盖式）

`POST /api/homework/email-whitelist`

#### 请求体（JSON）
支持两种写法：

写法 A（数组）：
```json
{ "emails": ["a@example.com", "b@example.com"] }
```

写法 B（逗号分隔字符串）：
```json
{ "emails": "a@example.com,b@example.com" }
```

也兼容字段名：
- `emailWhitelist`
- `whitelist`

保存策略：
- 覆盖式：每次提交会先删除当前用户旧白名单，再插入新数据

成功（200）：
```json
{
  "code": 200,
  "msg": "保存成功",
  "data": { "count": 2 }
}
```

## 3. 触发当日邮件同步入库

`GET /api/homework/from-email`

说明：
- 服务器会根据你绑定的 IMAP 配置登录（`mail_accounts`）
- 根据 `email_whitelist` 过滤允许的发件人
- 将当日邮件转为 `homework` 数据（source = `email`）

返回：
```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "id": "mail-1",
      "title": "xxx",
      "course": null,
      "receivedAt": "2026-04-29T03:20:00Z",
      "dueAt": null,
      "color": "pink",
      "icon": "mail"
    }
  ]
}
```

