import { Router } from "express";
import { changeStatus, get, list, remove } from "./messages.controller.js";

export const messageRoutes = Router();

messageRoutes.get("/", list);
messageRoutes.get("/:id", get);
messageRoutes.patch("/:id", changeStatus);
messageRoutes.delete("/:id", remove);
