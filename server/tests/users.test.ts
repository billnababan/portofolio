import { describe, expect, it } from "vitest";
import { login } from "./helpers.js";

describe("users and roles", () => {
  it("lets the owner add an editor who cannot manage users", async () => {
    const owner = await login();
    const created = await owner.post("/api/users").send({ name: "Editor", email: "editor@example.com", role: "editor", password: "editor-password-1" });
    expect(created.status).toBe(201);

    const editor = await login("editor@example.com", "editor-password-1");
    expect((await editor.get("/api/projects")).status).toBe(200);
    expect((await editor.get("/api/users")).status).toBe(403);

    // Deactivating ends the editor's sessions at once.
    const off = await owner.put(`/api/users/${created.body.user.id}`).send({ name: "Editor", role: "editor", isActive: false });
    expect(off.status).toBe(200);
    expect((await editor.get("/api/projects")).status).toBe(401);
  });

  it("always keeps one active owner", async () => {
    const owner = await login();
    const users = (await owner.get("/api/users")).body.users as { id: number; email: string }[];
    const me = users.find((u) => u.email === "owner@example.com")!;
    expect((await owner.delete(`/api/users/${me.id}`)).status).toBe(400);
    expect((await owner.put(`/api/users/${me.id}`).send({ name: "Owner", role: "editor", isActive: true })).status).toBe(400);
  });
});
