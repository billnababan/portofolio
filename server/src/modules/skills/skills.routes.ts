import { Router } from "express";
import { create, list, remove, reorder, update } from "./skills.controller.js";

export const skillRoutes = Router();

skillRoutes.get("/", list);
skillRoutes.post("/", create);
skillRoutes.put("/order", reorder);
skillRoutes.put("/:id", update);
skillRoutes.delete("/:id", remove);
