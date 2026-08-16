import { ProductCard } from "@/components/site/product-card";
import { getCategories, getProducts, getWhatsAppSettings } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type OrderNowProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function OrderNowPage({ searchParams }: OrderNowProps) {
  const params = await searchParams;
  const [categories, products, whatsapp] = await Promise.all([
    getCategories(),
    getProducts(params.q, params.category),
    getWhatsAppSettings()
  ]);

  return (
    <div className="space-y-10">
      <section className="card p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Order Now</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Browse meals like a modern food catalog.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-soft">
          Select your meal, review the details, and complete confirmation and arrangement on WhatsApp with the VISEMFOOD team.
        </p>
        <form className="mt-8 grid gap-4 rounded-3xl bg-surface-muted p-5 lg:grid-cols-[2fr,1fr,auto]">
          <input name="q" defaultValue={params.q} placeholder="Search products" />
          <select name="category" defaultValue={params.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category: (typeof categories)[number]) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Filter</button>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {products.map((product: (typeof products)[number]) => (
          <ProductCard
            key={product.id}
            slug={product.slug}
            name={product.name}
            shortDescription={product.shortDescription}
            price={product.price}
            categoryName={product.categoryName}
            availabilityStatus={product.availabilityStatus}
            image={product.image}
            whatsappUrl={buildWhatsAppUrl({
              phoneNumber: whatsapp.adminPhoneNumber,
              template: product.whatsappMessageTemplate || whatsapp.defaultOrderMessage,
              name: product.name,
              price: `NGN ${product.price}`
            })}
          />
        ))}
      </div>
    </div>
  );
}
