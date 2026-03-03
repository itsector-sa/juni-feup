import type { Post } from "@/types";
import { useState } from "react";
import { api } from "../api";

// TODO: 3 - Refactor to use React Query for better caching.
export const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: Omit<Post, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<Post>("/posts", data);
      return res;
    } catch (e) {
      setError((e as Error).message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { create, error, loading };
};
