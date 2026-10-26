import type { RequestHandler } from "express";
import { rangeSchema } from "../../lib/range.js";
import { trafficReport } from "./analytics.report.js";

export const report: RequestHandler = async (req, res) => {
  res.json(await trafficReport(rangeSchema.parse(req.query.range)));
};
