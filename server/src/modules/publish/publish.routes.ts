import { Router } from "express";
import { publish, status } from "./publish.controller.js";

export const publishRoutes = Router();

publishRoutes.get("/", status);
publishRoutes.post("/", publish);
