import { Router } from "express";
import { requireOwner } from "../../middleware/auth.js";
import { create, list, remove, resetPassword, update } from "./users.controller.js";

export const userRoutes = Router();

userRoutes.use(requireOwner);
userRoutes.get("/", list);
userRoutes.post("/", create);
userRoutes.put("/:id", update);
userRoutes.put("/:id/password", resetPassword);
userRoutes.delete("/:id", remove);
