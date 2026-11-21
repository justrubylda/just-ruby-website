import { site } from "@/app/site";
import { apagarBloqueioAcao } from "../acoes";
import { exigirSessao } from "../lib/acesso";
import { dataPT, diasEntre, hojeISO } from "../lib/calculos";
import { AL_DO_SLUG, codigoCalendario, listarBloqueios } from "../lib/calendario";
import { temBaseDados } from "../lib/db";
import BotaoApagar from "../componentes/BotaoApagar";
import Copiar from "../componentes/Copiar";
import { SemBaseDados, Titulo, cartao } from "../componentes/ui";
import FormBloqueio from "./FormBloqueio";

export default async function Calendario({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const [bloqueios, codigo] = await Promise.all([listarBloqueios(), codigoCalendario()]);
  const casas = Object.entries(AL_DO_SLUG);
  const hoje = hojeISO();

  return (
    <div className="space-y-6">
      <Titulo sub="Bloqueie aqui as datas em que a casa está ocupada por fora (contrato, uso próprio…). O Airbnb e o Booking fecham-nas sozinhos.">
        Calendário
      </Titulo>

      {sp.ok && <p className="rounded-md bg-[#e3f1e5] p-3 text-sm text-[#1f5f2b]">Datas bloqueadas.</p>}
      {sp.apagado && <p className="rounded-md bg-[#e3f1e5] p-3 text-sm text-[#1f5f2b]">Bloqueio apagado: as datas voltam a ficar livres.</p>}

      <section className={cartao}>
        <h2 className="mb-4 font-display text-xl">Bloquear datas</h2>
        <FormBloqueio casas={casas.map(([, al]) => al)} hoje={hoje} />
        <p className="mt-4 text-xs text-cinza">
          O Airbnb e o Booking vão buscar este calendário de tempos a tempos: um bloqueio novo pode demorar algumas horas a
          aparecer lá. Para hoje ou amanhã, bloqueie também na app.
        </p>
      </section>

      <section className={cartao}>
        <h2 className="mb-3 font-display text-xl">Datas bloqueadas</h2>
        {bloqueios.length === 0 ? (
          <p className="text-cinza">Não há bloqueios a partir de hoje.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {bloqueios.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">
                    {b.al} · {dataPT(b.inicio)} → {dataPT(b.fim)}{" "}
                    <span className="font-normal text-cinza">({diasEntre(b.inicio, b.fim)} noites)</span>
                  </p>
                  {b.motivo && <p className="text-sm text-cinza">{b.motivo}</p>}
                </div>
                <form action={apagarBloqueioAcao}>
                  <input type="hidden" name="id" value={b.id} />
                  <BotaoApagar texto="Desbloquear" />
                </form>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-cinza">
          As reservas que não são do Airbnb nem do Booking (diretas, do site, contratos…) também fecham as datas nas
          plataformas. Ficam em Reservas.
        </p>
      </section>

      <section className={cartao}>
        <h2 className="font-display text-xl">Ligar ao Airbnb e ao Booking (uma vez por casa)</h2>
        <p className="mt-1 text-sm text-cinza">
          Links privados: não os partilhe. Cole cada um na importação de calendário da plataforma.
        </p>
        <div className="mt-4 space-y-4">
          {casas.map(([slug, al]) => {
            const link = `${site.url}/api/calendario/${slug}.ics?t=${codigo}`;
            return (
              <div key={slug}>
                <p className="font-semibold">{al}</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded bg-[#f6f4f0] px-2 py-1.5 text-xs">{link}</code>
                  <Copiar texto={link} />
                </div>
              </div>
            );
          })}
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          <li>
            <b>Airbnb</b>: Calendário → Disponibilidade → Associar calendários → Associar a outro site → colar em “Ligação
            do outro site”, nome “JUST RUBY”.
          </li>
          <li>
            <b>Booking</b>: Tarifas e disponibilidade → Sincronizar calendários → Adicionar ligação → colar o link, nome
            “JUST RUBY”.
          </li>
        </ul>
      </section>
    </div>
  );
}
