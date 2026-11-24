import Link from "next/link";
import { redirect } from "next/navigation";
import { temSessao } from "../lib/acesso";
import { EntrarDigital } from "../componentes/Digital";
import { haAparelhos } from "../lib/digital";
import { palavraPasseDefinida } from "../lib/palavra";
import FormEntrar from "./FormEntrar";

export default async function Entrar() {
  if (await temSessao()) redirect("/gestao");
  const comDigital = await haAparelhos();
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-lg border border-black/5 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl">Área de gestão</h1>
      <p className="mt-1 text-sm text-cinza">Reservas e faturação da JUST RUBY LDA.</p>
      {(await palavraPasseDefinida()) ? (
        <>
          {comDigital && (
            <>
              <EntrarDigital />
              <p className="mt-5 flex items-center gap-3 text-xs uppercase tracking-wide text-cinza">
                <span className="h-px flex-1 bg-black/10" />
                ou com a palavra-passe
                <span className="h-px flex-1 bg-black/10" />
              </p>
            </>
          )}
          <FormEntrar />
          <p className="mt-4 text-sm">
            <Link href="/gestao/recuperar" className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
              Esqueci-me da palavra-passe
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-5 rounded-md bg-[#fde8b8] p-3 text-sm text-[#7a4b00]">
          Falta definir a palavra-passe. Na Vercel: Settings → Environment Variables → adicionar{" "}
          <b>GESTAO_PALAVRA_PASSE</b> (Production e Preview) e voltar a publicar.
        </p>
      )}
      <p className="mt-6 border-t border-black/5 pt-4 text-sm">
        <Link href="/" className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
          Voltar ao site
        </Link>
      </p>
    </div>
  );
}
