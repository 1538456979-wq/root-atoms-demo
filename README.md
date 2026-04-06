# Atoms Generator — 设计与思考文档

> 一个基于大模型与 react-live 动态沙箱渲染的 AI UI 组件生成器 MVP，输入自然语言需求，秒级输出可交互的 React 组件。

---

## 一、项目简介

Atoms Generator 是一个全栈 AI 工具：用户在左侧面板用自然语言描述 UI 需求，后端将请求转发给 DeepSeek 大模型，模型返回纯 JSX 代码后，右侧预览区通过 react-live 实时渲染出可交互的 React 组件——整个链路无需构建、无需刷新，所见即所得。

---

## 二、技术选型

| 层次 | 技术 | 选型理由 |
|------|------|----------|
| 全栈骨架 | **Next.js 16 App Router** | Server Components + Route Handler 一体化，无需单独维护后端服务，部署极简 |
| 样式系统 | **Tailwind CSS v4** | 原子化 CSS 与 AI 生成代码高度契合；配合 CDN 注入解决 react-live 动态渲染时 JIT 扫描盲区 |
| 前端沙箱 | **react-live** | 在浏览器内安全编译并渲染字符串 JSX，无需 iframe，支持实时 scope 注入（Lucide 图标库） |
| AI 引擎 | **DeepSeek API（deepseek-chat）** | 兼容 OpenAI SDK 调用，中文指令理解出色，代码生成质量高，成本低 |
| 状态持久化 | **localStorage** | MVP 阶段零后端依赖，轻量实现历史记录的跨会话保存；通过自定义 Hook 封装，便于后续替换为云端方案 |
| 图标 | **lucide-react** | 轻量、Tree-shakeable，作为 scope 注入 react-live，AI 生成的代码可直接使用图标组件 |

---

## 三、AI 提效心法（Highlight）

本项目全程使用 **Cursor Agent（claude-sonnet-4.6 模型）** 进行 Vibe Coding，以下是几个关键决策：

### 3.1 用 System Prompt 驯服模型输出

react-live 只接受纯 JSX 节点——不能有 `import`、不能有组件声明、不能有 Markdown 包裹。为此，在后端 Route Handler 中硬编码了一段强约束性 System Prompt，从多个维度明确"违禁项"，并告知模型"违反将导致系统崩溃"以强化遵从度。实践证明，这比在前端做后处理清洗要更稳定、更彻底。

### 3.2 用自然语言驱动全栈骨架搭建

从 Next.js 项目初始化、依赖安装、目录结构规划，到跨组件状态传递方案（`useState` 提升至 page 层 + props 下传），整个架构决策均通过自然语言与 Agent 协作完成。Agent 不仅能执行终端命令，还能在多文件之间保持上下文一致性，相当于一个理解全局的 pair programmer。

### 3.3 分层思考，指令原子化

每次提需求时，先在脑中将任务拆解为独立原子（安装依赖 → 建接口 → 改组件 → 串状态），再逐步下达，避免一次性塞入过多变更导致 Agent 遗漏细节。这种"人来架构、AI 来实现"的协作模式，将原本需要半天的 MVP 搭建压缩到了数小时内完成。

---

## 四、核心功能亮点

**所见即所得的动态渲染**
用户输入 Prompt → 后端调用 DeepSeek → 返回纯 JSX 字符串 → `react-live` 在客户端实时编译渲染，全程无页面跳转，延迟感知极低。Lucide 图标组件通过 `scope` 注入，AI 生成的代码可以直接引用，无需额外配置。

**历史记录持久化**
每次成功生成后，`{ id, prompt, code }` 三元组自动写入 `localStorage`。刷新页面后历史仍然保留，点击任意历史条目可一键将对应代码重载到预览区，方便对比和复用之前的生成结果。自定义 Hook `useHistory` 封装了所有读写逻辑，业务层零感知存储细节。

---

## 五、未来演进思考

当前 MVP 验证了核心链路的可行性。若推进到真实业务场景，我会重点考虑以下几个方向：

**沙箱安全加固**
`react-live` 在主线程执行动态代码，存在 XSS 风险。生产环境应将渲染层迁移至 `<iframe sandbox>` 或 `Web Worker`，通过 `postMessage` 通信，彻底隔离用户代码的执行上下文，防止恶意脚本访问宿主页面的 DOM 和 Cookie。

**云端持久化与用户隔离**
将 `localStorage` 替换为 **Supabase**（PostgreSQL + Row-Level Security），每条生成记录绑定用户 ID，支持多端同步、团队共享和历史版本回溯，真正实现用户数据隔离。

**RAG 增强的代码生成**
接入 **RAG（检索增强生成）** 流程：将公司内部组件库的文档、Props 类型定义向量化存入知识库，在调用大模型时自动检索相关组件文档注入 Prompt，让 AI 生成的代码直接复用公司已有的设计系统，而非从零造轮子。

**流式输出提升体验**
当前实现为等待模型全量返回后一次性渲染。可改为 **Streaming** 模式（`stream: true`），配合 `ReadableStream` 逐 token 推送，代码生成过程实时可见，显著降低用户感知延迟。

**Prompt 模板系统**
内置常用场景的 Prompt 模板（表单、卡片、数据表格、导航栏等），降低用户的输入门槛，同时通过模板规范化输出，提升生成代码的一致性。

---

*本项目为个人 MVP，代码均为原创设计与实现。*
