"use client";

import { useState, useRef, useEffect } from "react";
import { Atom, Plus, LogOut, Settings, FolderOpen, ChevronDown } from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";

interface HeaderProps {
  hasResult?: boolean;
  onReset?: () => void;
  onOpenAuth?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

const Header = ({ hasResult, onReset, onOpenAuth, user, onLogout }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** 点击弹窗外部自动关闭下拉菜单 */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-100 bg-white shrink-0 z-20 relative">
      {/* 左侧 Logo */}
      <div className="flex items-center gap-2">
        <Atom className="w-5 h-5 text-indigo-500" strokeWidth={2} />
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          Atoms Generator
        </span>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-2">
        {/* 有结果时显示"新建"按钮 */}
        {hasResult && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新建
          </button>
        )}

        {user ? (
          /* ── 已登录：头像 + 下拉菜单 ─────────────────────────────── */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 h-9 pl-1.5 pr-2.5 rounded-full hover:bg-zinc-100 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full ring-2 ring-indigo-200 object-cover"
              />
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 下拉面板 */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-black/8 overflow-hidden z-50 py-1">
                {/* 用户信息 */}
                <div className="px-4 py-3 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                </div>
                {/* 菜单项 */}
                <div className="py-1">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors text-left">
                    <Settings className="w-4 h-4 text-zinc-400" />
                    账号设置
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors text-left">
                    <FolderOpen className="w-4 h-4 text-zinc-400" />
                    项目管理
                  </button>
                </div>
                {/* 退出登录 */}
                <div className="border-t border-zinc-100 py-1">
                  <button
                    onClick={() => {
                      onLogout?.();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── 游客模式：登录 + 开始免费使用 ─────────────────────────── */
          <>
            <button
              onClick={onOpenAuth}
              className="h-8 px-4 rounded-full text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              登录
            </button>
            <button
              onClick={onOpenAuth}
              className="h-8 px-4 rounded-full text-xs font-semibold text-white shadow-sm shadow-indigo-300/40 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
            >
              开始免费使用
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
