# Atoms Generator — AI Native 组件生成器 MVP

> 用一句话描述你的 UI 需求，AI 即刻生成可交互的 React 组件。

---

## 🚀 项目简介

**Atoms Generator** 是一个基于 **Next.js App Router + DeepSeek API + react-live** 构建的 AI 原生 UI 组件生成器。

用户只需用自然语言描述 UI 需求，系统便会调用大语言模型生成符合规范的 React JSX 代码，并通过前端沙箱实时渲染为可交互的真实组件——整个链路无需构建、无需刷新、所见即所得。

产品形态经历了从**单页极简生成器**到**专业工作台（Workspace）**的完整演进，目前已具备多项目会话管理、基于上下文的迭代修改等准商业级能力。

---

## ✨ 核心特性

### 🤖 AI 驱动生成
接入 DeepSeek `deepseek-chat` 模型，通过精心设计的 **System Prompt** 将模型输出严格约束为可被 `react-live` 直接渲染的纯 JSX 节点——无 import、无组件声明、无 Markdown 包裹，开箱即用。

### ⚡ 实时沙箱渲染（Live Sandbox）
基于 `react-live`，AI 生成的 JSX 字符串在浏览器内即时编译并渲染为真实的可交互 React 组件。`lucide-react` 图标库以 `scope` 形式注入沙箱，AI 生成的代码可直接引用图标，无需任何额外配置。

### 🖥️ 工作台模式（Workspace）
首页采用类 ChatGPT / v0.dev 的居中极简布局；提交需求后，页面以 500ms 平滑动画过渡为**左右分栏专业工作台**：
- **左侧侧边栏**：可折叠的历史项目列表 + 当前会话对话气泡流 + 底部迭代输入栏
- **右侧内容区**：UI 预览 / 查看源码 双 Tab + 复制代码 + 一键下载 `Component.tsx`

### 📁 多项目会话管理（Sessions）
基于 `localStorage` 实现多项目数据隔离，每个项目包含独立的 `id`、`title`、`updatedAt` 与完整的 `entries[]` 对话历史。支持历史记录折叠（ChevronDown 动效）、跨会话回溯与代码复现，刷新页面数据不丢失。

### 🔁 基于上下文的迭代修改
工作台中再次提交需求时，系统会将**当前正在渲染的 JSX 代码**连同新需求一起发送给大模型，模型在「看到旧代码」的前提下进行精准增量修改（调整位置、改变颜色、增删元素），而非每次从零生成。这是本项目与普通代码生成工具的核心差异。

### 💡 灵感胶囊（Preset Prompts）
首页内置 4 个预设 Prompt 胶囊（SaaS 定价卡片、数据仪表盘、登录框、商品卡片），降低零代码用户的上手门槛，点击即触发生成。

---

## 🛠️ 技术栈与架构决策

| 层次 | 技术 | 选型理由 |
|------|------|----------|
| 全栈骨架 | **Next.js 16 App Router** | Server Component + Route Handler 一体化，零额外后端；动态 API 路由 `/api/generate` 处理大模型调用 |
| 样式系统 | **Tailwind CSS v4** | 原子化类名与 AI 生成代码高度契合；配合 CDN 注入解决 react-live 动态渲染时的 JIT 扫描盲区 |
| 前端沙箱 | **react-live** | 浏览器内安全编译并渲染 JSX 字符串，支持实时 scope 注入，无需 iframe |
| AI 引擎 | **DeepSeek API**（兼容 OpenAI SDK）| 中文指令理解出色，代码生成质量高，成本可控；`deepseek-chat` 模型兼容 OpenAI 客户端，迁移成本极低 |
| 图标库 | **lucide-react** | Tree-shakeable，作为 scope 整体注入 react-live，AI 生成的代码直接可用 |
| 工具函数 | **clsx + tailwind-merge** | `cn()` 工具函数处理条件类名合并，避免 Tailwind 样式冲突 |
| 持久化 | **localStorage** | MVP 阶段零后端依赖，通过 `useProjects` 自定义 Hook 封装读写逻辑，接口设计预留云端替换空间 |

**架构亮点：双视图状态机**

`page.tsx` 维护一个 `hasResult` 布尔值驱动 Home ↔ Workspace 的视图切换，两套视图通过 `absolute inset-0` 叠层 + CSS `opacity/transform` 过渡，无路由跳转、无页面重载，体验流畅。

