import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorMessage, isApiError } from "@/lib/api";
import { buildMeta } from "@/lib/meta";
import { OPENING_HOURS_DAYS } from "@/lib/site-settings";
import {
  fetchAdminSiteSettings,
  type OpeningHours,
  type SiteMeta,
  type SiteSettingsUpdateInput,
  updateAdminSiteSettings,
} from "@/lib/visemfood-api";
import { useSiteData } from "@/contexts/site-data-context";

const hoursEntrySchema = z
  .object({
    isOpen: z.boolean(),
    opensAt: z.string(),
    closesAt: z.string(),
  })
  .superRefine((value, context) => {
    if (!value.isOpen) {
      return;
    }

    if (!value.opensAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Opening time is required when this day is open.",
        path: ["opensAt"],
      });
    }

    if (!value.closesAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Closing time is required when this day is open.",
        path: ["closesAt"],
      });
    }

    if (value.opensAt && value.closesAt && value.opensAt >= value.closesAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Closing time must be later than opening time.",
        path: ["closesAt"],
      });
    }
  });

const settingsSchema = z.object({
  name: z.string().min(2, "Business name is required.").max(150),
  tagline: z.string().max(190, "Tagline is too long."),
  email: z.union([z.literal(""), z.email("Please enter a valid business email.")]),
  phone: z.string().max(40, "Primary phone is too long."),
  secondaryPhone: z.string().max(40, "Secondary phone is too long."),
  whatsappNumber: z.string().max(20, "WhatsApp number is too long."),
  whatsappContactNumber: z.string().max(20, "Contact WhatsApp number is too long."),
  whatsappOrderingEnabled: z.boolean(),
  whatsappOrderIntro: z.string().max(255, "WhatsApp intro is too long."),
  address: z.string().max(5000, "Address is too long."),
  city: z.string().max(120, "City is too long."),
  stateRegion: z.string().max(120, "State / region is too long."),
  country: z.string().max(120, "Country is too long."),
  openingHours: z.object({
    monday: hoursEntrySchema,
    tuesday: hoursEntrySchema,
    wednesday: hoursEntrySchema,
    thursday: hoursEntrySchema,
    friday: hoursEntrySchema,
    saturday: hoursEntrySchema,
    sunday: hoursEntrySchema,
  }),
  deliveryInformation: z.string().max(10000, "Delivery information is too long."),
  checkoutNotice: z.string().max(10000, "Checkout notice is too long."),
  socialLinks: z.object({
    instagram: z.union([z.literal(""), z.url("Enter a valid Instagram URL.")]),
    facebook: z.union([z.literal(""), z.url("Enter a valid Facebook URL.")]),
    tiktok: z.union([z.literal(""), z.url("Enter a valid TikTok URL.")]),
    youtube: z.union([z.literal(""), z.url("Enter a valid YouTube URL.")]),
  }),
  seoDefaultTitle: z.string().max(160, "SEO title is too long."),
  seoDefaultDescription: z.string().max(320, "SEO description is too long."),
  defaultShareImageUrl: z.union([z.literal(""), z.url("Enter a valid image URL.")]),
  currencyCode: z.literal("USD"),
  currencySymbol: z.literal("$"),
  currencyLocale: z.literal("en-US"),
});

type SiteSettingsFormValues = z.infer<typeof settingsSchema>;

function emptyOpeningHours(): OpeningHours {
  return {
    monday: { isOpen: false, opensAt: "", closesAt: "" },
    tuesday: { isOpen: false, opensAt: "", closesAt: "" },
    wednesday: { isOpen: false, opensAt: "", closesAt: "" },
    thursday: { isOpen: false, opensAt: "", closesAt: "" },
    friday: { isOpen: false, opensAt: "", closesAt: "" },
    saturday: { isOpen: false, opensAt: "", closesAt: "" },
    sunday: { isOpen: false, opensAt: "", closesAt: "" },
  };
}

function toFormValues(settings: SiteMeta): SiteSettingsFormValues {
  return {
    name: settings.name,
    tagline: settings.tagline,
    email: settings.email,
    phone: settings.phone,
    secondaryPhone: settings.secondaryPhone,
    whatsappNumber: settings.whatsappOrderNumber,
    whatsappContactNumber: settings.whatsappContactNumber,
    whatsappOrderingEnabled: settings.whatsappOrderingEnabled,
    whatsappOrderIntro: settings.whatsappOrderIntro,
    address: settings.address,
    city: settings.city,
    stateRegion: settings.stateRegion,
    country: settings.country,
    openingHours: settings.openingHours,
    deliveryInformation: settings.deliveryInformation,
    checkoutNotice: settings.checkoutNotice,
    socialLinks: {
      instagram: settings.socialLinks.instagram,
      facebook: settings.socialLinks.facebook,
      tiktok: settings.socialLinks.tiktok,
      youtube: settings.socialLinks.youtube,
    },
    seoDefaultTitle: settings.seoDefaultTitle,
    seoDefaultDescription: settings.seoDefaultDescription,
    defaultShareImageUrl: settings.defaultShareImageUrl,
    currencyCode: "USD",
    currencySymbol: "$",
    currencyLocale: "en-US",
  };
}

