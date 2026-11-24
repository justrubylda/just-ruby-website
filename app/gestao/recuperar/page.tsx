import Link from "next/link";
import { ReporDigital } from "../componentes/Digital";
import { haAparelhos } from "../lib/digital";
import FormVercel from "./FormVercel";

export default async function Recuperar() {
  const comDigital = await haAparelhos();
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-lg border border-black/5 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl">Esqueci-me da palavra-passe</h1>
      {comDigital ? (
        <>
          <p className="mt-1 text-sm text-cinza">
            Escolha uma palavra-passe nova e confirme com a impressão digital (ou o rosto), no telemóvel onde a ativou.
          </p>
          <ReporDigital />
          <details className="mt-6 border-t border-black/5 pt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-ouro-escuro">Não tenho o telemóvel comigo</summary>
            <p className="mt-2 text-cinza">Use a palavra-passe que está guardada na Vercel (GESTAO_PALAVRA_PASSE).</p>
            <FormVercel />
          </details>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-cinza">
            Ainda não ativou a impressão digital. Use a palavra-passe que está guardada na Vercel (GESTAO_PALAVRA_PASSE) e
            escolha uma nova. Depois, em Gestão → Acesso, ative a impressão digital no telemóvel.
          </p>
          <FormVercel />
        </>
      )}
      <p className="mt-6 border-t border-black/5 pt-4 text-sm">
        <Link href="/gestao/entrar" className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
          Voltar à entrada
        </Link>
      </p>
    </div>
  );
}
