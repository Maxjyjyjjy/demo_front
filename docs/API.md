# 后端 API 对接说明

本文档面向与 `demo_front` 前端联调的后端，说明 **已在前端调用的接口** 以及 **为覆盖当前所有界面能力建议实现的接口**。

- **Base URL**：由环境变量 `VITE_API_BASE_URL` 配置（**不要**末尾斜杠，例如 `https://api.example.com` 或 `http://127.0.0.1:3000`）。未配置时前端走本地 mock，不请求真实服务。
- **Content-Type**：默认 `application/json`（`multipart/form-data` 除外）。
- **时间**：无特殊说明时建议统一 **ISO 8601** 字符串（如 `2026-04-26T10:00:00+08:00` 或 `Z` 结尾的 UTC）。

---

## 1. 认证方式

除登录等明确标注 **无需登录** 的接口外，其余请求需在请求头携带：

| Header            | 说明 |
|-------------------|------|
| `Authorization`   | `Bearer <access_token>` |

前端在 `localStorage` 中持久化 token；401 时前端会清 token 并跳转 `/login?redirect=...`，后端应返回 **401** 表示 token 无效或过期。

---

## 2. 当前前端已调用的接口

以下路径与 `src/utils/request.js`（axios）及 `src/services/*.js` 中写法一致，后端需与之一致或提供网关映射。

### 2.1 登录

| 项目 | 说明 |
|------|------|
| **方法 / 路径** | `POST /api/auth/login` |
| **鉴权** | 不需要 `Authorization`（前端使用 `{ auth: false }`） |

**请求体**

```json
{
  "username": "string",
  "password": "string"
}
```

**成功响应**（`2xx`）

需至少包含以下**之一**字段，供前端存为 token（见 `src/services/authService.js`）：

- `token`
- `accessToken`
- `access_token`
- 或嵌套 `data.token`

**示例（任选一种形态即可）**

```json
{ "token": "eyJhbGciOi..." }
```

```json
{ "accessToken": "eyJhbGciOi..." }
```

**失败**  
建议 `401` / `400`，且 body 中可提供 `message` 字符串供前端 `catch` 展示。

---

### 2.2 邮件/同步作业列表（作业页顶部列表数据源）

| 项目 | 说明 |
|------|------|
| **方法 / 路径** | `GET /api/homework/from-email` |
| **鉴权** | 需要 Bearer |

**成功响应**  
`200`，body 为 **JSON 数组**。前端按 `receivedAt` 倒序展示（如后端已排序，前端仍会排序，二者一致即可）。

**数组元素建议字段**（与 `HomeworkView` / `homeworkService` 一致）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 稳定唯一 id |
| `title` | string | 是 | 作业标题 |
| `course` | string | 否 | 课程名，可为 `null` |
| `receivedAt` | string | 否 | 收到时间 ISO |
| `dueAt` | string | 否 | 截止时间 ISO，用于截止展示与 24h 内标红 |
| `color` | string | 否 | 前端卡片色：`blue` \| `pink` \| `green` \| `yellow` \| `purple` |
| `icon` | string | 否 | Material Symbols 图标名，如 `assignment` |

**示例**

```json
[
  {
    "id": "mail-1",
    "title": "Advanced Calculus — Problem Set",
    "course": "Advanced Calculus",
    "receivedAt": "2026-04-26T01:12:00.000Z",
    "dueAt": "2026-04-27T02:00:00.000Z",
    "color": "pink",
    "icon": "functions"
  }
]
```

---

## 3. 建议补充接口（与当前界面一一对应）

下列功能在界面中**已实现交互与数据结构**，但 **尚未** 在 `src` 中发起真实 HTTP 请求，数据目前为页面内 `ref` 与本地逻辑。要完整“落库+多端同步”，建议按领域拆成以下 API（路径可按你们规范加 `/v1` 等前缀，前后端需统一）。

### 3.1 课程模块（Schedule：网格可拖拽的模块 / 可新增 / 可删除）

**用途**：`Schedule` 页「课程模块」列表；拖到时间表生成日程。

| 方法 | 路径（示例） | 说明 |
|------|----------------|------|
| `GET` | `/api/course-modules` | 列表 |
| `POST` | `/api/course-modules` | 新增（如 AddCourseModal：名称 + 颜色） |
| `DELETE` | `/api/course-modules/:id` | 删除（前端会同步从时间表移除 `moduleId` 相同的安排） |

**资源字段建议**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number 或 string | 与前端 `course.id` 一致即可 |
| `name` | string | 课程名称 |
| `category` | string | 如 `Activity` / `Art` / 自定义为 `Custom` |
| `color` | string | 同 `color` 枚举 |

---

### 3.2 日程安排（Schedule：按「某一天」的横向时间表）

**用途**：每个日期一条「日课表」：包含多个时间段课程块（与 `startSlotKey`、时长、颜色等一致）。