function buildPayload(values: SiteSettingsFormValues): SiteSettingsUpdateInput {
  return values;
}

function toFieldPath(field: string): string {
  return field
    .replace(/^business_name$/, "name")
    .replace(/^tagline$/, "tagline")
    .replace(/^support_email$/, "email")
    .replace(/^support_phone$/, "phone")
    .replace(/^secondary_phone$/, "secondaryPhone")
    .replace(/^whatsapp_order_number$/, "whatsappNumber")
    .replace(/^whatsapp_contact_number$/, "whatsappContactNumber")
    .replace(/^whatsapp_ordering_enabled$/, "whatsappOrderingEnabled")
    .replace(/^whatsapp_order_intro$/, "whatsappOrderIntro")
    .replace(/^business_address$/, "address")
    .replace(/^city$/, "city")
    .replace(/^state_region$/, "stateRegion")
    .replace(/^country$/, "country")
    .replace(/^delivery_information$/, "deliveryInformation")
    .replace(/^checkout_notice$/, "checkoutNotice")
    .replace(/^seo_default_title$/, "seoDefaultTitle")
    .replace(/^seo_default_description$/, "seoDefaultDescription")
    .replace(/^default_share_image_url$/, "defaultShareImageUrl")
    .replace(/^currency_code$/, "currencyCode")
    .replace(/^currency_symbol$/, "currencySymbol")
    .replace(/^currency_locale$/, "currencyLocale")
    .replace(/^social_links\./, "socialLinks.")
    .replace(/^opening_hours\./, "openingHours.")
    .replace(/\.is_open/g, ".isOpen")
    .replace(/\.opens_at/g, ".opensAt")
    .replace(/\.closes_at/g, ".closesAt");
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)] sm:p-7">
      <div className="max-w-2xl">
        <h2 className="text-lg font-bold text-[var(--vf-text)] sm:text-xl">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-soft">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export const Route = createFileRoute("/admin/settings")({
  head: () =>
    buildMeta({
      title: "Site Settings | VISEMFOOD Admin",
      description: "Manage public business details, WhatsApp, opening hours, social links, and global defaults.",
    }),
  component: AdminSiteSettingsPage,
});

