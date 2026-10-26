import { Router } from "express";
import { changeStatus, create, get, list, remove, reorder, update } from "./projects.controller.js";

export const projectRoutes = Router();

projectRoutes.get("/", list);
projectRoutes.post("/", create);
projectRoutes.put("/order", reorder);
projectRoutes.get("/:id", get);
projectRoutes.put("/:id", update);
projectRoutes.patch("/:id/status", changeStatus);
projectRoutes.delete("/:id", remove);
