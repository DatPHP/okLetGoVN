/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Promotion } from "../types.ts";
import { Sparkles, Clock, Copy, Check, Ticket, Award } from "lucide-react";

interface PromotionsPanelProps {
  city: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
  token: string;
}

export default function PromotionsPanel({ city, token }: PromotionsPanelProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulated morning countdown timer (resets every morning at 9:00 AM)
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(9, 0, 0, 0); // Target is 9:00 AM today

      if (now.getHours() >= 9) {
        // If past 9 AM, set target to 9:00 AM tomorrow
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch promotions
  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/promotions?city=${city}`);
        if (response.ok) {
          const data = await response.json();
          setPromotions(data);
        }
      } catch (e) {
        console.error("Error loading promos:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, [city]);

  // Handle copying code to clipboard
  const handleCopyCode = (promoId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(promoId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 text-left" id="promotions-panel">
      {/* Promotion Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4" id="promotions-header">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Ticket className="w-4.5 h-4.5 text-teal-400" />
            Voucher Khuyến Mãi Sáng Sớm (Flash Deals)
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Mã ưu đãi độc quyền từ các đại lý uy tín được cập nhật vào mỗi 06:00 sáng hàng ngày.</p>
        </div>

        {/* Floating Morning Countdown Timer */}
        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-800/40 px-3.5 py-1.5 rounded-xl shrink-0" id="countdown-timer">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-left">
            <span className="block text-[8px] font-bold text-amber-500 uppercase tracking-wider font-mono">Hết hạn Săn Sáng Nay sau</span>
            <span className="text-xs font-mono font-extrabold text-amber-400">{timeLeft}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8" id="promo-spinner-container">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400" id="promo-spinner"></div>
        </div>
      ) : promotions.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">Chưa có mã khuyến mãi khả dụng cho thành phố này sáng nay.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="promotions-grid">
          {promotions.map((promo) => {
            const isCopied = copiedId === promo.id;
            return (
              <div
                key={promo.id}
                className="p-5 rounded-xl bg-slate-950/80 border border-slate-900 flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-slate-800 transition-all"
                id={`promo-card-${promo.id}`}
              >
                {/* Visual Ticket dash lines on side */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-8 rounded-full bg-slate-900 border border-slate-800" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-8 rounded-full bg-slate-900 border border-slate-800" />

                <div className="space-y-1 pl-1" id={`promo-top-${promo.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-teal-400 uppercase font-mono tracking-wider">
                      {promo.agencyName}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      HSD: {promo.expiry}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors">
                    {promo.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                    {promo.description}
                  </p>
                </div>

                {/* Promo Code copy area */}
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800/60" id={`promo-code-box-${promo.id}`}>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-mono">Mã giảm giá</span>
                    <span className="text-xs font-mono font-extrabold text-teal-400 tracking-wide uppercase">{promo.code}</span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(promo.id, promo.code)}
                    className={`px-3 py-1.5 text-[9px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                      isCopied
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                        : "bg-slate-950 border-slate-850 text-slate-300 hover:text-teal-400 hover:border-teal-500/20"
                    }`}
                    id={`btn-copy-${promo.id}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Mã
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
