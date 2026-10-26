import { Router } from "express";
import { contactLimiter, trackLimiter } from "../../middleware/security.js";
import { contact, content, track } from "./public.controller.js";

// No login: these are called by the static site (through Vercel's rewrite) and by its build.
export const publicRoutes = Router();

publicRoutes.get("/content", content);
publicRoutes.post("/track", trackLimiter, track);
publicRoutes.post("/contact", contactLimiter, contact);
