import { Router } from "express";
import { getAll, update } from "./settings.controller.js";

export const settingsRoutes = Router();

settingsRoutes.get("/", getAll);
settingsRoutes.put("/:key", update);
