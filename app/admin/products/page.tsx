import { saveProductAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const productsQuery = prisma.product.findMany({
    include: {
      images: { include: { mediaAsset: true }, orderBy: [{ isPrimary: "desc" }] }
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }]
  });
  const categoriesQuery = prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
  const assetsQuery = prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 20 });

  const [products, categories, assets] = await Promise.all([
    productsQuery.catch(() => [] as Awaited<typeof productsQuery>),
    categoriesQuery.catch(() => [] as Awaited<typeof categoriesQuery>),
    assetsQuery.catch(() => [] as Awaited<typeof assetsQuery>)
  ]);

  const productForms = [{ id: "", name: "", slug: "", shortDescription: "", description: "", price: 0, currency: "NGN", servingSize: "", availabilityStatus: "IN_STOCK", isFeatured: false, isActive: true, sortOrder: 0, whatsappMessageTemplate: "", categoryId: categories[0]?.id ?? "", images: [] }, ...products];

  return (
    <div className="space-y-6">
      {productForms.map((product: (typeof productForms)[number], index) => (
        <form key={product.id || "new"} action={saveProductAction} className="card grid gap-4 p-6 lg:grid-cols-2">
          <input type="hidden" name="id" defaultValue={product.id} />
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-ink">{index === 0 ? "Create Product" : product.name}</h2>
          </div>
          <input name="name" placeholder="Product name" defaultValue={product.name} required />
          <input name="slug" placeholder="Slug" defaultValue={product.slug} required />
          <select name="categoryId" defaultValue={product.categoryId} required>
            {categories.map((category: (typeof categories)[number]) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input name="price" type="number" step="0.01" placeholder="Price" defaultValue={String(product.price)} required />
          <input name="servingSize" placeholder="Serving size" defaultValue={product.servingSize ?? ""} />
          <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={String(product.sortOrder)} />
          <textarea name="shortDescription" placeholder="Short description" rows={3} defaultValue={product.shortDescription} className="lg:col-span-2" />
          <textarea name="description" placeholder="Full description" rows={5} defaultValue={product.description} className="lg:col-span-2" />
          <select name="availabilityStatus" defaultValue={product.availabilityStatus}>
            <option value="IN_STOCK">In Stock</option>
            <option value="LIMITED">Limited</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
          <select name="imageId" defaultValue={product.images?.[0]?.mediaAssetId ?? ""}>
            <option value="">Select primary image</option>
            {assets.map((asset: (typeof assets)[number]) => (
              <option key={asset.id} value={asset.id}>
                {asset.publicId}
              </option>
            ))}
          </select>
          <textarea name="whatsappMessageTemplate" placeholder="WhatsApp message template override" rows={3} defaultValue={product.whatsappMessageTemplate ?? ""} className="lg:col-span-2" />
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} className="h-4 w-4" />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4" />
            Published
          </label>
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">
            {index === 0 ? "Create Product" : "Save Product"}
          </button>
        </form>
      ))}
    </div>
  );
}
