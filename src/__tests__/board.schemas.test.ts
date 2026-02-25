import { describe, expect, it } from "vitest";
import { CardSchema, CreateCardSchema } from "../features/board/api";

describe("CreateCardSchema", () => {
  it("accepts a title with 2+ chars", () => {
    expect(() => CreateCardSchema.parse({ title: "AB" })).not.toThrow();
  });

  it("rejects a title shorter than 2 chars", () => {
    expect(() => CreateCardSchema.parse({ title: "A" })).toThrow();
  });

  it("rejects missing title", () => {
    expect(() => CreateCardSchema.parse({})).toThrow();
  });
});

describe("CardSchema", () => {
  const valid = {
    id: "c_1",
    projectId: "p_1",
    title: "Login flow",
    column: "todo" as const,
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  it("accepts a valid card", () => {
    expect(() => CardSchema.parse(valid)).not.toThrow();
  });

  it("accepts all valid column values", () => {
    for (const column of ["todo", "doing", "done"] as const) {
      expect(() => CardSchema.parse({ ...valid, column })).not.toThrow();
    }
  });

  it("rejects an invalid column", () => {
    expect(() => CardSchema.parse({ ...valid, column: "backlog" })).toThrow();
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(() => CardSchema.parse(rest)).toThrow();
  });
});
