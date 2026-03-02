import { useMutation } from "@tanstack/react-query";
import { useFetch } from "./useFetch";

export const useFetchAddPost = <TInput, TOutput>() => {
  const fetch = useFetch<TInput, TOutput>({
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
  });

  return useMutation<TOutput, unknown, TInput>({
    mutationFn: fetch,
  });
};
