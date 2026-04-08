import { Router } from "express";
import { signup } from "../controllers/auth/signupController.js";
import { signin } from "../controllers/auth/signinController.js";
import { refresh } from "../controllers/auth/refreshController.js";
import { logout } from "../controllers/auth/logoutController.js";

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
