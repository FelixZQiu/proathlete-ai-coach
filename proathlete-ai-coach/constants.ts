import { Sport, UserProfile } from './types';

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 24,
  heightCm: 180,
  weightKg: 75,
  sport: Sport.FOOTBALL,
  trainingAge: 5,
  injuryHistory: 'None',
  injuryStatus: 'None' as any,
  sportSpecificStats: '',
  goals: 'Increase explosive power and maintain endurance during season.',
  constraints: 'Training 4 days a week. Gym access available.',
};

export const MOCK_PLAN = null; // We start with no plan

export const AVAILABLE_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Efficient)' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (High Reasoning)' },
];
