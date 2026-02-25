import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import React from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useToastStore } from "../../../app/toast/toastStore";
import { Button } from "../../../components/ui/Button";
import { CardContent, CardHeader, Card as UiCard } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { cn } from "../../../lib/utils";
import { type Card, type CreateCardInput, CreateCardSchema } from "../api";
import { useBoardQuery, useCreateCard, useMoveCard } from "../hooks";

function group(cards: Card[]) {
  return {
    todo: cards.filter((c) => c.column === "todo"),
    doing: cards.filter((c) => c.column === "doing"),
    done: cards.filter((c) => c.column === "done"),
  };
}

function SortableCard({
  card,
  disabled,
  selected,
  onSelect,
  onMoveLeft,
  onMoveRight,
}: {
  card: Card;
  disabled: boolean;
  selected: boolean;
  onSelect: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: DnD sortable wrapper — onMouseDown needed to set selected card
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
      onMouseDown={onSelect}
    >
      <motion.div
        layout
        className={cn(
          "rounded-2xl border bg-white dark:bg-slate-950 p-3 shadow-soft select-none transition",
          "border-slate-200 dark:border-slate-800",
          selected ? "ring-2 ring-slate-300 dark:ring-slate-700" : "hover:shadow-soft",
          isDragging ? "ring-2 ring-slate-300" : ""
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</div>

          <button
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-grab active:cursor-grabbing px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
            {...attributes}
            {...listeners}
            title="Drag"
          >
            ⠿
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {card.column.toUpperCase()}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              disabled={disabled || card.column === "todo"}
              onClick={onMoveLeft}
            >
              ←
            </Button>
            <Button
              variant="ghost"
              disabled={disabled || card.column === "done"}
              onClick={onMoveRight}
            >
              →
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ColumnView({
  title,
  id: _id,
  cards,
  selectedId,
  setSelectedId,
  disabled,
  onMoveLeft,
  onMoveRight,
}: {
  title: string;
  id: "todo" | "doing" | "done";
  cards: Card[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  disabled: boolean;
  onMoveLeft: (c: Card) => void;
  onMoveRight: (c: Card) => void;
}) {
  return (
    <UiCard>
      <CardHeader>
        <div className="text-sm font-bold text-slate-900 dark:text-white">{title}</div>
        <div className="text-xs text-slate-600 dark:text-slate-300">{cards.length} cards</div>
      </CardHeader>

      <CardContent className="space-y-3 min-h-[260px]">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 text-sm text-slate-600 dark:text-slate-300">
            <b>Empty</b>. Drag a card here or use “Quick add”.
          </div>
        ) : (
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((c) => (
              <SortableCard
                key={c.id}
                card={c}
                disabled={disabled}
                selected={selectedId === c.id}
                onSelect={() => setSelectedId(c.id)}
                onMoveLeft={() => onMoveLeft(c)}
                onMoveRight={() => onMoveRight(c)}
              />
            ))}
          </SortableContext>
        )}
      </CardContent>
    </UiCard>
  );
}

export function BoardPage() {
  const { id: projectId = "" } = useParams();
  const toast = useToastStore((s) => s.push);

  const q = useBoardQuery(projectId);
  const createM = useCreateCard(projectId);
  const moveM = useMoveCard(projectId);

  const form = useForm<CreateCardInput>({
    resolver: zodResolver(CreateCardSchema),
    defaultValues: { title: "" },
  });

  const [local, setLocal] = React.useState<Card[] | null>(null);

  React.useEffect(() => {
    if (q.data) setLocal(q.data);
  }, [q.data]);

  const columns = React.useMemo(() => (local ? group(local) : null), [local]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const allCards = React.useMemo(
    () => (columns ? [...columns.todo, ...columns.doing, ...columns.done] : []),
    [columns]
  );

  React.useEffect(() => {
    if (!columns) return;
    if (!selectedId) {
      const first = allCards[0];
      if (first) setSelectedId(first.id);
    } else if (!allCards.some((c) => c.id === selectedId)) {
      setSelectedId(allCards[0]?.id ?? null);
    }
  }, [columns, allCards, selectedId]);

  const selectedCard = React.useMemo(
    () => allCards.find((c) => c.id === selectedId) ?? null,
    [allCards, selectedId]
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const moveViaButtons = React.useCallback(
    async (card: Card, dir: "left" | "right") => {
      const order: Array<Card["column"]> = ["todo", "doing", "done"];
      const from = card.column;
      const idx = order.indexOf(from);
      const to =
        dir === "left" ? order[Math.max(0, idx - 1)] : order[Math.min(order.length - 1, idx + 1)];
      if (to === from) return;

      // optimistic local update
      setLocal((prev) =>
        prev ? prev.map((c) => (c.id === card.id ? { ...c, column: to } : c)) : prev
      );

      try {
        await moveM.mutateAsync({ cardId: card.id, toColumn: to });

        toast({
          kind: "success",
          title: "Moved",
          message: `${from} → ${to}`,
          durationMs: 5000,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await moveM.mutateAsync({ cardId: card.id, toColumn: from });
                toast({ kind: "info", title: "Undone", message: `${to} → ${from}` });
              } catch (e: any) {
                toast({ kind: "error", title: "Undo failed", message: e?.message });
              }
            },
          },
        });
      } catch (e: any) {
        toast({ kind: "error", title: "Move failed", message: e?.message });
        // revert
        setLocal(q.data ?? null);
      }
    },
    [moveM, toast, q.data]
  );

  const onCreate = async (values: CreateCardInput) => {
    try {
      await createM.mutateAsync(values);
      toast({ kind: "success", title: "Card created" });
      form.reset({ title: "" });
      window.dispatchEvent(new CustomEvent("board:card-created"));
    } catch (e: any) {
      toast({ kind: "error", title: "Create failed", message: e?.message });
    }
  };

  // Tip toast when tour step 3 starts
  React.useEffect(() => {
    const handler = () => {
      toast({
        kind: "info",
        title: "Tip",
        message: "Use Ctrl/⌘ + Enter to create instantly.",
        durationMs: 2500,
      });
      setTimeout(
        () => (document.getElementById("quick-add") as HTMLInputElement | null)?.focus(),
        50
      );
    };
    window.addEventListener("tour:quickadd-start", handler as any);
    return () => window.removeEventListener("tour:quickadd-start", handler as any);
  }, [toast]);

  // Keyboard shortcuts: N focus, J/K move, Up/Down select, Ctrl/⌘+Enter create
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea";

      if (isTyping) {
        // Only let Ctrl/⌘+Enter through when typing
        const isMac = navigator.platform.toLowerCase().includes("mac");
        const mod = isMac ? e.metaKey : e.ctrlKey;
        if (mod && e.key === "Enter") {
          e.preventDefault();
          (document.getElementById("quick-add-submit") as HTMLButtonElement | null)?.click();
        }
        return;
      }

      if (!selectedCard) return;

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        (document.getElementById("quick-add") as HTMLInputElement | null)?.focus();
        return;
      }

      if (e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (selectedCard.column !== "todo") moveViaButtons(selectedCard, "left");
        return;
      }
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (selectedCard.column !== "done") moveViaButtons(selectedCard, "right");
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!columns) return;
        const list = columns[selectedCard.column];
        const idx = list.findIndex((c) => c.id === selectedCard.id);
        const nextIdx =
          e.key === "ArrowDown" ? Math.min(idx + 1, list.length - 1) : Math.max(idx - 1, 0);
        const next = list[nextIdx];
        if (next) setSelectedId(next.id);
        return;
      }

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        (document.getElementById("quick-add-submit") as HTMLButtonElement | null)?.click();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedCard, columns, moveViaButtons]);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const onDragStart = (event: any) => setActiveId(event.active?.id ?? null);

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !local) return;

    const activeCard = local.find((c) => c.id === active.id);
    if (!activeCard) return;

    const overId = String(over.id);

    // over a column id?
    const isColumn = overId === "todo" || overId === "doing" || overId === "done";
    const overCard = local.find((c) => c.id === overId);

    const targetColumn = isColumn ? (overId as Card["column"]) : overCard?.column;
    if (!targetColumn) return;

    // reorder within same column
    if (overCard && overCard.column === activeCard.column) {
      const colCards = local.filter((c) => c.column === activeCard.column);
      const oldIndex = colCards.findIndex((c) => c.id === activeCard.id);
      const newIndex = colCards.findIndex((c) => c.id === overCard.id);

      if (oldIndex !== newIndex) {
        const moved = arrayMove(colCards, oldIndex, newIndex);
        const rest = local.filter((c) => c.column !== activeCard.column);
        setLocal([...rest, ...moved]);
      }
      return;
    }

    // move across columns (optimistic)
    const fromCol = activeCard.column;
    const toCol = targetColumn;
    if (fromCol === toCol) return;

    setLocal(local.map((c) => (c.id === activeCard.id ? { ...c, column: toCol } : c)));

    try {
      await moveM.mutateAsync({ cardId: activeCard.id, toColumn: toCol });
      toast({
        kind: "success",
        title: "Moved",
        message: `${fromCol} → ${toCol}`,
        durationMs: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await moveM.mutateAsync({ cardId: activeCard.id, toColumn: fromCol });
              toast({ kind: "info", title: "Undone", message: `${toCol} → ${fromCol}` });
            } catch (e: any) {
              toast({ kind: "error", title: "Undo failed", message: e?.message });
            }
          },
        },
      });
    } catch (e: any) {
      toast({ kind: "error", title: "Move failed", message: e?.message });
      setLocal(q.data ?? null);
    }
  };

  const activeCard = local?.find((c) => c.id === activeId) ?? null;

  if (q.isLoading) {
    return <div className="text-slate-600 dark:text-slate-300">Loading board...</div>;
  }

  if (!columns) {
    return <div className="text-slate-600 dark:text-slate-300">No data</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Board</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Drag & Drop + Undo + Shortcuts
        </div>
      </div>

      <UiCard>
        <CardHeader>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Quick add</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Press <b>N</b> to focus • <b>Ctrl/⌘+Enter</b> to create
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onCreate)}
            className="flex flex-col md:flex-row items-stretch md:items-end gap-2"
          >
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Title
              </div>
              <Input
                id="quick-add"
                data-spotlight="quick-add"
                {...form.register("title")}
                placeholder="e.g. Implement login flow"
              />
              {form.formState.errors.title && (
                <div className="text-xs text-rose-700 mt-1">
                  {form.formState.errors.title.message}
                </div>
              )}
            </div>
            <Button id="quick-add-submit" type="submit" disabled={form.formState.isSubmitting}>
              Add
            </Button>
          </form>
        </CardContent>
      </UiCard>

      <UiCard>
        <CardContent className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">Shortcuts:</span>
          <span className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            N
          </span>
          <span>focus quick add</span>
          <span className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            J
          </span>
          <span>move left</span>
          <span className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            K
          </span>
          <span>move right</span>
          <span className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            ↑/↓
          </span>
          <span>select card</span>
          <span className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            Ctrl/⌘ + Enter
          </span>
          <span>create</span>
        </CardContent>
      </UiCard>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div id="todo">
            <ColumnView
              title="To do"
              id="todo"
              cards={columns.todo}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              disabled={moveM.isPending}
              onMoveLeft={(c) => moveViaButtons(c, "left")}
              onMoveRight={(c) => moveViaButtons(c, "right")}
            />
          </div>
          <div id="doing">
            <ColumnView
              title="Doing"
              id="doing"
              cards={columns.doing}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              disabled={moveM.isPending}
              onMoveLeft={(c) => moveViaButtons(c, "left")}
              onMoveRight={(c) => moveViaButtons(c, "right")}
            />
          </div>
          <div id="done">
            <ColumnView
              title="Done"
              id="done"
              cards={columns.done}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              disabled={moveM.isPending}
              onMoveLeft={(c) => moveViaButtons(c, "left")}
              onMoveRight={(c) => moveViaButtons(c, "right")}
            />
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-soft">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {activeCard.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dragging…</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
