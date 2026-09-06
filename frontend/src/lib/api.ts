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

function getDefaultErrorMessage(status: number) {
  switch (status) {
    case 401:
      return "Authentication is required to continue.";
    case 403:
      return "You are not authorized to perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 419:
      return "Your secure session has expired. Please refresh and try again.";
    case 422:
      return "Validation failed.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return status >= 500 ? "An unexpected server error occurred." : "The request could not be completed.";
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
      `Unable to prepare a secure admin session. Check api/.env, make sure Laravel is serving from ${API_BASE_URL}, and verify Sanctum is allowed for your frontend origin.`,
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

  const attachCsrfHeader = async () => {
    if (!readCookie("XSRF-TOKEN")) {
      await ensureCsrfCookie();
    }

    const token = readCookie("XSRF-TOKEN");
    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
  };

  const sendRequest = async () => {
    if (requiresCsrf) {
      await attachCsrfHeader();
    }

    return fetch(buildUrl(path), {
      ...rest,
      method,
      body: requestBody,
      headers,
      credentials: "include",
    });
  };

  let response: Response;
  try {
    response = await sendRequest();
  } catch {
    throw new ApiError(
      "Unable to reach the VISEMFOOD API. Confirm the Laravel server is running and the frontend API URL is correct.",
      {
        status: 0,
      },
    );
  }

  if (response.status === 419 && requiresCsrf) {
    await ensureCsrfCookie();
    try {
      response = await sendRequest();
    } catch {
      throw new ApiError(
        "Unable to reach the VISEMFOOD API. Confirm the Laravel server is running and the frontend API URL is correct.",
        {
          status: 0,
        },
      );
    }
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
    throw new ApiError(payload?.message || getDefaultErrorMessage(response.status), {
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
    return error.message || getDefaultErrorMessage(error.status);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAuthenticationError(error: unknown) {
  return error instanceof ApiError && [401, 419].includes(error.status);
}

export function isAuthorizationError(error: unknown) {
  return error instanceof ApiError && error.status === 403;
}

export function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export function isValidationError(error: unknown) {
  return error instanceof ApiError && error.status === 422;
}

export function isRateLimitError(error: unknown) {
  return error instanceof ApiError && error.status === 429;
}

export function isServerError(error: unknown) {
  return error instanceof ApiError && error.status >= 500;
}

export function isNetworkError(error: unknown) {
  return error instanceof ApiError && error.status === 0;
}

export function getValidationMessages(error: unknown) {
  if (!isValidationError(error)) {
    return [];
  }

  const validationError = error as ApiError;

  if (!validationError.errors) {
    return [];
  }

  return Object.values(validationError.errors)
    .flat()
    .filter((message): message is string => typeof message === "string" && message.trim() !== "");
}






