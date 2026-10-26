import { Router } from "express";
import { list } from "./activity.controller.js";

export const activityRoutes = Router();

activityRoutes.get("/", list);
