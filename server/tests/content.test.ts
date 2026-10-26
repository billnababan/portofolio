import { describe, expect, it } from "vitest";
import { login, request } from "./helpers.js";

const baseProject = async () => {
  const owner = await login();
  const media = (await owner.get("/api/media")).body.media as { id: number; name: string; kind: string }[];
  const image = media.find((m) => m.name === "project-taskflow")!;
  return {
    owner,
    project: {
      slug: "new-app",
      title: "New app",
      shortTitle: "New",
      kicker: "",
      summary: "A new project used by the tests.",
      note: "",
      role: "Fullstack",
      featured: false,
      imageId: image.id,
      imageAlt: "Screenshot of the new app",
      sourceUrl: "",
      liveUrl: "",
      status: "draft",
      stack: ["React", "Express"],
      stats: [],
      steps: [],
    },
  };
};

describe("projects", () => {
  it("lists the seeded projects with their story steps", async () => {
    const owner = await login();
    const res = await owner.get("/api/projects");
    expect(res.status).toBe(200);
    const edepot = res.body.projects.find((p: { slug: string }) => p.slug === "edepot");
    expect(edepot.featured).toBe(true);
    expect(edepot.steps[1].flow).toContain("Gate in");
  });

  it("explains validation errors field by field", async () => {
    const { owner, project } = await baseProject();
    const res = await owner.post("/api/projects").send({ ...project, slug: "Bad Slug", featured: true, sourceUrl: "github.com/x" });
    expect(res.status).toBe(422);
    expect(Object.keys(res.body.fields)).toEqual(expect.arrayContaining(["slug", "sourceUrl", "kicker", "steps"]));
  });

  it("keeps drafts off the public site until shown", async () => {
    const { owner, project } = await baseProject();
    const created = await owner.post("/api/projects").send(project);
    expect(created.status).toBe(201);
    const id = created.body.project.id;

    let pub = await request().get("/api/public/content");
    expect(pub.body.projects.map((p: { id: string }) => p.id)).not.toContain("new-app");

    expect((await owner.patch(`/api/projects/${id}/status`).send({ status: "published" })).status).toBe(204);
    pub = await request().get("/api/public/content");
    const shown = pub.body.projects.find((p: { id: string }) => p.id === "new-app");
    expect(shown.stack).toEqual(["React", "Express"]);
    expect(pub.body.images["project-taskflow"].widths.length).toBeGreaterThan(0);

    const dup = await owner.post("/api/projects").send(project);
    expect(dup.status).toBe(409);

    // Saving a featured story with steps replaces the children atomically.
    const story = { ...project, status: "published", featured: true, kicker: "case 03 — test", steps: [{ label: "the problem", text: "Paper.", flow: ["A", "B"], facts: ["One fact"], features: [{ title: "F", text: "Feature text" }] }] };
    const updated = await owner.put(`/api/projects/${id}`).send(story);
    expect(updated.status).toBe(200);
    expect(updated.body.project.steps[0].features[0].title).toBe("F");

    const all = (await owner.get("/api/projects")).body.projects.map((p: { id: number }) => p.id);
    const reordered = [id, ...all.filter((x: number) => x !== id)];
    expect((await owner.put("/api/projects/order").send({ ids: reordered })).status).toBe(204);
    expect((await owner.get("/api/projects")).body.projects[0].id).toBe(id);
    expect((await owner.put("/api/projects/order").send({ ids: [id] })).status).toBe(400);

    expect((await owner.delete(`/api/projects/${id}`)).status).toBe(204);
    expect((await owner.get(`/api/projects/${id}`)).status).toBe(404);
  });
});

describe("settings", () => {
  it("validates and saves a settings form, and lists it as not live yet", async () => {
    const owner = await login();
    const { settings } = (await owner.get("/api/settings")).body;
    const tooLong = await owner.put("/api/settings/seo").send({ ...settings.seo, title: "x".repeat(90) });
    expect(tooLong.status).toBe(422);
    expect(tooLong.body.fields.title).toMatch(/70/);

    const ok = await owner.put("/api/settings/seo").send({ ...settings.seo, title: "Bill Jeferson — Fullstack Developer in Batam" });
    expect(ok.status).toBe(200);
    const pending = (await owner.get("/api/publish")).body.pending;
    expect(pending[0].summary).toBe("Edited SEO settings");

    const pub = await request().get("/api/public/content");
    expect(pub.body.seo.title).toBe("Bill Jeferson — Fullstack Developer in Batam");
  });

  it("refuses a hero image that is not an image", async () => {
    const owner = await login();
    const { settings } = (await owner.get("/api/settings")).body;
    const res = await owner.put("/api/settings/hero").send({ ...settings.hero, imageId: settings.profile.cvMediaId });
    expect(res.status).toBe(400);
    expect(res.body.fields.imageId).toBeTruthy();
  });
});

describe("skills and certifications", () => {
  it("saves a skill layer with its items", async () => {
    const owner = await login();
    const created = await owner.post("/api/skills").send({ title: "Testing", subtitle: "", items: [{ name: "Vitest", tag: "tests" }] });
    expect(created.status).toBe(201);
    const groups = (await owner.get("/api/skills")).body.groups;
    expect(groups.at(-1).items[0].name).toBe("Vitest");
    expect((await owner.delete(`/api/skills/${created.body.id}`)).status).toBe(204);
  });

  it("requires a link label when there is a link", async () => {
    const owner = await login();
    const certs = (await owner.get("/api/certifications")).body.certifications;
    const c = certs[0];
    const res = await owner.put(`/api/certifications/${c.id}`).send({ ...c, linkUrl: "https://example.com", linkLabel: "" });
    expect(res.status).toBe(422);
    expect(res.body.fields.linkLabel).toBeTruthy();
  });
});
