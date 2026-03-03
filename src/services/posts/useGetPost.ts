import { useState } from "react";
import type { Post } from "../../types";
import { api } from "../api";

export const useGetPost = (id: number) => {
  const [data, setData] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (id <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Post>(`/posts/${id}`);
      setData(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, fetch: handleFetch, loading };
};
