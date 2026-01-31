import OpenAI from "openai";
import type { ChatRequest, ChatResponse } from "../../domain/ai/ai.types";
import type { IAiClientRepository } from "../../domain/ai/ai-client.repository";

export class XaiClientRepository implements IAiClientRepository {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const completion = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("xAI returned empty response");
    }

    return { content };
  }
}
