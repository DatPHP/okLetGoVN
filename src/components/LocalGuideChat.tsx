/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { GuideMessage } from "../types.ts";
import { MessageSquare, Send, User, ShieldCheck, Heart } from "lucide-react";

interface LocalGuideChatProps {
  token: string;
  city: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
}

export default function LocalGuideChat({ token, city }: LocalGuideChatProps) {
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Guide naming mapped by city
  const guideNames = {
    VungTau: "Anh Nam (Thổ địa Vũng Tàu)",
    DaNang: "Chị Vy (Chuyên gia Đà Thành)",
    Hue: "Cô Thảo (Hướng dẫn viên Cố Đô)",
    BinhDinh: "Chú Ba (Thổ địa Quy Nhơn)",
  };
  const guideName = guideNames[city] || "Thổ địa OkLetGo";

  // Guide Avatars mapped by city
  const guideImages = {
    VungTau: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    DaNang: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    Hue: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    BinhDinh: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
  };
  const guideImage = guideImages[city] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

  // Polling / fetching messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?city=${city}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error fetching guide messages:", e);
    }
  };

  useEffect(() => {
    // Initial load
    fetchMessages();

    // Poll messages every 1.5 seconds to feel completely alive and real-time
    const interval = setInterval(() => {
      fetchMessages();
    }, 1500);

    return () => clearInterval(interval);
  }, [city]);

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: textToSend,
          city,
        }),
      });

      if (response.ok) {
        // Fetch immediately after sending
        await fetchMessages();
      }
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch overflow-hidden min-h-[500px]" id="guide-chat-card">
      {/* Left pane: Guide Info Profile Card */}
      <div className="md:w-64 bg-slate-950 p-6 flex flex-col items-center justify-between text-center border-r border-slate-900" id="guide-info-pane">
        <div className="space-y-4">
          <div className="relative" id="guide-avatar-box">
            <img
              src={guideImage}
              alt={guideName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-2 border-teal-500 shadow-md shadow-teal-500/10 mx-auto"
            />
            <span className="absolute bottom-0.5 right-1/2 translate-x-4 px-2 py-0.5 rounded-full text-[8px] font-bold text-teal-300 bg-teal-950/90 border border-teal-800/80 uppercase">
              ONLINE
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-200">{guideName}</h4>
            <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Thổ địa chứng thực
            </span>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs">
            Sinh ra và lớn lên tại địa phương. Am hiểu từng hẻm ăn vặt nhỏ nhất, có thể giải đáp các điểm lặn ngắm san hô bí mật, các rặng thông lãng mạn ít người biết cho giới trẻ khám phá.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-900 w-full text-left" id="guide-stats">
          <div className="flex items-center justify-between text-[10px] text-slate-500" id="stats-row-1">
            <span>Độ hài lòng:</span>
            <span className="text-teal-400 font-bold">100% (452 lượt)</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5" id="stats-row-2">
            <span>Ngôn ngữ:</span>
            <span className="text-slate-300">Tiếng Việt, Tiếng Anh</span>
          </div>
        </div>
      </div>

      {/* Right pane: Chat Messages Console */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/20" id="chat-messages-pane">
        {/* Chat window header */}
        <div className="px-5 py-3 border-b border-slate-900 bg-slate-950/40 text-left flex items-center justify-between" id="chat-header">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Kênh Trò Chuyện Trực Tuyến Địa Phương</span>
          </div>
          <span className="text-[10px] text-slate-500">Giám sát bảo mật bởi OkLetGoVN</span>
        </div>

        {/* Message logs */}
        <div className="flex-1 p-5 overflow-y-auto max-h-[350px] space-y-4" id="messages-list-container">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3" id="empty-chat-state">
              <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Hãy đặt câu hỏi đầu tiên của bạn cho <span className="text-teal-400 font-bold">{guideName}</span>! Ví dụ hỏi quán hải sản ngon rẻ, cung đường ít kẹt xe hay điểm cafe ngắm biển...
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                  id={`chat-bubble-${msg.id}`}
                >
                  {/* Sender Avatar Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser ? "bg-teal-950 border border-teal-800 text-teal-400" : "bg-slate-950 border border-slate-850"
                  }`} id={`avatar-${msg.id}`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : (
                      <img
                        src={guideImage}
                        alt="Guide"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>

                  {/* Bubble content */}
                  <div className="space-y-1">
                    <span className="block text-[9px] text-slate-500 px-1 text-left">
                      {isUser ? "Bạn" : msg.guideName}
                    </span>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed text-left shadow-sm ${
                      isUser
                        ? "bg-teal-400 text-slate-950 rounded-tr-none font-semibold"
                        : "bg-slate-950 text-slate-300 rounded-tl-none border border-slate-850"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950/40 flex gap-2" id="chat-input-form">
          <input
            type="text"
            required
            disabled={loading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Hỏi thổ địa ${guideName.split(" ")[0]} về quán sá địa phương...`}
            className="flex-1 bg-slate-950 border border-slate-800/80 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            id="chat-input-field"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 bg-teal-400 hover:bg-teal-350 disabled:opacity-40 text-slate-950 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
            id="chat-submit-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
