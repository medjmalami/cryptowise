import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { hashPassword } from "../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.js";
import {
  signupSchema,
  type SignupInput,
} from "../../validators/authValidators.js";
import { setRefreshTokenCookieForSignup } from "./shared/authConstants.js";

/**
 * User signup/registration
 * POST /auth/signup
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    // Validate input
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.issues,
      });
      return;
    }

    const { email, username, password }: SignupInput = validationResult.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate tokens
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
      })
      .returning();

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Hash refresh token before storing
    const hashedRefreshToken = await hashPassword(refreshToken);

    // Update user with refresh token
    await db
      .update(users)
      .set({ refreshToken: hashedRefreshToken, updatedAt: new Date() })
      .where(eq(users.id, newUser.id));

    // Set refresh token as HTTP-only cookie
    setRefreshTokenCookieForSignup(res, refreshToken);

    // Return user data and access token
    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}