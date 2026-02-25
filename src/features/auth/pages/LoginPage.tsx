import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../../app/toast/toastStore";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { type LoginInput, LoginSchema } from "../schemas";
import { useAuthStore } from "../store";

export function LoginPage() {
  const nav = useNavigate();
  const login = useAuthStore((s) => s.login);
  const toast = useToastStore((s) => s.push);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "demo@juni-feup.pt", password: "demo" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      toast({ kind: "error", title: "Login failed", message: e?.message });
    }
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 p-6">
      <Card className="w-[520px] max-w-[95vw]">
        <CardHeader>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">juni-feup</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Login (mock) — patterns + Better UX
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email
              </div>
              <Input {...form.register("email")} />
              {form.formState.errors.email && (
                <div className="text-xs text-rose-700 mt-1">
                  {form.formState.errors.email.message}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Password
              </div>
              <Input type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <div className="text-xs text-rose-700 mt-1">
                  {form.formState.errors.password.message}
                </div>
              )}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              Sign in
            </Button>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Tip: use <b>Ctrl+K</b> after login to open Command Palette.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
