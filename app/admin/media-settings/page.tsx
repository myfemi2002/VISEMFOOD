import { saveMediaSettingsAction, testCloudinaryConnectionAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type MediaSettingsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminMediaSettingsPage({ searchParams }: MediaSettingsPageProps) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const params = await searchParams;
  const settingsQuery = prisma.mediaSetting.findUnique({ where: { provider: "cloudinary" } });
  const assetsQuery = prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 25 });
  const [settings, assets] = await Promise.all([
    settingsQuery.catch(() => null),
    assetsQuery.catch(() => [] as Awaited<typeof assetsQuery>)
  ]);

  return (
    <div className="space-y-6">
      {params.status ? (
        <div className={`rounded-2xl px-4 py-3 text-sm ${params.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {params.status === "success" ? "Cloudinary connected successfully." : "Cloudinary connection failed."}
        </div>
      ) : null}
      <form action={saveMediaSettingsAction} className="card grid gap-4 p-6 lg:grid-cols-2">
        <h2 className="font-display text-2xl text-ink lg:col-span-2">Cloudinary Settings</h2>
        <input name="cloudName" defaultValue={settings?.cloudName ?? ""} placeholder="Cloud name" required />
        <input name="apiKey" defaultValue={settings?.apiKey ?? ""} placeholder="API key" required />
        <input name="apiSecret" type="password" placeholder="API secret" required />
        <input name="uploadPreset" defaultValue={settings?.uploadPreset ?? ""} placeholder="Upload preset" />
        <input name="defaultFolder" defaultValue={settings?.defaultFolder ?? ""} placeholder="Default folder" />
        <div className="flex gap-6 lg:col-span-2">
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="secureUrls" defaultChecked={settings?.secureUrls ?? true} className="h-4 w-4" />
            Secure URLs
          </label>
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="isEnabled" defaultChecked={settings?.isEnabled ?? true} className="h-4 w-4" />
            Enabled
          </label>
        </div>
        <div className="flex gap-3 lg:col-span-2">
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save Settings</button>
          <button formAction={testCloudinaryConnectionAction} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-ink-soft">
            Test Connection
          </button>
        </div>
      </form>

      <section className="card p-6">
        <h2 className="font-display text-2xl text-ink">Upload Media Asset</h2>
        <form action="/api/admin/media/upload" method="post" encType="multipart/form-data" className="mt-5 grid gap-4 lg:grid-cols-2">
          <input name="file" type="file" required />
          <input name="altText" placeholder="Alt text" />
          <input name="folder" placeholder="Folder override" className="lg:col-span-2" />
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">Upload File</button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl text-ink">Recent Media Assets</h2>
        <div className="mt-5 space-y-3">
          {assets.map((asset: (typeof assets)[number]) => (
            <div key={asset.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink-soft">
              <p className="font-medium text-ink">{asset.publicId}</p>
              <p>{asset.secureUrl}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
