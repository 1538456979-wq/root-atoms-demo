"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProjectEntry {
  id: number;
  prompt: string;
  code: string;
  createdAt: number;
}

export interface Project {
  id: string;
  /** 项目标题，取第一条 prompt（截断后）*/
  title: string;
  updatedAt: number;
  entries: ProjectEntry[];
}

const STORAGE_KEY = "atoms_generator_projects";

const readFromStorage = (): Project[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
};

const writeToStorage = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("[useProjects] 写入 localStorage 失败:", err);
  }
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  // 客户端挂载后才读取，避免 SSR 水合不一致
  useEffect(() => {
    setProjects(readFromStorage());
  }, []);

  /** 首次生成：创建新项目，返回该项目对象 */
  const createProject = useCallback((prompt: string, code: string): Project => {
    const now = Date.now();
    const entry: ProjectEntry = { id: now, prompt, code, createdAt: now };
    const newProject: Project = {
      id: `proj_${now}`,
      title: prompt.length > 40 ? `${prompt.slice(0, 40)}…` : prompt,
      updatedAt: now,
      entries: [entry],
    };
    setProjects((prev) => {
      const next = [newProject, ...prev];
      writeToStorage(next);
      return next;
    });
    return newProject;
  }, []);

  /** 追加生成记录到已有项目，返回新的 entry */
  const addEntry = useCallback((projectId: string, prompt: string, code: string): ProjectEntry => {
    const now = Date.now();
    const entry: ProjectEntry = { id: now, prompt, code, createdAt: now };
    setProjects((prev) => {
      const next = prev.map((p) =>
        p.id !== projectId
          ? p
          : { ...p, updatedAt: now, entries: [...p.entries, entry] }
      );
      // 将更新过的项目置顶
      const idx = next.findIndex((p) => p.id === projectId);
      if (idx > 0) {
        const [proj] = next.splice(idx, 1);
        next.unshift(proj);
      }
      writeToStorage([...next]);
      return [...next];
    });
    return entry;
  }, []);

  return { projects, createProject, addEntry };
};
