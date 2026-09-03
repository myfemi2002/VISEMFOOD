function parseBooleanEnv(value: string | boolean | undefined, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readStringEnv(value: string | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export const ENABLE_MOCK_FALLBACK = parseBooleanEnv(import.meta.env.VITE_ENABLE_MOCK_FALLBACK, false);
export const SHOW_DEMO_CREDENTIALS = parseBooleanEnv(import.meta.env.VITE_SHOW_DEMO_CREDENTIALS, false);
export const DEFAULT_CURRENCY_CODE = readStringEnv(import.meta.env.VITE_DEFAULT_CURRENCY_CODE) || "USD";
export const DEFAULT_CURRENCY_LOCALE = readStringEnv(import.meta.env.VITE_DEFAULT_CURRENCY_LOCALE) || "en-US";

const demoEmail = readStringEnv(import.meta.env.VITE_DEMO_ADMIN_EMAIL);
const demoPassword = readStringEnv(import.meta.env.VITE_DEMO_ADMIN_PASSWORD);

export const DEMO_ADMIN_CREDENTIALS =
  SHOW_DEMO_CREDENTIALS && demoEmail !== "" && demoPassword !== ""
    ? {
        email: demoEmail,
        password: demoPassword,
      }
    : null;
