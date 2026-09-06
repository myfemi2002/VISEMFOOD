import { DEFAULT_CURRENCY_CODE, DEFAULT_CURRENCY_LOCALE } from "@/lib/runtime-config";

type FormatCurrencyOptions = {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export function formatCurrency(value: number, options: FormatCurrencyOptions = {}) {
  const amount = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat(options.locale || DEFAULT_CURRENCY_LOCALE, {
    style: "currency",
    currency: options.currency || DEFAULT_CURRENCY_CODE,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  }).format(amount);
}
