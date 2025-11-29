import { Type } from "@google/genai";

// Enums
export enum Sport {
  FOOTBALL = 'Football (Soccer)',
  BASKETBALL = 'Basketball',
  SPRINT = 'Sprint (Track)',
  TENNIS = 'Tennis',
  OTHER = 'Other'
}

export enum InjuryStatus {
  NONE = 'None',
  RECOVERING = 'Recovering',
  ACTIVE = 'Active Issue'
}

// User Profile
export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPercentage?: number;
  sport: Sport;
  trainingAge: number; // Years of experience
  injuryHistory: string;
  injuryStatus: InjuryStatus;
  
  // Performance Metrics
  strengthSquat?: number; // 1RM estimate
  speed10m?: number; // seconds
  enduranceVo2?: number; // or Cooper test distance
  sportSpecificStats: string; // Free text for now for flexibility
  
  // Goals
  goals: string; // SMARTS format preferred
  constraints: string; // Days per week, equipment, etc.
}

// Training Plan Structure
export interface Exercise {
  name: string;
  sets: number;
  reps: string; // string to allow "12-15" or "AMRAP"
  intensity: string; // RPE, %1RM, or Zone
  rest: string;
  notes?: string;
}

export interface TrainingDay {
  dayIndex: number; // 0-6
  dayName: string; // Monday, Tuesday...
  focus: string; // Hypertrophy, Power, Recovery, etc.
  description: string;
  exercises: Exercise[];
  isRestDay: boolean;
}

export interface TrainingPlan {
  id: string;
  startDate: string;
  weekNumber: number; // Tracking progression
  summary: string;
  days: TrainingDay[];
}

// Feedback
export interface DailyFeedback {
  planId: string;
  dayIndex: number;
  rpe: number; // 1-10
  fatigue: number; // 1-10
  sleepQuality: number; // 1-5
  painLevel: number; // 1-10
  painLocation?: string;
  completionRate: number; // 0-100%
  notes?: string;
}

// App Settings
export interface AppSettings {
  apiKey: string;
  model: string;
}

export const InitialSettings: AppSettings = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: 'gemini-2.0-flash', // Default efficient model
};

// Response Schemas for Gemini
// We define these as object literals to map closely to the Type enum
// Note: We won't use the raw GenAI schema objects in state, but we need them for the service.
