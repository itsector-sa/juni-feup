import { z } from "zod";
import { apiFetch } from "../../lib/http";

export const CardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  column: z.enum(["todo", "doing", "done"]),
  createdAt: z.string(),
});
export type Card = z.infer<typeof CardSchema>;

export const CreateCardSchema = z.object({ title: z.string().min(2) });
export type CreateCardInput = z.infer<typeof CreateCardSchema>;

export async function fetchBoard(projectId: string) {
  const data = await apiFetch(`/api/projects/${projectId}/board`);
  return z.array(CardSchema).parse(data);
}

export async function createCard(projectId: string, input: unknown) {
  const payload = CreateCardSchema.parse(input);
  const data = await apiFetch(`/api/projects/${projectId}/cards`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return CardSchema.parse(data);
}

export async function moveCard(cardId: string, toColumn: "todo" | "doing" | "done") {
  const data = await apiFetch(`/api/cards/${cardId}/move`, {
    method: "POST",
    body: JSON.stringify({ toColumn }),
  });
  return z.object({ ok: z.boolean() }).parse(data);
}
