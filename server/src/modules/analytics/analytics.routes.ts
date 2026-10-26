import { Router } from "express";
import { report } from "./analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/", report);
