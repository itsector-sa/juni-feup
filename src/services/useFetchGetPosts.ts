import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";

export const useFetchGetPosts = <TInput, TOutput>() => {
  const fetch = useFetch<TInput, TOutput[]>({
    url: "https://jsonplaceholder.typicode.com/posts",
  });

  return useQuery<TOutput[]>({
    queryKey: ["posts"],
    queryFn: fetch,
  });
};
