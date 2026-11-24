import { SemBaseDados, Titulo, cartao } from "../componentes/ui";
import { exigirSessao } from "../lib/acesso";
import { dataPT } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { codigoCriadoEm } from "../lib/palavra";
import { FormCodigo, FormMudar } from "./Formularios";

export default async function Conta() {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const criado = await codigoCriadoEm();

  return (
    <div className="space-y-6">
      <Titulo sub="A palavra-passe fica guardada de forma cifrada; ninguém a consegue ler, nem no código do site.">
        Palavra-passe
      </Titulo>

      <section className={`${cartao} max-w-xl`} aria-labelledby="t-codigo">
        <h2 id="t-codigo" className="font-display text-xl">
          Código de recuperação
        </h2>
        <p className="mt-1 mb-4 text-sm text-cinza">
          {criado === null ? (
            <>
              <b className="text-[#8a2b1f]">Ainda não tem código.</b> Crie um e guarde-o no telemóvel: é com ele que repõe a
              palavra-passe se se esquecer dela.
            </>
          ) : (
            <>
              Tem um código{criado ? ` criado a ${dataPT(criado)}` : ""}. Se o perdeu, crie um novo: o anterior deixa de servir.
            </>
          )}
        </p>
        <FormCodigo temCodigo={criado !== null} />
      </section>

      <section className={`${cartao} max-w-xl`} aria-labelledby="t-mudar">
        <h2 id="t-mudar" className="font-display text-xl">
          Mudar a palavra-passe
        </h2>
        <p className="mt-1 mb-4 text-sm text-cinza">Ao mudar, as sessões abertas noutros aparelhos terminam.</p>
        <FormMudar />
      </section>
    </div>
  );
}
