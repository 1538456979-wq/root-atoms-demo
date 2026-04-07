# Atoms Generator — AI Native 组件生成器 MVP

> 用一句话描述你的 UI 需求，AI 即刻生成可交互的 React 组件。

---

## 🚀 项目简介

**Atoms Generator** 是一个基于 **Next.js App Router + DeepSeek API + react-live** 构建的 AI 原生 UI 组件生成器 MVP。

用户只需用自然语言描述 UI 需求，系统便会调用大语言模型生成符合规范的 React JSX 代码，并通过前端沙箱实时渲染为可交互的真实组件——整个链路无需构建、无需刷新、所见即所得。

产品从**单页极简生成器**完整演进至**专业 Workspace 工作台**，目前已具备多项目会话管理、基于上下文的迭代修改、渐进式鉴权等准商业级能力。

---

## ✨ 核心特性

### 🤖 AI 驱动生成
接入 DeepSeek `deepseek-chat` 模型，通过精心设计的 **System Prompt** 将模型输出严格约束为可被 `react-live` 直接渲染的纯 JSX 节点——无 import、无组件声明、无 Markdown 包裹，开箱即用。

### 🖥️ Workspace 工作台模式
首页采用类 ChatGPT / v0.dev 的居中极简布局；提交需求后，页面以 500ms 平滑动画过渡为**左右分栏专业工作台**：

- **左侧侧边栏**：可折叠的历史项目列表 + 当前会话气泡流 + 底部迭代输入栏
- **右侧内容区**：UI 预览 / 查看源码 双 Tab + 复制代码 + 一键下载 `Component.tsx`

### 🔁 基于上下文的局部迭代
工作台中再次提交需求时，系统将**当前正在渲染的 JSX 代码**连同新需求一起发送给大模型。模型在「看到旧代码」的前提下进行精准增量修改（调整布局、改变颜色、增删元素），而非每次从零生成。这是本项目与普通代码生成工具的核心差异，也最贴近真实的开发协作流。

### 📁 多项目会话管理
基于 `localStorage` 实现多项目数据隔离，每个项目包含独立的 `id`、`title`、`updatedAt` 与完整的 `entries[]` 对话历史。支持历史记录折叠（ChevronDown 动效）、跨会话回溯与代码复现，刷新页面数据不丢失。

### 🔐 渐进式鉴权（Progressive Auth）
遵循「**体验优先**」原则：

- **免摩擦核心功能**：AI 生成不需要任何登录，零门槛上手
- **软引导登录时机**：当用户尝试「新建项目」或「下载代码」时，弹出高保真 AuthModal 引导登录；关闭弹窗后，用户依然可以自由继续操作，绝不强制拦截
- **高保真 Mock 体系**：登录/注册双 Tab、密码可见切换、确认密码实时校验（绿 ✓ / 红 ✗）、1.5s Loading 动效、`localStorage` 持久化 Session，刷新后自动恢复登录状态

### 💡 灵感胶囊（Preset Prompts）
首页内置 4 个预设 Prompt 胶囊，降低零代码用户的上手门槛，点击即触发生成。

---

## 🧠 核心架构权衡

> 本节向代码审阅者说明关键工程决策背后的考量，而非单纯罗列技术栈。

### ① 沙箱方案：react-live vs WebContainers

| 方案 | 优势 | 劣势 |
|------|------|------|
| **react-live**（当前采用） | 零依赖、即时 JIT 渲染、bundle 极小 | 仅支持单文件 JSX，无法处理多文件导入 |
| WebContainers / Sandpack | 支持完整 Node.js 环境与多文件项目 | 初始化耗时 5-15s，bundle 增加数 MB，MVP 阶段成本过高 |

**决策**：在 MVP 交付周期内，`react-live` 以最低成本实现了「所见即所得」的核心产品价值。WebContainers 作为下一阶段演进方向保留（见 Roadmap）。

### ② Mock Auth vs 真实后端

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Mock Auth**（当前采用） | 纯前端部署，Vercel 零配置，审阅者 100% 可访问 | 无真实账号隔离，数据未上云 |
| NextAuth + Supabase | 完整的身份验证与数据同步 | 需要配置数据库与环境变量，引入运维复杂度 |

**决策**：保证 Vercel 纯前端部署的 100% 稳定性，避免因数据库连接失败或环境变量缺失导致审阅者白屏。接口层（`useAuth` Hook）已为云端替换预留接口，迁移成本极低。

### ③ 非流式渲染 + UX 补偿

流式（Streaming）输出在文本场景极佳，但 JSX 代码必须**完整合法**才能被 `react-live` 解析——任何残缺的标签或括号都会导致沙箱崩溃。

