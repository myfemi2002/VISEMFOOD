import { saveSiteSettingsAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSiteSettingsPage() {
  await requireRole(["SUPER_ADMIN", "OPERATIONS_STAFF"]);
  const settingsQuery = prisma.siteSetting.findUnique({ where: { singletonKey: "default" } });
  const assetsQuery = prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const [settings, assets] = await Promise.all([
    settingsQuery.catch(() => null),
    assetsQuery.catch(() => [] as Awaited<typeof assetsQuery>)
  ]);

  return (
    <form action={saveSiteSettingsAction} className="card grid gap-4 p-6 lg:grid-cols-2">
      <h2 className="font-display text-2xl text-ink lg:col-span-2">Site Settings</h2>
      <input name="siteName" defaultValue={settings?.siteName ?? "VISEMFOOD"} placeholder="Site name" required />
      <input name="supportEmail" defaultValue={settings?.supportEmail ?? ""} placeholder="Support email" />
      <input name="supportPhone" defaultValue={settings?.supportPhone ?? ""} placeholder="Support phone" />
      <input name="whatsappNumber" defaultValue={settings?.whatsappNumber ?? ""} placeholder="WhatsApp number" />
      <input name="businessHours" defaultValue={settings?.businessHours ?? ""} placeholder="Business hours" />
      <input name="instagramUrl" defaultValue={settings?.instagramUrl ?? ""} placeholder="Instagram URL" />
      <input name="facebookUrl" defaultValue={settings?.facebookUrl ?? ""} placeholder="Facebook URL" />
      <input name="tiktokUrl" defaultValue={settings?.tiktokUrl ?? ""} placeholder="TikTok URL" />
      <textarea name="businessAddress" defaultValue={settings?.businessAddress ?? ""} placeholder="Business address" rows={4} className="lg:col-span-2" />
      <select name="logoMediaAssetId" defaultValue={settings?.logoMediaAssetId ?? ""}>
        <option value="">Logo asset</option>
        {assets.map((asset: (typeof assets)[number]) => (
          <option key={asset.id} value={asset.id}>
            {asset.publicId}
          </option>
        ))}
      </select>
      <select name="faviconMediaAssetId" defaultValue={settings?.faviconMediaAssetId ?? ""}>
        <option value="">Favicon asset</option>
        {assets.map((asset: (typeof assets)[number]) => (
          <option key={asset.id} value={asset.id}>
            {asset.publicId}
          </option>
        ))}
      </select>
      <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">Save Site Settings</button>
    </form>
  );
}
