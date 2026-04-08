import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.js";
import {
  signinSchema,
  type SigninInput,
} from "../../validators/authValidators.js";
import { setRefreshTokenCookie } from "./shared/authConstants.js";

/**
 * User signin/login
 * POST /auth/signin
 */
export async function signin(req: Request, res: Response): Promise<void> {
  try {
    // Validate input
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.issues,
      });
      return;
    }

    const { email, password }: SigninInput = validationResult.data;

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Hash refresh token before storing
    const hashedRefreshToken = await hashPassword(refreshToken);

    // Update user with new refresh token
    await db
      .update(users)
      .set({ refreshToken: hashedRefreshToken, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Set refresh token as HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and access token
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}