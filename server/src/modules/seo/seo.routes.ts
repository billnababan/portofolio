import { Router } from "express";
import { getAudit, overview, runNow, search, sync } from "./seo.controller.js";

export const seoRoutes = Router();

seoRoutes.get("/", overview);
seoRoutes.post("/audits", runNow);
seoRoutes.get("/audits/:id", getAudit);
seoRoutes.get("/search", search);
seoRoutes.post("/search/sync", sync);
