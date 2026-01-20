export const AUTH_TOKEN_KEY = "auth_token";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? null;
}

export function getAuthHeaders() {
  const token = getAuthToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  return headers;
}
