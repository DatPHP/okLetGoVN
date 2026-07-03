/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { DestinationItem, LocationType } from "../types.ts";
import { Star, MapPin, Coffee, Utensils, Calendar, Clock, DollarSign, Check, ChevronRight } from "lucide-react";

interface DestinationSelectorProps {
  token: string;
  onPlanCreated: (itinerary: any) => void;
  selectedCity: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
  setSelectedCity: (city: "DaNang" | "Hue" | "VungTau" | "BinhDinh") => void;
}

export default function DestinationSelector({
  token,
  onPlanCreated,
  selectedCity,
  setSelectedCity,
}: DestinationSelectorProps) {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selector inputs
  const [daysCount, setDaysCount] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7); // Default to 1 week from now
    return today.toISOString().split("T")[0];
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const cities = [
    { key: "VungTau", label: "Vũng Tàu", desc: "Thành phố biển năng động, sát vách Sài Gòn" },
    { key: "DaNang", label: "Đà Nẵng", desc: "Đô thị biển văn minh, thành phố đáng sống nhất VN" },
    { key: "Hue", label: "Huế", desc: "Cố đô trầm mặc, thung lũng văn hoá & ẩm thực phong phú" },
    { key: "BinhDinh", label: "Bình Định", desc: "Eo biển Quy Nhơn quyến rũ, jeju thu nhỏ hoang sơ" },
  ];

  // Fetch destinations when city changes
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/destinations?city=${selectedCity}`);
        if (!response.ok) {
          throw new Error("Lỗi tải danh mục địa điểm du lịch.");
        }
        const data = await response.json();
        setDestinations(data);
        // Pre-select some interesting items automatically to provide a quick onboarding experience
        if (data.length > 0) {
          setSelectedItems([data[0].id, data[1].id, data[5].id, data[7].id]);
        } else {
          setSelectedItems([]);
        }
      } catch (err: any) {
        setError(err.message || "Không thể kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [selectedCity]);

  // Toggle checklist selection
  const handleToggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Calculate total budget estimate
  const totalCostEstimate = selectedItems.reduce((sum, itemId) => {
    const item = destinations.find((d) => d.id === itemId);
    return sum + (item ? item.costEstimate : 0);
  }, 0) + (daysCount * 1000000); // base hospitality budget cost (hotel + transport = 1,000,000đ per day)

  // Submit and call AI Consultation endpoint
  const handleGenerateItinerary = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng check chọn ít nhất 1 địa điểm hoặc món ăn muốn trải nghiệm.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: selectedCity,
          daysCount,
          startDate,
          selectedItems,
          overallCostEstimate: totalCostEstimate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Không thể lập hành trình bằng AI.");
      }

      onPlanCreated(data);
    } catch (err: any) {
      setError(err.message || "Lỗi xử lý hệ thống.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8" id="destination-selector">
      {/* City Switcher Row */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6" id="city-selector-panel">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-400" />
          <span>Bước 1: Lựa chọn Thành phố Điểm Đến của bạn</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" id="city-buttons-grid">
          {cities.map((city) => (
            <button
              key={city.key}
              onClick={() => setSelectedCity(city.key as any)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedCity === city.key
                  ? "bg-teal-950/40 border-teal-500 shadow-lg shadow-teal-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
              id={`btn-city-${city.key}`}
            >
              <div className="flex items-center justify-between mb-1" id={`city-row-${city.key}`}>
                <span className={`text-sm font-bold ${selectedCity === city.key ? "text-teal-400" : "text-slate-300"}`}>
                  {city.label}
                </span>
                {selectedCity === city.key && (
                  <span className="w-2 h-2 rounded-full bg-teal-400" id={`dot-${city.key}`} />
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">{city.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration & Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="planner-config-row">
        {/* Date Selector */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between" id="config-dates">
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-400" />
            Ngày khởi hành dự kiến
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
            id="start-date-input"
          />
          <p className="text-[10px] text-slate-500 mt-2">Dùng làm mốc thời gian thực hiện thông báo đẩy lịch trình.</p>
        </div>

        {/* Days Count Selector */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between" id="config-days">
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-400" />
            Số ngày tham quan dự định
          </label>
          <div className="flex gap-2" id="days-buttons-row">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setDaysCount(d)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  daysCount === d
                    ? "bg-teal-400 text-slate-950 border-teal-400"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                id={`btn-daycount-${d}`}
              >
                {d}N
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">AI sẽ phân bổ các điểm ăn chơi hợp lý dựa trên số ngày này.</p>
        </div>

        {/* Dynamic Budget Display */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between" id="config-budget">
          <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Ngân sách dự kiến trọn gói
          </label>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1" id="overall-budget-text">
            {totalCostEstimate.toLocaleString()} VNĐ
          </div>
          <p className="text-[10px] text-slate-500 leading-normal mt-2">
            Bao gồm chi phí tham quan, ẩm thực thực tế ({selectedItems.length} món/điểm) và phòng khách sạn/xe đi lại ({daysCount} ngày).
          </p>
        </div>
      </div>

      {/* Spots Checklist Grid */}
      <div className="space-y-4" id="spots-selection-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3" id="checklist-heading">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Utensils className="w-4.5 h-4.5 text-teal-400" />
              <span>Bước 2: Chọn Địa Danh & Đặc Sản bạn muốn ghé</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Mỗi thành phố bao gồm 5 địa danh du lịch nổi tiếng và 5 món ăn đặc sản đặc sắc nhất.</p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono self-start" id="selected-badge">
            Đã chọn: <span className="text-teal-400 font-bold">{selectedItems.length}/10</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12" id="loading-spinner-container">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400" id="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-xs" id="spots-error">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="destinations-grid">
            {destinations.map((item) => {
              const isChecked = selectedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  className={`group relative flex items-stretch rounded-xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
                    isChecked
                      ? "bg-slate-900/90 border-teal-500/80 shadow-md shadow-teal-500/5"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                  id={`spot-card-${item.id}`}
                >
                  {/* Left image */}
                  <div className="w-24 sm:w-28 shrink-0 relative rounded-lg overflow-hidden bg-slate-900" id={`spot-img-container-${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-teal-300 bg-slate-950/80 border border-teal-800/60" id={`badge-${item.id}`}>
                      {item.tag}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="ml-4 flex flex-col justify-between flex-1 py-0.5" id={`spot-info-${item.id}`}>
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-teal-400 transition-colors">
                          {item.name}
                        </h4>
                        <div className="shrink-0 w-4.5 h-4.5 rounded-md border border-slate-800 flex items-center justify-center transition-all bg-slate-950" id={`checkbox-${item.id}`}>
                          {isChecked && <Check className="w-3 h-3 text-teal-400" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-slate-900 pt-2 mt-2" id={`spot-meta-${item.id}`}>
                      {/* Price Estimate */}
                      <span className="text-[10px] font-bold text-slate-300">
                        {item.costEstimate === 0 ? "Miễn Phí" : `~${item.costEstimate.toLocaleString()}đ`}
                      </span>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono" id={`rating-box-${item.id}`}>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-slate-300 font-bold">{item.rating}</span>
                        <span>({item.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generation CTA Button Block */}
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 text-center" id="itinerary-builder-cta-box">
        <h3 className="text-base font-bold text-slate-100 mb-2">Sẵn sàng chốt danh sách & kiến tạo hành trình?</h3>
        <p className="text-xs text-slate-400 max-w-lg mb-6 leading-relaxed">
          Thổ địa AI sẽ phân tích các điểm bạn đã chọn để lên lộ trình khoa học nhất, kèm theo chỉ số tối ưu hoá tài chính và gợi ý điểm Co-working hoàn hảo.
        </p>
        <button
          onClick={handleGenerateItinerary}
          disabled={isGenerating || selectedItems.length === 0}
          className="inline-flex items-center gap-2 px-8 py-3.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-350 hover:to-emerald-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer"
          id="generate-itinerary-cta"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-1"></div>
              Thổ Địa AI Đang Phân Tích & Tính Toán...
            </>
          ) : (
            <>
              Xác Nhận & Tạo Lịch Trình AI Lập Tức
              <ChevronRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
