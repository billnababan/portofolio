import supertest from "supertest";
import { createApp } from "../src/app.js";

export const app = createApp();

// A logged-in agent: keeps the session cookie and always sends the X-CMS header.
export const login = async (email = "owner@example.com", password = "owner-password-123") => {
  const agent = supertest.agent(app);
  const res = await agent.post("/api/auth/login").set("X-CMS", "1").send({ email, password });
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return {
    get: (url: string) => agent.get(url).set("X-CMS", "1"),
    post: (url: string) => agent.post(url).set("X-CMS", "1"),
    put: (url: string) => agent.put(url).set("X-CMS", "1"),
    patch: (url: string) => agent.patch(url).set("X-CMS", "1"),
    delete: (url: string) => agent.delete(url).set("X-CMS", "1"),
  };
};

export const request = () => supertest(app);
