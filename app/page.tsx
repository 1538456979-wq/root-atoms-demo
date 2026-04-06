"use client";

import { useState, useCallback } from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import PromptBar from "@/components/PromptBar";
import WorkspaceLeft from "@/components/WorkspaceLeft";
import WorkspaceRight from "@/components/WorkspaceRight";
import { useProjects } from "@/hooks/useProjects";
import type { Project, ProjectEntry } from "@/hooks/useProjects";

// ── 公共 fetch 逻辑，与 React 状态无关 ──────────────────────────────
// currentCode 有值时，API 切换为「基于旧代码修改」模式，让大模型理解上下文
async function callGenerateAPI(
  promptText: string,
  currentCode?: string
): Promise<string | null> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: promptText,
      ...(currentCode ? { currentCode } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    window.alert(`生成失败：${data.error ?? "未知错误"}`);
    return null;
  }
  return data.code as string;
}

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [displayCode, setDisplayCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState("");

  const { projects, createProject, addEntry } = useProjects();

  // 切换到 Workspace 的条件：已有项目，或正在生成第一条
  const hasResult = !!currentProject || isLoading;

  // ══ 职责 1：首页提交 → 永远创建新项目 ════════════════════════════
  const handleHomeGenerate = useCallback(
    async (promptText: string) => {
      if (!promptText.trim()) return;
      setPendingPrompt(promptText);
      setIsLoading(true);
      setPrompt("");
      try {
        const code = await callGenerateAPI(promptText);
        if (!code) return;
        // 首页专属：只在这里调用 createProject
        const project = createProject(promptText, code);
        setCurrentProject(project);
        setDisplayCode(code);
        setSelectedEntryId(project.entries[0].id);
      } catch (err) {
        console.error("[Home] 首页生成异常:", err);
        window.alert("请求失败，请检查网络或稍后重试");
      } finally {
        setIsLoading(false);
        setPendingPrompt("");
      }
    },
    [createProject]
    // 注意：不依赖 currentProject，此函数永远只新建
  );

  // ══ 职责 2：工作区提交 → 永远追加到当前项目，并携带旧代码供大模型参考 ═══
  const handleWorkspaceGenerate = useCallback(
    async (promptText: string) => {
      if (!promptText.trim() || !currentProject) return;
      const projectId = currentProject.id; // 固定住，避免异步期间引用漂移
      const codeSnapshot = displayCode;    // 同样快照，避免闭包捕获旧值
      setPendingPrompt(promptText);
      setIsLoading(true);
      setPrompt("");
      try {
        // 关键：把当前渲染的代码一起发给 API，大模型才能理解「在这个基础上修改」
        const code = await callGenerateAPI(promptText, codeSnapshot || undefined);
        if (!code) return;
        // 工作区专属：只在这里调用 addEntry，永远不新建项目
        const entry = addEntry(projectId, promptText, code);
        setCurrentProject((prev) =>
          prev?.id === projectId
            ? { ...prev, updatedAt: Date.now(), entries: [...prev.entries, entry] }
            : prev
        );
        setDisplayCode(code);
        setSelectedEntryId(entry.id);
      } catch (err) {
        console.error("[Home] 工作区迭代异常:", err);
        window.alert("请求失败，请检查网络或稍后重试");
      } finally {
        setIsLoading(false);
        setPendingPrompt("");
      }
    },
    [currentProject, displayCode, addEntry]
    // displayCode 加入依赖：每次渲染的代码变化后，此函数都能拿到最新快照
  );

  // ── 新建项目：重置所有状态，返回首页居中视图 ──────────────────────
  const handleNewProject = useCallback(() => {
    setCurrentProject(null);
    setDisplayCode("");
    setSelectedEntryId(null);
    setPrompt("");
    setPendingPrompt("");
  }, []);

  // ── 点击历史项目：加载其最新一条代码 ──────────────────────────────
  const handleSelectProject = useCallback((project: Project) => {
    setCurrentProject(project);
    const latest = project.entries[project.entries.length - 1];
    if (latest) {
      setDisplayCode(latest.code);
      setSelectedEntryId(latest.id);
    }
  }, []);

  // ── 点击会话条目：切换右侧展示对应代码 ────────────────────────────
  const handleSelectEntry = useCallback((entry: ProjectEntry) => {
    setDisplayCode(entry.code);
    setSelectedEntryId(entry.id);
  }, []);

  return (
    // 外层背景：浅灰，与亮色侧边栏 + 白色右侧卡片形成微妙层次
    <div className="h-screen bg-gray-100 overflow-hidden relative">

      {/* ══ Home 视图（居中极简） ════════════════════════════════════ */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col bg-white transition-all duration-500 ease-out",
          hasResult
            ? "opacity-0 pointer-events-none scale-[0.98]"
            : "opacity-100 scale-100"
        )}
      >
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 pb-24 -translate-y-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
            >
              <Wand2 className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
                一句话，生成你的产品 UI
              </h1>
              <p className="mt-2.5 text-base text-zinc-500">
                描述你的想法，AI 即刻生成可交互的 React 组件
              </p>
            </div>
          </div>
          {/* 首页输入框调用 handleHomeGenerate */}
          <PromptBar
            variant="hero"
            prompt={prompt}
            setPrompt={setPrompt}
            isLoading={isLoading}
            onGenerate={handleHomeGenerate}
          />
        </div>
      </div>

      {/* ══ Workspace 视图（左右分栏工作台） ════════════════════════ */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 ease-out",
          hasResult
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none translate-y-4"
        )}
      >
        <div className="h-screen p-4 flex gap-4">
          {/* 左侧亮色侧边栏；传入 handleWorkspaceGenerate */}
          <WorkspaceLeft
            currentProject={currentProject}
            projects={projects}
            selectedEntryId={selectedEntryId}
            isLoading={isLoading}
            pendingPrompt={pendingPrompt}
            prompt={prompt}
            setPrompt={setPrompt}
            onWorkspaceGenerate={handleWorkspaceGenerate}
            onNewProject={handleNewProject}
            onSelectProject={handleSelectProject}
            onSelectEntry={handleSelectEntry}
          />

          {/* 右侧白色预览卡片 */}
          <WorkspaceRight
            generatedCode={displayCode}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
