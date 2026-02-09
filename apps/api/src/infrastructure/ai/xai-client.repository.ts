import OpenAI from "openai";
import type { ChatRequest, ChatResponse } from "../../domain/ai/ai.types";
import type { IAiClientRepository } from "../../domain/ai/ai-client.repository";

export class XaiClientRepository implements IAiClientRepository {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });
    this.model = model;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: request.messages,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("xAI returned empty response");
    }

    return { content };
  }
}
