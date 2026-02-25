import { Activity as ActivityIcon, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatDate } from "../../../lib/utils";
import { useDashboardSummaryQuery } from "../hooks";

function StatCard({
  title,
  value,
  loading,
  suffix,
}: {
  title: string;
  value?: number;
  loading?: boolean;
  suffix?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</div>
        <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
          {loading ? <Skeleton className="h-9 w-20" /> : `${value ?? 0}${suffix ?? ""}`}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const nav = useNavigate();
  const q = useDashboardSummaryQuery();

  const pieData = q.data
    ? [
        { name: "To do", value: q.data.byColumn.todo },
        { name: "Doing", value: q.data.byColumn.doing },
        { name: "Done", value: q.data.byColumn.done },
      ]
    : [];

  const pieColors = ["#94a3b8", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</div>
        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Insights + charts + activity
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Projects" value={q.data?.projectsCount} loading={q.isLoading} />
        <StatCard title="Cards" value={q.data?.cardsCount} loading={q.isLoading} />
        <StatCard
          title="Completion"
          value={q.data?.completionRate}
          loading={q.isLoading}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Cards by status</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Kanban distribution</div>
          </CardHeader>
          <CardContent className="h-[260px]">
            {q.isLoading && <Skeleton className="h-full w-full" />}
            {q.isSuccess && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Cards created (7 days)
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Trend</div>
          </CardHeader>
          <CardContent className="h-[260px]">
            {q.isLoading && <Skeleton className="h-full w-full" />}
            {q.isSuccess && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={q.data.createdByDay}>
                  <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cards" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-spotlight="recent-boards">
        <CardHeader>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Recent projects</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Quick access to boards</div>
        </CardHeader>
        <CardContent>
          {q.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {q.isSuccess && q.data.recentProjects.length === 0 && (
            <EmptyState
              icon={<FolderOpen className="w-7 h-7 text-slate-700 dark:text-slate-200" />}
              title="No projects yet"
              description="Create your first project to unlock the board, charts and activity feed."
              ctaLabel="Create a project"
              onCta={() => nav("/projects")}
            />
          )}

          {q.isSuccess && q.data.recentProjects.length > 0 && (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {q.data.recentProjects.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Created: {formatDate(p.createdAt)}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => nav(`/projects/${p.id}/board`)}>
                    Open board
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Activity</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Latest actions</div>
        </CardHeader>
        <CardContent>
          {q.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {q.isSuccess && (q.data.activity?.length ?? 0) === 0 && (
            <EmptyState
              icon={<ActivityIcon className="w-7 h-7 text-slate-700 dark:text-slate-200" />}
              title="No activity yet"
              description="Create a project or move a card to see the activity feed update."
            />
          )}
          {q.isSuccess && (q.data.activity?.length ?? 0) > 0 && (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {q.data.activity.map((a) => (
                <div key={a.id} className="py-2 flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-800 dark:text-slate-200">{a.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
