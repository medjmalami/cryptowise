import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  signupSchema,
  signinSchema,
  type SignupInput,
  type SigninInput,
} from "../validators/authValidators.js";

const REFRESH_TOKEN_COOKIE = "refreshToken";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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

    // Check if username already exists
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate tokens
    // We'll use a temporary ID for token generation, then update after insert
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
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
    });

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
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
    });

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
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
    });

    // Return new access token
    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

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
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
