import { describe, expect, it } from "vitest";
import { ProjectInputSchema, ProjectSchema } from "../features/projects/schemas";

describe("ProjectInputSchema", () => {
  it("accepts a valid input with name only", () => {
    expect(() => ProjectInputSchema.parse({ name: "My Project" })).not.toThrow();
  });

  it("accepts a valid input with name and description", () => {
    expect(() =>
      ProjectInputSchema.parse({ name: "My Project", description: "Desc" })
    ).not.toThrow();
  });

  it("rejects name shorter than 2 chars", () => {
    expect(() => ProjectInputSchema.parse({ name: "X" })).toThrow();
  });

  it("rejects missing name", () => {
    expect(() => ProjectInputSchema.parse({})).toThrow();
  });

  it("returns the parsed value with optional description", () => {
    const result = ProjectInputSchema.parse({ name: "AB" });
    expect(result.name).toBe("AB");
    expect(result.description).toBeUndefined();
  });
});

describe("ProjectSchema", () => {
  const valid = {
    id: "p_1",
    name: "Workshop",
    description: "Desc",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("accepts a valid project", () => {
    expect(() => ProjectSchema.parse(valid)).not.toThrow();
  });

  it("accepts a project without description", () => {
    const { description: _, ...rest } = valid;
    expect(() => ProjectSchema.parse(rest)).not.toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => ProjectSchema.parse({ id: "p_1" })).toThrow();
  });
});
