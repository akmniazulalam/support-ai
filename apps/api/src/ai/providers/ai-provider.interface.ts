export const AI_PROVIDER = Symbol('AI_PROVIDER');

export interface AiProvider {
  generateResponse(
    systemInstructions: string,
    context: string,
    userMessage: string,
    conversationHistory?: string,
  ): Promise<string>;
}
