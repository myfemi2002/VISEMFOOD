type ApiMeta = Record<string, unknown>;

export type ApiValidationErrors = Record<string, string[]>;

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: ApiMeta;
  errors?: ApiValidationErrors;
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  requiresCsrf?: boolean;
};

const DEFAULT_API_BASE_URL = "http://localhost:8000";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  errors?: ApiValidationErrors;
  meta?: ApiMeta;

  constructor(
    message: string,
    options: {
      status?: number;
      errors?: ApiValidationErrors;
      meta?: ApiMeta;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 500;
    this.errors = options.errors;
    this.meta = options.meta;
  }
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isJsonLikeBody(body: ApiRequestOptions["body"]) {
  if (body == null) {
    return false;
  }

  return (
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  );
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const value = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return value ? decodeURIComponent(value) : null;
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

export async function ensureCsrfCookie() {
  const csrfUrl = buildUrl("/sanctum/csrf-cookie");
  const response = await fetch(csrfUrl, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Unable to prepare a secure admin session. Check backend/.env, make sure Laravel is serving from ${API_BASE_URL}, and verify Sanctum is allowed for your frontend origin.`,
      {
      status: response.status,
      },
    );
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers: providedHeaders, method = body ? "POST" : "GET", requiresCsrf = false, ...rest } = options;
  const headers = new Headers(providedHeaders);

  headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  let requestBody: BodyInit | undefined;
  if (body != null) {
    if (isJsonLikeBody(body)) {
      headers.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body as BodyInit;
    }
  }

  if (requiresCsrf) {
    if (!readCookie("XSRF-TOKEN")) {
      await ensureCsrfCookie();
    }

    const token = readCookie("XSRF-TOKEN");
    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      method,
      body: requestBody,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Unable to reach the VISEMFOOD API. Confirm the Laravel server is running and the frontend API URL is correct.",
      {
        status: 0,
      },
    );
  }

  if (response.status === 204) {
    return {
      data: undefined as T,
      message: "Request completed successfully.",
      meta: undefined as ApiMeta | undefined,
    };
  }

  const payload = await readEnvelope<T>(response);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || "The request could not be completed.", {
      status: response.status,
      errors: payload?.errors,
      meta: payload?.meta,
    });
  }

  return {
    data: (payload?.data ?? undefined) as T,
    message: payload?.message || "Request completed successfully.",
    meta: payload?.meta,
  };
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
