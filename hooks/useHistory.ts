"use client";

import { useState, useEffect, useCallback } from "react";

export interface HistoryItem {
  id: number;
  prompt: string;
  code: string;
}

const STORAGE_KEY = "atoms_generator_history";

// 从 localStorage 安全读取历史记录，SSR 阶段直接返回空数组
const readFromStorage = (): HistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
};

const writeToStorage = (items: HistoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("[useHistory] 写入 localStorage 失败:", err);
  }
};

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 仅在客户端挂载后读取，避免 SSR 不一致警告
  useEffect(() => {
    setHistory(readFromStorage());
  }, []);

  const addHistory = useCallback((prompt: string, code: string) => {
    const item: HistoryItem = { id: Date.now(), prompt, code };
    setHistory((prev) => {
      const next = [item, ...prev];
      writeToStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("[useHistory] 清除 localStorage 失败:", err);
    }
  }, []);

  return { history, addHistory, clearHistory };
};
