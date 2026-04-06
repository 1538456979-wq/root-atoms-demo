"use client";

import { useState } from "react";
import {
  Plus, MessageSquare, Clock,
  ArrowUp, Loader2, Sparkles,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Project, ProjectEntry } from "@/hooks/useProjects";

interface WorkspaceLeftProps {
  currentProject: Project | null;
  projects: Project[];
  selectedEntryId: number | null;
  isLoading: boolean;
  pendingPrompt: string;
  prompt: string;
  setPrompt: (v: string) => void;
  onWorkspaceGenerate: (promptText: string) => void;
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
  onSelectEntry: (entry: ProjectEntry) => void;
}

const WorkspaceLeft = ({
  currentProject,
  projects,
  selectedEntryId,
  isLoading,
  pendingPrompt,
  prompt,
  setPrompt,
  onWorkspaceGenerate,
  onNewProject,
  onSelectProject,
  onSelectEntry,
}: WorkspaceLeftProps) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const pastProjects = projects.filter((p) => p.id !== currentProject?.id);
  const hasSession = !!(currentProject || isLoading);

  const handleSubmit = () => {
    if (prompt.trim()) onWorkspaceGenerate(prompt);
  };

  return (
    /**
     * 布局结构（三层嵌套）：
     * aside [flex flex-col]
     *   ├── 顶部按钮        [shrink-0]
     *   ├── 中间弹性区      [flex-1 min-h-0 flex flex-col]   ← 关键：min-h-0 防止溢出
     *   │     ├── 历史项目  [shrink-0, collapsible]
     *   │     └── 当前会话  [flex-1 min-h-0 overflow-y-auto]  ← 独立滚动，永远占满剩余
     *   └── 底部输入栏      [shrink-0]
     */
    <aside className="flex-[0_0_25%] min-w-[280px] max-w-[360px] flex flex-col bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {/* ── 顶部：新建项目 ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <button
          onClick={onNewProject}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {/* ── 中间弹性区：历史 + 当前会话 ──────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col">

        {/* 历史项目：shrink-0，不抢占空间 */}
        {pastProjects.length > 0 && (
          <div className="shrink-0 px-3 pb-1">
            {/* 折叠触发器 */}
            <button
              onClick={() => setIsHistoryExpanded((v) => !v)}
              className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                历史项目
              </span>
              {isHistoryExpanded
                ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                : <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              }
            </button>

            {/* 列表：max-h 动画实现平滑折叠 */}
            <div
              className={cn(
                "flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ease-in-out",
                isHistoryExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {pastProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 mt-0.5 shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 group-hover:text-gray-900 truncate transition-colors leading-snug">
                      {project.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 分割线（有历史且有当前会话时显示） */}
            {hasSession && (
              <div className="mt-1 mb-0 border-t border-gray-200" />
            )}
          </div>
        )}

        {/* 当前会话：flex-1 min-h-0 overflow-y-auto → 始终占满剩余高度，独立滚动 */}
        {hasSession ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold px-2 pt-2 pb-1">
                当前会话
              </span>

              {/* 已完成的条目 */}
              {currentProject?.entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className={cn(
                    "w-full flex gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left",
                    selectedEntryId === entry.id
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-gray-100"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] text-white font-bold leading-none">你</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-snug truncate transition-colors",
                      selectedEntryId === entry.id ? "text-indigo-700 font-medium" : "text-gray-600"
                    )}>
                      {entry.prompt}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </div>
                </button>
              ))}

              {/* 正在生成的占位气泡 */}
              {isLoading && pendingPrompt && (
                <div className="flex gap-2.5 px-3 py-2.5 rounded-xl bg-indigo-50/60 ring-1 ring-indigo-100">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] text-white font-bold leading-none">你</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">{pendingPrompt}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                      <span className="text-xs text-indigo-500 animate-pulse">生成中…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 没有当前会话时，用空白占位让底部输入栏保持在底部 */
          <div className="flex-1" />
        )}
      </div>

      {/* ── 底部：输入栏 ──────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-200 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 min-w-0 h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="迭代修改当前项目…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ArrowUp className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </aside>
  );
};

export default WorkspaceLeft;
