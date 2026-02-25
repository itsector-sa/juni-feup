import { delay, HttpResponse, http } from "msw";
import { db } from "./db";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const handlers = [
  http.post(`${base}/api/auth/login`, async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as { email: string; password: string };
    if (!body.email || !body.password)
      return HttpResponse.json({ message: "Missing credentials" }, { status: 400 });
    db.logLogin();
    return HttpResponse.json({ token: "demo-token", user: db.demoUser });
  }),

  http.get(`${base}/api/dashboard/summary`, async () => {
    await delay(250);
    return HttpResponse.json(db.dashboardSummary());
  }),

  http.get(`${base}/api/projects`, async () => {
    await delay(250);
    return HttpResponse.json(db.listProjects());
  }),

  http.post(`${base}/api/projects`, async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as { name: string; description?: string };
    return HttpResponse.json(db.createProject(body));
  }),

  http.put(`${base}/api/projects/:id`, async ({ params, request }) => {
    await delay(250);
    const body = (await request.json()) as { name: string; description?: string };
    const updated = db.updateProject(String(params.id), body);
    if (!updated) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.delete(`${base}/api/projects/:id`, async ({ params }) => {
    await delay(250);
    db.deleteProject(String(params.id));
    return HttpResponse.json({ ok: true });
  }),

  http.get(`${base}/api/projects/:id/board`, async ({ params }) => {
    await delay(250);
    return HttpResponse.json(db.listCards(String(params.id)));
  }),

  http.post(`${base}/api/projects/:id/cards`, async ({ params, request }) => {
    await delay(250);
    const body = (await request.json()) as { title: string };
    return HttpResponse.json(db.createCard(String(params.id), body.title));
  }),

  http.post(`${base}/api/cards/:id/move`, async ({ params, request }) => {
    await delay(250);
    const body = (await request.json()) as { toColumn: "todo" | "doing" | "done" };
    const ok = db.moveCard(String(params.id), body.toColumn);
    if (!ok) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ ok: true });
  }),
];
