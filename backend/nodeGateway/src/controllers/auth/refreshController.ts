import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { REFRESH_TOKEN_COOKIE, setRefreshTokenCookie } from "./shared/authConstants.js";

/**
 * Refresh access token using refresh token
 * POST /auth/refresh
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token not found" });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify stored refresh token matches
    if (!user.refreshToken) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isRefreshTokenValid = await comparePassword(
      refreshToken,
      user.refreshToken
    );

    if (!isRefreshTokenValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id);

    // Generate new refresh token (token rotation)
    const newRefreshToken = generateRefreshToken(user.id);
    const hashedRefreshToken = await hashPassword(newRefreshToken);

    // Update user with new refresh token
    await db
      .update(users)
      .set({ refreshToken: hashedRefreshToken, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Set new refresh token as HTTP-only cookie
    setRefreshTokenCookie(res, newRefreshToken);

    // Return new access token
    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}