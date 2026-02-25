import type React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { useAuthStore } from "../features/auth/store";
import { BoardPage } from "../features/board/pages/BoardPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";
import { AppShell } from "./layout/AppShell";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter(
  [
    { path: "/login", element: <LoginPage /> },
    {
      path: "/",
      element: (
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      ),
      children: [
        { path: "dashboard", element: <DashboardPage /> },
        { path: "projects", element: <ProjectsPage /> },
        { path: "projects/:id/board", element: <BoardPage /> },
      ],
    },
    { path: "*", element: <Navigate to="/dashboard" replace /> },
  ],
  { basename: import.meta.env.BASE_URL }
);
