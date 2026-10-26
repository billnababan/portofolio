import { Router } from "express";
import multer from "multer";
import { list, remove, replace, updateAlt, upload, usage } from "./media.controller.js";

// Files stay in memory (max 15 MB) until sharp has checked and converted them.
const uploader = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1 } });

export const mediaRoutes = Router();

mediaRoutes.get("/", list);
mediaRoutes.post("/", uploader.single("file"), upload);
mediaRoutes.get("/:id/usage", usage);
mediaRoutes.post("/:id/replace", uploader.single("file"), replace);
mediaRoutes.patch("/:id", updateAlt);
mediaRoutes.delete("/:id", remove);
