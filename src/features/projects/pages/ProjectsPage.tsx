import { FolderPlus } from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToastStore } from "../../../app/toast/toastStore";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Input } from "../../../components/ui/Input";
import { useCreateProject, useDeleteProject, useProjectsQuery, useUpdateProject } from "../hooks";
import { type ProjectInput, ProjectInputSchema } from "../schemas";

export function ProjectsPage() {
  const nav = useNavigate();
  const toast = useToastStore((s) => s.push);
  const q = useProjectsQuery();
  const createM = useCreateProject();
  const updateM = useUpdateProject();
  const deleteM = useDeleteProject();

  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<{
    id: string | null;
    name: string;
    description: string;
  }>({
    id: null,
    name: "",
    description: "",
  });

  React.useEffect(() => {
    const handler = () => setEditing({ id: "", name: "", description: "" });
    window.addEventListener("projects:new", handler as EventListener);
    return () => window.removeEventListener("projects:new", handler as EventListener);
  }, []);

  // Open new-project form when navigated here with { state: { openNew: true } }
  const location = useLocation();
  React.useEffect(() => {
    if ((location.state as any)?.openNew) {
      setEditing({ id: "", name: "", description: "" });
      // Clear the state so a back-navigation doesn't re-open the form
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const visible = (q.data ?? []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    try {
      const input: ProjectInput = ProjectInputSchema.parse({
        name: editing.name,
        description: editing.description || undefined,
      });

      if (editing.id === null) return;

      if (editing.id === "") {
        await createM.mutateAsync(input);
        toast({ kind: "success", title: "Project created" });
      } else {
        await updateM.mutateAsync({ id: editing.id, input });
        toast({ kind: "success", title: "Project updated" });
      }

      setEditing({ id: null, name: "", description: "" });
    } catch (e: any) {
      toast({ kind: "error", title: "Validation failed", message: e?.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Projects</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">CRUD + Zod validation</div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-60"
          />
          <Button onClick={() => setEditing({ id: "", name: "", description: "" })}>New</Button>
        </div>
      </div>

      {editing.id !== null && (
        <Card>
          <CardHeader>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {editing.id === "" ? "New project" : "Edit project"}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Name is required</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Name
                </div>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </div>
                <Input
                  value={editing.description}
                  onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setEditing({ id: null, name: "", description: "" })}
              >
                Cancel
              </Button>
              <Button onClick={save} disabled={createM.isPending || updateM.isPending}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {q.isSuccess && visible.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState
              icon={<FolderPlus className="w-7 h-7 text-slate-700 dark:text-slate-200" />}
              title="No projects found"
              description="Create one above. Then open its board and drag cards like a real product."
              ctaLabel="Create project"
              onCta={() => setEditing({ id: "", name: "", description: "" })}
            />
          </div>
        )}

        {visible.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">{p.name}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {p.description || "—"}
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setEditing({ id: p.id, name: p.name, description: p.description ?? "" })
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await deleteM.mutateAsync(p.id);
                    toast({ kind: "info", title: "Deleted" });
                  }}
                >
                  Delete
                </Button>
              </div>

              <Button
                data-spotlight="open-board-btn"
                variant="outline"
                onClick={() => nav(`/projects/${p.id}/board`)}
              >
                Board
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
