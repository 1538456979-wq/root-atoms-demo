"use client";

import { useState } from "react";
import { X, Loader2, Eye, EyeOff, Wand2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 成功登录/注册后调用（可选），用于触发后续动作 */
  onSuccess?: () => void;
  isAuthLoading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
}

const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  isAuthLoading,
  onLogin,
  onRegister,
}: AuthModalProps) => {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // 登录表单字段
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 注册表单字段
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const resetForm = () => {
    setError("");
    setLoginEmail("");
    setLoginPassword("");
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setError("");
  };

  const handleLogin = async () => {
    setError("");
    if (!loginEmail.includes("@")) return setError("请输入有效的邮箱地址");
    if (loginPassword.length < 6) return setError("密码至少需要 6 位字符");
    try {
      await onLogin(loginEmail, loginPassword);
      onSuccess?.();
      handleClose();
    } catch {
      setError("登录失败，请稍后重试");
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!regUsername.trim()) return setError("请输入用户名");
    if (!regEmail.includes("@")) return setError("请输入有效的邮箱地址");
    if (regPassword.length < 6) return setError("密码至少需要 6 位字符");
    if (regPassword !== regConfirm) return setError("两次密码输入不一致");
    try {
      await onRegister(regUsername, regEmail, regPassword);
      onSuccess?.();
      handleClose();
    } catch {
      setError("注册失败，请稍后重试");
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full h-10 px-4 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* 弹窗主体 */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 顶部品牌区 */}
        <div className="pt-8 pb-5 px-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
          >
            <Wand2 className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            {tab === "login" ? "欢迎回来" : "创建账号"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {tab === "login" ? "登录你的 Atoms 账号" : "开始你的 AI 创作之旅"}
          </p>
        </div>

        {/* Tab 切换器 */}
        <div className="px-8 pb-5">
          <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={cn(
                  "flex-1 h-8 rounded-lg text-sm font-medium transition-all duration-200",
                  tab === t
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {t === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>
        </div>

        {/* 表单区域 */}
        <div className="px-8 pb-8">
          {tab === "login" ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">邮箱</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="至少 6 位字符"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className={cn(inputClass, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">用户名</label>
                <input
                  type="text"
                  placeholder="你的显示名称"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">邮箱</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="至少 6 位字符"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={cn(inputClass, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">确认密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="再次输入密码"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className={cn(
                      inputClass,
                      "pr-10",
                      regConfirm && regConfirm !== regPassword
                        ? "!border-red-300 focus:!border-red-400 focus:!ring-red-100"
                        : regConfirm && regConfirm === regPassword
                        ? "!border-emerald-300 focus:!border-emerald-400 focus:!ring-emerald-100"
                        : ""
                    )}
                  />
                  {regConfirm && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {regConfirm === regPassword
                        ? <Check className="w-4 h-4 text-emerald-500" />
                        : <X className="w-4 h-4 text-red-400" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          {/* 主按钮 */}
          <button
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={isAuthLoading}
            className="mt-5 w-full h-11 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
          >
            {isAuthLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {tab === "login" ? "登录中..." : "注册中..."}
              </>
            ) : (
              tab === "login" ? "登录" : "创建账号"
            )}
          </button>

          {/* 底部提示文字 */}
          <p className="mt-4 text-center text-xs text-zinc-400">
            {tab === "login" ? (
              <>还没有账号？<button onClick={() => handleTabChange("register")} className="text-indigo-500 hover:text-indigo-700 font-medium">免费注册</button></>
            ) : (
              <>已有账号？<button onClick={() => handleTabChange("login")} className="text-indigo-500 hover:text-indigo-700 font-medium">立即登录</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
