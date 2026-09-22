const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === "true";

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (SKIP_AUTH) headers["x-dev-user"] = "true";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}
