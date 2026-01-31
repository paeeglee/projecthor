import type { ChatRequest, ChatResponse } from "./ai.types";

export interface IAiClientRepository {
  chat(request: ChatRequest): Promise<ChatResponse>;
}
