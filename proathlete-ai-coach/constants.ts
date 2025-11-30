import { Sport, UserProfile } from './types';

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 24,
  heightCm: 180,
  weightKg: 75,
  sport: 'Football',
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

export const DEFAULT_INITIAL_PLAN_PROMPT = `
    You are a world-class Strength & Conditioning Coach for elite athletes.
    
    Athlete Profile:
    - Sport: {{SPORT}}
    - Age: {{AGE}}, Height: {{HEIGHT}}cm, Weight: {{WEIGHT}}kg
    - Training Age: {{TRAINING_AGE}} years
    - Injury History: {{INJURY_HISTORY}} (Status: {{INJURY_STATUS}})
    - Goals: {{GOALS}}
    - Performance Stats: Squat {{SQUAT}}, Speed {{SPEED}}, Endurance {{ENDURANCE}}
    - Sport Specific: {{SPORT_SPECIFIC}}
    - Constraints: {{CONSTRAINTS}}

    Task:
    Create a highly specific, periodized 7-day training microcycle (Week 1).
    Ensure volume and intensity are appropriate for the athlete's level.
    If the athlete is injured, prioritize rehab/prehab or work around it.
    
    Output strictly valid JSON matching the schema.
`;

export const DEFAULT_ITERATE_PLAN_PROMPT = `
    You are iterating a training plan for an elite athlete based on last week's feedback.

    Athlete Context:
    - Sport: {{SPORT}}
    - Goal: {{GOALS}}
    - Injuries: {{INJURY_STATUS_TEXT}}

    Last Week's Plan ID: {{PLAN_ID}} (Week {{WEEK_NUMBER}})
    Last Week's Focus: {{PLAN_SUMMARY}}

    Feedback Received:
    {{FEEDBACK_SUMMARY}}

    Task:
    Generate Week {{NEXT_WEEK_NUMBER}}.
    - If RPE was too high (>8 consistently) or Pain > 3, deload or adjust exercises.
    - If RPE was too low (<5) and completion high, apply progressive overload (increase intensity/volume).
    - Address any specific complaints in the feedback notes.

    Output strictly valid JSON matching the schema.
`;
