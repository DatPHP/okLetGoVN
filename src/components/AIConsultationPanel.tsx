/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Calendar, HelpCircle, CheckCircle2, Compass } from "lucide-react";

interface AIConsultationPanelProps {
  aiConsultation: string;
  startDate: string;
  daysCount: number;
  cityName: string;
  onContinue: () => void;
}

export default function AIConsultationPanel({
  aiConsultation,
  startDate,
  daysCount,
  cityName,
  onContinue,
}: AIConsultationPanelProps) {
  // A clean, robust, lightweight regex-based parser to turn Markdown strings into styled HTML
  const parseMarkdown = (text: string) => {
    if (!text) return "";
    let html = text;

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-teal-400 mt-5 mb-2">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-1.5">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-extrabold text-slate-100 mt-8 mb-4 border-l-4 border-teal-400 pl-3">$1</h2>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-slate-200 font-bold">$1</strong>');

    // Bullet Lists
    // Match line starting with * or - and transform into list item
    html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li class="text-xs text-slate-400 ml-4 list-disc mb-1">$1</li>');

    // Paragraphs (except if it's already a list or heading tags)
    const lines = html.split("\n");
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "<br/>";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<li") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol") || trimmed.startsWith("<br")) {
        return line;
      }
      return `<p class="text-xs text-slate-400 leading-relaxed mb-3">${line}</p>`;
    });

    return processedLines.join("\n");
  };

  const formattedHTML = parseMarkdown(aiConsultation);

  return (
    <div className="space-y-6 animate-fade-in" id="ai-consultation-panel">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-teal-950/20 border border-teal-900/40 rounded-2xl" id="consultation-header-box">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-950 text-teal-400 border border-teal-800/50 shrink-0">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>Hồ sơ Tư vấn AI độc quyền của bạn</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-slate-500" /> {cityName}</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Khởi hành: {startDate}</span>
              <span className="text-slate-700">•</span>
              <span>Thời gian: {daysCount} Ngày</span>
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-350 hover:to-emerald-350 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-center"
          id="proceed-to-itinerary-btn"
        >
          Xác nhận Itinerary & Đi tiếp
        </button>
      </div>

      {/* Main AI Consultation Content */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-left overflow-y-auto max-h-[60vh] custom-scrollbar" id="ai-consultation-content-card">
        <div
          className="space-y-1"
          dangerouslySetInnerHTML={{ __html: formattedHTML }}
          id="markdown-rendered-body"
        />
      </div>

      {/* Workspace Note */}
      <div className="flex items-start gap-3 p-4 bg-slate-950 border border-slate-900 rounded-xl text-left" id="digital-nomad-notice">
        <HelpCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" id="notice-icon" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-300">💡 Gợi ý cho Chuyên viên làm việc từ xa</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Hành trình này đã được tính toán thời gian rảnh hợp lý vào buổi chiều để bạn có thể ghé các Co-working cafe được đề xuất, giải quyết nhanh công việc khẩn cấp mà không làm ảnh hưởng đến nhịp độ nghỉ ngơi chung.
          </p>
        </div>
      </div>
    </div>
  );
}
