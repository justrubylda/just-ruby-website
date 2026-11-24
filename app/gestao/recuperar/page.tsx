import Link from "next/link";
import FormRecuperar from "./FormRecuperar";

export default function Recuperar() {
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-lg border border-black/5 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl">Esqueci-me da palavra-passe</h1>
      <p className="mt-1 text-sm text-cinza">
        Escreva o código de recuperação que guardou e escolha uma palavra-passe nova. Se ainda não criou nenhum código, use a
        palavra-passe que está na Vercel (GESTAO_PALAVRA_PASSE).
      </p>
      <FormRecuperar />
      <p className="mt-6 border-t border-black/5 pt-4 text-sm">
        <Link href="/gestao/entrar" className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
          Voltar à entrada
        </Link>
      </p>
    </div>
  );
}