**决策**：暂缓 Streaming，转而设计了一套「**智能状态轮播**」：
```
AI 正在理解您的需求… → 正在构思组件结构… → 正在编写 Tailwind 样式… → 正在进行细节打磨（固定 + 闪烁 ...）
```
最后一条消息固定并附带闪烁动效，即使大模型响应耗时 20 秒，用户也不会感到「卡死」。

### ④ 双视图状态机

`page.tsx` 维护单一的 `hasResult` 布尔值，驱动 Home ↔ Workspace 的视图切换。两套视图通过 `absolute inset-0` 叠层 + CSS `opacity/transform` 过渡，**无路由跳转、无页面重载**，体验流畅且无闪烁。

生成逻辑被显式拆分为职责互斥的两个 `useCallback`：
- `handleHomeGenerate` — 只调用 `createProject`，永远新建
- `handleWorkspaceGenerate` — 只调用 `addEntry`，永远追加；同时携带 `currentCode` 上下文快照

---

## 🛠️ 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 全栈骨架 | Next.js App Router | 15+ |
| 样式系统 | Tailwind CSS | v4 |
| 前端沙箱 | react-live | latest |
| AI 引擎 | DeepSeek API（兼容 OpenAI SDK）| deepseek-chat |
| 图标库 | lucide-react | latest |
| 工具函数 | clsx + tailwind-merge | latest |
| 持久化 | localStorage（useProjects / useAuth Hook） | — |

---

## 🤖 AI 协同开发（Vibe Coding）

本项目由开发者与 **Cursor Agent（Claude Sonnet）** 深度结对编程完成，全程采用精准自然语言指令驱动多文件协同修改。

### 攻坚案例速览

| # | 问题 | 根因 | 解法 |
|---|------|------|------|
| ① | System Prompt 工程 | `react-live` 拒绝 `import`/`export`，模型默认输出含这些内容 | 后端硬编码强约束 Prompt，格式控制率接近 100% |
| ② | Flex 弹性挤压 | 历史区与会话区共用 `flex-1` 容器，历史增多后会话被完全挤掉 | 三层嵌套结构：外层 `flex-1 min-h-0` + 历史区 `shrink-0` + 会话区 `flex-1 min-h-0 overflow-y-auto` |
| ③ | Hydration 样式丢失 | Tailwind CDN（注入给 react-live）与编译版 Tailwind v4 水合后产生类名覆盖冲突 | Logo 背景改为 React `style={{ background: 'linear-gradient(...)' }}` 内联样式，绕过水合竞争 |
| ④ | 迭代生成新建了项目 | 单一 `handleGenerate` 函数的 if/else 分支读取到过期闭包值 | 拆分为 `handleHomeGenerate` / `handleWorkspaceGenerate` 两个职责明确的函数，彻底隔离 |

### 核心结论

> **AI 时代，前端工程师的新核心竞争力：重架构 × 懂交互 × 强 Prompt**

编写代码的速度已不再是壁垒；能够清晰定义问题边界、设计可扩展的组件契约、将模糊需求转化为精准 AI 指令，才是真正的差异化能力。

---

## 🚀 本地运行

```bash
# 1. 克隆项目
git clone <repo-url>
cd root-atoms-demo

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 填入你的 DeepSeek API Key：LLM_API_KEY=sk-xxxx

# 4. 启动开发服务器
npm run dev
```

> 打开 [http://localhost:3000](http://localhost:3000) 即可体验。无需数据库，无需额外服务。

---

## 🔮 未来演进路线（Roadmap）

### 近期（工程强化）
- **AST 流式渲染**：接入 AST 解析器，在每个顶层 JSX 节点完整后即时渲染，实现打字机式的流式组件生成体验
- **沙箱安全隔离**：将 `react-live` 主线程执行迁移至 `<iframe sandbox>` 或 Web Worker，通过 `postMessage` 通信防止 XSS

### 中期（产品升级）
- **真实鉴权落地**：将 `useAuth` Mock 层替换为 **NextAuth.js + Supabase**（PostgreSQL + RLS），实现多端同步与团队协作
- **RAG 组件库接入**：将设计系统文档向量化，生成时自动检索注入，让 AI 直接复用已有组件

### 长期（范式跃迁）
接入 **WebContainers** 或 **Sandpack 虚拟文件系统（VFS）**，将大模型输出从单一 JSX 字符串**升级为完整的全栈项目脚手架**——包含目录树、多文件互相引用、`package.json` 依赖管理与 TypeScript 类型定义，真正实现媲美生产环境的 **AI-Native IDE**。

---

*本项目为个人 MVP，代码均为原创设计与实现。*  
*Built with ❤️ and Claude Sonnet by Cursor Agent.*
