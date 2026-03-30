import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { verifyRefreshToken } from "../../utils/jwt.js";
import { REFRESH_TOKEN_COOKIE, clearRefreshTokenCookie } from "./shared/authConstants.js";

/**
 * User logout
 * POST /auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      // Try to verify and get user ID to clear their refresh token in DB
      try {
        const decoded = verifyRefreshToken(refreshToken);

        // Clear refresh token from database
        await db
          .update(users)
          .set({ refreshToken: null, updatedAt: new Date() })
          .where(eq(users.id, decoded.userId));
      } catch (error) {
        // Token might be expired, but we still want to clear the cookie
        console.log("Token verification failed during logout, clearing cookie anyway");
      }
    }

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}