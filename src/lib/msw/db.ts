export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: string;
  projectId: string;
  title: string;
  column: "todo" | "doing" | "done";
  createdAt: string;
};

export type Activity = {
  id: string;
  at: string;
  type:
    | "login"
    | "project_created"
    | "project_updated"
    | "project_deleted"
    | "card_created"
    | "card_moved";
  label: string;
};

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}_${crypto.randomUUID().slice(0, 8)}`;

const demoUser = { id: "u_1", name: "Demo User", email: "juni-feup@itsector.pt" };

let projects: Project[] = [
  {
    id: "p_f0938f00", //uid("p"),
    name: "Workshop",
    description: "Starter project",
    createdAt: now(),
    updatedAt: now(),
  },
];

let cards: Card[] = [
  {
    id: uid("c"),
    projectId: projects[0].id,
    title: "Login flow",
    column: "todo",
    createdAt: now(),
  },
  {
    id: uid("c"),
    projectId: projects[0].id,
    title: "Dashboard charts",
    column: "doing",
    createdAt: now(),
  },
  {
    id: uid("c"),
    projectId: projects[0].id,
    title: "Kanban drag & drop",
    column: "done",
    createdAt: now(),
  },
];

let activities: Activity[] = [];

const log = (type: Activity["type"], label: string) => {
  activities = [{ id: uid("a"), at: now(), type, label }, ...activities].slice(0, 30);
};

export const db = {
  demoUser,

  logLogin: () => log("login", `User logged in: ${demoUser.email}`),
  listActivity: () => activities,

  listProjects: () => projects,
  createProject: (input: { name: string; description?: string }) => {
    const p: Project = {
      id: uid("p"),
      name: input.name,
      description: input.description,
      createdAt: now(),
      updatedAt: now(),
    };
    projects = [p, ...projects];
    log("project_created", `Project created: ${p.name}`);
    return p;
  },
  updateProject: (id: string, input: { name: string; description?: string }) => {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    projects[idx] = { ...projects[idx], ...input, updatedAt: now() };
    log("project_updated", `Project updated: ${projects[idx].name}`);
    return projects[idx];
  },
  deleteProject: (id: string) => {
    projects = projects.filter((p) => p.id !== id);
    cards = cards.filter((c) => c.projectId !== id);
    log("project_deleted", `Project deleted: ${id}`);
    return true;
  },

  listCards: (projectId: string) => cards.filter((c) => c.projectId === projectId),
  createCard: (projectId: string, title: string) => {
    const c: Card = { id: uid("c"), projectId, title, column: "todo", createdAt: now() };
    cards = [c, ...cards];
    log("card_created", `Card created in ${projectId}: ${title}`);
    return c;
  },
  moveCard: (cardId: string, toColumn: Card["column"]) => {
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx < 0) return false;
    cards[idx] = { ...cards[idx], column: toColumn };
    log("card_moved", `Card moved: ${cardId} → ${toColumn}`);
    return true;
  },

  dashboardSummary: () => {
    const byColumn = {
      todo: cards.filter((c) => c.column === "todo").length,
      doing: cards.filter((c) => c.column === "doing").length,
      done: cards.filter((c) => c.column === "done").length,
    };

    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const createdByDay = days.map((day) => ({
      day,
      cards: cards.filter((c) => c.createdAt.slice(0, 10) === day).length,
    }));

    const recentProjects = projects
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, createdAt: p.createdAt }));

    return {
      projectsCount: projects.length,
      cardsCount: cards.length,
      completionRate: cards.length === 0 ? 0 : Math.round((byColumn.done / cards.length) * 100),
      byColumn,
      createdByDay,
      recentProjects,
      activity: activities.slice(0, 8),
    };
  },
};
