/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Itinerary, DestinationItem, LocationType } from "../types.ts";
import { Clock, Bell, MapPin, Sparkles, Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface ItineraryTimelineProps {
  itinerary: Itinerary;
  destinations: DestinationItem[];
}

interface TimelineItem {
  id: string;
  day: number;
  time: string;
  title: string;
  type: "attraction" | "food" | "work" | "leisure";
  description: string;
  note?: string;
}

export default function ItineraryTimeline({ itinerary, destinations }: ItineraryTimelineProps) {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Map chosen items to timeline milestones
  const selectedDetails = destinations.filter((d) => itinerary.selectedItems.includes(d.id));
  const attractions = selectedDetails.filter((d) => d.locationType === LocationType.ATTRACTION);
  const foods = selectedDetails.filter((d) => d.locationType === LocationType.FOOD);

  // Auto-distribute selected items into days
  const getTimelineForDay = (day: number): TimelineItem[] => {
    const dayTimeline: TimelineItem[] = [];

    // Base timeline schedule templates
    const breakfastSpot = foods[day % foods.length] || { name: "Đặc sản Điểm Tâm Sáng", description: "Thưởng thức bữa sáng truyền thống" };
    const morningAttraction = attractions[(day * 2 - 2) % attractions.length] || { name: "Điểm tham quan buổi sáng", description: "Tự do dạo chơi" };
    const lunchSpot = foods[(day + 1) % foods.length] || { name: "Ẩm thực bữa trưa", description: "Thưởng thức đặc sản vùng miền" };
    const afternoonAttraction = attractions[(day * 2 - 1) % attractions.length] || { name: "Điểm tham quan buổi chiều", description: "Chụp ảnh lưu niệm" };
    const dinnerSpot = foods[(day + 2) % foods.length] || { name: "Ẩm thực buổi tối", description: "Bữa tối ấm cúng" };

    // 1. Morning Breakfast (07:30 - 08:30)
    dayTimeline.push({
      id: `${day}-1`,
      day,
      time: "07:30 - 08:30",
      title: `Ăn sáng: ${breakfastSpot.name}`,
      type: "food",
      description: breakfastSpot.description,
      note: "Nên khởi hành sớm để tránh nắng nóng và xếp hàng."
    });

    // 2. Morning Sightseeing (09:00 - 11:30)
    dayTimeline.push({
      id: `${day}-2`,
      day,
      time: "09:00 - 11:30",
      title: `Khám phá: ${morningAttraction.name}`,
      type: "attraction",
      description: morningAttraction.description,
      note: "Góc chụp ảnh đẹp nhất lúc trời nhiều nắng trong trẻo."
    });

    // 3. Lunch (12:00 - 13:00)
    dayTimeline.push({
      id: `${day}-3`,
      day,
      time: "12:00 - 13:00",
      title: `Ăn trưa: ${lunchSpot.name}`,
      type: "food",
      description: lunchSpot.description,
      note: "Nước dùng béo bùi, nhớ vắt chanh để dậy vị."
    });

    // 4. Remote Work Hour / Coffee (13:30 - 15:30)
    const workCafes = {
      VungTau: "Soho Coffee - Trần Phú (View biển ngập gió, ổ cắm đầy đủ)",
      DaNang: "Enouvo Space - Co-working lý tưởng cho người làm việc từ xa",
      Hue: "Trà Tiệm Vy - Hùng Vương (Không gian cổ kính, yên tĩnh)",
      BinhDinh: "Surf Bar - Nguyễn Huệ (Sát bờ biển cát mịn Quy Nhơn)"
    };
    const cityCafe = workCafes[itinerary.city] || "Quán cafe địa phương yên tĩnh";

    dayTimeline.push({
      id: `${day}-4`,
      day,
      time: "13:30 - 15:30",
      title: `Làm việc remote & Cafe: ${cityCafe}`,
      type: "work",
      description: "Khoảng thời gian lý tưởng để check email, giải quyết công việc khẩn cấp.",
      note: "Mạng Wi-Fi tốc độ cao, có sẵn ổ cắm tại bàn sát tường."
    });

    // 5. Afternoon Sightseeing (16:00 - 18:00)
    dayTimeline.push({
      id: `${day}-5`,
      day,
      time: "16:00 - 18:00",
      title: `Ngắm hoàng hôn: ${afternoonAttraction.name}`,
      type: "attraction",
      description: afternoonAttraction.description,
      note: "Địa điểm đón gió đại dương tuyệt hảo khi hoàng hôn buông xuống."
    });

    // 6. Dinner & Night Exploration (19:00 - 21:30)
    dayTimeline.push({
      id: `${day}-6`,
      day,
      time: "19:00 - 21:30",
      title: `Bữa tối & Chơi đêm: ${dinnerSpot.name}`,
      type: "food",
      description: dinnerSpot.description,
      note: "Nổi tiếng với đồ hải sản tươi ngon, dạo bộ ngắm phố phường mát mẻ."
    });

    return dayTimeline;
  };

  // Notification simulator
  const triggerNotificationSimulation = (item: TimelineItem) => {
    let message = "";
    if (item.type === "food") {
      message = `🔔 [Ăn uống] Đã đến giờ ${item.time}! Ghé ngay ${item.title.split(": ")[1]} để thưởng thức hương vị bản địa đặc trưng.`;
    } else if (item.type === "attraction") {
      message = `🔔 [Địa điểm] Hành trình tiếp theo: Ghé ${item.title.split(": ")[1]}. Nhớ chuẩn bị kem chống nắng và điện thoại đầy pin để chụp ảnh nha!`;
    } else if (item.type === "work") {
      message = `🔔 [Làm việc] Gợi ý Co-working: ${item.title.split(": ")[1]} là không gian lý tưởng nhất để bạn vừa ngắm cảnh vừa họp trực tuyến lúc này.`;
    }

    setNotifications([message, ...notifications]);

    // Use Web Notification API if permitted
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("OkLetGoVN - Nhắc Lịch Trình", {
          body: message.replace("🔔 ", ""),
          icon: "/compass-icon.png"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("OkLetGoVN - Nhắc Lịch Trình", {
              body: message.replace("🔔 ", "")
            });
          }
        });
      }
    }
  };

  const daysArray = Array.from({ length: itinerary.daysCount }, (_, i) => i + 1);
  const currentTimeline = getTimelineForDay(activeDay);

  return (
    <div className="space-y-6 animate-fade-in" id="itinerary-timeline-component">
      {/* Simulation Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-900 text-left flex flex-col md:flex-row md:items-center justify-between gap-4" id="simulation-banner">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-teal-400 animate-bounce" id="bell-icon" />
            Trình giả lập thông báo đẩy lịch trình cá nhân hóa
          </h4>
          <p className="text-[10px] text-slate-500 max-w-xl leading-relaxed">
            Hệ thống tự động nhắc nhở bạn theo mốc thời gian thực của hành trình dựa trên sở thích làm việc/ăn chơi. Hãy ấn nút <span className="text-teal-400 font-bold">"Thử Nhắc"</span> ở từng mốc giờ để xem thông báo xuất hiện!
          </p>
        </div>

        <button
          onClick={() => {
            // Request notification permission
            if (typeof window !== "undefined" && "Notification" in window) {
              Notification.requestPermission();
            }
            setShowNotificationCenter(!showNotificationCenter);
          }}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-all cursor-pointer self-start md:self-center flex items-center gap-1.5"
          id="toggle-notif-center"
        >
          {showNotificationCenter ? "Ẩn hòm thông báo" : `Xem hòm thông báo (${notifications.length})`}
        </button>
      </div>

      {/* Notification Logs List */}
      {showNotificationCenter && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 text-left space-y-2 max-h-40 overflow-y-auto" id="notification-center-logs">
          <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-1" id="logs-header">
            <span>NHẬT KÝ THÔNG BÁO PUSH THEO THỜI GIAN THỰC</span>
            <button onClick={() => setNotifications([])} className="text-teal-400 font-bold hover:underline" id="clear-logs">Xoá nhật ký</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-[10px] text-slate-600 py-3 text-center">Chưa có thông báo nào được giả lập kích hoạt.</p>
          ) : (
            notifications.map((notif, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800/40 text-[10px] text-slate-300 leading-normal flex items-start gap-2" id={`notif-item-${idx}`}>
                <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>{notif}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Days Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1" id="days-tabs-row">
        {daysArray.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 text-xs font-bold transition-all relative cursor-pointer ${
              activeDay === day
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
            id={`tab-day-${day}`}
          >
            Ngày {day}
          </button>
        ))}
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 text-left border-l-2 border-slate-800 ml-4 py-2" id="vertical-timeline">
        {currentTimeline.map((item, idx) => {
          // Color coding based on type
          const badgeColors = {
            food: "bg-emerald-950 text-emerald-400 border-emerald-800/40",
            attraction: "bg-teal-950 text-teal-400 border-teal-800/40",
            work: "bg-indigo-950 text-indigo-400 border-indigo-800/40",
            leisure: "bg-slate-950 text-slate-400 border-slate-800/40",
          };
          const colorClass = badgeColors[item.type] || badgeColors.leisure;

          return (
            <div key={item.id} className="relative group" id={`timeline-row-${item.id}`}>
              {/* Dot Icon Indicator */}
              <div className="absolute -left-10 sm:-left-12 top-0.5 w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center group-hover:border-teal-400 transition-colors" id={`dot-indicator-${item.id}`}>
                <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </div>

              {/* Card Container */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-800 group-hover:bg-slate-900/60 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4" id={`timeline-card-${item.id}`}>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40">
                      {item.time}
                    </span>
                    <span className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${colorClass}`}>
                      {item.type === "food" ? "Ẩm Thực" : item.type === "attraction" ? "Điểm Đến" : item.type === "work" ? "Workplace" : "Giải Trí"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

                  {item.note && (
                    <p className="text-[10px] text-slate-500 italic flex items-center gap-1 pt-1" id={`note-line-${item.id}`}>
                      <AlertCircle className="w-3 h-3 text-slate-600 shrink-0" />
                      {item.note}
                    </p>
                  )}
                </div>

                {/* Simulated Notification Trigger */}
                <button
                  onClick={() => triggerNotificationSimulation(item)}
                  className="shrink-0 px-3 py-1.5 self-start bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-[10px] font-bold text-slate-300 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  id={`btn-push-${item.id}`}
                >
                  <Bell className="w-3 h-3 text-teal-400" />
                  Thử Nhắc Nhở
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
