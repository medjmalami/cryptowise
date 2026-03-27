import { Router } from "express";
import { signup, signin, refresh, logout } from "../controllers/authController.js";

const router = Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post("/signup", signup);

/**
 * POST /auth/signin
 * Login an existing user
 */
router.post("/signin", signin);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token cookie
 */
router.post("/refresh", refresh);

/**
 * POST /auth/logout
 * Logout user and clear refresh token
 */
router.post("/logout", logout);

export default router;
