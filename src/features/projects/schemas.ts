import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectInputSchema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  description: z.string().optional(),
});

export type ProjectInput = z.infer<typeof ProjectInputSchema>;
