import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Post } from "../../types";
import { postKeys } from "./types";

export const useGetPosts = () =>
  useQuery<Post[]>({
    queryKey: postKeys.all,
    queryFn: () => api.get<Post[]>("/posts"),
  });
