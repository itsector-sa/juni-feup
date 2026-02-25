import { z } from "zod";
import { apiFetch } from "../../lib/http";
import { ProjectInputSchema, ProjectSchema } from "./schemas";

const ProjectsSchema = z.array(ProjectSchema);

export async function listProjects() {
  const data = await apiFetch("/api/projects");
  return ProjectsSchema.parse(data);
}

export async function createProject(input: unknown) {
  const payload = ProjectInputSchema.parse(input);
  const data = await apiFetch("/api/projects", { method: "POST", body: JSON.stringify(payload) });
  return ProjectSchema.parse(data);
}

export async function updateProject(id: string, input: unknown) {
  const payload = ProjectInputSchema.parse(input);
  const data = await apiFetch(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return ProjectSchema.parse(data);
}

export async function deleteProject(id: string) {
  await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
  return true;
}
