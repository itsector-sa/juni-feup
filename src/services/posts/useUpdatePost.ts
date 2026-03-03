import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Post } from "../../types";
import { postKeys } from "./types";

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation<Post, Error, Post>({
    mutationFn: (data) => api.put<Post>(`/posts/${data.id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};