function AdminSiteSettingsPage() {
  const { refresh: refreshSiteData } = useSiteData();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "VISEMFOOD",
      tagline: "",
      email: "",
      phone: "",
      secondaryPhone: "",
      whatsappNumber: "",
      whatsappContactNumber: "",
      whatsappOrderingEnabled: true,
      whatsappOrderIntro: "",
      address: "",
      city: "",
      stateRegion: "",
      country: "",
      openingHours: emptyOpeningHours(),
      deliveryInformation: "",
      checkoutNotice: "",
      socialLinks: {
        instagram: "",
        facebook: "",
        tiktok: "",
        youtube: "",
      },
      seoDefaultTitle: "",
      seoDefaultDescription: "",
      defaultShareImageUrl: "",
      currencyCode: "USD",
      currencySymbol: "$",
      currencyLocale: "en-US",
    },
  });

  async function loadSettings() {
    setIsLoading(true);

    try {
      const settings = await fetchAdminSiteSettings();
      form.reset(toFormValues(settings));
      setLastSavedAt(settings.updatedAt ?? null);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load site settings right now."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await updateAdminSiteSettings(buildPayload(values));
      form.reset(toFormValues(result.settings));
      setLastSavedAt(result.settings.updatedAt ?? new Date().toISOString());
      await refreshSiteData();
      toast.success("Settings saved", {
        description: result.message,
      });
    } catch (error) {
      if (isApiError(error) && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const path = toFieldPath(field);
          const message = messages[0];

          if (!message) {
            return;
          }

          form.setError(path as never, {
            type: "server",
            message,
          });
        });
      }

      toast.error("Unable to save settings", {
        description: getErrorMessage(error, "Please review the form and try again."),
      });
    }
  });

  const isSaving = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <section className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Public Business Controls</p>
            <h1 className="heading-display mt-2 text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">
              Site Settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-soft sm:text-base">
              Update the business information, WhatsApp contact points, opening hours, social links, and global defaults that power the public VISEMFOOD website.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-2 text-xs font-medium text-[var(--vf-text-soft)]">
              {lastSavedAt ? `Last updated ${new Date(lastSavedAt).toLocaleString("en-US")}` : "Not saved yet"}
            </div>
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="btn-ghost rounded-full border border-[var(--vf-border-soft)] px-5"
              disabled={isLoading || isSaving}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              className="btn-primary rounded-full px-6"
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </section>

      {loadError ? (
        <section className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-danger)]/20 bg-[var(--vf-danger-soft)] p-5 text-sm text-[var(--vf-danger)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Unable to load site settings.</p>
              <p className="mt-1 text-sm opacity-90">{loadError}</p>
            </div>
            <button type="button" onClick={() => void loadSettings()} className="btn-secondary rounded-full px-5">
              Retry
            </button>
          </div>
        </section>
      ) : null}

      <form onSubmit={submit} className="space-y-6">
        <SettingsSection
          title="Business Information"
          description="These details feed the footer, contact page, and other public hospitality touchpoints."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Business Name" error={form.formState.errors.name?.message}>
              <input className="field" {...form.register("name")} placeholder="VISEMFOOD" />
            </Field>
            <Field label="Tagline" error={form.formState.errors.tagline?.message}>
              <input className="field" {...form.register("tagline")} placeholder="Authentic African Food" />
            </Field>
            <Field label="Business Email" error={form.formState.errors.email?.message}>
              <input className="field" type="email" {...form.register("email")} placeholder="hello@visemfood.com" />
            </Field>
            <Field label="Primary Phone" error={form.formState.errors.phone?.message}>
              <input className="field" {...form.register("phone")} placeholder="+1 555 123 4567" />
            </Field>
            <Field label="Secondary Phone" error={form.formState.errors.secondaryPhone?.message}>
              <input className="field" {...form.register("secondaryPhone")} placeholder="+1 555 123 8900" />
            </Field>
            <Field label="Street Address" error={form.formState.errors.address?.message}>
              <input className="field" {...form.register("address")} placeholder="1458 Heritage Avenue" />
            </Field>
            <Field label="City" error={form.formState.errors.city?.message}>
              <input className="field" {...form.register("city")} placeholder="Houston" />
            </Field>
            <Field label="State / Region" error={form.formState.errors.stateRegion?.message}>
              <input className="field" {...form.register("stateRegion")} placeholder="Texas" />
            </Field>
            <Field label="Country" error={form.formState.errors.country?.message}>
              <input className="field" {...form.register("country")} placeholder="United States" />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Contact & WhatsApp"
          description="Use a clean international WhatsApp number so public links and later checkout flows are reliable."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="WhatsApp Number" error={form.formState.errors.whatsappNumber?.message}>
              <input className="field" {...form.register("whatsappNumber")} placeholder="15557654321" />
              <p className="mt-2 text-xs text-[var(--vf-text-soft)]">Store numbers in international format with country code.</p>
            </Field>
            <Field label="WhatsApp Contact Override" error={form.formState.errors.whatsappContactNumber?.message}>
              <input className="field" {...form.register("whatsappContactNumber")} placeholder="15557654321" />
              <p className="mt-2 text-xs text-[var(--vf-text-soft)]">Optional if support and order conversations use different numbers.</p>
            </Field>
          </div>

          <div className="mt-5 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--vf-text)]">WhatsApp Ordering Enabled</p>
                <p className="mt-1 text-sm text-soft">Controls whether public WhatsApp business actions are shown.</p>
              </div>
              <input type="checkbox" className="h-5 w-5 accent-[var(--vf-primary)]" {...form.register("whatsappOrderingEnabled")} />
            </label>
          </div>

          <div className="mt-5">
            <Field label="Default WhatsApp Intro" error={form.formState.errors.whatsappOrderIntro?.message}>
              <textarea
                className="textarea-field"
                rows={3}
                {...form.register("whatsappOrderIntro")}
                placeholder="Hello VISEMFOOD, I would like to place an order."
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Opening Hours"
          description="Set a structured weekly schedule. Public pages will render these saved hours directly."
        >
          <div className="space-y-4">
            {OPENING_HOURS_DAYS.map((day) => {
              const entry = form.watch(`openingHours.${day.key}`);
              const dayError = form.formState.errors.openingHours?.[day.key];

              return (
                <div
                  key={day.key}
                  className="grid gap-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4 md:grid-cols-[minmax(0,0.9fr)_auto_1fr_1fr]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--vf-text)]">{day.label}</p>
                    <p className="mt-1 text-xs text-soft">{entry?.isOpen ? "Open for service" : "Closed"}</p>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--vf-text)]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--vf-primary)]"
                      {...form.register(`openingHours.${day.key}.isOpen`)}
                    />
                    Open
                  </label>

                  <Field
                    label="Opens"
                    error={dayError?.opensAt?.message ?? dayError?.message}
                    compact
                  >
                    <input
                      type="time"
                      className="field"
                      disabled={!entry?.isOpen}
                      {...form.register(`openingHours.${day.key}.opensAt`)}
                    />
                  </Field>

                  <Field
                    label="Closes"
                    error={dayError?.closesAt?.message}
                    compact
                  >
                    <input
                      type="time"
                      className="field"
                      disabled={!entry?.isOpen}
                      {...form.register(`openingHours.${day.key}.closesAt`)}
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Social Media"
          description="Only populated social links will appear publicly."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Instagram" error={form.formState.errors.socialLinks?.instagram?.message}>
              <input className="field" {...form.register("socialLinks.instagram")} placeholder="https://instagram.com/visemfood" />
            </Field>
            <Field label="Facebook" error={form.formState.errors.socialLinks?.facebook?.message}>
              <input className="field" {...form.register("socialLinks.facebook")} placeholder="https://facebook.com/visemfood" />
            </Field>
            <Field label="TikTok" error={form.formState.errors.socialLinks?.tiktok?.message}>
              <input className="field" {...form.register("socialLinks.tiktok")} placeholder="https://tiktok.com/@visemfood" />
            </Field>
            <Field label="YouTube" error={form.formState.errors.socialLinks?.youtube?.message}>
              <input className="field" {...form.register("socialLinks.youtube")} placeholder="https://youtube.com/@visemfood" />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="SEO"
          description="These are global defaults for the brand. They stay lightweight in Phase 2 and do not replace page-specific SEO later."
        >
          <div className="grid gap-5">
            <Field label="Default Site Title" error={form.formState.errors.seoDefaultTitle?.message}>
              <input className="field" {...form.register("seoDefaultTitle")} placeholder="VISEMFOOD | Premium African Catering Platform" />
            </Field>
            <Field label="Default Meta Description" error={form.formState.errors.seoDefaultDescription?.message}>
              <textarea className="textarea-field" rows={4} {...form.register("seoDefaultDescription")} placeholder="Premium African catering, trays, bowls, coolers, and warm hospitality for gatherings of every size." />
            </Field>
            <Field label="Default Social Share Image URL" error={form.formState.errors.defaultShareImageUrl?.message}>
              <input className="field" {...form.register("defaultShareImageUrl")} placeholder="https://..." />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Operations Messaging"
          description="These short supporting messages are reused across public ordering and contact experiences."
        >
          <div className="grid gap-5">
            <Field label="Delivery Information" error={form.formState.errors.deliveryInformation?.message}>
              <textarea className="textarea-field" rows={4} {...form.register("deliveryInformation")} placeholder="Pickup and delivery are available based on order size and schedule confirmation." />
            </Field>
            <Field label="Checkout Notice" error={form.formState.errors.checkoutNotice?.message}>
              <textarea className="textarea-field" rows={4} {...form.register("checkoutNotice")} placeholder="You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team." />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Currency"
          description="Phase 2 keeps the VISEMFOOD platform locked to USD only. This is intentionally visible but not freely editable."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Currency Code">
              <input className="field bg-[var(--vf-surface-muted)]" disabled {...form.register("currencyCode")} />
            </Field>
            <Field label="Currency Symbol">
              <input className="field bg-[var(--vf-surface-muted)]" disabled {...form.register("currencySymbol")} />
            </Field>
            <Field label="Locale">
              <input className="field bg-[var(--vf-surface-muted)]" disabled {...form.register("currencyLocale")} />
            </Field>
          </div>
        </SettingsSection>

        <div className="flex flex-col gap-3 rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-5 shadow-[var(--vf-shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-soft">
            Saving here updates the public VISEMFOOD settings source used by the footer, contact page, and related hospitality surfaces.
          </p>
          <button type="submit" className="btn-primary rounded-full px-6" disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Site Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  compact = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div>
      <label className={`block font-semibold text-[var(--vf-text-soft)] ${compact ? "mb-2 text-xs uppercase tracking-[0.16em]" : "mb-2 text-sm"}`}>
        {label}
      </label>
      {children}
      {error ? <p className="form-error mt-2">{error}</p> : null}
    </div>
  );
}
