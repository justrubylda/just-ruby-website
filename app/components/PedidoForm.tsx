"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Ocupacao } from "../lib/disponibilidade";
import { escolherDatas, formulario, rota, type Lingua } from "../i18n";
import { euros, orcamento, type TabelaPrecos } from "../lib/orcamento";
import { casasEm, emailLink, site, whatsappLink } from "../site";
import { useDatasPartilhadas } from "./DatasPartilhadas";
import EscolherDatas, { ResumoPreco } from "./EscolherDatas";

// Formulário de pedido de disponibilidade.
// Prepara a mensagem e abre o WhatsApp ou o email do hóspede. Uma cópia do pedido
// fica registada na área de gestão (/gestao/pedidos) para não se perder nenhum.
export default function PedidoForm({
  casaInicial = "",
  tema = "escuro",
  ocupado = {},
  precos = {},
  l = "pt",
}: {
  casaInicial?: string;
  tema?: "escuro" | "claro";
  ocupado?: Ocupacao; // noites ocupadas (Airbnb, Booking e bloqueios do site), por casa
  precos?: Record<string, TabelaPrecos>; // preços por noite definidos na gestão, por casa
  l?: Lingua;
}) {
  const id = useId();
  const t = formulario[l];
  const te = escolherDatas[l];
  const casas = casasEm(l);
  const [erro, setErro] = useState("");
  const [casaEscolhida, setCasaEscolhida] = useState(casaInicial);
  const [chegadaLocal, setChegadaLocal] = useState("");
  const [partidaLocal, setPartidaLocal] = useState("");
  // Na página da casa as datas escolhem-se no calendário grande da página.
  const daPagina = useDatasPartilhadas();
  const chegada = daPagina ? daPagina.chegada : chegadaLocal;
  const partida = daPagina ? daPagina.partida : partidaLocal;
  const mudarDatas = (c: string, p: string) => {
    if (daPagina) daPagina.mudar(c, p);
    else {
      setChegadaLocal(c);
      setPartidaLocal(p);
    }
    setErro("");
  };
  const escuro = tema === "escuro";

  const campo = `mt-2 block w-full rounded-sm border px-3 py-3 text-base ${
    escuro
      ? "border-white/25 bg-white/5 text-white [color-scheme:dark] placeholder:text-white/40"
      : "border-xisto/25 bg-white text-xisto placeholder:text-cinza/70"
  }`;
  const rotulo = `block text-sm font-semibold ${escuro ? "text-white" : "text-xisto"}`;

  const dataPT = (iso: string) => iso.split("-").reverse().join("/");

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    const via = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "email";

    const casa = casas.find((c) => c.slug === dados.get("casa"));
    const hospedes = String(dados.get("hospedes") ?? "");
    const nome = String(dados.get("nome") ?? "").trim();
    const mensagem = String(dados.get("mensagem") ?? "").trim();

    const d = new Date();
    const hoje = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!casa) return setErro(t.erroCasa);
    if (!chegada || !partida) return setErro(t.erroDatas);
    if (chegada < hoje) return setErro(t.erroPassado);
    if (partida <= chegada) return setErro(t.erroOrdem);
    const reservado = (ocupado[casa.slug] ?? []).some((i) => chegada < i.fim && partida > i.inicio);
    if (reservado)
      return setErro(t.erroOcupado);
    if (!hospedes || Number(hospedes) < 1) return setErro(t.erroPessoas);
    setErro("");

    const linhas = [
      t.ola(casa.doNome),
      "",
      `${t.lChegada}: ${dataPT(chegada)}`,
      `${t.lPartida}: ${dataPT(partida)}`,
      `${t.lHospedes}: ${hospedes}`,
    ];
    const orc = orcamento(precos[casa.slug], chegada, partida);
    if (orc) {
      linhas.push(`${te.lEstadia} (${te.noites(orc.noites)}): ${euros(orc.estadia, l)}`);
      if (orc.limpeza > 0) linhas.push(`${te.limpeza}: ${euros(orc.limpeza, l)}`);
      linhas.push(`${te.lPreco}: ${euros(orc.total, l)}`);
    }
    if (nome) linhas.push(`${t.lNome}: ${nome}`);
    if (mensagem) linhas.push("", mensagem);
    const texto = linhas.join("\n");

    // Regista o pedido na área de gestão (não bloqueia nem atrasa o envio).
    try {
      fetch("/api/pedidos", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          casa: casa.slug,
          chegada,
          partida,
          hospedes,
          nome,
          mensagem,
          via,
          site: String(dados.get("site_web") ?? ""),
        }),
      }).catch(() => {});
    } catch {
      /* sem rede: o pedido segue na mesma por email/WhatsApp */
    }

    if (via === "whatsapp" && site.whatsapp) {
      window.open(whatsappLink(texto), "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(emailLink(t.assunto(casa.nome), texto));
    }
  }

  return (
    <form onSubmit={enviar} noValidate aria-describedby={`${id}-nota`}>
      {/* Campo-armadilha para robôs: escondido das pessoas e dos leitores de ecrã. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          {t.naoPreencher}
          <input name="site_web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {daPagina ? (
          // Na página da casa, a casa já está escolhida.
          <input type="hidden" name="casa" value={casaEscolhida} />
        ) : (
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-casa`} className={rotulo}>
              {t.alojamento}
            </label>
            <select
              id={`${id}-casa`}
              name="casa"
              value={casaEscolhida}
              onChange={(e) => {
                setCasaEscolhida(e.target.value);
                mudarDatas("", "");
              }}
              className={campo}
              required
            >
              <option value="" disabled>
                {t.escolha}
              </option>
              {casas.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome} ({c.cidade})
                </option>
              ))}
            </select>
          </div>
        )}

        <fieldset className="sm:col-span-2">
          <legend className={rotulo}>{te.titulo}</legend>
          <input type="hidden" name="chegada" value={chegada} />
          <input type="hidden" name="partida" value={partida} />
          <div className="mt-3">
            {daPagina ? (
              <ResumoDatas
                chegada={chegada}
                partida={partida}
                precos={precos[casaEscolhida]}
                l={l}
                escuro={escuro}
              />
            ) : casaEscolhida ? (
              <EscolherDatas
                key={casaEscolhida}
                l={l}
                escuro={escuro}
                ocupado={ocupado[casaEscolhida] ?? []}
                precos={precos[casaEscolhida]}
                chegada={chegada}
                partida={partida}
                onChange={mudarDatas}
              />
            ) : (
              <p className={`text-sm ${escuro ? "text-nevoa/80" : "text-cinza"}`}>{te.escolhaCasa}</p>
            )}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${id}-hospedes`} className={rotulo}>
            {t.pessoas}
          </label>
          <input
            id={`${id}-hospedes`}
            name="hospedes"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            defaultValue={2}
            className={campo}
            required
          />
        </div>

        <div>
          <label htmlFor={`${id}-nome`} className={rotulo}>
            {t.nome} <span className="font-normal opacity-70">{t.opcional}</span>
          </label>
          <input id={`${id}-nome`} name="nome" type="text" autoComplete="name" className={campo} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-mensagem`} className={rotulo}>
            {t.mensagem} <span className="font-normal opacity-70">{t.opcional}</span>
          </label>
          <textarea
            id={`${id}-mensagem`}
            name="mensagem"
            rows={3}
            placeholder={t.exemplo}
            className={campo}
          />
        </div>
      </div>

      {erro && (
        <p role="alert" className={`mt-5 text-sm font-semibold ${escuro ? "text-ouro-claro" : "text-[#9a2b1f]"}`}>
          {erro}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {site.whatsapp && (
          <button
            type="submit"
            value="whatsapp"
            className="rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto transition-colors hover:bg-ouro-claro"
          >
            {t.porWhatsapp}
          </button>
        )}
        <button
          type="submit"
          value="email"
          className={
            site.whatsapp
              ? `rounded-sm border px-6 py-3.5 font-semibold transition-colors ${
                  escuro
                    ? "border-ouro text-ouro-claro hover:bg-ouro hover:text-preto"
                    : "border-ouro-escuro text-ouro-escuro hover:bg-ouro hover:text-preto"
                }`
              : "rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto transition-colors hover:bg-ouro-claro"
          }
        >
          {t.porEmail}
        </button>
      </div>

      <p id={`${id}-nota`} className={`mt-4 text-sm ${escuro ? "text-nevoa/80" : "text-cinza"}`}>
        {t.notaAntes(Boolean(site.whatsapp))}
        <Link href={rota(l, "privacidade")} className="underline underline-offset-2">
          {t.notaLink}
        </Link>
        {t.notaDepois}
      </p>
    </form>
  );
}

/** Na página da casa: as duas datas escolhidas no calendário e o total, como no cartão do Airbnb. */
function ResumoDatas({
  chegada,
  partida,
  precos,
  l,
  escuro,
}: {
  chegada: string;
  partida: string;
  precos?: TabelaPrecos;
  l: Lingua;
  escuro: boolean;
}) {
  const t = formulario[l];
  const te = escolherDatas[l];
  const data = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");
  const orc = orcamento(precos, chegada, partida);
  const caixa = `block px-3 py-2.5 ${escuro ? "text-white" : "text-xisto"}`;
  return (
    <>
      <a
        href="#disponibilidade"
        className={`grid grid-cols-2 rounded-sm border transition-colors ${
          escuro ? "border-white/25 hover:border-ouro" : "border-xisto/25 bg-white hover:border-ouro-escuro"
        }`}
      >
        <span className={caixa}>
          <span className="block text-xs font-semibold">{t.chegada}</span>
          <span className={chegada ? "" : "text-cinza"}>{data(chegada) || te.escolher}</span>
        </span>
        <span className={`${caixa} border-l ${escuro ? "border-white/25" : "border-xisto/25"}`}>
          <span className="block text-xs font-semibold">{t.partida}</span>
          <span className={partida ? "" : "text-cinza"}>{data(partida) || te.escolher}</span>
        </span>
      </a>
      {orc ? (
        <ResumoPreco orc={orc} l={l} escuro={escuro} />
      ) : (
        <p className={`mt-2 text-sm ${escuro ? "text-nevoa/80" : "text-cinza"}`}>{te.noCalendario}</p>
      )}
    </>
  );
}
