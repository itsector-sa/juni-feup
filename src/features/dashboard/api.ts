import { z } from "zod";
import { apiFetch } from "../../lib/http";

export const DashboardSummarySchema = z.object({
  projectsCount: z.number(),
  cardsCount: z.number(),
  completionRate: z.number(),
  byColumn: z.object({ todo: z.number(), doing: z.number(), done: z.number() }),
  createdByDay: z.array(z.object({ day: z.string(), cards: z.number() })),
  recentProjects: z.array(z.object({ id: z.string(), name: z.string(), createdAt: z.string() })),
  activity: z.array(
    z.object({ id: z.string(), at: z.string(), type: z.string(), label: z.string() })
  ),
});

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

export async function fetchDashboardSummary() {
  const data = await apiFetch("/api/dashboard/summary");
  return DashboardSummarySchema.parse(data);
}
