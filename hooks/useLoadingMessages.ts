"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "AI 正在理解您的需求",
  "正在构思组件结构",
  "正在编写 Tailwind 样式",
  "正在进行细节打磨",
];

/**
 * 智能加载文案轮播 Hook
 * - isLoading=true 时，每 2 秒推进一条文案
 * - 到达最后一条后停止轮播，固定显示并标记 isLastMessage
 * - isLoading=false 时重置至第 0 条，准备下次使用
 */
export const useLoadingMessages = (isLoading: boolean) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMsgIndex(0);
      return;
    }
    if (msgIndex >= MESSAGES.length - 1) return;

    const timer = setTimeout(() => {
      setMsgIndex((prev) => Math.min(prev + 1, MESSAGES.length - 1));
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, msgIndex]);

  return {
    message: MESSAGES[msgIndex],
    isLastMessage: msgIndex >= MESSAGES.length - 1,
  };
};
