import type { MetadataRoute } from "next";
import { codigo, linguas, paginas, rota, rotaCasa, type Lingua, type Pagina } from "./i18n";
import { casas, site } from "./site";
import { agendaRevistaEm } from "./zona";

// Mapa do site para o Google: cada página em português, inglês, espanhol e francês,
// com a indicação de quais são as versões nas outras línguas.
// As páginas com agenda (zona e "onde ficar") levam a data da última revisão,
// atualizada todas as semanas pela tarefa automática: assim o Google sabe que
// mudaram e volta a lê-las sem ser preciso pedir.
const abs = (caminho: string) => `${site.url}${caminho === "/" ? "" : caminho}`;

const COM_AGENDA: Pagina[] = ["zona", "tabuleiros", "castelo", "cnema"];

const PRIORIDADE: Record<Pagina, number> = {
  inicio: 1,
  alojamentos: 0.9,
  zona: 0.7,
  tabuleiros: 0.8,
  castelo: 0.8,
  cnema: 0.8,
  sobre: 0.6,
  galeria: 0.6,
  contactos: 0.6,
  privacidade: 0.2,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const versoes = (caminho: (l: Lingua) => string) => ({
    languages: Object.fromEntries(linguas.map((x) => [codigo[x], abs(caminho(x))])),
  });

  const lista: MetadataRoute.Sitemap = [];

  for (const p of paginas) {
    for (const l of linguas) {
      lista.push({
        url: abs(rota(l, p)),
        changeFrequency: p === "privacidade" ? "yearly" : COM_AGENDA.includes(p) ? "weekly" : "monthly",
        ...(COM_AGENDA.includes(p) ? { lastModified: agendaRevistaEm } : {}),
        priority: PRIORIDADE[p],
        alternates: versoes((x) => rota(x, p)),
      });
    }
  }

  for (const c of casas) {
    for (const l of linguas) {
      lista.push({
        url: abs(rotaCasa(l, c.slug)),
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: versoes((x) => rotaCasa(x, c.slug)),
        ...(c.fotos.length ? { images: c.fotos.map((f) => `${site.url}${f.src}`) } : {}),
      });
    }
  }

  return lista;
}
