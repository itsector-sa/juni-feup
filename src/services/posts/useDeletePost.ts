import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { postKeys } from "./types";

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};
