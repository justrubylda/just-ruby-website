"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { ativarDigital, entrarComDigital, opcoesAtivarDigital, opcoesDigital, reporComDigital } from "../acoes";
import { botao, campo, rotulo } from "./ui";

// Impressão digital / rosto do aparelho (chaves de acesso). O aparelho pede a confirmação;
// o site só recebe uma assinatura, nunca a impressão digital.

const MINIMO = 8;

function mensagemErro(e: unknown, aAtivar = false) {
  const nome = e instanceof Error ? e.name : "";
  if (nome === "NotAllowedError" || nome === "AbortError") return "Cancelado ou demorou demasiado. Tente outra vez.";
  if (aAtivar && nome === "InvalidStateError") return "Este aparelho já está ativado.";
  return "Não foi possível usar a impressão digital neste aparelho.";
}

const semSubscricao = () => () => {};

/** null no servidor; no navegador, se permite chaves de acesso. */
function useSuporte(): boolean | null {
  return useSyncExternalStore(semSubscricao, browserSupportsWebAuthn, () => null);
}

const nomeDoAparelho = () => {
  const ua = navigator.userAgent;
  return /iPhone|Android.*Mobile/i.test(ua) ? "Telemóvel" : /iPad|Android/i.test(ua) ? "Tablet" : "Computador";
};

function Erro({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <p role="alert" className="text-sm font-semibold text-[#8a2b1f]">
      {texto}
    </p>
  );
}

const IconeDigital = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 11v3a6 6 0 0 1-1.5 4" />
    <path d="M8.5 9.5A3.5 3.5 0 0 1 15.5 10v2.5c0 2-.5 4-1.6 5.6" />
    <path d="M5.6 7.5A7.5 7.5 0 0 1 19.5 11v1.5c0 1.6-.2 3.1-.7 4.5" />
    <path d="M5 11v1.5c0 1.3-.3 2.6-.8 3.7" />
    <path d="M8.2 4.6A9 9 0 0 1 17 5" />
  </svg>
);

/** Botão "Entrar com impressão digital" (página de entrada). */
export function EntrarDigital() {
  const suporta = useSuporte();
  const [erro, setErro] = useState<string | null>(null);
  const [aEntrar, iniciar] = useTransition();
  if (suporta === false) return null;

  function entrar() {
    setErro(null);
    iniciar(async () => {
      try {
        const opcoes = await opcoesDigital();
        if (!opcoes) return setErro("Falta ligar a base de dados.");
        const resposta = await startAuthentication({ optionsJSON: opcoes });
        const r = await entrarComDigital(resposta);
        if (r?.erro) setErro(r.erro);
      } catch (e) {
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
        setErro(mensagemErro(e));
      }
    });
  }

  return (
    <div className="mt-5 space-y-3">
      <button type="button" onClick={entrar} disabled={aEntrar || suporta === null} className={`${botao} w-full`}>
        <IconeDigital />
        {aEntrar ? "A confirmar…" : "Entrar com impressão digital"}
      </button>
      <Erro texto={erro} />
    </div>
  );
}

/** "Esqueci-me da palavra-passe": palavra-passe nova confirmada com a impressão digital. */
export function ReporDigital() {
  const suporta = useSuporte();
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, iniciar] = useTransition();

  function gravar(form: FormData) {
    const nova = String(form.get("nova") ?? "");
    const repetida = String(form.get("repetir") ?? "");
    setErro(null);
    if (nova.length < MINIMO) return setErro(`A palavra-passe nova tem de ter pelo menos ${MINIMO} caracteres.`);
    if (nova !== repetida) return setErro("As duas palavras-passe novas não são iguais.");
    iniciar(async () => {
      try {
        const opcoes = await opcoesDigital();
        if (!opcoes) return setErro("Falta ligar a base de dados.");
        const resposta = await startAuthentication({ optionsJSON: opcoes });
        const r = await reporComDigital(resposta, nova, repetida);
        if (r?.erro) setErro(r.erro);
      } catch (e) {
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
        setErro(mensagemErro(e));
      }
    });
  }

  if (suporta === false)
    return <p className="mt-4 text-sm">Este navegador não permite a impressão digital. Use o aparelho onde a ativou.</p>;

  return (
    <form action={gravar} className="mt-5 space-y-4">
      <div>
        <label htmlFor="nova" className={rotulo}>
          Palavra-passe nova
        </label>
        <input id="nova" name="nova" type="password" autoComplete="new-password" minLength={MINIMO} required className={campo} />
        <p className="mt-1 text-xs text-cinza">Pelo menos {MINIMO} caracteres.</p>
      </div>
      <div>
        <label htmlFor="repetir" className={rotulo}>
          Repetir a palavra-passe nova
        </label>
        <input id="repetir" name="repetir" type="password" autoComplete="new-password" minLength={MINIMO} required className={campo} />
      </div>
      <Erro texto={erro} />
      <button className={`${botao} w-full`} disabled={aGravar || suporta === null}>
        <IconeDigital />
        {aGravar ? "A confirmar…" : "Confirmar com impressão digital"}
      </button>
    </form>
  );
}

/** Ativar a impressão digital no aparelho atual (página Acesso). */
export function AtivarDigital() {
  const suporta = useSuporte();
  const nomePadrao = useSyncExternalStore(semSubscricao, nomeDoAparelho, () => "");
  const [nomeEscrito, setNome] = useState<string | null>(null);
  const nome = nomeEscrito ?? nomePadrao;
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [aAtivar, iniciar] = useTransition();

  function ativar() {
    setErro(null);
    setOk(null);
    iniciar(async () => {
      try {
        const opcoes = await opcoesAtivarDigital();
        const resposta = await startRegistration({ optionsJSON: opcoes });
        const r = await ativarDigital(resposta, nome || "Aparelho");
        if (r?.erro) setErro(r.erro);
        else if (r?.ok) setOk(r.ok);
      } catch (e) {
        setErro(mensagemErro(e, true));
      }
    });
  }

  if (suporta === false)
    return <p className="text-sm">Este navegador não permite a impressão digital. Abra esta página no telemóvel.</p>;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="nome-aparelho" className={rotulo}>
          Nome deste aparelho
        </label>
        <input
          id="nome-aparelho"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={60}
          placeholder="Ex.: Telemóvel do Bruno"
          className={campo}
        />
      </div>
      <Erro texto={erro} />
      {ok && (
        <p role="status" className="text-sm font-semibold text-[#1f5f2b]">
          {ok}
        </p>
      )}
      <button type="button" onClick={ativar} disabled={aAtivar || suporta === null} className={botao}>
        <IconeDigital />
        {aAtivar ? "A ativar…" : "Ativar neste aparelho"}
      </button>
    </div>
  );
}

