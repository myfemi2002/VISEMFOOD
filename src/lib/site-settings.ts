import type { OpeningHours, OpeningHoursDayKey, SiteMeta } from "@/lib/visemfood-api";

export const OPENING_HOURS_DAYS: Array<{ key: OpeningHoursDayKey; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function buildTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

export function buildWhatsAppHref(number: string, message?: string) {
  const normalized = number.replace(/\D+/g, "");

  if (!normalized) {
    return null;
  }

  const text = message?.trim();
  return text ? `https://wa.me/${normalized}?text=${encodeURIComponent(text)}` : `https://wa.me/${normalized}`;
}

export function getBusinessWhatsAppHref(siteMeta: SiteMeta, message?: string) {
  if (!siteMeta.whatsappOrderingEnabled) {
    return null;
  }

  const number = siteMeta.whatsappContactNumber || siteMeta.whatsappOrderNumber;
  return buildWhatsAppHref(number, message ?? siteMeta.whatsappOrderIntro);
}

export function getBusinessLocation(siteMeta: SiteMeta) {
  const locationParts = [siteMeta.city, siteMeta.stateRegion, siteMeta.country].filter(Boolean);
  const primary = siteMeta.address || locationParts.join(", ");
  const normalizedPrimary = primary.toLowerCase();
  const secondaryParts = locationParts.filter((part) => !normalizedPrimary.includes(part.toLowerCase()));
  const secondary = secondaryParts.join(", ");
  const full = [primary, secondary].filter(Boolean).join(", ") || siteMeta.address;

  return {
    primary: primary || "Business address pending",
    secondary,
    full: full || "Business address pending",
  };
}

function formatDisplayTime(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`1970-01-01T${value}:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
    .format(date)
    .toLowerCase();
}

export function getOpeningHoursRows(openingHours: OpeningHours) {
  return OPENING_HOURS_DAYS.map(({ key, label }) => {
    const entry = openingHours[key];
    const hours = entry?.isOpen
      ? `${formatDisplayTime(entry.opensAt)} - ${formatDisplayTime(entry.closesAt)}`
      : "Closed";

    return {
      key,
      label,
      hours,
      isOpen: Boolean(entry?.isOpen),
    };
  });
}
