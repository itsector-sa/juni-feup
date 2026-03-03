import { useState } from "react";
import type { Post } from "../../types";
import { api } from "../api";

// TODO: 1 - Refactor to use React Query for better caching.
export const useGetPosts = () => {
  const [data, setData] = useState<Post[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Post[]>("/posts");

      setData(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, fetch: handleFetch, loading };
};
