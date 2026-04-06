"use client";

import { useState, useEffect } from "react";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import * as LucideIcons from "lucide-react";
import { Copy, Check, Atom } from "lucide-react";
import { cn } from "@/lib/utils";

// 智能加载文案数组，最后一条会固定显示并附带闪烁动画
const LOADING_MESSAGES = [
  "AI 正在理解您的需求",
  "正在构思组件结构",
  "正在编写 Tailwind 样式",
  "正在进行细节打磨",
];

interface PreviewPanelProps {
  generatedCode: string;
  isLoading: boolean;
}

const PreviewPanel = ({ generatedCode, isLoading }: PreviewPanelProps) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // 文字轮播：每 2 秒推进一条，到达最后一条后停止并固定显示
  useEffect(() => {
    if (!isLoading) {
      setMsgIndex(0);
      return;
    }
    // 已到最后一条，停止调度，保持固定显示
    if (msgIndex >= LOADING_MESSAGES.length - 1) return;

    const timer = setTimeout(() => {
      setMsgIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, msgIndex]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[PreviewPanel] 复制失败:", err);
    }
  };

  const isLastMessage = msgIndex >= LOADING_MESSAGES.length - 1;

  return (
    // flex flex-col 使内部子元素可以正确分配高度，relative 给复制按钮提供定位上下文
    <main className="flex-1 flex flex-col relative overflow-hidden bg-[#f8f8fb]">

      {/* ── 加载状态覆盖层 ────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#f8f8fb] z-10">
          {/* 光晕 + 图标 */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <div
              className="absolute inset-0 rounded-full border-2 border-indigo-300 animate-ping opacity-50"
              style={{ animationDuration: "1.8s" }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-violet-200 animate-ping opacity-30"
              style={{ animationDuration: "1.8s", animationDelay: "0.6s" }}
            />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Atom
                className="w-6 h-6 text-white"
                style={{ animation: "spin 3s linear infinite" }}
              />
            </div>
          </div>

          {/* 轮播文字：到最后一条时替换为闪烁省略号版本 */}
          <div className="flex items-center gap-0.5 h-5">
            <span className="text-sm font-medium text-zinc-500 transition-all duration-300">
              {LOADING_MESSAGES[msgIndex]}
            </span>
            {isLastMessage ? (
              <span className="text-sm font-medium text-indigo-400 animate-pulse">
                ...
              </span>
            ) : (
              <span className="text-sm font-medium text-zinc-400">...</span>
            )}
          </div>
        </div>
      )}

      {/* ── 有代码时渲染 react-live ──────────────────────────────── */}
      {!isLoading && generatedCode ? (
        <>
          {/* 复制按钮：绝对定位浮于内容之上 */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all shadow-sm",
                copied
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-white border border-zinc-200 text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-indigo-100"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  复制代码
                </>
              )}
            </button>
          </div>

          {/* 滚动容器：flex-1 使其精确占满 main 的剩余高度，pt-24 保证顶部留白 */}
          <div className="flex-1 overflow-y-auto px-10 pt-4 pb-24">
            <LiveProvider code={generatedCode} scope={{ ...LucideIcons }}>
              {/* min-h-full 保证内容不足一屏时依然居中，内容超出时从顶部开始排列 */}
              <div className="flex justify-center items-center min-h-full pb-24">
                <LivePreview />
              </div>
              <LiveError className="mt-4 bg-red-50 text-red-500 p-4 font-mono text-xs rounded-lg border border-red-100" />
            </LiveProvider>
          </div>
        </>
      ) : (
        /* 既没加载也没代码：占位状态 */
        !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-zinc-400">生成的组件将在此处预览……</p>
          </div>
        )
      )}
    </main>
  );
};

export default PreviewPanel;
