import { GoogleGenAI } from "@google/genai";
import { SimulationResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getChargingAdvice = async (
  currentBattery: number,
  simulation: SimulationResult
): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "未配置 API Key，无法获取 AI 建议。";
  }

  const today = new Date();
  const daysRemaining = simulation.lastSafeDate 
    ? Math.ceil((simulation.lastSafeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const prompt = `
    Context:
    - User rides an e-bike 9km to school.
    - Consumption: 13% per trip (26% daily).
    - Current Battery: ${currentBattery}%.
    - Remaining Trips possible: ${simulation.remainingTrips}.
    - The battery will run out around: ${simulation.lastSafeDate?.toLocaleDateString()}.
    - User rides 5 days a week (Mon-Fri).
    
    Task:
    用中文给出一个简短友好（最多2句话）的充电策略建议。
    如果电量极低（<20%），语气要紧迫。
    如果是周五且电量够周一用，可以提醒这一点。
    使用Emoji。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "随时充电，保持充足！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法获取建议，为了安全起见请尽快充电。";
  }
};