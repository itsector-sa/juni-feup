import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fireMicroConfetti } from "../../lib/confetti";
import { useToastStore } from "../toast/toastStore";
import { useOnboardingStore } from "./onboardingStore";
import { Spotlight } from "./Spotlight";

const STEPS = [
  {
    key: "projects_nav",
    title: "1) Ir aos Projects",
    desc: "Clica no item “Projects” na sidebar para abrir o CRUD.",
    selector: '[data-spotlight="projects-nav"]',
    goTo: "/dashboard",
    advance: { type: "click" as const },
  },
  {
    key: "open_board",
    title: "2) Abrir um Board",
    desc: "Clica no botão “Board” de um projeto (se não houver, cria um projeto primeiro).",
    selector: '[data-spotlight="open-board-btn"]',
    goTo: "/projects",
    advance: { type: "click" as const },
  },
  {
    key: "quick_add",
    title: "3) Criar um card (Ctrl/⌘+Enter)",
    desc: "Clica no Quick Add, escreve um título e usa Ctrl/⌘+Enter. O tour só termina quando o card for criado.",
    selector: '[data-spotlight="quick-add"]',
    goTo: "projects/p_f0938f00/board",
    advance: { type: "event" as const, name: "board:card-created" },
  },
];

function useWaitForClick(selector: string, enabled: boolean, onOk: () => void) {
  React.useEffect(() => {
    if (!enabled) return;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const handler = () => onOk();
    el.addEventListener("click", handler, { capture: true });
    return () => el.removeEventListener("click", handler, { capture: true });
  }, [selector, enabled, onOk]);
}

function useWaitForEvent(eventName: string, enabled: boolean, onOk: () => void) {
  React.useEffect(() => {
    if (!enabled) return;
    const handler = () => onOk();
    window.addEventListener(eventName, handler as EventListener);
    return () => window.removeEventListener(eventName, handler as EventListener);
  }, [eventName, enabled, onOk]);
}

export function OnboardingTour() {
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToastStore((s) => s.push);

  const seen = useOnboardingStore((s) => s.seen);
  const step = useOnboardingStore((s) => s.step);
  const start = useOnboardingStore((s) => s.start);
  const next = useOnboardingStore((s) => s.next);
  const prev = useOnboardingStore((s) => s.prev);
  const skip = useOnboardingStore((s) => s.skip);
  const complete = useOnboardingStore((s) => s.complete);

  const maxStep = STEPS.length - 1;
  const s = STEPS[Math.min(step, maxStep)];

  React.useEffect(() => {
    if (seen) return;
    if (loc.pathname.startsWith("/dashboard")) {
      start();
    }
  }, [seen, loc.pathname, start]);

  React.useEffect(() => {
    if (seen) return;
    if (s.key === "quick_add") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("tour:quickadd-start"));
      }, 300);
    }
  }, [seen, s.key]);

  const advance = React.useCallback(() => {
    if (step === maxStep) {
      complete();

      fireMicroConfetti();

      toast({ kind: "success", title: "Tour completed", message: "Now build like a product 🚀" });
    } else {
      next(maxStep);
    }
  }, [step, maxStep, complete, next, toast]);

  // Keyboard navigation: ← prev · → next · Esc skip
  React.useEffect(() => {
    if (seen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skip();

        toast({ kind: "info", title: "Tour skipped" });
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [seen, skip, prev, advance, toast]);

  useWaitForClick(s.selector, !seen && s.advance.type === "click", advance);
  useWaitForEvent(
    s.advance.type === "event" ? s.advance.name : "",
    !seen && s.advance.type === "event",
    advance
  );

  if (seen) return null;

  const progress = `${step + 1} / ${STEPS.length}`;

  return (
    <Spotlight
      selector={s.selector}
      padding={10}
      radius={18}
      onMissingTarget={() => {
        const to = s.goTo;
        if (to && loc.pathname !== to) {
          nav(to);
        }
      }}
      onBackdropClick={() => {
        // keep backdrop click non-advancing for "game" mode
      }}
    >
      {() => (
        <>
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between w-auto">
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                Quick Tour — {s.title}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{s.desc}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                👉{" "}
                <b>
                  {s.advance.type === "click"
                    ? "Clica no elemento destacado"
                    : "Cria um card para continuar"}
                </b>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 w-12">{progress}</div>
          </div>

          <div className="p-5 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Keys: <b>Esc</b> skip • <b>←</b>/<b>→</b> navigation (manual)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                onClick={() => {
                  skip();

                  toast({ kind: "info", title: "Tour skipped" });
                }}
              >
                Skip
              </button>

              <button
                type="button"
                className="text-xs font-semibold px-3 py-2 rounded-xl border bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 disabled:opacity-50"
                onClick={prev}
                disabled={step === 0}
              >
                Back
              </button>

              <button
                type="button"
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                onClick={() => {
                  advance();
                }}
              >
                {step === maxStep ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </>
      )}
    </Spotlight>
  );
}
