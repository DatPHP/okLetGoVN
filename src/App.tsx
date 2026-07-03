/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { User, Itinerary, DestinationItem } from "./types.ts";
import WelcomeScreen from "./components/WelcomeScreen.tsx";
import AuthScreen from "./components/AuthScreen.tsx";
import DestinationSelector from "./components/DestinationSelector.tsx";
import AIConsultationPanel from "./components/AIConsultationPanel.tsx";
import ItineraryTimeline from "./components/ItineraryTimeline.tsx";
import ChecklistBudgetTracker from "./components/ChecklistBudgetTracker.tsx";
import LocalGuideChat from "./components/LocalGuideChat.tsx";
import OfflineMapCompanion from "./components/OfflineMapCompanion.tsx";
import PromotionsPanel from "./components/PromotionsPanel.tsx";
import { Compass, UserCheck, LogOut, Calendar, Wallet, Map, MessageSquare, Ticket, Clock, AlertCircle } from "lucide-react";

export default function App() {
  const [started, setStarted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Active planning states
  const [selectedCity, setSelectedCity] = useState<"DaNang" | "Hue" | "VungTau" | "BinhDinh">("VungTau");
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  
  // Custom view and tab routing states
  const [showAIConsult, setShowAIConsult] = useState(false);
  const [activeTab, setActiveTab] = useState<"selector" | "timeline" | "checklist" | "map" | "chat" | "promos">("selector");

  // Load user session from localStorage on mount for smooth experience
  useEffect(() => {
    const savedUser = localStorage.getItem("okletgo_user");
    const savedToken = localStorage.getItem("okletgo_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setStarted(true);
    }
  }, []);

  // Fetch all destinations for selected city to feed map/timeline components
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(`/api/destinations?city=${selectedCity}`);
        if (response.ok) {
          const data = await response.json();
          setDestinations(data);
        }
      } catch (e) {
        console.error("Error loading destinations:", e);
      }
    };
    fetchDestinations();
  }, [selectedCity]);

  // Handle successful auth
  const handleAuthSuccess = (data: { user: User; token: string }) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("okletgo_user", JSON.stringify(data.user));
    localStorage.setItem("okletgo_token", data.token);
  };

  // Log out
  const handleLogOut = () => {
    setUser(null);
    setToken(null);
    setActiveItinerary(null);
    localStorage.removeItem("okletgo_user");
    localStorage.removeItem("okletgo_token");
    setStarted(false);
  };

  // Handle plan created by AI Consultation
  const handlePlanCreated = (itinerary: Itinerary) => {
    setActiveItinerary(itinerary);
    setShowAIConsult(true);
  };

  // Proceed from AI consultation panel to timeline Itinerary
  const handleProceedToTimeline = () => {
    setShowAIConsult(false);
    setActiveTab("timeline");
  };

  // Map City Names for visual headers
  const vietnameseCities = {
    VungTau: "Vũng Tàu",
    DaNang: "Đà Nẵng",
    Hue: "Huế",
    BinhDinh: "Bình Định (Quy Nhơn)"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" id="applet-container">
      {/* 1. WELCOME SCREEN ONBOARDING */}
      {!started && !user && (
        <div className="max-w-7xl mx-auto px-4" id="welcome-screen-wrapper">
          <WelcomeScreen onStart={() => setStarted(true)} />
        </div>
      )}

      {/* 2. AUTH CARD PANEL */}
      {started && !user && (
        <div className="max-w-7xl mx-auto px-4" id="auth-screen-wrapper">
          <div className="pt-6 text-left" id="auth-back-nav">
            <button
              onClick={() => setStarted(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
              id="back-welcome-btn"
            >
              ➔ Quay lại trang chủ
            </button>
          </div>
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        </div>
      )}

      {/* 3. MAIN DASHBOARD AREA */}
      {user && token && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" id="dashboard-wrapper">
          {/* Header section with branding & log out */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5" id="dashboard-header">
            {/* Logo and brand heading */}
            <div className="flex items-center gap-3 text-left" id="dashboard-logo-title">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 font-sans uppercase">
                  okletgovn
                </h1>
                <p className="text-[10px] text-slate-500 font-medium">Bản đồ & Lịch Trình du lịch thông minh bằng AI</p>
              </div>
            </div>

            {/* Profile & Log out info */}
            <div className="flex items-center gap-3 self-start sm:self-center" id="dashboard-profile-bar">
              <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-left" id="user-badge">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="block text-xs font-bold text-slate-300">{user.name}</span>
                  <span className="block text-[8px] text-slate-500 font-mono">ĐT: {user.phone}</span>
                </div>
              </div>

              <button
                onClick={handleLogOut}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-950 transition-all cursor-pointer"
                title="Đăng xuất"
                id="logout-btn"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Active travel info banner sub-header */}
          {activeItinerary && (
            <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left animate-fade-in" id="active-travel-banner">
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-teal-400 uppercase tracking-widest font-mono">HÀNH TRÌNH ĐANG KÍCH HOẠT</span>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>Khám phá {vietnameseCities[activeItinerary.city]}</span>
                  <span className="text-slate-700">•</span>
                  <span>{activeItinerary.daysCount} Ngày</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg" id="banner-financial-pill">
                <span className="text-slate-500">DỰ TRÙ TÀI CHÍNH:</span>
                <span className="text-emerald-400 font-bold">{activeItinerary.overallCostEstimate.toLocaleString()}đ</span>
              </div>
            </div>
          )}

          {/* Navigation Tab Bar switcher */}
          {activeItinerary && !showAIConsult && (
            <nav className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-slate-900 scrollbar-none" id="tabs-navigation">
              {[
                { key: "selector", label: "Lập lịch mới", icon: Calendar },
                { key: "timeline", label: "Itinerary AI", icon: Clock },
                { key: "checklist", label: "Check-in & Sổ Chi Tiêu", icon: Wallet },
                { key: "map", label: "Bản Đồ Ngoại Tuyến", icon: Map },
                { key: "chat", label: "Hỏi Thổ Địa Bản Xứ", icon: MessageSquare },
                { key: "promos", label: "Săn Voucher Sáng Sớm", icon: Ticket },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-teal-400 text-slate-950 shadow-md shadow-teal-500/10"
                        : "text-slate-400 hover:text-slate-200 bg-slate-950/50 hover:bg-slate-900 border border-transparent hover:border-slate-800"
                    }`}
                    id={`nav-tab-${tab.key}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Main Workspace Frame container */}
          <main className="min-h-[50vh]" id="main-workspace-frame">
            {/* A. If showing AI advice review panel */}
            {showAIConsult && activeItinerary && (
              <AIConsultationPanel
                aiConsultation={activeItinerary.aiConsultation}
                startDate={activeItinerary.startDate}
                daysCount={activeItinerary.daysCount}
                cityName={vietnameseCities[activeItinerary.city]}
                onContinue={handleProceedToTimeline}
              />
            )}

            {/* B. Standard Tab Rendering (if AI consult panel closed) */}
            {!showAIConsult && (
              <>
                {/* 1. Setup / selector Tab */}
                {activeTab === "selector" && (
                  <DestinationSelector
                    token={token}
                    onPlanCreated={handlePlanCreated}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                  />
                )}

                {/* 2. Detailed Timeline tab */}
                {activeTab === "timeline" && activeItinerary && (
                  <ItineraryTimeline
                    itinerary={activeItinerary}
                    destinations={destinations}
                  />
                )}

                {/* 3. Checklist and budgeting logging tab */}
                {activeTab === "checklist" && activeItinerary && (
                  <ChecklistBudgetTracker
                    itinerary={activeItinerary}
                    destinations={destinations}
                    token={token}
                    onUpdateItinerary={setActiveItinerary}
                    onCompleteTrip={() => setActiveTab("checklist")}
                  />
                )}

                {/* 4. Offline Map Companion Tab */}
                {activeTab === "map" && activeItinerary && (
                  <OfflineMapCompanion
                    destinations={destinations}
                    selectedItems={activeItinerary.selectedItems}
                  />
                )}

                {/* 5. Local tour guide chat tab */}
                {activeTab === "chat" && activeItinerary && (
                  <LocalGuideChat
                    token={token}
                    city={activeItinerary.city}
                  />
                )}

                {/* 6. Voucher Promos Tab */}
                {activeTab === "promos" && activeItinerary && (
                  <PromotionsPanel
                    city={activeItinerary.city}
                    token={token}
                  />
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
