import { Hero } from "@/components/site/hero";
import { getPageContent } from "@/lib/data";

export default async function OurStoryPage() {
  const content = await getPageContent("ourStory");

  return (
    <div className="space-y-10">
      <Hero title={content.heroTitle || "Our Story"} subtitle="Our Story" body={content.heroSubtitle || ""} />
      <section className="card p-8">
        <h2 className="font-display text-3xl text-ink">Premium hospitality with rooted identity.</h2>
        <p className="mt-5 max-w-4xl text-sm leading-8 text-ink-soft">{content.bodyContent}</p>
      </section>
    </div>
  );
}
