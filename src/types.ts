/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LocationType {
  ATTRACTION = "attraction",
  FOOD = "food",
}

export interface DestinationItem {
  id: string;
  name: string;
  locationType: LocationType;
  city: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
  description: string;
  costEstimate: number; // Cost in VND
  image: string;
  rating: number;
  reviewsCount: number;
  tag: string; // e.g. "Work Friendly", "Historical", "Sunset", "Scenic"
}

export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ItineraryChecklistItem {
  itemId: string;
  completed: boolean;
  completedDate?: string;
  costActual?: number;
  rating?: number;
  comment?: string;
}

export interface FinancialLog {
  id: string;
  itemId?: string; // Reference to destination item if applicable
  category: "Transportation" | "Accommodation" | "Food" | "Sightseeing" | "Workplace" | "Other";
  amount: number; // VND
  note: string;
  date: string;
}

export interface Itinerary {
  id: string;
  userId: string;
  city: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
  daysCount: number;
  startDate: string;
  selectedItems: string[]; // List of DestinationItem IDs
  aiConsultation: string; // Markdown response from Gemini
  checklist: ItineraryChecklistItem[];
  financialLogs: FinancialLog[];
  status: "planning" | "active" | "completed";
  overallCostEstimate: number;
  overallCostActual: number;
  overallReview?: string;
  overallRating?: number;
}

export interface GuideMessage {
  id: string;
  userId: string;
  sender: "user" | "guide";
  guideName: string;
  text: string;
  timestamp: string;
  city: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
}

export interface Promotion {
  id: string;
  agencyName: string;
  title: string;
  code: string;
  discount: string;
  description: string;
  expiry: string;
  city: "DaNang" | "Hue" | "VungTau" | "BinhDinh";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
