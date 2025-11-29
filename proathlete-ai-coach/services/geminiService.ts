import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AppSettings, UserProfile, TrainingPlan, DailyFeedback } from "../types";

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

export const generateInitialPlan = async (
  profile: UserProfile,
  settings: AppSettings
): Promise<TrainingPlan> => {
  if (!settings.apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: settings.apiKey });

  const prompt = `
    You are a world-class Strength & Conditioning Coach for elite athletes.
    
    Athlete Profile:
    - Sport: ${profile.sport}
    - Age: ${profile.age}, Height: ${profile.heightCm}cm, Weight: ${profile.weightKg}kg
    - Training Age: ${profile.trainingAge} years
    - Injury History: ${profile.injuryHistory} (Status: ${profile.injuryStatus})
    - Goals: ${profile.goals}
    - Performance Stats: Squat ${profile.strengthSquat || 'N/A'}, Speed ${profile.speed10m || 'N/A'}, Endurance ${profile.enduranceVo2 || 'N/A'}
    - Sport Specific: ${profile.sportSpecificStats}
    - Constraints: ${profile.constraints}

    Task:
    Create a highly specific, periodized 7-day training microcycle (Week 1).
    Ensure volume and intensity are appropriate for the athlete's level.
    If the athlete is injured, prioritize rehab/prehab or work around it.
    
    Output strictly valid JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction: "You are an expert sports scientist and coach. You prioritize safety, specificity, and progressive overload.",
      },
    });

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

  const prompt = `
    You are iterating a training plan for an elite athlete based on last week's feedback.

    Athlete Context:
    - Sport: ${profile.sport}
    - Goal: ${profile.goals}
    - Injuries: ${profile.injuryStatus === 'Active Issue' ? 'ACTIVE ISSUE' : 'Stable'}

    Last Week's Plan ID: ${currentPlan.id} (Week ${currentPlan.weekNumber})
    Last Week's Focus: ${currentPlan.summary}

    Feedback Received:
    ${feedbackSummary}

    Task:
    Generate Week ${currentPlan.weekNumber + 1}.
    - If RPE was too high (>8 consistently) or Pain > 3, deload or adjust exercises.
    - If RPE was too low (<5) and completion high, apply progressive overload (increase intensity/volume).
    - Address any specific complaints in the feedback notes.

    Output strictly valid JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction: "You are an adaptive AI coach. You listen to athlete bio-feedback to optimize performance and prevent overtraining.",
      },
    });

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
