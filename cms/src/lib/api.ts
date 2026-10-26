// Every call to the CMS API goes through here: same-origin cookie session, the
// X-CMS header on every request (the server refuses writes without it), and errors
// turned into ApiError with per-field messages for forms.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

const request = async <T>(method: string, url: string, body?: unknown): Promise<T> => {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${url}`, {
    method,
    credentials: "same-origin",
    headers: { "X-CMS": "1", ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}) },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({ error: `The server answered ${res.status}.` }));
  if (!res.ok) {
    const err = new ApiError(res.status, data.error ?? `Request failed (${res.status}).`, data.fields ?? {});
    // A lost session anywhere sends the user back to the login screen.
    if (res.status === 401 && url !== "/auth/login") window.dispatchEvent(new Event("cms:logged-out"));
    throw err;
  }
  return data as T;
};

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  put: <T>(url: string, body: unknown) => request<T>("PUT", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
