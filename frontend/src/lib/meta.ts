type MetaInput = {
  title: string;
  description: string;
  image?: string;
};

export function buildMeta(input: MetaInput) {
  return {
    meta: [
      { title: input.title },
      { name: "description", content: input.description },
      { property: "og:title", content: input.title },
      { property: "og:description", content: input.description },
      ...(input.image ? [{ property: "og:image", content: input.image }] : []),
    ],
  };
}
