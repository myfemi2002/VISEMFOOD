import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { getErrorMessage } from "@/lib/api";
import { buildMeta } from "@/lib/meta";
import {
  fallbackCategories,
  fallbackProducts,
  fetchAdminCategories,
  fetchAdminProducts,
  getProductTone,
  type Category,
  type Product,
} from "@/lib/visemfood-api";

export const Route = createFileRoute("/admin/catalog")({
  head: () =>
    buildMeta({
      title: "Catalog | VISEMFOOD Admin",
      description: "Catalog and inventory screen backed by the live VISEMFOOD admin API.",
    }),
  component: CatalogAdminPage,
});

function CatalogAdminPage() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const result = await fetchAdminCategories({ perPage: 100 });

        if (!cancelled) {
          setCategories(result.items);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(nextError, "Unable to load categories right now."));
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const result = await fetchAdminProducts({
          categoryId: categoryId === "all" ? undefined : categoryId,
          status: status === "all" ? undefined : status,
          search: search.trim() || undefined,
          perPage: 100,
        });

        if (!cancelled) {
          setProducts(result.items);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(nextError, "Unable to load catalog records right now."));
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryId, search, status]);

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Admin"
        title="Product catalog & inventory"
        body="Monitor live product availability, categories and pricing without leaving the VISEMFOOD admin suite."
        as="h1"
      />

      {error ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          {error}
        </div>
      ) : null}

      <div className="card-surface space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_220px_220px]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
              <span className="material-symbols-rounded text-xl">search</span>
            </span>
            <input
              className="field pl-12"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, descriptions or slugs"
              aria-label="Search catalog"
            />
          </label>

          <label className="relative block">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="select-field appearance-none pr-12"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
              <span className="material-symbols-rounded">expand_more</span>
            </span>
          </label>

          <label className="relative block">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="select-field appearance-none pr-12"
              aria-label="Filter by publication status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
              <span className="material-symbols-rounded">expand_more</span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatusChip tone="olive">{products.length} catalog items</StatusChip>
          <StatusChip tone="neutral">
            {products.filter((item) => item.availability === "Available").length} available for order
          </StatusChip>
          <StatusChip tone="warning">
            {products.filter((item) => item.availability === "Limited").length} limited batches
          </StatusChip>
          <StatusChip tone="danger">
            {products.filter((item) => item.availability === "Sold Out").length} unavailable
          </StatusChip>
        </div>
      </div>

      <DataTable
        rows={products}
        columns={[
          {
            key: "name",
            header: "Product",
            cell: (row) => (
              <div className="flex items-center gap-3">
                <img
                  src={row.image}
                  alt={row.name}
                  className="h-12 w-12 rounded-[var(--vf-radius-sm)] object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-[var(--vf-text)]">{row.name}</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">{row.slug}</p>
                </div>
              </div>
            ),
          },
          {
            key: "category",
            header: "Category",
            cell: (row) => (
              <div>
                <p className="font-medium text-[var(--vf-text)]">{row.category}</p>
                <p className="text-xs text-soft">{formatProductType(row.productType)}</p>
              </div>
            ),
          },
          {
            key: "price",
            header: "Price",
            cell: (row) => (
              <div>
                <p className="font-semibold text-[var(--vf-text)]">NGN {row.price.toLocaleString()}</p>
                <p className="text-xs text-soft">{row.servingSize}</p>
              </div>
            ),
          },
          {
            key: "availability",
            header: "Availability",
            cell: (row) => <StatusChip tone={getProductTone(row.availability)}>{row.availability}</StatusChip>,
          },
          {
            key: "featured",
            header: "Featured",
            cell: (row) =>
              row.featured ? (
                <StatusChip tone="olive">Featured</StatusChip>
              ) : (
                <span className="text-sm text-[var(--vf-text-soft)]">Standard</span>
              ),
          },
        ]}
      />
    </section>
  );
}

function formatProductType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
