import { Router } from "express";
import { changeStatus, create, list, remove, reorder, update } from "./certifications.controller.js";

export const certificationRoutes = Router();

certificationRoutes.get("/", list);
certificationRoutes.post("/", create);
certificationRoutes.put("/order", reorder);
certificationRoutes.put("/:id", update);
certificationRoutes.patch("/:id/status", changeStatus);
certificationRoutes.delete("/:id", remove);
