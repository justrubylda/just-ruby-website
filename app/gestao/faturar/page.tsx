import Link from "next/link";
import { marcarFatura } from "../acoes";
import { exigirSessao } from "../lib/acesso";
import {
  CENTRALGEST_VENDAS,
  artigoCentralGest,
  calcular,
  dataPT,
  descricaoFatura,
  eur,
  hojeISO,
  numPT,
  precoSemIva,
} from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos, listarReservas } from "../lib/reservas";
import Copiar from "../componentes/Copiar";
import { SelectAuto } from "../componentes/Filtros";
import { SemBaseDados, Titulo, botao, botaoSec, campo, cartao } from "../componentes/ui";

export default async function Faturar({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const hoje = hojeISO();
  const ano = sp.ano ?? hoje.slice(0, 4);
  const [todas, als] = await Promise.all([listarReservas(), listarAlojamentos()]);
  const pendentes = todas
    .map((r) => ({ r, c: calcular(r, hoje) }))
    .filter(({ r, c }) => c.estado === "Por faturar" && (ano === "Todos" || r.checkin?.slice(0, 4) === ano));
  const anos = [...new Set(todas.map((r) => r.checkin?.slice(0, 4)).filter(Boolean) as string[])].sort().reverse();
  const soma = pendentes.reduce((s, x) => s + (x.r.total ?? 0), 0);

  return (
    <div>
      <Titulo sub={`${pendentes.length} estadia(s) já terminadas sem nº de fatura · ${eur(soma)}`}>Por faturar</Titulo>
      <form className="mb-5 max-w-xs">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={["Todos", ...anos].map((a) => ({ valor: a, texto: a }))} />
      </form>
      <div className="mb-5 max-w-3xl space-y-3 text-sm text-cinza">
        <p>
          Para cada estadia: no CentralGest Cloud, em <strong>Clientes → Vendas → Novo</strong>, escolha{" "}
          <strong>Fatura-Recibo</strong> (série FR 2.1), cole os campos abaixo e finalize. Depois escreva aqui o número da
          fatura.
        </p>
        <a href={CENTRALGEST_VENDAS} target="_blank" rel="noopener noreferrer" className={`${botaoSec} inline-block`}>
          Abrir o CentralGest ↗
        </a>
      </div>
      {pendentes.length === 0 && <p className="text-cinza">Nada por faturar. 🎉</p>}
      <ul className="space-y-4">
        {pendentes.map(({ r, c }) => {
          const desc = descricaoFatura(r, als);
          const art = artigoCentralGest(r.al);
          const preco = precoSemIva(r);
          const nif = (r.nif ?? "").replace(/\s/g, "") || "999999990";
          const nome = r.nif ? r.hospede || "" : r.hospede || "Consumidor Final";
          return (
            <li key={r.id} className={cartao}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/gestao/reservas/${r.id}?voltar=/gestao/faturar`} className="font-semibold hover:underline">
                  {r.hospede || "—"}
                </Link>
                <span className="text-lg font-bold tabular-nums">{c.faltaValor ? <span className="text-[#7a4b00]">falta valor</span> : eur(r.total)}</span>
              </div>
              <p className="text-xs text-cinza">
                {dataPT(r.checkin)} → {dataPT(r.checkout)} · {c.noites} noite(s) · {r.al} · {r.plataforma}
                {r.cod_reserva && ` · ${r.cod_reserva}`}
              </p>
              <dl className="mt-3 divide-y divide-black/5 rounded-md border border-black/5 text-sm">
                <CampoCG rotulo="Tipo" valor="Fatura-Recibo (FR 2.1)" />
                <CampoCG rotulo="NIF" valor={nif} copiar={nif} />
                <CampoCG rotulo="Nome" valor={nome} copiar={nome} />
                {r.morada && <CampoCG rotulo="Morada" valor={r.morada} copiar={r.morada} />}
                <CampoCG rotulo="Artigo" valor={`${art.codigo} · ${art.nome}`} copiar={art.codigo} />
                <CampoCG rotulo="Descrição da linha" valor={desc || "Sem texto: escolha o alojamento da reserva."} copiar={desc} />
                <CampoCG rotulo="Qtd." valor="1" />
                <CampoCG
                  rotulo="Preço s/ IVA"
                  valor={preco == null ? "falta valor" : numPT(preco, 4)}
                  copiar={preco == null ? "" : numPT(preco, 4)}
                />
                <CampoCG rotulo="IVA" valor={`${Math.round(r.taxa_iva * 100)} % · ${eur(c.iva)}`} />
                <CampoCG rotulo="Total a confirmar" valor={eur(r.total)} forte />
              </dl>
              <form action={marcarFatura} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={r.id} />
                <label className="w-full min-w-0 sm:w-auto sm:flex-1">
                  <span className="sr-only">Nº da fatura</span>
                  <input name="fatura" placeholder="Nº da fatura (ex.: FR 2.1/80)" className={campo} />
                </label>
                <button className={botao}>Guardar nº</button>
                <button name="sem" value="1" className={botaoSec}>
                  Sem fatura
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CampoCG({ rotulo, valor, copiar, forte }: { rotulo: string; valor: string; copiar?: string; forte?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <dt className="w-28 shrink-0 text-xs text-cinza sm:w-36">{rotulo}</dt>
      <dd className={`min-w-0 flex-1 break-words ${forte ? "font-bold tabular-nums" : ""}`}>{valor || "—"}</dd>
      {copiar !== undefined && <Copiar texto={copiar} />}
    </div>
  );
}
