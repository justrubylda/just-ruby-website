import "server-only";
import { garantirTabelas, gravarConfig, lerConfig, temBaseDados } from "@/app/gestao/lib/db";
import sitemap from "@/app/sitemap";
import { site } from "@/app/site";

// IndexNow: avisa o Bing (e os motores ligados a ele: DuckDuckGo, Copilot, Yandex...)
// de que o site mudou, para lerem as páginas logo, em vez de esperarem pela visita.
// O Google não usa o IndexNow; para ele há o Search Console e o sitemap.xml.
//
// A chave é pública por natureza: o Bing confirma-a no ficheiro public/<chave>.txt.
export const CHAVE_INDEXNOW = "e154ed0d9f37f053de98af3301e42f9f";

// Envia todas as páginas do mapa do site, mas só uma vez por cada publicação nova
// (a versão é o commit que a Vercel publicou). Só corre em produção.
export async function avisarIndexNow(): Promise<{ enviado: boolean; motivo?: string; paginas?: number }> {
  if (process.env.VERCEL_ENV !== "production") return { enviado: false, motivo: "não é produção" };
  const versao = process.env.VERCEL_GIT_COMMIT_SHA ?? "";
  const comBase = temBaseDados();
  if (comBase) await garantirTabelas();
  if (comBase && versao && (await lerConfig("indexnow_versao")) === versao) {
    return { enviado: false, motivo: "versão já enviada" };
  }

  const urls = sitemap().map((p) => p.url);
  const host = new URL(site.url).host;
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: CHAVE_INDEXNOW,
      keyLocation: `${site.url}/${CHAVE_INDEXNOW}.txt`,
      urlList: urls,
    }),
  });
  if (!r.ok) return { enviado: false, motivo: `IndexNow respondeu ${r.status}` };
  if (comBase && versao) await gravarConfig("indexnow_versao", versao);
  return { enviado: true, paginas: urls.length };
}
