import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Authentication middleware to verify JWT access tokens
 * Expects Authorization header with format: "Bearer <token>"
 * Attaches userId to request object if token is valid
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authorization token required" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = verifyAccessToken(token);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}
