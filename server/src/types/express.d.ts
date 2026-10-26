import type { AuthUser } from "../modules/auth/auth.queries.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export {};
