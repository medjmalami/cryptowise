/**
 * Authentication API Service
 * 
 * Endpoints:
 * - POST /auth/signup - Register new user
 * - POST /auth/signin - Login existing user
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/logout - Logout and clear tokens
 */

import { api } from './client';
import type {
  SignupRequest,
  SignupResponse,
  SigninRequest,
  SigninResponse,
  RefreshResponse,
  LogoutResponse,
} from './types';

/**
 * Register a new user
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  return api.post<SignupResponse>('/auth/signup', data, { skipAuth: true });
}

/**
 * Login an existing user
 */
export async function signin(data: SigninRequest): Promise<SigninResponse> {
  return api.post<SigninResponse>('/auth/signin', data, { skipAuth: true });
}

/**
 * Refresh access token using refresh token cookie
 * Note: This request includes credentials (cookies) automatically
 */
export async function refreshToken(): Promise<RefreshResponse> {
  return api.post<RefreshResponse>('/auth/refresh', undefined, { skipAuth: true });
}

/**
 * Logout user and clear tokens
 */
export async function logout(): Promise<LogoutResponse> {
  return api.post<LogoutResponse>('/auth/logout');
}
