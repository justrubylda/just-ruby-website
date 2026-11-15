import type { MetadataRoute } from "next";
import { casas, menu, site } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = menu.map((item) => ({
    url: `${site.url}${item.href === "/" ? "" : item.href}`,
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : item.href === "/alojamentos" ? 0.9 : 0.6,
  }));

  const alojamentos = casas.map((c) => ({
    url: `${site.url}/alojamentos/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.9,
    ...(c.fotos.length ? { images: c.fotos.map((f) => `${site.url}${f.src}`) } : {}),
  }));

  return [...paginas, ...alojamentos, { url: `${site.url}/privacidade`, priority: 0.2 }];
}
