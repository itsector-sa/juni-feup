export const postKeys = {
  all: ["posts"] as const,
  detail: (id: number) => ["posts", id] as const,
};
