import { type Response } from "express";

// Shared constants
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Cookie configuration helpers
export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function setRefreshTokenCookieForSignup(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax", // Different sameSite for signup
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
}