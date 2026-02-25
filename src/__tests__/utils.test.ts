import { describe, expect, it } from "vitest";
import { cn, formatDate } from "../lib/utils";

describe("cn()", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("handles single class", () => {
    expect(cn("only")).toBe("only");
  });
});

describe("formatDate()", () => {
  it("formats an ISO date string without throwing", () => {
    const result = formatDate("2024-06-15T10:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the year", () => {
    const result = formatDate("2024-06-15T10:00:00.000Z");
    expect(result).toContain("2024");
  });
});
