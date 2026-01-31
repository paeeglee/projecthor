import { GoogleGenAI } from "@google/genai";
import type { ChatRequest, ChatResponse } from "../../domain/ai/ai.types";
import type { IAiClientRepository } from "../../domain/ai/ai-client.repository";

export class GeminiClientRepository implements IAiClientRepository {
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const systemMessage = request.messages.find((m) => m.role === "system");
    const userMessage = request.messages.find((m) => m.role === "user");

    const response = await this.client.models.generateContent({
      model: request.model,
      contents: userMessage?.content ?? "",
      config: {
        systemInstruction: systemMessage?.content,
      },
    });

    const content = response.text;

    if (!content) {
      throw new Error("Gemini returned empty response");
    }

    return { content };
  }
}
