import { z } from "zod";
import { apiFetch } from "../../lib/http";
import { LoginSchema, UserSchema } from "./schemas";

const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export async function loginApi(input: unknown) {
  const payload = LoginSchema.parse(input);
  const data = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
  return LoginResponseSchema.parse(data);
}
