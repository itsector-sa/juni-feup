type TUseFetchProps<TInput> = {
  body?: TInput;
  method?: string;
  url: string;
};

export const useFetch = <TInput, TOutput>({
  body,
  method = "GET",
  url,
}: TUseFetchProps<TInput>) => {
  return () =>
    fetch(url, { body: JSON.stringify(body), method })
      .then((response) => response.json())
      .then((data) => {
        return data as TOutput;
      });
};
