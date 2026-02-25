import React from "react";
import { cn } from "../../lib/utils";

type Rect = { x: number; y: number; w: number; h: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

export function Spotlight({
  selector,
  padding = 10,
  radius = 16,
  onMissingTarget,
  onBackdropClick,
  children,
}: {
  selector: string;
  padding?: number;
  radius?: number;
  onMissingTarget?: () => void;
  onBackdropClick?: () => void;
  children?: (rect: Rect) => React.ReactNode;
}) {
  const [rect, setRect] = React.useState<Rect | null>(null);

  const measure = React.useCallback(() => {
    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      onMissingTarget?.();
      return;
    }
    const r = getRect(el);
    setRect({ x: r.x - padding, y: r.y - padding, w: r.w + padding * 2, h: r.h + padding * 2 });
  }, [selector, padding, onMissingTarget]);

  React.useEffect(() => {
    measure();

    const ro = new ResizeObserver(() => measure());
    const el = document.querySelector(selector);
    if (el) ro.observe(el);

    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    const t = window.setInterval(measure, 250);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(t);
    };
  }, [measure, selector]);

  if (!rect) return null;

  const top = { left: 0, top: 0, width: "100vw", height: rect.y };
  const left = { left: 0, top: rect.y, width: rect.x, height: rect.h };
  const right = {
    left: rect.x + rect.w,
    top: rect.y,
    width: `calc(100vw - ${rect.x + rect.w}px)`,
    height: rect.h,
  };
  const bottom = {
    left: 0,
    top: rect.y + rect.h,
    width: "100vw",
    height: `calc(100vh - ${rect.y + rect.h}px)`,
  };

  const tooltipMaxW = 520;
  const centerX = rect.x + rect.w / 2;
  const tooltipLeft = clamp(centerX - tooltipMaxW / 2, 12, window.innerWidth - tooltipMaxW - 12);
  const belowTop = rect.y + rect.h + 14;
  const aboveTop = rect.y - 14;
  const preferBelow = belowTop + 160 < window.innerHeight;
  const tooltipTop = preferBelow ? belowTop : Math.max(12, aboveTop - 160);

  const arrowSize = 10;
  const arrowLeft = clamp(centerX - tooltipLeft - arrowSize, 18, tooltipMaxW - 18);

  const arrowStyle: React.CSSProperties = preferBelow
    ? {
        top: -arrowSize,
        left: arrowLeft,
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid rgba(255,255,255,0.92)`,
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.20))",
      }
    : {
        bottom: -arrowSize,
        left: arrowLeft,
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid rgba(255,255,255,0.92)`,
        filter: "drop-shadow(0 -6px 10px rgba(0,0,0,0.20))",
      };

  const overlayClass = "absolute bg-slate-900/55 backdrop-blur-[2px] pointer-events-auto";
  const overlayProps = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onBackdropClick?.();
    },
  };

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none">
      <div className={overlayClass} style={top as React.CSSProperties} {...overlayProps} />
      <div className={overlayClass} style={left as React.CSSProperties} {...overlayProps} />
      <div className={overlayClass} style={right as React.CSSProperties} {...overlayProps} />
      <div className={overlayClass} style={bottom as React.CSSProperties} {...overlayProps} />

      <div
        className={cn("absolute rounded-[18px] pointer-events-none")}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          borderRadius: radius,
          border: "2px solid rgba(255,255,255,0.75)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.20), 0 12px 40px rgba(0,0,0,0.45), 0 0 22px rgba(255,255,255,0.18)",
        }}
      />

      <div
        className="absolute rounded-[18px] pointer-events-none"
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          borderRadius: radius,
          border: "2px solid rgba(255,255,255,0.55)",
          animation: "spotlight-pulse 1.15s ease-out infinite",
          transformOrigin: "center",
        }}
      />

      <div
        role="dialog"
        aria-label="Tour navigation"
        aria-modal="false"
        className="absolute pointer-events-auto"
        style={{
          left: tooltipLeft,
          top: tooltipTop,
          width: tooltipMaxW,
          maxWidth: "calc(100vw - 24px)",
          animation: "spotlight-float 1.6s ease-in-out infinite",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="absolute w-0 h-0 pointer-events-none" style={arrowStyle} />
        <div
          className={cn(
            "rounded-2xl border shadow-soft overflow-hidden",
            "border-slate-200 dark:border-slate-800",
            "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md"
          )}
        >
          {children?.(rect)}
        </div>
      </div>
    </div>
  );
}
