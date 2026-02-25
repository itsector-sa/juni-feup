import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCard, fetchBoard, moveCard } from "./api";

export function useBoardQuery(projectId: string) {
  return useQuery({ queryKey: ["board", projectId], queryFn: () => fetchBoard(projectId) });
}

export function useCreateCard(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: unknown) => createCard(projectId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board", projectId] }),
  });
}

export function useMoveCard(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, toColumn }: { cardId: string; toColumn: "todo" | "doing" | "done" }) =>
      moveCard(cardId, toColumn),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board", projectId] }),
  });
}
