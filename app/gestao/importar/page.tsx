import { exigirSessao } from "../lib/acesso";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos } from "../lib/reservas";
import BotaoSincronizar from "../componentes/BotaoSincronizar";
import FormImportar from "../componentes/FormImportar";
import { SemBaseDados, Titulo, cartao } from "../componentes/ui";

export const maxDuration = 60;

export default async function Importar() {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const als = (await listarAlojamentos()).map((a) => a.nome);
  return (
    <div className="space-y-6">
      <Titulo sub="Nada é duplicado: reservas que já existem são reconhecidas pelo código, pela origem ou pelas datas.">
        Importar reservas
      </Titulo>

      <section className={cartao}>
        <FormImportar als={als} />
      </section>

      <section className={cartao}>
        <h2 className="font-display text-xl">Que ficheiros posso carregar?</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">
          <li>
            <b>Faturacao_JustRuby.xlsx</b> (uma vez, para trazer o histórico de 2020 a 2026). Traz também os textos das
            faturas de cada alojamento.
          </li>
          <li>
            <b>Airbnb</b>: Anfitrião → Menu → Ganhos → Histórico de transações (pagas ou futuras) → escolher as datas →
            “Obter relatório” → CSV. Traz o código da reserva, o hóspede, as noites, o valor bruto e a taxa do Airbnb.
          </li>
          <li>
            <b>Booking</b>: Extranet → Reservas → escolher o período → Descarregar. Traz o nº da reserva, o hóspede, o preço
            e a comissão. Escolha acima o alojamento se o ficheiro for de uma só casa.
          </li>
        </ol>
      </section>

      <section className={cartao}>
        <h2 className="font-display text-xl">Calendários (automático)</h2>
        <p className="mt-2 text-sm">
          As reservas novas do Airbnb e do Booking entram sozinhas a partir dos calendários iCal (os mesmos que o site usa
          para mostrar a disponibilidade): todos os dias de manhã e sempre que abre o painel (no máximo de 3 em 3 horas).
          O iCal só traz as datas — o nome e o valor completam-se com o CSV ou à mão.
        </p>
        <div className="mt-3">
          <BotaoSincronizar />
        </div>
      </section>
    </div>
  );
}
