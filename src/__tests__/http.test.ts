import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../lib/http";

function mockFetch(status: number, body: unknown, contentType = "application/json") {
  const headers = new Headers({ "content-type": contentType });
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("apiFetch()", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch(200, { token: "abc" });
    const result = await apiFetch("/api/auth/login", { method: "POST" });
    expect(result).toEqual({ token: "abc" });
  });

  it("always sends content-type: application/json", async () => {
    mockFetch(200, {});
    await apiFetch("/api/test");
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].headers["content-type"]).toBe("application/json");
  });

  it("merges caller headers with content-type", async () => {
    mockFetch(200, {});
    await apiFetch("/api/test", { headers: { Authorization: "Bearer tok" } });
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].headers["content-type"]).toBe("application/json");
    expect(call[1].headers.Authorization).toBe("Bearer tok");
  });

  it("throws on non-ok status with fallback message", async () => {
    mockFetch(404, "", "text/plain");
    await expect(apiFetch("/api/missing")).rejects.toThrow("Request failed (404)");
  });

  it("throws body text when non-ok with body", async () => {
    mockFetch(404, "Not Found", "text/plain");
    await expect(apiFetch("/api/missing")).rejects.toThrow("Not Found");
  });

  it("throws with error message from body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "text/plain" }),
      text: () => Promise.resolve("Invalid credentials"),
    } as unknown as Response);
    await expect(apiFetch("/api/auth/login")).rejects.toThrow("Invalid credentials");
  });

  it("returns text when content-type is not json", async () => {
    mockFetch(200, "plain text response", "text/plain");
    const result = await apiFetch("/api/text");
    expect(result).toBe("plain text response");
  });
});
