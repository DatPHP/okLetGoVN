/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, User, Phone, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import { AuthResponse } from "../types.ts";

interface AuthScreenProps {
  onAuthSuccess: (authData: AuthResponse) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation functions
  const validatePhone = (p: string) => {
    return /^0\d{9}$/.test(p);
  };

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Common check
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Địa chỉ Email không hợp lệ.");
      return;
    }

    if (!isLogin) {
      if (!name || !phone) {
        setError("Vui lòng nhập đầy đủ Họ tên và Số điện thoại.");
        return;
      }
      if (!validatePhone(phone)) {
        setError("Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.");
        return;
      }
      if (password.length < 6) {
        setError("Mật khẩu phải chứa ít nhất 6 ký tự.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email, password }
        : { name, email, phone, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đã xảy ra lỗi ngoài ý muốn.");
      }

      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8" id="auth-screen">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl" id="auth-card">
        {/* Brand & Toggle */}
        <div className="text-center mb-8" id="auth-header">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-full uppercase mb-3" id="badge-auth">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>OkLetGoVN Security</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100" id="auth-title">
            {isLogin ? "Đăng Nhập Tài Khoản" : "Đăng Ký Thành Viên"}
          </h2>
          <p className="text-xs text-slate-400 mt-2" id="auth-subtitle">
            Hành trình thông minh và tối ưu chi phí đang chờ đợi bạn
          </p>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs text-left" id="auth-error-alert">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" id="error-icon" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div id="field-name">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và Tên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-150"
                  />
                </div>
              </div>

              <div id="field-phone">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-150"
                  />
                </div>
                <span className="block text-[10px] text-slate-500 mt-1">Định dạng 10 chữ số, bắt đầu bằng số 0</span>
              </div>
            </>
          )}

          {/* Email */}
          <div id="field-email">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Địa chỉ Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@viettel.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-150"
              />
            </div>
          </div>

          {/* Password */}
          <div id="field-password">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                id="toggle-pass-visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CTA Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-350 hover:to-emerald-350 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-150 cursor-pointer"
            id="auth-submit-btn"
          >
            {loading ? "Đang xử lý..." : isLogin ? "Đăng Nhập" : "Đăng Ký Miễn Phí"}
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center mt-6 text-xs text-slate-500" id="auth-footer-toggle">
          {isLogin ? (
            <span>
              Chưa có tài khoản?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className="text-teal-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                id="toggle-to-register"
              >
                Đăng ký ngay
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className="text-teal-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                id="toggle-to-login"
              >
                Đăng nhập
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
