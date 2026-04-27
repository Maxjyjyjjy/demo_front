# 后端 API 对接说明（`demo_backend`）

本文档与当前 **Flask 实现** 一致，供前端与 `VITE_API_BASE_URL` 联调使用。

---

## 1. 基础约定

| 项 | 说明 |
|----|------|
| **Base URL** | 由环境变量配置，**不要**末尾斜杠。本地默认 `http://127.0.0.1:3000`（见 `PORT` / `run.py`）。 |
| **Content-Type** | 除说明外，均为 `application/json` |
| **时间** | 日期为 `YYYY-MM-DD`；日期时间为 ISO 8601 字符串（如 `...Z` 或带时区） |

### 1.1 统一返回体

所有 JSON 响应（含错误）均为此结构，**业务数据在 `data` 中**；无载荷时 `data` 为 **`""`（空字符串）** 而非 `null`。

```json
{
  "code": 200,
  "msg": "成功",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | number | 业务/状态码，**与 HTTP 状态码在实现中保持一致**（如 200/201/400/401/404/409） |
| `msg` | string | 提示文案，成功/失败均有可能 |
| `data` | 任意 / `""` | 成功时为对象、数组等；**无数据时多为 `""`** |

**Axios 示例**：`const res = response.data`，业务负载一般为 `res.data`（与 axios 的 `data` 字段重名，注意区分——HTTP 体里的内层 `data`）：

```ts
// 即：const payload = response.data;
const { code, msg, data } = response.data;
if (code !== 200 && code !== 201) { /* 按 msg 提示 */ }
```

（若你方封装把 HTTP body 已解成 `res`，则 `res.data` 为业务 `data` 字段。）

### 1.2 鉴权

除 `POST /api/auth/login` 外，请携带：

| Header | 值 |
|--------|-----|
| `Authorization` | `Bearer <access_token>` |

`access_token` 在登录成功后的 **`data` 中** 可取：`data.token` / `data.accessToken` / `data.access_token`（与历史前端兼容）。

Token 无效或缺失时，HTTP 为 **401**，体为统一结构，`msg` 为相应中文说明（如 `token 无效或已过期`）。

---

## 2. 认证

### 2.1 登录

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `POST /api/auth/login` |
| **鉴权** | 不需要 |

**请求体**

```json
{
  "username": "string",
  "password": "string"
}
```

**成功**（HTTP 200，body 中 `code: 200`）

`data` 为对象，至少包含（均为同一串 JWT，任选其一或嵌套取 token 即可）：

| 路径 | 说明 |
|------|------|
| `data.token` | 访问令牌 |
| `data.accessToken` | 同上，兼容 |
| `data.access_token` | 同上，兼容 |
| `data.data.token` | 嵌套兼容（与部分前端写法一致） |

`msg` 为 `"登录成功"`。

**失败**（400 / 401）

- HTTP 与 `code` 一致
- `data` 多为 `""`
- `msg` 示例：`需要 JSON 请求体`、`用户名与密码必填`、`用户名或密码错误`

**演示用户**（开启种子数据且未关 `SEED_DEMO` 时，见 `.env`）

- 用户名：`demo`
- 密码：默认以 `.env` 中 `DEMO_PASSWORD` 为准，未配置时多为 `demo123`

---

## 3. 作业（Homework）

### 3.1 邮件/同步作业列表

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `GET /api/homework/from-email` |
| **鉴权** | 需要 |

**成功** `data`：数组。每项为作业对象，字段同下节「作业对象」。

### 3.2 全量作业列表

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `GET /api/homework` |
| **鉴权** | 需要 |

**成功** `data`：数组（含邮件类与自建类）。

### 3.3 创建自定义作业

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `POST /api/homework` |
| **鉴权** | 需要 |

**请求体**（`title` 必填）

```json
{
  "title": "string",
  "course": "string | null",
  "dueAt": "string | null",
  "color": "string",
  "icon": "string"
}
```

- `dueAt`：可选，ISO 字符串
- 未传 `color` 时默认 `blue`，`icon` 默认 `assignment`

**成功**（HTTP 201，`code: 201`）  
`data` 为单条 **作业对象**（见下）。

### 3.4 删除作业

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `DELETE /api/homework/:id` |
| **鉴权** | 需要 |

- `:id` 为作业字符串 id

**成功**（HTTP 200）  
`data` 为 `""`，`msg` 为 `删除成功`。

**失败 404**  
`msg` 为 `未找到资源`。

### 3.5 作业时间轴：新增安排

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `POST /api/homework/schedule-entries` |
| **鉴权** | 需要 |

**请求体**

```json
{
  "homeworkId": "string",
  "date": "2026-04-26",
  "startSlotKey": 600
}
```

- `date`：自然日 `YYYY-MM-DD`（会按字符串前 10 位解析）
- `startSlotKey`：从当日 0 点起的**分钟数**（整数）

**成功**（HTTP 201）  
`data` 含：

| 字段 | 说明 |
|------|------|
| `id` / `scheduleId` | 同一条时间轴记录 id（数字，持久化用） |
| `homeworkId` | 作业 id |
| `date` | 日期 `YYYY-MM-DD` |
| `startSlotKey` | 与请求一致 |

### 3.6 作业时间轴：删除单条安排

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `DELETE /api/homework/schedule-entries/:scheduleId` |
| **鉴权** | 需要 |

**成功**（HTTP 200）`data` 为 `""`。

---

### 作业对象（`data` 中单项形状）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一 id |
| `title` | string | 标题 |
| `course` | 字符串，可为 `null` | 课程名 |
| `receivedAt` | 字符串，可为 `null` | 收到/创建时间（ISO） |
| `dueAt` | 字符串，可为 `null` | 截止时间（ISO） |
| `color` | 字符串，可为 `null` | 等 |
| `icon` | 字符串，可为 `null` | 图标名 |

---

## 4. 课程模块（Course modules）

### 4.1 列表

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `GET /api/course-modules` |
| **鉴权** | 需要 |

**成功** `data`：数组。元素：

| 字段 | 类型 |
|------|------|
| `id` | number |
| `name` | string |
| `category` | string |
| `color` | string |

### 4.2 新增

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `POST /api/course-modules` |
| **鉴权** | 需要 |

**请求体**

```json
{
  "name": "string",
  "color": "string",
  "category": "string"
}
```

- `name` 必填
- 未传 `color` 默认 `blue`，`category` 默认 `Custom`

**成功**（HTTP 201）`data` 为单条课程模块对象。

### 4.3 删除

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `DELETE /api/course-modules/:id` |
| **鉴权** | 需要 |

- `:id` 为数字 id

**成功**（HTTP 200）`data` 为 `""`。

**失败 404** `未找到资源`。

---

## 5. 日程（Schedule / events）

### 5.1 按日查询事件

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `GET /api/schedule/events?date=YYYY-MM-DD` |
| **鉴权** | 需要 |

**成功** `data`：事件数组。

**失败 400** 示例：缺少 `date`、`date` 非法。

### 5.2 新增事件

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `POST /api/schedule/events` |
| **鉴权** | 需要 |

**请求体**（`date`、`name`、`startSlotKey` 必填；`date` 取前 10 位为自然日）

```json
{
  "date": "2026-04-26",
  "name": "string",
  "startSlotKey": 0,
  "duration": 1.0,
  "color": "string",
  "status": "string",
  "location": "string",
  "description": "string",
  "moduleId": 1
}
```

- `startSlotKey`：当日从 0:00 起的**分钟**（整数），与课程表一致
- `duration`：**小时**（如 `0.5`、`1`），未传默认 `1`
- `moduleId`：可选，必须为本用户已存在的课程模块

**成功**（HTTP 201）`data` 为单条**事件对象**（见下）。

**失败 409**（同用户、同日、同 `startSlotKey` 已存在）  
`code` 与 HTTP 均为 409，`msg`：`该时间段已存在课程模块`。

### 5.3 删除事件

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `DELETE /api/schedule/events/:eventId` |
| **鉴权** | 需要 |

**成功**（HTTP 200）`data` 为 `""`。

**失败 404** `未找到资源`。

### 事件对象（`data` 中单项 / 201 创建返回）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 事件 id |
| `name` | string | 展示名 |
| `startTime` / `endTime` | string | `HH:mm`（由起止分钟推算） |
| `startHour` / `startMinute` | number | 开始时刻 |
| `startSlotKey` | number | 从 0 点起的**分钟** |
| `duration` | number | 小时 |
| `color` / `status` / `location` / `description` | 可空 | |
| `moduleId` | 数字，可为 `null` | 关联课程模块 id |

---

## 6. 快捷任务（Quick tasks）

### 6.1 列表

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `GET /api/quick-tasks` |
| **鉴权** | 需要 |

**成功** `data`：数组。元素：

| 字段 | 类型 |
|------|------|
| `id` | number |
| `title` | string |
| `category` | string |

### 6.2 新增

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `POST /api/quick-tasks` |
| **鉴权** | 需要 |

**请求体**

```json
{
  "title": "string",
  "category": "string"
}
```

- `title` 必填；`category` 未传为 `General`

**成功**（HTTP 201）`data` 为单条任务。

### 6.3 删除

| 项 | 值 |
|----|-----|
| **方法 / 路径** | `DELETE /api/quick-tasks/:id` |
| **鉴权** | 需要 |

**成功**（HTTP 200）`data` 为 `""`。

**失败 404** `未找到资源`。

---

## 7. 常见 `code` / HTTP 与 `msg`

| code / HTTP | 典型 `msg`（节选） |
|---------------|-------------------|
| 200 | 成功、删除成功 等 |
| 201 | 创建成功 等 |
| 400 | 参数错误、需 JSON 等（见各接口） |
| 401 | 未提供凭证、用户名或密码错误、token 无效 等 |
| 404 | 未找到资源、作业不存在 等 |
| 409 | 该时间段已存在课程模块（日程冲突） |

---

## 8. 跨域

服务端已对 `/api/*` 做了 CORS，默认允许来源以环境变量 `CORS_ORIGINS` 控制（未配置时多为 `*`；生产请收紧）。

---

## 9. 修订说明

- 与仓库实现同步；若你方前端仍从旧版「无外层 `code/msg`、直出数组」的 mock 迁出，需改为读取**统一体**中的 `data` 与 `code`。
