/**
 * API Type Definitions - Matching backend schemas
 */

// ========== Authentication Types ==========

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface SignupResponse {
  user: User;
  accessToken: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

// ========== Chat Types ==========

export interface ChatRequest {
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: ChatUsage;
}
