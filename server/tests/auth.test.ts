import { describe, expect, it } from "vitest";
import { login, request } from "./helpers.js";

describe("auth", () => {
  it("rejects writes without the X-CMS header", async () => {
    const res = await request().post("/api/auth/login").send({ email: "owner@example.com", password: "owner-password-123" });
    expect(res.status).toBe(400);
  });

  it("rejects a wrong password with the same message as an unknown email", async () => {
    const wrong = await request().post("/api/auth/login").set("X-CMS", "1").send({ email: "owner@example.com", password: "nope-nope-nope" });
    const unknown = await request().post("/api/auth/login").set("X-CMS", "1").send({ email: "nobody@example.com", password: "nope-nope-nope" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error).toBe(unknown.body.error);
  });

  it("logs in with an httpOnly session cookie and logs out", async () => {
    const res = await request().post("/api/auth/login").set("X-CMS", "1").send({ email: "OWNER@example.com", password: "owner-password-123" });
    expect(res.status).toBe(200);
    const cookie = res.headers["set-cookie"]![0]!;
    expect(cookie).toMatch(/cms_sid=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);

    const me = await request().get("/api/auth/me").set("Cookie", cookie);
    expect(me.body.user.email).toBe("owner@example.com");

    const out = await request().post("/api/auth/logout").set("Cookie", cookie).set("X-CMS", "1");
    expect(out.status).toBe(204);
    const after = await request().get("/api/auth/me").set("Cookie", cookie);
    expect(after.status).toBe(401);
  });

  it("protects every CMS endpoint", async () => {
    for (const path of ["/api/dashboard", "/api/projects", "/api/media", "/api/messages", "/api/seo", "/api/users"]) {
      expect((await request().get(path)).status).toBe(401);
    }
  });

  it("changes the password only with the current one", async () => {
    const owner = await login();
    const bad = await owner.put("/api/auth/password").send({ currentPassword: "wrong", newPassword: "a-new-password-1" });
    expect(bad.status).toBe(400);
    expect(bad.body.fields.currentPassword).toBeTruthy();
    const short = await owner.put("/api/auth/password").send({ currentPassword: "owner-password-123", newPassword: "short" });
    expect(short.status).toBe(422);
  });
});
