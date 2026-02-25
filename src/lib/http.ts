const githubPages = import.meta.env.GITHUB_PAGES;

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(import.meta.env.PROD ? `/juni-feup${path}` : path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Request failed (${res.status})`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}
