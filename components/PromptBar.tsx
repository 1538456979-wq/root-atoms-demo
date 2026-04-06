"use client";

import { Sparkles, Loader2, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/hooks/useHistory";

// 灵感胶囊预设 Prompt
const PRESETS = [
  { emoji: "✨", label: "生成 SaaS 定价卡片" },
  { emoji: "📊", label: "生成用户数据仪表盘" },
  { emoji: "🔐", label: "生成极简登录框" },
  { emoji: "🛒", label: "生成电商商品卡片" },
];

interface PromptBarProps {
  variant: "hero" | "bottom";
  prompt: string;
  setPrompt: (v: string) => void;
  isLoading: boolean;
  /** 接受最终要生成的 prompt 文本，与 UI 状态解耦 */
  onGenerate: (promptText: string) => void;
  history?: HistoryItem[];
  onHistoryClick?: (item: HistoryItem) => void;
}

const PromptBar = ({
  variant,
  prompt,
  setPrompt,
  isLoading,
  onGenerate,
  history,
  onHistoryClick,
}: PromptBarProps) => {
  // 点击胶囊：先回填文本，再立即触发生成（无需等待 setState）
  const handlePresetClick = (text: string) => {
    setPrompt(text);
    onGenerate(text);
  };

  // ─── Hero 模式：居中大号输入框 + 灵感胶囊 ───────────────────────
  if (variant === "hero") {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* 带内嵌发送按钮的 textarea */}
        <div
          className={cn(
            "relative rounded-2xl bg-white border border-zinc-200 shadow-lg shadow-zinc-100",
            "focus-within:border-indigo-300 focus-within:shadow-indigo-100/60 transition-all duration-200"
          )}
        >
          <textarea
            rows={3}
            className="w-full resize-none rounded-2xl px-5 pt-4 pb-16 text-base text-zinc-900 placeholder-zinc-400 outline-none bg-transparent leading-relaxed"
            placeholder="描述你想生成的组件，例如：一个带渐变背景的登录卡片，包含邮箱和密码输入框……"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                onGenerate(prompt);
              }
            }}
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-xs text-zinc-300 select-none">⌘ Enter</span>
            <button
              onClick={() => onGenerate(prompt)}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  生成
                </>
              )}
            </button>
          </div>
        </div>

        {/* 灵感胶囊 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePresetClick(p.label)}
              disabled={isLoading}
              className="flex items-center gap-1.5 h-8 px-4 rounded-full border border-zinc-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-sm text-zinc-600 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Bottom 模式：固定底部紧凑输入栏 + 历史 chips ────────────────
  return (
    <div className="border-t border-zinc-100 bg-white/95 backdrop-blur-sm px-4 py-3 shrink-0">
      {/* 历史记录 chips（最多展示 5 条，横向滚动） */}
      {history && history.length > 0 && (
        <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-0.5">
          <span className="text-xs text-zinc-400 shrink-0">最近：</span>
          {history.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onHistoryClick?.(item)}
              className="shrink-0 h-6 px-3 rounded-full border border-zinc-200 text-xs text-zinc-500 hover:text-indigo-600 hover:border-indigo-200 bg-white transition-colors max-w-[200px] truncate"
            >
              {item.prompt}
            </button>
          ))}
        </div>
      )}

      {/* 输入行 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 h-10 px-4 rounded-full bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all"
          placeholder="继续描述新的需求… (⌘+Enter 发送)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              onGenerate(prompt);
            }
          }}
          disabled={isLoading}
        />
        <button
          onClick={() => onGenerate(prompt)}
          disabled={isLoading || !prompt.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptBar;
