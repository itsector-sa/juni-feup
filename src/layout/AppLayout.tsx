import { NavLink, Outlet } from "react-router-dom";
import { FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const navLinks = [{ to: "/posts", label: "Posts", icon: FileText }];

export function AppLayout() {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r bg-card">
          {/* Brand */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              IT Sector | Juni FEUP
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Resources
            </p>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <a
                href="https://jsonplaceholder.typicode.com"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                JSONPlaceholder
              </a>
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </TooltipProvider>
  );
}
