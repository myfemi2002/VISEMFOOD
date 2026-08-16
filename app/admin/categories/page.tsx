import { saveCategoryAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const categoriesQuery = prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
  const assetsQuery = prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const [categories, assets] = await Promise.all([
    categoriesQuery.catch(() => [] as Awaited<typeof categoriesQuery>),
    assetsQuery.catch(() => [] as Awaited<typeof assetsQuery>)
  ]);

  return (
    <div className="space-y-6">
      {[{ id: "", name: "", slug: "", description: "", sortOrder: 0, isActive: true, imageId: "" }, ...categories].map((category: (typeof categories)[number] | { id: string; name: string; slug: string; description: string; sortOrder: number; isActive: boolean; imageId: string }, index) => (
        <form key={category.id || "new"} action={saveCategoryAction} className="card grid gap-4 p-6 lg:grid-cols-2">
          <input type="hidden" name="id" defaultValue={category.id} />
          <h2 className="font-display text-2xl text-ink lg:col-span-2">{index === 0 ? "Create Category" : category.name}</h2>
          <input name="name" placeholder="Category name" defaultValue={category.name} required />
          <input name="slug" placeholder="Slug" defaultValue={category.slug} required />
          <textarea name="description" placeholder="Description" rows={3} defaultValue={category.description ?? ""} className="lg:col-span-2" />
          <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={String(category.sortOrder)} />
          <select name="imageId" defaultValue={category.imageId ?? ""}>
            <option value="">Optional category image</option>
            {assets.map((asset: (typeof assets)[number]) => (
              <option key={asset.id} value={asset.id}>
                {asset.publicId}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-3 text-sm text-ink-soft lg:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="h-4 w-4" />
            Active
          </label>
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">
            {index === 0 ? "Create Category" : "Save Category"}
          </button>
        </form>
      ))}
    </div>
  );
}
