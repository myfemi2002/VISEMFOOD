import { saveTrayPackageAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminTraysCoolersPage() {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const packagesQuery = prisma.trayPackage.findMany({
    include: { images: { orderBy: { isPrimary: "desc" } } },
    orderBy: { sortOrder: "asc" }
  });
  const assetsQuery = prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const bulkInquiriesQuery = prisma.bulkOrderInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  const [packages, assets, bulkInquiries] = await Promise.all([
    packagesQuery.catch(() => [] as Awaited<typeof packagesQuery>),
    assetsQuery.catch(() => [] as Awaited<typeof assetsQuery>),
    bulkInquiriesQuery.catch(() => [] as Awaited<typeof bulkInquiriesQuery>)
  ]);

  return (
    <div className="space-y-8">
      {[{ id: "", name: "", slug: "", shortDescription: "", description: "", price: 0, currency: "NGN", servingRange: "", packageType: "Tray", whatsappMessageTemplate: "", isFeatured: false, isActive: true, sortOrder: 0, images: [] }, ...packages].map((trayPackage: (typeof packages)[number] | { id: string; name: string; slug: string; shortDescription: string; description: string; price: number; currency: string; servingRange: string; packageType: string; whatsappMessageTemplate: string; isFeatured: boolean; isActive: boolean; sortOrder: number; images: never[] }, index) => (
        <form key={trayPackage.id || "new"} action={saveTrayPackageAction} className="card grid gap-4 p-6 lg:grid-cols-2">
          <input type="hidden" name="id" defaultValue={trayPackage.id} />
          <h2 className="font-display text-2xl text-ink lg:col-span-2">{index === 0 ? "Create Tray / Cooler Package" : trayPackage.name}</h2>
          <input name="name" placeholder="Package name" defaultValue={trayPackage.name} required />
          <input name="slug" placeholder="Slug" defaultValue={trayPackage.slug} required />
          <input name="servingRange" placeholder="Serving range" defaultValue={trayPackage.servingRange} required />
          <input name="packageType" placeholder="Package type" defaultValue={trayPackage.packageType} required />
          <input name="price" type="number" step="0.01" placeholder="Price" defaultValue={String(trayPackage.price)} required />
          <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={String(trayPackage.sortOrder)} />
          <textarea name="shortDescription" placeholder="Short description" rows={3} defaultValue={trayPackage.shortDescription} className="lg:col-span-2" />
          <textarea name="description" placeholder="Full description" rows={5} defaultValue={trayPackage.description} className="lg:col-span-2" />
          <select name="imageId" defaultValue={trayPackage.images?.[0]?.mediaAssetId ?? ""}>
            <option value="">Select primary image</option>
            {assets.map((asset: (typeof assets)[number]) => (
              <option key={asset.id} value={asset.id}>
                {asset.publicId}
              </option>
            ))}
          </select>
          <textarea name="whatsappMessageTemplate" placeholder="WhatsApp message template override" rows={3} defaultValue={trayPackage.whatsappMessageTemplate ?? ""} />
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="isFeatured" defaultChecked={trayPackage.isFeatured} className="h-4 w-4" />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="isActive" defaultChecked={trayPackage.isActive} className="h-4 w-4" />
            Published
          </label>
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">
            {index === 0 ? "Create Package" : "Save Package"}
          </button>
        </form>
      ))}

      <section className="card p-6">
        <h2 className="font-display text-2xl text-ink">Recent Bulk Requests</h2>
        <div className="mt-5 space-y-3">
          {bulkInquiries.map((item: (typeof bulkInquiries)[number]) => (
            <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink-soft">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{item.fullName}</span>
                <span>{item.status.replaceAll("_", " ")}</span>
              </div>
              <p className="mt-1">{item.phone}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
