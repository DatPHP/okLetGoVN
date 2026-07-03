/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Itinerary, DestinationItem, FinancialLog } from "../types.ts";
import { Check, Edit3, Award, DollarSign, Wallet, AlertTriangle, TrendingUp, Sparkles, FileText, Star, ThumbsUp } from "lucide-react";

interface ChecklistBudgetTrackerProps {
  itinerary: Itinerary;
  destinations: DestinationItem[];
  token: string;
  onUpdateItinerary: (updated: Itinerary) => void;
  onCompleteTrip: () => void;
}

export default function ChecklistBudgetTracker({
  itinerary,
  destinations,
  token,
  onUpdateItinerary,
  onCompleteTrip,
}: ChecklistBudgetTrackerProps) {
  // Map selected items
  const selectedDetails = destinations.filter((d) => itinerary.selectedItems.includes(d.id));

  // Toggling details for checklist items
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCost, setTempCost] = useState<string>("");
  const [tempRating, setTempRating] = useState<number>(5);
  const [tempComment, setTempComment] = useState<string>("");

  // Manual financial logs state
  const [category, setCategory] = useState<"Transportation" | "Accommodation" | "Food" | "Sightseeing" | "Workplace" | "Other">("Food");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Save overall trip review
  const [tripRating, setTripRating] = useState<number>(5);
  const [tripReview, setTripReview] = useState<string>("");

  // Handle checking off an item
  const handleCheckItem = (itemId: string, completed: boolean) => {
    const matchedItem = selectedDetails.find((d) => d.id === itemId);
    const costEst = matchedItem ? matchedItem.costEstimate : 0;

    const updatedChecklist = itinerary.checklist.map((item) => {
      if (item.itemId === itemId) {
        return {
          ...item,
          completed,
          completedDate: completed ? new Date().toISOString() : undefined,
          costActual: completed ? costEst : undefined, // Initialize actual cost with estimate
        };
      }
      return item;
    });

    const updatedItinerary = {
      ...itinerary,
      checklist: updatedChecklist,
    };

    updateItineraryOnServer(updatedItinerary);
  };

  // Open edit cost/review drawer for a checked spot
  const handleOpenEdit = (itemId: string) => {
    const checklistItem = itinerary.checklist.find((item) => item.itemId === itemId);
    if (checklistItem) {
      setEditingId(itemId);
      const matchedItem = selectedDetails.find((d) => d.id === itemId);
      setTempCost(checklistItem.costActual?.toString() || matchedItem?.costEstimate.toString() || "0");
      setTempRating(checklistItem.rating || 5);
      setTempComment(checklistItem.comment || "Không gian và món ăn tuyệt vời, giá cả hợp lý!");
    }
  };

  // Save specific spot's actual expense & review and post reviews to general database
  const handleSaveSpotReview = async (itemId: string) => {
    const updatedChecklist = itinerary.checklist.map((item) => {
      if (item.itemId === itemId) {
        return {
          ...item,
          costActual: Number(tempCost) || 0,
          rating: tempRating,
          comment: tempComment,
        };
      }
      return item;
    });

    const updatedItinerary = {
      ...itinerary,
      checklist: updatedChecklist,
    };

    // Attempt to post this review to the global destination review server DB so others see it instantly
    try {
      await fetch(`/api/destinations/${itemId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: tempRating,
          comment: tempComment,
        }),
      });
    } catch (e) {
      console.error("Error posting review to global DB:", e);
    }

    setEditingId(null);
    updateItineraryOnServer(updatedItinerary);
  };

  // Add extra generic financial logs (hotel, flight, transport)
  const handleAddFinancialLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      alert("Vui lòng nhập đúng số tiền.");
      return;
    }

    const newLog: FinancialLog = {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      category,
      amount: Number(amount),
      note: note || `Chi tiêu ${category}`,
      date: new Date().toISOString(),
    };

    const updatedItinerary = {
      ...itinerary,
      financialLogs: [...itinerary.financialLogs, newLog],
    };

    setAmount("");
    setNote("");
    updateItineraryOnServer(updatedItinerary);
  };

  // Save Itinerary directly to DB
  const updateItineraryOnServer = async (updated: Itinerary) => {
    // Re-calculate actual totals
    const checkedSpotsCost = updated.checklist.reduce((sum, item) => {
      return sum + (item.completed ? (item.costActual || 0) : 0);
    }, 0);

    const extraLogsCost = updated.financialLogs.reduce((sum, log) => sum + log.amount, 0);
    updated.overallCostActual = checkedSpotsCost + extraLogsCost;

    try {
      const response = await fetch(`/api/itineraries/${updated.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error("Lỗi cập nhật lịch trình lên server.");
      }

      const data = await response.json();
      onUpdateItinerary(data);
    } catch (e: any) {
      alert(e.message || "Lỗi lưu trạng thái.");
    }
  };

  // Submit final trip review and complete trip
  const handleFinishWholeTrip = () => {
    if (!tripReview) {
      alert("Vui lòng nhập đôi dòng cảm nhận về chuyến đi để tạo kết xuất Report.");
      return;
    }

    const updatedItinerary: Itinerary = {
      ...itinerary,
      status: "completed",
      overallRating: tripRating,
      overallReview: tripReview,
    };

    updateItineraryOnServer(updatedItinerary);
    onCompleteTrip();
  };

  // Calculations
  const totalCompletedSpots = itinerary.checklist.filter((i) => i.completed).length;
  const isTripFinished = itinerary.status === "completed";

  // Financial Breakdown
  const checkedSpotsCost = itinerary.checklist.reduce((sum, item) => sum + (item.completed ? (item.costActual || 0) : 0), 0);
  const extraLogsCost = itinerary.financialLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalActualSpent = checkedSpotsCost + extraLogsCost;
  const budgetVariance = totalActualSpent - itinerary.overallCostEstimate;
  const variancePercentage = itinerary.overallCostEstimate > 0 ? (totalActualSpent / itinerary.overallCostEstimate) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left" id="checklist-budget-tracker">
      {/* LEFT BLOCK: Checklist (8 cols) */}
      <div className="lg:col-span-7 space-y-6" id="tracker-left-pane">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6" id="spots-checklist-box">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4" id="spots-checklist-header">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Bảng Check-in Địa Điểm Thực Tế</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Tích chọn các địa danh đã ghé, khai báo chi phí thực tế và đánh giá chất lượng.</p>
            </div>
            <span className="text-xs font-bold text-teal-400 font-mono" id="completed-count-badge">
              {totalCompletedSpots}/{itinerary.checklist.length} Đã Đi
            </span>
          </div>

          <div className="space-y-3.5" id="checklist-items-stack">
            {itinerary.checklist.map((checkItem) => {
              const matchedSpot = selectedDetails.find((d) => d.id === checkItem.itemId);
              if (!matchedSpot) return null;

              const isEditing = editingId === checkItem.itemId;

              return (
                <div key={checkItem.itemId} className={`p-4 rounded-xl border transition-all ${
                  checkItem.completed
                    ? "bg-slate-900/60 border-teal-500/40"
                    : "bg-slate-950/60 border-slate-800/80"
                }`} id={`check-item-container-${checkItem.itemId}`}>
                  <div className="flex items-start justify-between gap-3" id={`check-item-top-${checkItem.itemId}`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleCheckItem(checkItem.itemId, !checkItem.completed)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${
                          checkItem.completed
                            ? "bg-teal-400 border-teal-400 text-slate-950"
                            : "border-slate-800 hover:border-slate-700 bg-slate-950"
                        }`}
                        id={`btn-checkbox-${checkItem.itemId}`}
                      >
                        {checkItem.completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <h4 className={`text-xs font-bold ${checkItem.completed ? "text-slate-200 line-through" : "text-slate-200"}`}>
                          {matchedSpot.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Dự tính: {matchedSpot.costEstimate.toLocaleString()}đ</span>
                          {checkItem.completed && checkItem.costActual !== undefined && (
                            <span className="text-teal-400 font-semibold">• Thực tế: {checkItem.costActual.toLocaleString()}đ</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {checkItem.completed && !isEditing && (
                      <button
                        onClick={() => handleOpenEdit(checkItem.itemId)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        id={`btn-edit-cost-${checkItem.itemId}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Khai báo & Đánh giá
                      </button>
                    )}
                  </div>

                  {/* Rating display under checked items */}
                  {checkItem.completed && checkItem.rating && !isEditing && (
                    <div className="mt-3 p-2.5 rounded bg-slate-950 border border-slate-900 text-left flex items-start gap-2" id={`review-snippet-${checkItem.itemId}`}>
                      <div className="flex items-center gap-0.5 text-amber-400 mt-0.5" id={`review-stars-${checkItem.itemId}`}>
                        {Array.from({ length: checkItem.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        "{checkItem.comment}"
                      </p>
                    </div>
                  )}

                  {/* Inline declarer panel when editing cost & reviews */}
                  {isEditing && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 text-left" id={`editing-panel-${checkItem.itemId}`}>
                      <div className="grid grid-cols-2 gap-4" id={`edit-inputs-${checkItem.itemId}`}>
                        <div id={`edit-col-cost-${checkItem.itemId}`}>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Số tiền đã dùng (VNĐ)</label>
                          <input
                            type="number"
                            value={tempCost}
                            onChange={(e) => setTempCost(e.target.value)}
                            placeholder="Số tiền thực tế"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div id={`edit-col-rating-${checkItem.itemId}`}>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Đánh giá điểm này</label>
                          <select
                            value={tempRating}
                            onChange={(e) => setTempRating(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                          >
                            <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
                            <option value="4">⭐⭐⭐⭐ 4 Sao</option>
                            <option value="3">⭐⭐⭐ 3 Sao</option>
                            <option value="2">⭐⭐ 2 Sao</option>
                            <option value="1">⭐ 1 Sao</option>
                          </select>
                        </div>
                      </div>

                      <div id={`edit-comment-${checkItem.itemId}`}>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nhận xét thực tế gửi cộng đồng</label>
                        <textarea
                          rows={2}
                          value={tempComment}
                          onChange={(e) => setTempComment(e.target.value)}
                          placeholder="Chia sẻ trải nghiệm thực tế tại đây..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-2" id={`edit-buttons-${checkItem.itemId}`}>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200"
                        >
                          Huỷ bỏ
                        </button>
                        <button
                          onClick={() => handleSaveSpotReview(checkItem.itemId)}
                          className="px-4 py-1.5 rounded bg-teal-400 text-slate-950 text-[10px] font-bold hover:bg-teal-350"
                        >
                          Lưu lại
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic overall trip completion report section */}
        {!isTripFinished ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 space-y-4" id="complete-trip-action-box">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-teal-400" />
              Tổng Kết Chuyến Đi & Khai Báo Nhật Ký
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khi đã hoàn thành lịch trình tham quan, hãy đóng góp nhận xét tổng thể để tạo báo cáo chi tiết về mức độ chênh lệch tài chính và chia sẻ mẹo cho cộng đồng.
            </p>

            <div className="space-y-3" id="complete-trip-inputs">
              <div id="overall-rating-select">
                <label className="block text-xs text-slate-400 font-semibold mb-1">Đánh giá chung hành trình</label>
                <select
                  value={tripRating}
                  onChange={(e) => setTripRating(Number(e.target.value))}
                  className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Tuyệt vời (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Hài lòng (4/5)</option>
                  <option value="3">⭐⭐⭐ Bình thường (3/5)</option>
                  <option value="2">⭐⭐ Tạm ổn (2/5)</option>
                  <option value="1">⭐ Thất vọng (1/5)</option>
                </select>
              </div>

              <div id="overall-comment-text">
                <label className="block text-xs text-slate-400 font-semibold mb-1">Chia sẻ nhật ký hành trình / mẹo hữu ích</label>
                <textarea
                  rows={3}
                  value={tripReview}
                  onChange={(e) => setTripReview(e.target.value)}
                  placeholder="Ví dụ: Chuyến đi Vũng Tàu rất vui, ăn ở Gành Hào nên đặt bàn sớm trước ngắm hoàng hôn, tổng chi phí dưới mức dự phòng do săn được voucher buổi sáng..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg p-3 text-xs text-slate-200 focus:outline-none placeholder-slate-600 leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={handleFinishWholeTrip}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-350 hover:to-emerald-350 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer"
              id="submit-finish-trip-btn"
            >
              Hoàn Thành Chuyến Đi & Tạo Báo Cáo
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-teal-950/20 border border-teal-900/40 text-left space-y-3" id="completed-badge-card">
            <h4 className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-teal-400" />
              Hành Trình Đã Hoàn Thành Thành Công!
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cảm ơn bạn đã tin tưởng OkLetGoVN. Nhật ký chuyến đi của bạn đã được ghi nhận trên hệ thống. Dưới đây là bảng đánh giá hành trình của bạn:
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2" id="saved-overall-review">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400" id="saved-stars-row">
                <span>Đánh giá:</span>
                {Array.from({ length: itinerary.overallRating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{itinerary.overallReview}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT BLOCK: Budgets and Logs (5 cols) */}
      <div className="lg:col-span-5 space-y-6" id="tracker-right-pane">
        {/* Budget Summary Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5" id="financial-summary-card">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Wallet className="w-4.5 h-4.5 text-teal-400" />
            Kiểm Soát & Đối Chiếu Tài Chính
          </h3>

          {/* Variance Widget */}
          <div className="space-y-2" id="variance-widget">
            <div className="flex items-center justify-between text-xs font-semibold" id="budget-labels">
              <span className="text-slate-400">Dự tính: {itinerary.overallCostEstimate.toLocaleString()}đ</span>
              <span className="text-slate-200">Đã tiêu: {totalActualSpent.toLocaleString()}đ</span>
            </div>

            {/* Simulated Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden" id="progress-bar-container">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  variancePercentage > 100 ? "bg-rose-500" : "bg-teal-400"
                }`}
                style={{ width: `${Math.min(variancePercentage, 100)}%` }}
                id="progress-bar-fill"
              />
            </div>

            {/* Under/Over indicator message */}
            <div className="flex items-center justify-between pt-1" id="variance-indicator-footer">
              <span className="text-[10px] text-slate-500">Mức chi tiêu thực tế</span>
              <span className={`text-xs font-bold ${budgetVariance > 0 ? "text-rose-400" : "text-teal-400"}`}>
                {budgetVariance === 0 ? "Đúng dự toán 0đ" : budgetVariance > 0 ? `Vượt hạn mức +${budgetVariance.toLocaleString()}đ` : `Tiết kiệm được ${Math.abs(budgetVariance).toLocaleString()}đ`}
              </span>
            </div>
          </div>

          {/* Alert messages / travel advisor */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 text-left space-y-1" id="budget-advisor-alert">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              {budgetVariance > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400">Cảnh báo chi tiêu</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-teal-400">Lời khuyên tiết kiệm</span>
                </>
              )}
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              {budgetVariance > 0
                ? "Ngân sách thực tế của bạn đã vượt quá hạn mức dự tính ban đầu. Hãy hạn chế các hoạt động mua sắm tự do không có trong kế hoạch hoặc ưu tiên săn deal giá rẻ vào sáng ngày mai."
                : "Chúc mừng! Bạn đang kiểm soát tài chính cực tốt, chi tiêu dưới mức hạn mức dự kiến. Hãy tiếp tục duy trì tiến độ này."}
            </p>
          </div>
        </div>

        {/* Financial Log list and Logger form */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4" id="financial-logger-panel">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Ghi Chép Chi Phí Khác</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Khai báo thêm các khoản chi phát sinh như: Tiền phòng khách sạn, vé máy bay, xe cộ đi lại...</p>
          </div>

          {/* Logger form */}
          <form onSubmit={handleAddFinancialLog} className="space-y-3" id="financial-log-form">
            <div className="grid grid-cols-2 gap-3" id="log-form-row-1">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Hạng mục chi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="Accommodation">Khách Sạn</option>
                  <option value="Transportation">Di Chuyển</option>
                  <option value="Food">Ăn Uống thêm</option>
                  <option value="Sightseeing">Vé vui chơi</option>
                  <option value="Workplace">Làm việc/Cafe</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ví dụ: 500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Ghi chú chi tiết</label>
              <input
                type="text"
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Thuê phòng homestay 2 ngày"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
              id="submit-log-btn"
            >
              Thêm khoản chi tiêu
            </button>
          </form>

          {/* List of custom logs */}
          {itinerary.financialLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800 max-h-48 overflow-y-auto" id="financial-logs-list">
              <span className="block text-[10px] font-bold text-slate-500">DANH SÁCH CÁC KHOẢN CHI ĐÃ THÊM</span>
              {itinerary.financialLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded bg-slate-950 border border-slate-900 flex items-center justify-between text-left" id={`log-item-${log.id}`}>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded mr-2 uppercase">
                      {log.category === "Accommodation" ? "Khách Sạn" : log.category === "Transportation" ? "Xe cộ" : log.category === "Food" ? "Ăn" : log.category === "Sightseeing" ? "Vé" : log.category === "Workplace" ? "Cafe" : "Khác"}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">{log.note}</span>
                  </div>
                  <span className="text-xs text-rose-400 font-bold">-{log.amount.toLocaleString()}đ</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
