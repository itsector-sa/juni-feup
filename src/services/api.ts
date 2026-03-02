const BASE_URL = "https://jsonplaceholder.typicode.com";

export const api = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}${path}`).then((r) => r.json() as Promise<T>),

  post: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),

  put: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),

  delete: (path: string): Promise<void> =>
    fetch(`${BASE_URL}${path}`, { method: "DELETE" }).then(() => undefined),
};
