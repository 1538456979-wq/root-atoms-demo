"use client";

import { LiveProvider, LiveError, LivePreview } from "react-live";
import * as LucideIcons from "lucide-react";
import { Loader2 } from "lucide-react";

interface PreviewPanelProps {
  generatedCode: string;
  isLoading: boolean;
}

const PreviewPanel = ({ generatedCode, isLoading }: PreviewPanelProps) => {
  return (
    <main className="flex-1 h-full flex flex-col bg-zinc-50 overflow-hidden">
      {/* 面板标题栏 */}
      <div className="px-4 py-3 border-b border-zinc-200 bg-white shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          预览
        </h2>
      </div>

      {/* 预览内容区 */}
      <div className="relative flex-1 overflow-hidden">
        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-50/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
            <p className="text-sm text-zinc-500">正在生成组件…</p>
          </div>
        )}

        {/* 有代码时渲染 react-live */}
        {!isLoading && generatedCode ? (
          <LiveProvider code={generatedCode} scope={{ ...LucideIcons }}>
            <div className="flex-1 flex items-center justify-center bg-zinc-50 p-8 h-full overflow-y-auto">
              <LivePreview />
            </div>
            <LiveError className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-600 p-4 font-mono text-sm" />
          </LiveProvider>
        ) : (
          /* 既没加载也没代码时，显示占位提示 */
          !isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-zinc-400">生成的组件将在此处预览……</p>
            </div>
          )
        )}
      </div>
    </main>
  );
};

export default PreviewPanel;