| 方法 | 路径（示例） | 说明 |
|------|----------------|------|
| `GET` | `/api/schedule/events?date=YYYY-MM-DD` | 某日全部事件（或 `GET /api/schedule/:date`） |
| `POST` | `/api/schedule/events` | 从模块拖入或快捷创建时新增一条 |
| `DELETE` | `/api/schedule/events/:eventId` | 移出该时间段（抽屉内删除） |

**单条 event 与前端 `scheduledEvents` 项对齐（建议）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number 或 string | 事件 id |
| `name` | string | 显示名称 |
| `startTime` / `endTime` | string | `HH:mm`，与前端展示一致；或由后端用分钟推算 |
| `startHour` / `startMinute` | number | 与前端一致，便于对槽位 |
| `startSlotKey` | number | **从 0 起算的当日分钟**（0=00:00，600=10:00，720=12:00 …），与前端槽位 key 一致 |
| `duration` | number | 小时数：`0.5`（30m） / `1` / `1.5` 等 |
| `color` | string | 色枚举 |
| `status` | string \| null | 如 `live` |
| `location` | string \| null | |
| `description` | string \| null | |
| `moduleId` | number \| null | 由课程模块拖入时携带 |

> **日期**：前端通过路由 `?date=YYYY-MM-DD` 与 Schedule 状态联动；请求参数传同一 `date` 即可与日历、导航一致。

**同一 `startSlotKey` 仅一条课程**（前端有校验与提示）。

---

### 3.3 作业主列表 + 自定义作业 + 时间轴上的“安排副本”

**当前**：邮件列表用 `GET /api/homework/from-email`；**自定义作业**、**从列表中删除**、**拖入时间表的副本** 尚未对接。

建议拆分（可合并设计，但字段需能表达下列行为）：

| 方法 | 路径（示例） | 说明 |
|------|----------------|------|
| `GET` | `/api/homework` | 全量或分页作业（含邮件同步 + 用户自建） |
| `POST` | `/api/homework` | 创建自定义作业（对应当前 AddHomeworkModal：`title`、`dueAt`、`color`） |
| `DELETE` | `/api/homework/:id` | 删除一条作业，并删其在时间表上的所有安排 |

**作业资源字段（与 `HomeworkView` 一致）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 自定义可能为 `custom-<timestamp>`，后端可改为 ULID |
| `title` | string | |
| `course` | string \| null | |
| `receivedAt` | string (ISO) | 自建时可用创建时间 |
| `dueAt` | string (ISO) \| null | |
| `color` / `icon` | string | 同前 |

**时间表上的“安排”**（`homeworkSchedule`：每槽可多条、结构含 `_scheduleId`）：

| 方法 | 路径（示例） | 说明 |
|------|----------------|------|
| `POST` | `/api/homework/schedule-entries` | 拖拽作业到某 `slotKey` 时落库 |
| `DELETE` | `/api/homework/schedule-entries/:scheduleId` | 只删时间轴上一条，不删作业主记录 |

**请求体 `POST` 建议**

```json
{
  "homeworkId": "string",
  "date": "2026-04-26",
  "startSlotKey": 600
}
```

**响应**中返回 `id` 或 `scheduleId` 作为前端 `_scheduleId` 的持久化对应。

> 若希望 **一次带齐某日作业 + 安排**，可扩展 `GET /api/homework?date=YYYY-MM-DD&include=schedule` 在响应中嵌套 `scheduleBySlot`（键为 `startSlotKey` 字符串、值为数组），与前端 `homeworkSchedule` 结构类似。

---

### 3.4 Quick Tasks

**用途**：Homework 页「Quick Tasks」列表；新增/删除。

| 方法 | 路径（示例） | 说明 |
|------|----------------|------|
| `GET` | `/api/quick-tasks` | 列表 |
| `POST` | `/api/quick-tasks` | 新增 `title`、`category` |
| `DELETE` | `/api/quick-tasks/:id` | 删除 |

---

## 4. 日历（Calendar 页）

- **不单独依赖接口**：选日期后通过路由 `?date=YYYY-MM-DD` 与 `returnTo` 回跳，由 **Schedule/Homework** 拉取该日数据即可。  
- 若需「点日历显示当月是否有课/作业点」，可后续增加如 `GET /api/calendar/marks?year=2026&month=4` 返回有数据的日期集合。

---

## 5. 错误与状态码（建议约定）

| HTTP | 说明 |
|------|------|
| `200` / `201` | 成功；`DELETE` 无 body 可 `204` |
| `400` | 参数错误，body 可带 `{ "message": "..." }` |
| `401` | 未登录 / token 无效 |
| `403` | 无权限（例如非本人资源） |
| `404` | 资源不存在 |
| `409` | 冲突（如某 `startSlotKey` 已存在课程，与前端 `该时间段已存在课程模块` 提示对应） |
| `500` | 服务器错误 |

---

## 6. 修订记录

- 与仓库内实现同步：`authService` → `POST /api/auth/login`；`homeworkService`（在配置 `VITE_API_BASE_URL` 时）→ `GET /api/homework/from-email`；其余为根据 **Schedule / Homework / Quick Tasks** 与 **作业时间轴** 推演的建议接口，供后端分阶段落地。
