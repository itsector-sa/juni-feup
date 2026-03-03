import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Post } from "../../types";
import { postKeys } from "./types";

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation<Post, Error, Omit<Post, "id">>({
    mutationFn: (data) => api.post<Post>("/posts", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};
