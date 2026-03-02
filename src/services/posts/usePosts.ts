import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Post } from "../../types";

export const postKeys = {
  all: ["posts"] as const,
  detail: (id: number) => ["posts", id] as const,
};

export const useGetPosts = () =>
  useQuery<Post[]>({
    queryKey: postKeys.all,
    queryFn: () => api.get<Post[]>("/posts"),
  });

export const useGetPost = (id: number) =>
  useQuery<Post>({
    queryKey: postKeys.detail(id),
    queryFn: () => api.get<Post>(`/posts/${id}`),
    enabled: id > 0,
  });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation<Post, Error, Omit<Post, "id">>({
    mutationFn: (data) => api.post<Post>("/posts", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation<Post, Error, Post>({
    mutationFn: (data) => api.put<Post>(`/posts/${data.id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};
