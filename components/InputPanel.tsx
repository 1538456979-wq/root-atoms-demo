"use client";

import { useState } from "react";
import { Loader2, Sparkles, History, ChevronRight } from "lucide-react";
import type { HistoryItem } from "@/hooks/useHistory";

interface InputPanelProps {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setGeneratedCode: (code: string) => void;
  addHistory: (prompt: string, code: string) => void;
  history: HistoryItem[];
}

const InputPanel = ({
  isLoading,
  setIsLoading,
  setGeneratedCode,
  addHistory,
  history,
}: InputPanelProps) => {
  const [prompt, setPrompt] = useState<string>("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      window.alert("请先输入组件需求描述");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(`生成失败：${data.error ?? "未知错误"}`);
        return;
      }

      setGeneratedCode(data.code);
      // 生成成功后持久化到 localStorage
      addHistory(prompt.trim(), data.code);
    } catch (err) {
      console.error("[InputPanel] 请求异常:", err);
      window.alert("请求失败，请检查网络或稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 点击历史记录项，直接将对应代码重载到预览区
  const handleHistoryClick = (item: HistoryItem) => {
    setGeneratedCode(item.code);
    setPrompt(item.prompt);
  };

  return (
    <aside className="w-[30%] h-full flex flex-col bg-zinc-900 border-r border-zinc-700 shrink-0 overflow-hidden">
      {/* 面板标题栏 */}
      <div className="px-4 py-3 border-b border-zinc-700 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          输入配置
        </h2>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        {/* 输入框 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400 font-medium">
            组件需求描述
          </label>
          <textarea
            className="w-full min-h-[180px] resize-none rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="描述你想生成的 React 组件，例如：一个带渐变背景的登录卡片，包含邮箱和密码输入框以及提交按钮……"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              生成组件
            </>
          )}
        </button>

        {/* 历史记录区块 */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-700">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                历史记录
              </span>
            </div>

            <ul className="flex flex-col gap-1">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleHistoryClick(item)}
                    className="group w-full flex items-center gap-2 rounded-md px-3 py-2 text-left bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate transition-colors">
                      {item.prompt}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default InputPanel;
