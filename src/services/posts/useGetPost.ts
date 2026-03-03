import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Post } from "../../types";
import { postKeys } from "./types";

export const useGetPost = (id: number) =>
  useQuery<Post>({
    queryKey: postKeys.detail(id),
    queryFn: () => api.get<Post>(`/posts/${id}`),
    enabled: id > 0,
  });
