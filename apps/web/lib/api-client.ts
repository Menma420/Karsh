export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
      // Don't throw error to avoid console pollution during the redirect flip
      return {} as T;
    }

    const errorMsg = data?.error?.message || `HTTP ${res.status} error`;
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    err.code = data?.error?.code;
    err.details = data?.error?.details || data?.errors;
    throw err;
  }

  return data as T;
}
