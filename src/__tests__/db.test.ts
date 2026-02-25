import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../lib/msw/db";

// Re-seed state before each test by calling the exported db methods
// (the db module uses module-level mutable state, so we manipulate it via its API).

describe("db.createProject / listProjects", () => {
  it("creates a project and returns it in the list", () => {
    const before = db.listProjects().length;
    const p = db.createProject({ name: "Test Project" });
    expect(p.name).toBe("Test Project");
    expect(db.listProjects()).toHaveLength(before + 1);
    expect(db.listProjects().find((x) => x.id === p.id)).toBeDefined();
  });

  it("stores the optional description", () => {
    const p = db.createProject({ name: "With Desc", description: "Hello" });
    expect(p.description).toBe("Hello");
  });

  it("assigns a unique id and timestamps", () => {
    const p = db.createProject({ name: "Unique" });
    expect(typeof p.id).toBe("string");
    expect(p.id.length).toBeGreaterThan(0);
    expect(new Date(p.createdAt).toString()).not.toBe("Invalid Date");
    expect(new Date(p.updatedAt).toString()).not.toBe("Invalid Date");
  });
});

describe("db.updateProject", () => {
  it("updates name and description", () => {
    const p = db.createProject({ name: "Old Name" });
    const updated = db.updateProject(p.id, { name: "New Name", description: "D" });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("New Name");
    expect(updated?.description).toBe("D");
  });

  it("returns null for a non-existent id", () => {
    expect(db.updateProject("non-existent", { name: "X" })).toBeNull();
  });
});

describe("db.deleteProject", () => {
  it("removes the project from the list", () => {
    const p = db.createProject({ name: "To Delete" });
    db.deleteProject(p.id);
    expect(db.listProjects().find((x) => x.id === p.id)).toBeUndefined();
  });

  it("also removes cards belonging to the project", () => {
    const p = db.createProject({ name: "With Cards" });
    db.createCard(p.id, "Orphan Card");
    db.deleteProject(p.id);
    expect(db.listCards(p.id)).toHaveLength(0);
  });
});

describe("db cards", () => {
  let projectId: string;

  beforeEach(() => {
    projectId = db.createProject({ name: "Card Project" }).id;
  });

  it("creates a card in todo column by default", () => {
    const c = db.createCard(projectId, "My Card");
    expect(c.column).toBe("todo");
    expect(c.title).toBe("My Card");
    expect(c.projectId).toBe(projectId);
  });

  it("listCards returns only cards for the given project", () => {
    const other = db.createProject({ name: "Other" });
    db.createCard(projectId, "Card A");
    db.createCard(other.id, "Card B");
    const cards = db.listCards(projectId);
    expect(cards.every((c) => c.projectId === projectId)).toBe(true);
  });

  it("moveCard changes the column", () => {
    const c = db.createCard(projectId, "Move Me");
    const ok = db.moveCard(c.id, "doing");
    expect(ok).toBe(true);
    const updated = db.listCards(projectId).find((x) => x.id === c.id);
    expect(updated?.column).toBe("doing");
  });

  it("moveCard returns false for non-existent card", () => {
    expect(db.moveCard("ghost", "done")).toBe(false);
  });
});

describe("db activity log", () => {
  it("records a login event", () => {
    const before = db.listActivity().length;
    db.logLogin();
    expect(db.listActivity()).toHaveLength(before + 1);
    expect(db.listActivity()[0].type).toBe("login");
  });

  it("records project_created on createProject", () => {
    db.createProject({ name: "Logged" });
    const activity = db.listActivity();
    expect(activity.some((a) => a.type === "project_created")).toBe(true);
  });
});
