import type { Post } from "@/types";
import { useState } from "react";
import { api } from "../api";

// TODO: 4 - Refactor to use React Query for better caching.
export const useUpdatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (data: Post) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put<Post>(`/posts/${data.id}`, data);
      return res;
    } catch (e) {
      setError((e as Error).message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, update };
};
