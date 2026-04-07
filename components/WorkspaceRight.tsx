"use client";

import { useState } from "react";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import * as LucideIcons from "lucide-react";
import { Copy, Check, Download, Code2, Eye, Atom } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoadingMessages } from "@/hooks/useLoadingMessages";

type Tab = "preview" | "code";

interface WorkspaceRightProps {
  generatedCode: string;
  isLoading: boolean;
  /** 当前是否已登录 */
  isLoggedIn?: boolean;
  /** 唤起登录弹窗 */
  onOpenAuth?: () => void;
}

const WorkspaceRight = ({
  generatedCode,
  isLoading,
  isLoggedIn = false,
  onOpenAuth,
}: WorkspaceRightProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const { message, isLastMessage } = useLoadingMessages(isLoading);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[WorkspaceRight] 复制失败:", err);
    }
  };

  /** Blob API 触发浏览器下载；未登录时先唤起认证弹窗 */
  const handleDownload = () => {
    if (!isLoggedIn) {
      onOpenAuth?.();
      return;
    }
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Component.tsx";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const hasCode = !!generatedCode && !isLoading;

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden min-w-0">

      {/* ── 顶部操作栏 ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 shrink-0">
        {/* Tab 切换 */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-all",
              activeTab === "preview"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            UI 预览
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-all",
              activeTab === "code"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            查看源码
          </button>
        </div>

        {/* 操作按钮（仅有代码时显示） */}
        {hasCode && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all border",
                copied
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-indigo-300 hover:text-indigo-600"
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "复制代码"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              下载代码
            </button>
          </div>
        )}
      </div>

      {/* ── 内容区 ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">

        {/* 加载中覆盖层 */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-zinc-50 z-10">
            <div className="relative flex items-center justify-center w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border-2 border-indigo-300 animate-ping opacity-40"
                style={{ animationDuration: "1.8s" }}
              />
              <div
                className="absolute inset-2 rounded-full border-2 border-violet-200 animate-ping opacity-25"
                style={{ animationDuration: "1.8s", animationDelay: "0.6s" }}
              />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Atom
                  className="w-6 h-6 text-white"
                  style={{ animation: "spin 3s linear infinite" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-0.5 h-5">
              <span className="text-sm font-medium text-zinc-500">{message}</span>
              {isLastMessage ? (
                <span className="text-sm font-medium text-indigo-400 animate-pulse">...</span>
              ) : (
                <span className="text-sm font-medium text-zinc-400">...</span>
              )}
            </div>
          </div>
        )}

        {/* UI 预览 Tab */}
        {activeTab === "preview" && !isLoading && (
          hasCode ? (
            <div className="h-full overflow-y-auto">
              <LiveProvider code={generatedCode} scope={{ ...LucideIcons }}>
                <div className="flex justify-center items-center min-h-full p-10 pb-20">
                  <LivePreview />
                </div>
                <LiveError className="bg-red-50 text-red-500 p-4 font-mono text-xs border-t border-red-100" />
              </LiveProvider>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 pb-16">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-400">生成的 UI 组件将在此处预览</p>
            </div>
          )
        )}

        {/* 查看源码 Tab */}
        {activeTab === "code" && !isLoading && (
          hasCode ? (
            <div className="h-full overflow-y-auto bg-zinc-950">
              <pre className="p-6 text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
                <code>{generatedCode}</code>
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 pb-16">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-400">生成后可在此查看源码</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WorkspaceRight;
