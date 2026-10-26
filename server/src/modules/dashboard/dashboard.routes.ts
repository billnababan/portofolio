import { Router } from "express";
import { dashboard } from "./dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", dashboard);
