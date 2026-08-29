import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { buildMeta } from "@/lib/meta";
import { useAdminAuth } from "@/contexts/admin-auth-context";

const loginSchema = z.object({
  email: z.email("Please enter a valid admin email."),
  password: z.string().min(6, "Please enter the admin password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  head: () =>
    buildMeta({
      title: "Admin Login | VISEMFOOD",
      description: "Sign in to the VISEMFOOD admin suite for orders, catalog, and catering operations.",
    }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isHydrated, login, demoCredentials } = useAdminAuth();
  const search = Route.useSearch() as Record<string, unknown>;
  const redirectTarget =
    typeof search.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : "/admin";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: demoCredentials.email,
      password: demoCredentials.password,
    },
  });

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || typeof window === "undefined") {
      return;
    }

    window.location.replace(redirectTarget);
  }, [isAuthenticated, isHydrated, redirectTarget]);

  const submit = form.handleSubmit(async (values) => {
    const result = await login(values);

    if (!result.ok) {
      form.setError("root", {
        type: "manual",
        message: result.error,
      });
      return;
    }

    toast.success("Admin access granted", {
      description: "Redirecting you into the VISEMFOOD operations suite.",
    });
    window.location.assign(redirectTarget);
  });

  return (
    <main className="section-gap">
      <div className="page-shell">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] xl:items-center">
          <section className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--vf-primary-light)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">
              <span className="material-symbols-rounded text-base">shield_lock</span>
              Protected Admin Access
            </div>

            <h1 className="heading-display mt-5 text-[3rem] font-bold leading-[1.04] text-[var(--vf-secondary)] sm:text-[3.8rem] lg:text-[4.6rem]">
              Login to the VISEMFOOD admin suite.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-soft sm:text-lg sm:leading-9">
              Access orders, catering inquiries, analytics, and menu controls from one refined operations dashboard.
            </p>

            <div className="mt-8 rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Seeded Admin Credentials</p>
              <div className="mt-4 space-y-3 text-sm text-[var(--vf-text)]">
                <p>
                  <span className="font-semibold text-[var(--vf-primary)]">Email:</span> {demoCredentials.email}
                </p>
                <p>
                  <span className="font-semibold text-[var(--vf-primary)]">Password:</span> {demoCredentials.password}
                </p>
              </div>
            </div>
          </section>

          <section className="card-surface p-6 sm:p-8 lg:p-10">
            <div className="max-w-lg">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">Admin Sign In</p>
              <h2 className="heading-display mt-3 text-4xl font-bold text-[var(--vf-text)]">Operations dashboard access</h2>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                Sign in with the seeded administrator account or your live admin credentials from the Laravel backend.
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="login-email">
                  Email Address
                </label>
                <input id="login-email" className="field" type="email" {...form.register("email")} />
                {form.formState.errors.email ? <p className="form-error mt-2">{form.formState.errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="login-password">
                  Password
                </label>
                <input id="login-password" className="field" type="password" {...form.register("password")} />
                {form.formState.errors.password ? <p className="form-error mt-2">{form.formState.errors.password.message}</p> : null}
              </div>

              {form.formState.errors.root ? (
                <div className="rounded-[var(--vf-radius-md)] border border-[color-mix(in_srgb,var(--vf-danger)_18%,white)] bg-[var(--vf-danger-soft)] px-4 py-3 text-sm text-[var(--vf-danger)]">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting || !isHydrated}
                  className="btn-primary w-full rounded-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  <span>{form.formState.isSubmitting ? "Signing In..." : "Enter Admin Suite"}</span>
                  <span className="material-symbols-rounded text-base">arrow_forward</span>
                </button>

                <Link to="/" className="btn-ghost w-full rounded-full border border-[var(--vf-border-soft)] sm:w-auto">
                  Back to Website
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
