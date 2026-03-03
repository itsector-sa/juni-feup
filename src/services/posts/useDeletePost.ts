import { useState } from "react";
import { api } from "../api";

// TODO: 5 - Refactor to use React Query for better caching.
export const useDeletePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/posts/${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, remove };
};
