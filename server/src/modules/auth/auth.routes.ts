import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { loginLimiter } from "../../middleware/security.js";
import { changePassword, login, logout, me, revokeSession, sessions } from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/login", loginLimiter, login);
authRoutes.post("/logout", requireAuth, logout);
authRoutes.get("/me", requireAuth, me);
authRoutes.put("/password", requireAuth, changePassword);
authRoutes.get("/sessions", requireAuth, sessions);
authRoutes.delete("/sessions/:id", requireAuth, revokeSession);
