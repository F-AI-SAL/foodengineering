import { getAuthHeaders } from "./auth";

const apiBase = process.env.NEXT_PUBLIC_API_URL;
if (!apiBase) {
  throw new Error("NEXT_PUBLIC_API_URL is required.");
}

export const API_BASE = apiBase;

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function apiFetchPage<T>(
  path: string,
  options: RequestInit = {},
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<T>> {
  const separator = path.includes("?") ? "&" : "?";
  return apiFetch<PaginatedResponse<T>>(
    `${path}${separator}page=${page}&pageSize=${pageSize}`,
    options
  );
}

export async function apiFetchList<T>(
  path: string,
  options: RequestInit = {},
  page = 1,
  pageSize = 100
): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await apiFetchPage<T>(path, options, page, pageSize);
  return response.data;
}

export async function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function publicFetchList<T>(
  path: string,
  options: RequestInit = {},
  page = 1,
  pageSize = 100
): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await publicFetchPage<T>(path, options, page, pageSize);
  return response.data;
}

export async function publicFetchPage<T>(
  path: string,
  options: RequestInit = {},
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<T>> {
  const separator = path.includes("?") ? "&" : "?";
  return publicFetch<PaginatedResponse<T>>(
    `${path}${separator}page=${page}&pageSize=${pageSize}`,
    options
  );
}
