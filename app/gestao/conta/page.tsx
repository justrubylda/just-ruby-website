import { removerAparelhoAcao } from "../acoes";
import { AtivarDigital } from "../componentes/Digital";
import { SemBaseDados, Titulo, botaoSec, cartao } from "../componentes/ui";
import { exigirSessao } from "../lib/acesso";
import { listarAparelhos } from "../lib/digital";
import { temBaseDados } from "../lib/db";
import FormMudar from "./FormMudar";

const dia = (iso: string) => new Date(iso).toLocaleDateString("pt-PT", { timeZone: "Europe/Lisbon" });

export default async function Acesso({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const aparelhos = await listarAparelhos();

  return (
    <div className="space-y-6">
      <Titulo sub="Entre com a impressão digital ou o rosto do telemóvel. Se se esquecer da palavra-passe, é com ela que cria uma nova.">
        Acesso
      </Titulo>

      {sp.reposta && (
        <p role="status" className="max-w-xl rounded-md bg-[#e3f1e5] p-3 text-sm font-semibold text-[#1f5f2b]">
          Palavra-passe nova gravada. As sessões abertas noutros aparelhos terminaram.
        </p>
      )}

      <section className={`${cartao} max-w-xl`} aria-labelledby="t-digital">
        <h2 id="t-digital" className="font-display text-xl">
          Impressão digital
        </h2>
        {aparelhos.length ? (
          <ul className="mt-3 divide-y divide-black/5 border-y border-black/5">
            {aparelhos.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="font-semibold">{a.nome}</p>
                  <p className="text-xs text-cinza">
                    Ativada a {dia(a.criado_em)}
                    {a.usado_em ? ` · usada a ${dia(a.usado_em)}` : ""}
                  </p>
                </div>
                <form action={removerAparelhoAcao}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className={`${botaoSec} px-3 py-1.5`} aria-label={`Remover ${a.nome}`}>
                    Remover
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm">
            <b className="text-[#8a2b1f]">Ainda não está ativada.</b> Abra esta página no telemóvel e carregue em
            &laquo;Ativar neste aparelho&raquo;.
          </p>
        )}
        <p className="mt-3 mb-4 text-sm text-cinza">
          Ative em cada aparelho onde quer entrar (telemóvel e, se quiser, o computador). A impressão digital fica no
          aparelho; o site nunca a recebe.
        </p>
        <AtivarDigital />
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
