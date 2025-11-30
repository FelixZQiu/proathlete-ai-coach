import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AppSettings, UserProfile, TrainingPlan, DailyFeedback } from "../types";
import { DEFAULT_INITIAL_PLAN_PROMPT, DEFAULT_ITERATE_PLAN_PROMPT } from "../constants";

// Define the response schema structure for the API
const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    sets: { type: Type.NUMBER },
    reps: { type: Type.STRING },
    intensity: { type: Type.STRING },
    rest: { type: Type.STRING },
    notes: { type: Type.STRING },
  },
  required: ["name", "sets", "reps", "intensity"],
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dayIndex: { type: Type.INTEGER },
    dayName: { type: Type.STRING },
    focus: { type: Type.STRING },
    description: { type: Type.STRING },
    isRestDay: { type: Type.BOOLEAN },
    exercises: {
      type: Type.ARRAY,
      items: exerciseSchema,
    },
  },
  required: ["dayIndex", "dayName", "focus", "isRestDay", "exercises"],
};

const trainingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the training phase" },
    days: {
      type: Type.ARRAY,
      items: daySchema,
    },
  },
  required: ["summary", "days"],
};

// Helper function for retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) {
      throw new Error(`Network request failed after multiple retries. Please check your internet connection or proxy settings. Original error: ${error.message}`);
    }
    
    // Check if error is related to fetch failure
    const isNetworkError = error.message?.includes('fetch failed') || 
                          error.message?.includes('Failed to fetch') ||
                          error.message?.includes('NetworkError');
                          
    if (isNetworkError) {
       console.warn(`Network error detected, retrying... (${retries} attempts left).`);
       await new Promise(res => setTimeout(res, delay));
       return withRetry(fn, retries - 1, delay * 1.5); // Exponential backoff
    }
    
    // If it's not a network error (e.g. 400 Bad Request), throw immediately
    throw error;
  }
}

// Helper to replace placeholders in prompt templates
const fillPrompt = (template: string, data: Record<string, string | number>) => {
  let res = template;
  for (const key in data) {
    res = res.replace(new RegExp(`{{${key}}}`, 'g'), String(data[key]));
  }
  return res;
};

export const generateInitialPlan = async (
  profile: UserProfile,
  settings: AppSettings
): Promise<TrainingPlan> => {
  if (!settings.apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: settings.apiKey });

  // Use custom prompt from settings or fallback to default
  const promptTemplate = settings.initialPlanPrompt || DEFAULT_INITIAL_PLAN_PROMPT;
  
  const prompt = fillPrompt(promptTemplate, {
    SPORT: profile.sport,
    AGE: profile.age,
    HEIGHT: profile.heightCm,
    WEIGHT: profile.weightKg,
    TRAINING_AGE: profile.trainingAge,
    INJURY_HISTORY: profile.injuryHistory,
    INJURY_STATUS: profile.injuryStatus,
    GOALS: profile.goals,
    SQUAT: profile.strengthSquat || 'N/A',
    SPEED: profile.speed10m || 'N/A',
    ENDURANCE: profile.enduranceVo2 || 'N/A',
    SPORT_SPECIFIC: profile.sportSpecificStats,
    CONSTRAINTS: profile.constraints
  });

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: settings.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction: "You are an expert sports scientist and coach. You prioritize safety, specificity, and progressive overload.",
      },
    }));

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      id: Date.now().toString(),
      startDate: new Date().toISOString(),
      weekNumber: 1,
      summary: data.summary,
      days: data.days,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const iteratePlan = async (
  currentPlan: TrainingPlan,
  feedbacks: DailyFeedback[],
  profile: UserProfile,
  settings: AppSettings
): Promise<TrainingPlan> => {
  if (!settings.apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: settings.apiKey });

  const feedbackSummary = feedbacks.map(f => 
    `Day ${f.dayIndex}: Completed ${f.completionRate}%, RPE ${f.rpe}/10, Fatigue ${f.fatigue}/10, Pain ${f.painLevel}/10 (${f.painLocation || 'None'}). Notes: ${f.notes}`
  ).join('\n');

  // Use custom prompt from settings or fallback to default
  const promptTemplate = settings.iteratePlanPrompt || DEFAULT_ITERATE_PLAN_PROMPT;

  const prompt = fillPrompt(promptTemplate, {
    SPORT: profile.sport,
    GOALS: profile.goals,
    INJURY_STATUS_TEXT: profile.injuryStatus === 'Active Issue' ? 'ACTIVE ISSUE' : 'Stable',
    PLAN_ID: currentPlan.id,
    WEEK_NUMBER: currentPlan.weekNumber,
    PLAN_SUMMARY: currentPlan.summary,
    FEEDBACK_SUMMARY: feedbackSummary,
    NEXT_WEEK_NUMBER: currentPlan.weekNumber + 1
  });

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: settings.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction: "You are an adaptive AI coach. You listen to athlete bio-feedback to optimize performance and prevent overtraining.",
      },
    }));

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      id: Date.now().toString(),
      startDate: new Date().toISOString(),
      weekNumber: currentPlan.weekNumber + 1,
      summary: data.summary,
      days: data.days,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
