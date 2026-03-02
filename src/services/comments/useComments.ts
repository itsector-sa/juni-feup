import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Comment } from "../../types";

export const commentKeys = {
  all: ["comments"] as const,
  byPost: (postId: number) => ["comments", "post", postId] as const,
  detail: (id: number) => ["comments", id] as const,
};

export const useGetComments = (postId?: number) =>
  useQuery<Comment[]>({
    queryKey: postId ? commentKeys.byPost(postId) : commentKeys.all,
    queryFn: () =>
      postId
        ? api.get<Comment[]>(`/posts/${postId}/comments`)
        : api.get<Comment[]>("/comments"),
  });

export const useGetComment = (id: number) =>
  useQuery<Comment>({
    queryKey: commentKeys.detail(id),
    queryFn: () => api.get<Comment>(`/comments/${id}`),
    enabled: id > 0,
  });

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation<Comment, Error, Omit<Comment, "id">>({
    mutationFn: (data) => api.post<Comment>("/comments", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKeys.all }),
  });
};

export const useUpdateComment = () => {
  const qc = useQueryClient();
  return useMutation<Comment, Error, Comment>({
    mutationFn: (data) => api.put<Comment>(`/comments/${data.id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKeys.all }),
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/comments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKeys.all }),
  });
};
