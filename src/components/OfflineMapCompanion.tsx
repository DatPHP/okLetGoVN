/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { DestinationItem } from "../types.ts";
import { Map, Navigation, ShieldAlert, Compass, Shuffle, Info, Pin } from "lucide-react";

interface OfflineMapCompanionProps {
  destinations: DestinationItem[];
  selectedItems: string[];
}

export default function OfflineMapCompanion({ destinations, selectedItems }: OfflineMapCompanionProps) {
  const [useOptimalOrder, setUseOptimalOrder] = useState(true);
  const [trafficDensity, setTrafficDensity] = useState<"low" | "medium" | "high">("low");

  // Filter selected details
  const chosenSpots = destinations.filter((d) => selectedItems.includes(d.id));

  // Determine routing order
  const routeOrder = useOptimalOrder
    ? [...chosenSpots].sort((a, b) => a.locationType.localeCompare(b.locationType)) // Group attractions then foods
    : chosenSpots;

  // Calculate simulated distances and travel times
  const calculateTotalDistance = () => {
    if (routeOrder.length < 2) return "0 km";
    const kms = routeOrder.length * 2.8;
    return `${kms.toFixed(1)} km`;
  };

  const calculateTotalDuration = () => {
    if (routeOrder.length < 2) return "0 phút";
    let baseMins = routeOrder.length * 8;
    if (trafficDensity === "medium") baseMins *= 1.3;
    if (trafficDensity === "high") baseMins *= 1.8;
    return `${Math.round(baseMins)} phút`;
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 text-left" id="offline-map-companion">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4" id="map-header">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Map className="w-4.5 h-4.5 text-teal-400" />
            Bản Đồ Ngoại Tuyến OkLetGo - Dẫn Đường Tối Ưu
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Tải sẵn dữ liệu ngoại tuyến giúp bạn định vị GPS vệ tinh không cần mạng internet 3G/4G.</p>
        </div>

        {/* Optimise controller */}
        <div className="flex flex-wrap gap-2" id="routing-options-row">
          <button
            onClick={() => setUseOptimalOrder(!useOptimalOrder)}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              useOptimalOrder
                ? "bg-teal-950/40 border-teal-500 text-teal-300"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
            id="btn-optimize-route"
          >
            <Shuffle className="w-3.5 h-3.5" />
            {useOptimalOrder ? "Đang bật tuyến đường tối ưu AI" : "Tuyến đường theo thứ tự lựa chọn"}
          </button>
        </div>
      </div>

      {/* Route Info Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-900" id="route-stats-banner">
        <div id="stat-spots-count">
          <span className="block text-[9px] text-slate-500 uppercase font-mono">Tổng điểm dừng</span>
          <span className="text-sm font-bold text-slate-200 font-mono mt-0.5 block">{chosenSpots.length} Trạm</span>
        </div>
        <div id="stat-distance">
          <span className="block text-[9px] text-slate-500 uppercase font-mono">Quãng đường (Ước tính)</span>
          <span className="text-sm font-bold text-slate-200 font-mono mt-0.5 block">{calculateTotalDistance()}</span>
        </div>
        <div id="stat-duration">
          <span className="block text-[9px] text-slate-500 uppercase font-mono">Thời gian di chuyển</span>
          <span className="text-sm font-bold text-teal-400 font-mono mt-0.5 block">{calculateTotalDuration()}</span>
        </div>
        <div id="stat-traffic">
          <span className="block text-[9px] text-slate-500 uppercase font-mono">Mật độ giao thông</span>
          <select
            value={trafficDensity}
            onChange={(e) => setTrafficDensity(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer mt-0.5"
            id="traffic-select-field"
          >
            <option value="low">🟢 Thông thoáng</option>
            <option value="medium">🟡 Hơi đông</option>
            <option value="high">🔴 Kẹt xe cục bộ</option>
          </select>
        </div>
      </div>

      {/* Simulated Map Canvas Display Block */}
      <div className="relative h-64 sm:h-80 w-full rounded-xl bg-slate-950 border border-slate-900 overflow-hidden flex flex-col justify-between p-4" id="map-canvas-container">
        {/* Visual Map Simulator grid backdrop */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: "radial-gradient(#115e59 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }} id="grid-backdrop" />

        {/* Floating Compass Card */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center gap-1.5 shadow-md backdrop-blur-sm" id="floating-compass">
          <Compass className="w-4 h-4 text-teal-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-[9px] font-bold text-slate-300 font-mono">GPS: ĐANG ĐỊNH VỊ...</span>
        </div>

        {/* Simulated Route Drawing Board with nodes */}
        {routeOrder.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center" id="empty-map-state">
            <p className="text-xs text-slate-600 max-w-xs">Chưa có trạm dừng nào được kích hoạt lập bản đồ. Vui lòng check chọn địa điểm để vẽ tuyến đường tối ưu.</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-12" id="simulated-nodes-board">
            {/* Draw a connecting svg line between stops */}
            <svg className="absolute inset-0 w-full h-full opacity-60" id="route-svg">
              <path
                d={`M 150,120 Q 250,80 350,150 T 550,110`}
                fill="none"
                stroke={trafficDensity === "high" ? "#ef4444" : "#2dd4bf"}
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
                id="route-path-element"
              />
            </svg>

            {/* Display Node Badges floating */}
            <div className="flex flex-wrap items-center justify-center gap-6 z-10" id="floating-nodes">
              {routeOrder.map((spot, idx) => (
                <div key={spot.id} className="p-2 rounded-lg bg-slate-900 border border-teal-500/40 text-[9px] font-bold text-slate-300 flex items-center gap-1 shadow-md" id={`node-badge-${spot.id}`}>
                  <span className="w-4 h-4 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{spot.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Floating Guidelines bar */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-start gap-2 backdrop-blur-sm z-20" id="navigation-guide-bar">
          <Navigation className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <span className="block text-[9px] font-bold text-teal-300 uppercase tracking-wider">Hệ thống dẫn đường tối ưu AI</span>
            <p className="text-[10px] text-slate-400 leading-normal" id="navigation-guide-text">
              {routeOrder.length < 2
                ? "Thêm ít nhất 2 địa điểm để vẽ bản đồ lộ trình tối ưu hoá vòng tránh giao thông."
                : `Đi qua ${routeOrder.map((s, idx) => `${idx + 1}. ${s.name}`).join(" ➔ ")}. Tốc độ trung bình đề xuất là 40km/h.`}
            </p>
          </div>
        </div>
      </div>

      {/* Offline Alert and Wifi download guidelines */}
      <div className="flex items-start gap-3 p-4 bg-slate-950 border border-slate-900 rounded-xl" id="offline-download-panel">
        <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-left">
          <h4 className="text-xs font-bold text-slate-300">📱 Hướng dẫn sử dụng Bản Đồ Ngoại Tuyến</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Hệ thống tự động đồng bộ hóa GPS ngay khi mất kết nối mạng di động. Bạn nên bấm nút tải bản đồ trước ở nhà (bằng Wi-Fi) để lưu trữ trọn vẹn hình ảnh địa điểm và không lo rớt sóng khi đi qua các đèo, núi hiểm trở hay vùng biển xa bờ.
          </p>
        </div>
      </div>
    </div>
  );
}
