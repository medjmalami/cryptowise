/**
 * Chat API Service
 * 
 * Endpoints:
 * - POST /chat - Send message and get AI response
 */

import { api } from './client';
import type { ChatRequest, ChatResponse } from './types';

/**
 * Send a message to the chat endpoint and get AI response
 * Note: This endpoint does not require authentication
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const request: ChatRequest = { message };
  return api.post<ChatResponse>('/chat', request, { skipAuth: true });
}

/**
 * Extract the assistant's message content from the chat response
 */
export function extractAssistantMessage(response: ChatResponse): string {
  if (response.choices && response.choices.length > 0) {
    return response.choices[0].message.content;
  }
  throw new Error('No response from assistant');
}
