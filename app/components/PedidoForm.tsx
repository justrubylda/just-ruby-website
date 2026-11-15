"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { casas, emailLink, site, whatsappLink } from "../site";

// Formulário de pedido de disponibilidade.
// Não guarda nada: prepara a mensagem e abre o WhatsApp ou o email do hóspede.
export default function PedidoForm({
  casaInicial = "",
  tema = "escuro",
}: {
  casaInicial?: string;
  tema?: "escuro" | "claro";
}) {
  const id = useId();
  const [erro, setErro] = useState("");
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
    const chegada = String(dados.get("chegada") ?? "");
    const partida = String(dados.get("partida") ?? "");
    const hospedes = String(dados.get("hospedes") ?? "");
    const nome = String(dados.get("nome") ?? "").trim();
    const mensagem = String(dados.get("mensagem") ?? "").trim();

    const d = new Date();
    const hoje = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!casa) return setErro("Escolha o alojamento.");
    if (!chegada || !partida) return setErro("Indique as datas de chegada e de partida.");
    if (chegada < hoje) return setErro("A data de chegada já passou. Escolha uma data a partir de hoje.");
    if (partida <= chegada) return setErro("A data de partida tem de ser depois da data de chegada.");
    if (!hospedes || Number(hospedes) < 1) return setErro("Indique quantas pessoas vêm.");
    setErro("");

    const linhas = [
      `Olá! Gostaria de saber a disponibilidade ${casa.doNome}.`,
      "",
      `Chegada: ${dataPT(chegada)}`,
      `Partida: ${dataPT(partida)}`,
      `Hóspedes: ${hospedes}`,
    ];
    if (nome) linhas.push(`Nome: ${nome}`);
    if (mensagem) linhas.push("", mensagem);
    const texto = linhas.join("\n");

    if (via === "whatsapp" && site.whatsapp) {
      window.open(whatsappLink(texto), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = emailLink(`Disponibilidade ${casa.nome}`, texto);
    }
  }

  return (
    <form onSubmit={enviar} noValidate aria-describedby={`${id}-nota`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-casa`} className={rotulo}>
            Alojamento
          </label>
          <select id={`${id}-casa`} name="casa" defaultValue={casaInicial} className={campo} required>
            <option value="" disabled>
              Escolha um alojamento
            </option>
            {casas.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome} ({c.cidade})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-chegada`} className={rotulo}>
            Chegada
          </label>
          <input id={`${id}-chegada`} name="chegada" type="date" className={campo} required />
        </div>

        <div>
          <label htmlFor={`${id}-partida`} className={rotulo}>
            Partida
          </label>
          <input id={`${id}-partida`} name="partida" type="date" className={campo} required />
        </div>

        <div>
          <label htmlFor={`${id}-hospedes`} className={rotulo}>
            Número de pessoas
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
            O seu nome <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <input id={`${id}-nome`} name="nome" type="text" autoComplete="name" className={campo} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-mensagem`} className={rotulo}>
            Mensagem <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <textarea
            id={`${id}-mensagem`}
            name="mensagem"
            rows={3}
            placeholder="Por exemplo: vamos com crianças, ou chegamos tarde."
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
            Enviar pedido por WhatsApp
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
          Enviar pedido por email
        </button>
      </div>

      <p id={`${id}-nota`} className={`mt-4 text-sm ${escuro ? "text-nevoa/80" : "text-cinza"}`}>
        O pedido abre no seu {site.whatsapp ? "WhatsApp ou " : ""}email, já escrito, para
        confirmar antes de enviar. Respondemos com a disponibilidade e o preço. Os seus dados
        só servem para responder ao pedido (
        <Link href="/privacidade" className="underline underline-offset-2">
          política de privacidade
        </Link>
        ).
      </p>
    </form>
  );
}
