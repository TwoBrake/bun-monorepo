/** The data required to construct a set of metadata. */
interface MetadataConstructor {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
}

/**
 * Constructs a set of metadata information.
 * @param param0 The data to set.
 * @param param0.title The title.
 * @param param0.description The description.
 * @param param0.keywords The keywords.
 * @param param0.image The image.
 *
 * @returns The metadata structure.
 */
export const seo = ({
  title,
  description,
  keywords,
  image,
}: MetadataConstructor): Record<string, unknown>[] => [
  { title },
  { content: description, name: "description" },
  { content: keywords, name: "keywords" },
  { content: title, name: "twitter:title" },
  { content: description, name: "twitter:description" },
  { content: "@tannerlinsley", name: "twitter:creator" },
  { content: "@tannerlinsley", name: "twitter:site" },
  { content: "website", name: "og:type" },
  { content: title, name: "og:title" },
  { content: description, name: "og:description" },
  ...(image
    ? [
        { content: image, name: "twitter:image" },
        { content: "summary_large_image", name: "twitter:card" },
        { content: image, name: "og:image" },
      ]
    : []),
];
