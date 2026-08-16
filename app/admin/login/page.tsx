import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loginAction } from "@/app/admin/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  const params = await searchParams;

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="card w-full max-w-lg p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Admin Access</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Login to VISEMFOOD</h1>
        <p className="mt-3 text-sm text-ink-soft">Use your admin email and password to manage content, orders, and settings.</p>
        {params.error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">Invalid credentials or inactive account.</p>
        ) : null}
        <form action={loginAction} className="mt-8 space-y-4">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
