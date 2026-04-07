"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** 使用 ui-avatars.com 动态生成头像 URL */
  avatarUrl: string;
}

const STORAGE_KEY = "atoms_auth_user";

/** 根据名称生成带颜色的 ui-avatars 头像链接 */
function makeAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&size=128`;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  /** 页面加载时从 localStorage 恢复登录状态 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      // 忽略解析错误，保持游客状态
    }
  }, []);

  /** 登录：模拟 1.5s 网络请求，写入 mock 用户对象 */
  const login = useCallback(async (email: string, _password: string): Promise<void> => {
    setIsAuthLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const name = email.split("@")[0];
    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatarUrl: makeAvatarUrl(name),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthLoading(false);
  }, []);

  /** 注册：同样模拟 1.5s 延迟，写入带用户名的 mock 对象 */
  const register = useCallback(
    async (username: string, email: string, _password: string): Promise<void> => {
      setIsAuthLoading(true);
      await new Promise((r) => setTimeout(r, 1500));
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        name: username,
        email,
        avatarUrl: makeAvatarUrl(username),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthLoading(false);
    },
    []
  );

  /** 退出登录：清除 localStorage 与内存状态 */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, isAuthLoading, login, register, logout };
}
