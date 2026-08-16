import { saveHomepageSectionAction, saveWebsitePageAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const sectionsQuery = prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  const pagesQuery = prisma.websitePage.findMany({ orderBy: { title: "asc" } });
  const assetsQuery = prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const [sections, pages, assets] = await Promise.all([
    sectionsQuery.catch(() => [] as Awaited<typeof sectionsQuery>),
    pagesQuery.catch(() => [] as Awaited<typeof pagesQuery>),
    assetsQuery.catch(() => [] as Awaited<typeof assetsQuery>)
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <h2 className="font-display text-3xl text-ink">Homepage Sections</h2>
        {sections.map((section: (typeof sections)[number]) => (
          <form key={section.id} action={saveHomepageSectionAction} className="card grid gap-4 p-6 lg:grid-cols-2">
            <input type="hidden" name="id" value={section.id} />
            <input name="sectionKey" defaultValue={section.sectionKey} placeholder="Section key" required />
            <input name="title" defaultValue={section.title} placeholder="Title" required />
            <input name="subtitle" defaultValue={section.subtitle ?? ""} placeholder="Subtitle" />
            <input name="sortOrder" type="number" defaultValue={String(section.sortOrder)} placeholder="Sort order" />
            <textarea name="body" defaultValue={section.body ?? ""} placeholder="Body" rows={4} className="lg:col-span-2" />
            <input name="buttonText" defaultValue={section.buttonText ?? ""} placeholder="Button text" />
            <input name="buttonLink" defaultValue={section.buttonLink ?? ""} placeholder="Button link" />
            <select name="mediaAssetId" defaultValue={section.mediaAssetId ?? ""} className="lg:col-span-2">
              <option value="">Optional image</option>
              {assets.map((asset: (typeof assets)[number]) => (
                <option key={asset.id} value={asset.id}>
                  {asset.publicId}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-3 text-sm text-ink-soft lg:col-span-2">
              <input type="checkbox" name="isActive" defaultChecked={section.isActive} className="h-4 w-4" />
              Visible
            </label>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">Save Section</button>
          </form>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl text-ink">Core Pages</h2>
        {pages.map((page: (typeof pages)[number]) => (
          <form key={page.id} action={saveWebsitePageAction} className="card grid gap-4 p-6 lg:grid-cols-2">
            <input type="hidden" name="id" value={page.id} />
            <input name="title" defaultValue={page.title} placeholder="Title" required />
            <input name="slug" defaultValue={page.slug} placeholder="Slug" required />
            <input name="pageType" defaultValue={page.pageType} placeholder="Page type" required />
            <input name="heroTitle" defaultValue={page.heroTitle ?? ""} placeholder="Hero title" />
            <input name="heroSubtitle" defaultValue={page.heroSubtitle ?? ""} placeholder="Hero subtitle" className="lg:col-span-2" />
            <textarea name="bodyContent" defaultValue={page.bodyContent ?? ""} placeholder="Body content" rows={6} className="lg:col-span-2" />
            <input name="metaTitle" defaultValue={page.metaTitle ?? ""} placeholder="Meta title" />
            <input name="metaDescription" defaultValue={page.metaDescription ?? ""} placeholder="Meta description" />
            <label className="flex items-center gap-3 text-sm text-ink-soft lg:col-span-2">
              <input type="checkbox" name="isPublished" defaultChecked={page.isPublished} className="h-4 w-4" />
              Published
            </label>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">Save Page</button>
          </form>
        ))}
      </section>
    </div>
  );
}
