/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Compass, Briefcase, Zap, Shield, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12 text-center" id="welcome-screen">
      <div className="max-w-3xl space-y-8">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider text-teal-400 uppercase rounded-full bg-teal-950/50 border border-teal-800/60 animate-fade-in" id="brand-badge">
          <Compass className="w-4 h-4 text-teal-400" id="compass-icon" />
          <span>OkLetGoVN - Thổ Địa AI Số 1 Việt Nam</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 font-sans" id="hero-title">
          Du Lịch Thông Minh. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400" id="gradient-text">
            Tối Ưu Hoạt Động & Chi Phí
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed" id="hero-tagline">
          Thiết kế đặc quyền cho giới đi làm <span className="text-slate-200 font-semibold" id="age-range">25-35 tuổi</span>. Lên kế hoạch Itinerary bằng AI, tích hợp bản đồ dẫn đường, săn voucher sáng sớm và kết nối hướng dẫn viên bản địa 24/7.
        </p>

        {/* Strategic Pillars (Bento-style Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8" id="features-grid">
          <div className="p-5 text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition-all duration-300" id="feat-1">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-950 text-teal-400 mb-4" id="feat-1-icon">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-200" id="feat-1-title">Tích Hợp Làm Việc</h3>
            <p className="text-xs text-slate-400 mt-2" id="feat-1-desc">
              Gợi ý các quán cà phê yên tĩnh, Wi-Fi 5G, ổ cắm đầy đủ để bạn dễ dàng làm việc remote trong chuyến đi.
            </p>
          </div>

          <div className="p-5 text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition-all duration-300" id="feat-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 mb-4" id="feat-2-icon">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-200" id="feat-2-title">Lên Lịch Bằng AI</h3>
            <p className="text-xs text-slate-400 mt-2" id="feat-2-desc">
              Chỉ cần chọn địa điểm ưa thích, Gemini 3.5-Flash sẽ tối ưu hóa hành trình từng ngày từng giờ chi tiết nhất.
            </p>
          </div>

          <div className="p-5 text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition-all duration-300" id="feat-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-950 text-teal-400 mb-4" id="feat-3-icon">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-200" id="feat-3-title">Quản Lý Ngân Sách</h3>
            <p className="text-xs text-slate-400 mt-2" id="feat-3-desc">
              Checklist và so sánh chi phí thực tế vs chi phí dự kiến. Đảm bảo bạn không bao giờ chi tiêu lãng phí.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-6 animate-pulse" id="cta-container">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-350 hover:to-emerald-350 rounded-xl shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
            id="start-planning-btn"
          >
            Bắt đầu trải nghiệm ngay
            <ArrowRight className="w-5 h-5" id="arrow-icon" />
          </button>
        </div>

        {/* Location Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-slate-500 text-xs" id="locations-tag-list">
          <span>Khám phá điểm đến chiến lược:</span>
          {["Vũng Tàu", "Đà Nẵng", "Huế", "Bình Định (Quy Nhơn)"].map((city, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300" id={`tag-${idx}`}>
              {city}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
