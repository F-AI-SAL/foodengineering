export type HealthResponse = {
  status: "ok" | "degraded" | "error";
  service: string;
  version?: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PagedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