生成逻辑被显式拆分为两个独立函数：
- `handleHomeGenerate` — 只调用 `createProject`，永远新建
- `handleWorkspaceGenerate` — 只调用 `addEntry`，永远追加；同时携带 `currentCode` 上下文

---

## 🤖 AI 协同开发（Vibe Coding）

本项目由开发者与 **Cursor Agent（Claude Sonnet 4.6）** 结对编程完成，是一次对「AI 时代前端工程师工作流」的深度实践。

### 开发模式

> 人来架构 + AI 来实现 + 人来 Review = 10× 开发效率

开发者负责产品定义、架构决策与质量把关；Agent 负责代码实现、多文件协同与边界情况处理。每一次有价值的需求，均以精准的自然语言指令下达，Agent 可在单次响应中同时修改 5+ 个文件并保持全局一致性。

### 关键攻坚案例

**① System Prompt 工程 — 约束模型输出格式**

`react-live` 只接受纯 JSX 节点，不允许任何 `import` 或组件声明。通过在后端 Route Handler 中硬编码强约束性 System Prompt（「违反将导致系统崩溃」的强化写法），将模型输出格式控制率提升至接近 100%，远比前端后处理清洗更稳健。

**② Flex 弹性空间挤压问题**

侧边栏中「历史项目」与「当前会话」共用同一个 `flex-1 overflow-y-auto` 容器，历史记录增多时会将当前会话区域完全挤压。通过引入三层 Flex 嵌套结构（外层 `flex-1 min-h-0` + 历史区 `shrink-0` + 会话区 `flex-1 min-h-0 overflow-y-auto`），彻底解决溢出问题——`min-h-0` 是突破 Flex 子元素默认 `min-height: auto` 限制的关键。

**③ Hydration 样式丢失**

Tailwind CDN（为 react-live 动态渲染注入）与编译版 Tailwind v4 在客户端水合后产生样式覆盖冲突，导致 Logo 渐变背景丢失。通过将 Logo 容器的背景改为 React `style={{ background: 'linear-gradient(...)' }}` 内联样式，完全绕过了 CSS 类名的水合竞争，彻底根治问题。

**④ 上下文迭代修改架构**

工作台中再次生成时，旧的实现每次都会「新建项目」。问题根源在于单一的 `handleGenerate` 函数通过 if/else 分支判断，在某些状态下读取到了过期的 `currentProject` 闭包值。重构方案：将生成逻辑拆分为两个职责明确的 `useCallback` 函数，并在工作区生成时通过 API 请求体携带 `currentCode` 快照，让大模型真正具备「在旧代码上修改」的语义理解能力。

### 核心结论

这次实践验证了 AI 时代前端工程师的新核心竞争力：

- **重架构**：能设计可扩展的组件边界、状态流与 API 契约
- **懂交互**：能精确描述动效、布局和用户体验预期
- **强 Prompt**：能将模糊需求转化为精准的、可执行的 AI 指令

编写代码的速度已不再是核心壁垒，「定义清楚问题」的能力才是。

---

## 🔮 未来演进路线（Roadmap）

当前 MVP 已验证了「自然语言 → 可交互 UI」的完整产品闭环。下一阶段的演进方向：

### 近期（工程强化）

- **沙箱安全升级**：将 `react-live` 的主线程执行迁移至 `<iframe sandbox>` 或 `Web Worker`，通过 `postMessage` 通信彻底隔离用户代码，防止 XSS 攻击
- **Streaming 流式输出**：接入 `stream: true` 模式，逐 token 推送生成内容，消除大模型响应延迟的等待感
- **RAG 接入**：将公司组件库文档向量化，在调用大模型时自动检索注入，让生成的代码直接复用已有设计系统

### 中期（产品升级）

- **云端持久化**：将 `localStorage` 替换为 **Supabase**（PostgreSQL + RLS），实现多端同步、团队协作与版本历史
- **Prompt 模板系统**：内置行业常用场景模板（SaaS、电商、数据大屏），降低专业用户学习成本

### 长期（范式跃迁）

接入 **WebContainers** 或 **Sandpack 虚拟文件系统（VFS）**，将大模型输出从单一的 JSX 字符串**升级为完整的全栈项目脚手架**——包含目录树、多文件互相引用、`package.json` 依赖管理与 TypeScript 类型定义。届时用户一句话不只能生成一个组件，而是一个可以直接部署的完整工程，真正实现媲美生产环境的 **AI-Native IDE**。

---

*本项目为个人 MVP，代码均为原创设计与实现。*
*Built with ❤️ and Claude Sonnet by Cursor Agent.*
