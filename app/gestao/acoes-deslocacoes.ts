"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "./lib/acesso";
import { lerFicheiro } from "./lib/ficheiros";
import { numero } from "./lib/importar";
import {
  atualizarDeslocacao,
  confirmarPropostas,
  criarDeslocacao,
  fecharMes,
  gerarPropostas,
  gravarParametros,
  importarMapas,
  lerParametros,
  marcarPago,
  mudarEstado,
  reabrirMes,
  type NovaDeslocacao,
} from "./lib/deslocacoes";
import { PESSOAS, percursoPara, type Destino, type Parametros, type Pessoa } from "./lib/deslocacoes-comum";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;
const n = (f: FormData, k: string) => numero(f.get(k)) ?? 0;
const pessoaDe = (f: FormData): Pessoa => {
  const p = String(f.get("pessoa") ?? "");
  if (!(PESSOAS as readonly string[]).includes(p)) throw new Error("Escolha o Bruno ou a Rúbia.");
  return p as Pessoa;
};
const mesDe = (f: FormData) => {
  const m = String(f.get("mes") ?? "");
  if (!/^\d{4}-\d{2}$/.test(m)) throw new Error("Mês inválido.");
  return m;
};
const voltar = (mes: string, msg?: string, erro?: boolean): never => {
  revalidatePath("/gestao", "layout");
  const q = new URLSearchParams({ mes });
  if (msg) q.set(erro ? "erro" : "msg", msg);
  redirect(`/gestao/deslocacoes?${q}`);
};
const tentar = async (mes: string, f: () => Promise<string | void>) => {
  let msg: string | void = undefined;
  try {
    msg = await f();
  } catch (e) {
    voltar(mes, (e as Error).message, true);
  }
  voltar(mes, msg || undefined);
};

function lerLinha(f: FormData): NovaDeslocacao {
  const data = String(f.get("data") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error("Falta a data.");
  const destino = txt(f, "destino");
  const percurso = txt(f, "percurso") ?? (destino ? percursoPara(destino) : null);
  if (!percurso) throw new Error("Falta o destino.");
  return {
    data,
    pessoa: pessoaDe(f),
    saida: txt(f, "saida"),
    regresso: txt(f, "regresso"),
    percurso,
    motivo: txt(f, "motivo") ?? "",
    matricula: txt(f, "matricula"),
    km: n(f, "km"),
    almocos: n(f, "almocos"),
    jantares: n(f, "jantares"),
    noites: n(f, "noites"),
    prova: txt(f, "prova"),
  };
}

export async function novaDeslocacaoAcao(f: FormData) {
  await exigirSessao();
  const mes = String(f.get("data") ?? "").slice(0, 7) || mesDe(f);
  await tentar(mes, async () => {
    const d = lerLinha(f);
    const p = await lerParametros();
    if (!d.matricula) d.matricula = p.pessoas[d.pessoa].matricula || null;
    await criarDeslocacao(d);
    return "Deslocação lançada.";
  });
}

export async function editarDeslocacaoAcao(f: FormData) {
  await exigirSessao();
  const id = Number(f.get("id"));
  const mes = String(f.get("data") ?? "").slice(0, 7);
  await tentar(mes, async () => {
    await atualizarDeslocacao(id, lerLinha(f));
    return "Deslocação guardada e confirmada.";
  });
}

export async function estadoDeslocacaoAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  const estado = String(f.get("estado")) as "Confirmada" | "Excluída" | "Proposta";
  await tentar(mes, async () => {
    await mudarEstado(Number(f.get("id")), estado);
  });
}

export async function gerarPropostasAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => {
    const r = await gerarPropostas(mes);
    return r.novas
      ? `${r.novas} proposta(s) criadas a partir das saídas de hóspedes.`
      : `Sem propostas novas (${r.jaExistiam} saída(s) já tinham deslocação).`;
  });
}

export async function confirmarTodasAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => `${await confirmarPropostas(mes, pessoaDe(f))} proposta(s) confirmadas.`);
}

export async function fecharMesAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => {
    await fecharMes(mes, pessoaDe(f));
    return "Mês fechado. O mapa já pode ser impresso e assinado.";
  });
}

export async function reabrirMesAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => {
    await reabrirMes(mes, pessoaDe(f));
    return "Mês reaberto.";
  });
}

export async function marcarPagoAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => {
    const mov = Number(f.get("movimento_id")) || null;
    const data = txt(f, "pago_em");
    await marcarPago(mes, pessoaDe(f), data, mov);
    return data ? "Pagamento registado." : "Pagamento retirado.";
  });
}

export async function importarMapasAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => {
    const ficheiro = f.get("ficheiro");
    if (!(ficheiro instanceof File) || !ficheiro.size) throw new Error("Escolha o ficheiro dos mapas.");
    const r = await importarMapas(lerFicheiro(Buffer.from(await ficheiro.arrayBuffer())));
    if (!r.ok) throw new Error(r.titulo);
    return [r.titulo, ...r.linhas].join(" ");
  });
}

export async function parametrosAcao(f: FormData) {
  await exigirSessao();
  const mes = mesDe(f);
  await tentar(mes, async () => {
    const atual = await lerParametros();
    const pct = (k: string) => n(f, k) / 100;
    const pessoas = { ...atual.pessoas };
    for (const p of PESSOAS) {
      pessoas[p] = {
        nome: txt(f, `${p}_nome`) ?? p,
        cargo: txt(f, `${p}_cargo`) ?? "",
        nif: txt(f, `${p}_nif`) ?? "",
        matricula: txt(f, `${p}_matricula`) ?? "",
      };
    }
    const destinos: Destino[] = atual.destinos.map((d, i) => ({
      ...d,
      destino: txt(f, `d${i}_destino`) ?? d.destino,
      km: n(f, `d${i}_km`),
      pessoa: (PESSOAS as readonly string[]).includes(String(f.get(`d${i}_pessoa`))) ? (String(f.get(`d${i}_pessoa`)) as Pessoa) : d.pessoa,
      motivo: txt(f, `d${i}_motivo`) ?? d.motivo,
      saida: txt(f, `d${i}_saida`) ?? "",
      regresso: txt(f, `d${i}_regresso`) ?? "",
      almocos: n(f, `d${i}_almocos`),
      jantares: n(f, `d${i}_jantares`),
    }));
    const p: Parametros = {
      ...atual,
      valorKm: n(f, "valorKm"),
      diaria: n(f, "diaria"),
      pctAlmoco: pct("pctAlmoco"),
      pctJantar: pct("pctJantar"),
      pctNoite: pct("pctNoite"),
      tributacao: pct("tributacao"),
      domicilio: txt(f, "domicilio") ?? "",
      referenciaAta: txt(f, "referenciaAta") ?? "",
      autoriza: (PESSOAS as readonly string[]).includes(String(f.get("autoriza"))) ? (String(f.get("autoriza")) as Pessoa) : atual.autoriza,
      pessoas,
      destinos,
    };
    await gravarParametros(p);
    return "Parâmetros guardados.";
  });
}
