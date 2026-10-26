import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import express, { Router } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requireCmsHeader } from "./middleware/security.js";
import { activityRoutes } from "./modules/activity/activity.routes.js";
import { analyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { certificationRoutes } from "./modules/certifications/certifications.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { mediaRoutes } from "./modules/media/media.routes.js";
import { dirs } from "./modules/media/media.storage.js";
import { messageRoutes } from "./modules/messages/messages.routes.js";
import { projectRoutes } from "./modules/projects/projects.routes.js";
import { publicRoutes } from "./modules/public/public.routes.js";
import { publishRoutes } from "./modules/publish/publish.routes.js";
import { seoRoutes } from "./modules/seo/seo.routes.js";
import { settingsRoutes } from "./modules/settings/settings.routes.js";
import { skillRoutes } from "./modules/skills/skills.routes.js";
import { userRoutes } from "./modules/users/users.routes.js";

export const createApp = () => {
  const app = express();
  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // The dashboard sets widths of bars and chart tooltips with inline styles.
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          baseUri: ["'self'"],
        },
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/api/health", async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  });

  // Called by the static site and its build. No login.
  app.use("/api/public", publicRoutes);

  app.use("/api/auth", requireCmsHeader, authRoutes);

  // Everything else under /api is the CMS: logged in, and writes carry X-CMS.
  const cms = Router();
  cms.use(requireCmsHeader, requireAuth);
  cms.use("/dashboard", dashboardRoutes);
  cms.use("/analytics", analyticsRoutes);
  cms.use("/settings", settingsRoutes);
  cms.use("/projects", projectRoutes);
  cms.use("/skills", skillRoutes);
  cms.use("/certifications", certificationRoutes);
  cms.use("/media", mediaRoutes);
  cms.use("/messages", messageRoutes);
  cms.use("/seo", seoRoutes);
  cms.use("/publish", publishRoutes);
  cms.use("/activity", activityRoutes);
  cms.use("/users", userRoutes);
  app.use("/api", cms);
  app.use("/api", notFoundHandler);

  // Uploaded media. File names carry a content hash, so they can be cached for a year.
  app.use("/media", express.static(dirs.media, { immutable: true, maxAge: "365d", fallthrough: false }));

  // The CMS single-page app (cms/dist), when it has been built.
  if (fs.existsSync(path.join(env.cmsDist, "index.html"))) {
    app.use("/assets", express.static(path.join(env.cmsDist, "assets"), { immutable: true, maxAge: "365d" }));
    app.use(express.static(env.cmsDist, { index: false }));
    app.get("/{*path}", (_req, res) => res.sendFile(path.join(env.cmsDist, "index.html")));
  }

  app.use(errorHandler);
  return app;
};
