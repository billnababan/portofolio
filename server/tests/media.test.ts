import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { login, request } from "./helpers.js";

const png = (width: number, height: number) => sharp({ create: { width, height, channels: 4, background: { r: 20, g: 20, b: 20, alpha: 1 } } }).png().toBuffer();

describe("media", () => {
  it("makes responsive variants of an upload and serves them", async () => {
    const owner = await login();
    const res = await owner.post("/api/media").field("name", "Test Shot").field("alt", "A test").attach("file", await png(1000, 600), "shot.png");
    expect(res.status).toBe(201);
    expect(res.body.media.name).toBe("test-shot");
    expect(res.body.media.widths).toEqual([480, 800, 1000]);
    const file = await request().get(res.body.media.url);
    expect(file.status).toBe(200);
    expect(file.headers["cache-control"]).toMatch(/immutable/);

    // Same name again gets a suffix instead of overwriting.
    const again = await owner.post("/api/media").field("name", "test-shot").attach("file", await png(300, 300), "x.png");
    expect(again.body.media.name).toBe("test-shot-2");
    expect(again.body.media.widths).toEqual([300]);
    expect((await owner.delete(`/api/media/${again.body.media.id}`)).status).toBe(204);
  });

  it("checks the bytes, not only the declared type", async () => {
    const owner = await login();
    const fake = await owner.post("/api/media").attach("file", Buffer.from("not an image"), { filename: "x.png", contentType: "image/png" });
    expect(fake.status).toBe(400);
    const svg = await owner.post("/api/media").attach("file", Buffer.from("<svg/>"), { filename: "x.svg", contentType: "image/svg+xml" });
    expect(svg.status).toBe(400);
  });

  it("refuses to delete a file that is in use and says where", async () => {
    const owner = await login();
    const media = (await owner.get("/api/media")).body.media as { id: number; name: string; uses: number }[];
    const portrait = media.find((m) => m.name === "portrait")!;
    expect(portrait.uses).toBe(1);
    const res = await owner.delete(`/api/media/${portrait.id}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Hero portrait/);
    const usage = await owner.get(`/api/media/${portrait.id}/usage`);
    expect(usage.body.usage[0].label).toBe("Hero portrait");
  });

  it("replaces a file in place, keeping its name and every use", async () => {
    const owner = await login();
    const media = (await owner.get("/api/media")).body.media as { id: number; name: string; version: string }[];
    const shot = media.find((m) => m.name === "test-shot")!;
    const res = await owner.post(`/api/media/${shot.id}/replace`).attach("file", await png(1300, 700), "new.png");
    expect(res.status).toBe(200);
    expect(res.body.media.name).toBe("test-shot");
    expect(res.body.media.version).not.toBe(shot.version);
    expect(res.body.media.widths).toEqual([480, 800, 1200]);
    const pdf = await owner.post(`/api/media/${shot.id}/replace`).attach("file", Buffer.from("%PDF-1.4 test"), { filename: "x.pdf", contentType: "application/pdf" });
    expect(pdf.status).toBe(400);
  });
});
