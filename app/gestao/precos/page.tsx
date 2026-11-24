import Link from "next/link";
import { rotaCasa } from "@/app/i18n";
import { apagarPeriodoAcao } from "../acoes";
import BotaoApagar from "../componentes/BotaoApagar";
import { SemBaseDados, Titulo, cartao } from "../componentes/ui";
import { exigirSessao } from "../lib/acesso";
import { AL_DO_SLUG } from "../lib/calendario";
import { dataPT, hojeISO } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { lerComissoes, lerPrecos, precoNaPlataforma } from "../lib/precos";
import { FormComissoes, FormLimpeza, FormPeriodo, FormPrecosCasa } from "./Formularios";

const eur = (v: number) => {
  const n = Number(v);
  return n.toLocaleString("pt-PT", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
};
const texto = (n: number | null) => (n == null ? "" : String(Number(n)).replace(".", ","));

export default async function Precos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const [{ casas, periodos, limpeza }, comissoes] = await Promise.all([lerPrecos(), lerComissoes()]);
  const slugDe = Object.fromEntries(Object.entries(AL_DO_SLUG).map(([slug, al]) => [al, slug]));
  const hoje = hojeISO();

  return (
    <div className="space-y-6">
      <Titulo sub="O preço do site é o que quer receber numa reserva direta. O hóspede vê-o no calendário de cada casa, com o total da estadia. Ao lado fica o preço a pôr no Airbnb e no Booking para receber o mesmo depois da comissão.">
        Preços
      </Titulo>

      {sp.periodo && <p className="rounded-md bg-[#e3f1e5] p-3 text-sm text-[#1f5f2b]">Época guardada. O site já a usa.</p>}
      {sp.apagado && <p className="rounded-md bg-[#ecebe8] p-3 text-sm">Época apagada.</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {casas.map((c) => (
          <section key={c.al} className={cartao}>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{c.al}</h2>
              {slugDe[c.al] && (
                <Link href={rotaCasa("pt", slugDe[c.al])} className="text-sm font-semibold text-ouro-escuro hover:underline">
                  Ver no site
                </Link>
              )}
            </div>
            <FormPrecosCasa
              al={c.al}
              comissoes={comissoes}
              inicial={{
                base: texto(c.base),
                fim_semana: texto(c.fim_semana),
                noites_min: String(c.noites_min ?? 2),
              }}
            />
          </section>
        ))}
      </div>

      <section className={cartao}>
        <h2 className="font-display text-2xl">Taxa de limpeza</h2>
        <p className="mt-1 mb-4 text-sm text-cinza">
          Igual nas duas casas, cobrada uma vez por estadia. O site mostra-a no cartão de cada casa e soma-a ao total.
        </p>
        <FormLimpeza inicial={texto(limpeza)} comissoes={comissoes} />
      </section>

      <section className={cartao}>
        <h2 className="font-display text-2xl">Épocas e datas especiais</h2>
        <p className="mt-1 text-sm text-cinza">
          Natal, Passagem de Ano, agosto, festas… Nestas noites o preço da época substitui o da noite e o de sexta e sábado.
        </p>
        {periodos.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-cinza">
                  <th scope="col" className="pb-2 pr-3 font-semibold">Casa</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Época</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Noites</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">No site</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Airbnb</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Booking</th>
                  <th scope="col" className="pb-2 font-semibold">
                    <span className="sr-only">Apagar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => (
                  <tr key={p.id} className="border-t border-black/5">
                    <td className="py-2 pr-3">{p.al}</td>
                    <td className="py-2 pr-3">{p.nome || "—"}</td>
                    <td className="py-2 pr-3">
                      {dataPT(p.inicio)} a {dataPT(p.fim)}
                      {p.noites_min ? <span className="text-cinza"> · mín. {p.noites_min}</span> : null}
                    </td>
                    <td className="py-2 pr-3 font-semibold">{eur(p.preco)}</td>
                    <td className="py-2 pr-3">{eur(precoNaPlataforma(Number(p.preco), comissoes.airbnb))}</td>
                    <td className="py-2 pr-3">{eur(precoNaPlataforma(Number(p.preco), comissoes.booking))}</td>
                    <td className="py-2 text-right">
                      <form action={apagarPeriodoAcao}>
                        <input type="hidden" name="id" value={p.id} />
                        <BotaoApagar texto="Apagar" />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-5 border-t border-black/5 pt-5">
          <FormPeriodo casas={casas.map((c) => c.al)} hoje={hoje} comissoes={comissoes} />
        </div>
      </section>

      <section className={cartao}>
        <h2 className="font-display text-2xl">Comissões das plataformas</h2>
        <p className="mt-1 text-sm text-cinza">
          Servem para calcular o preço a pôr no Airbnb e no Booking.
          {!comissoes.bookingConfirmada && " A do Booking está no valor habitual (15 %): confirme no extranet, em Finanças."}
        </p>
        <div className="mt-4">
          <FormComissoes inicial={{ airbnb: comissoes.airbnb, booking: comissoes.booking }} />
        </div>
      </section>

      <p className="text-sm text-cinza">
        O Airbnb e o Booking não deixam que o site lhes mude os preços sozinho (só através de um gestor de canais pago).
        Quando mudar aqui, peça ao Claude para pôr os valores das colunas “Airbnb” e “Booking” nas plataformas.
      </p>
    </div>
  );
}
