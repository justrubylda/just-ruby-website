import { dataPT, diasEntre } from "../lib/calculos";
import { bloqueiosPorPassar, type Origem, type Periodo } from "../lib/calendario";

// Calendário de uma casa na gestão: tudo o que está ocupado, venha de onde vier
// (site, Airbnb, Booking), com a origem de cada noite.

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS = ["S", "T", "Q", "Q", "S", "S", "D"];

const COR: Record<Origem, string> = {
  site: "bg-ouro text-preto",
  "airbnb-reserva": "bg-[#e0565b] text-white",
  "airbnb-bloqueio": "bg-[#f3c3c5] text-[#7a1f23]",
  booking: "bg-[#1f4e79] text-white",
};
export const LEGENDA: { origem: Origem; texto: string }[] = [
  { origem: "site", texto: "Bloqueado no site" },
  { origem: "airbnb-reserva", texto: "Reserva Airbnb" },
  { origem: "airbnb-bloqueio", texto: "Indisponível no Airbnb" },
  { origem: "booking", texto: "Fechado/reservado no Booking" },
];
// Quando várias origens cobrem a mesma noite, mostra-se a mais importante.
const PRIORIDADE: Origem[] = ["site", "airbnb-reserva", "booking", "airbnb-bloqueio"];

const somar = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function origemDoDia(iso: string, periodos: Periodo[]): Origem | null {
  const aqui = periodos.filter((p) => iso >= p.inicio && iso < p.fim).map((p) => p.origem);
  return PRIORIDADE.find((o) => aqui.includes(o)) ?? null;
}

function Mes({ ano, mes, hoje, periodos }: { ano: number; mes: number; hoje: string; periodos: Periodo[] }) {
  const primeiro = new Date(Date.UTC(ano, mes, 1));
  const dias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const celulas: (string | null)[] = Array((primeiro.getUTCDay() + 6) % 7).fill(null);
  for (let d = 1; d <= dias; d++) celulas.push(`${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  return (
    <div>
      <p className="text-sm font-semibold">
        {MESES[mes]} {ano}
      </p>
      <div className="mt-1 grid grid-cols-7 gap-0.5 text-center text-[0.7rem]">
        {DIAS.map((d, i) => (
          <span key={i} className="text-cinza">
            {d}
          </span>
        ))}
        {celulas.map((iso, i) => {
          if (!iso) return <span key={i} />;
          const o = iso < hoje ? null : origemDoDia(iso, periodos);
          const passado = iso < hoje;
          return (
            <span
              key={i}
              title={o ? LEGENDA.find((x) => x.origem === o)?.texto : undefined}
              className={`rounded-sm py-1 ${passado ? "text-black/25" : o ? COR[o] : "bg-[#f6f4f0]"}`}
            >
              {Number(iso.slice(8))}
            </span>
          );
        })}
      </div>
    </div>
  );
}


export default function CalendarioCasa({
  hoje,
  periodos,
  erros,
}: {
  hoje: string;
  periodos: Periodo[];
  erros: string[];
}) {
  const meses: { ano: number; mes: number }[] = [];
  const base = new Date(`${hoje}T12:00:00Z`);
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + i, 1));
    meses.push({ ano: d.getUTCFullYear(), mes: d.getUTCMonth() });
  }
  const doSite = periodos.filter((p) => p.origem === "site");
  // Depois da passagem automática só sobram aqui bloqueios que foram desbloqueados no site
  // mas continuam fechados na plataforma: é preciso desbloqueá-los lá.
  const soNaPlataforma = bloqueiosPorPassar(periodos, doSite, hoje);
  const limite = somar(hoje, 400);

  return (
    <div>
      {erros.map((e) => (
        <p key={e} className="mb-2 rounded-md bg-[#fde8b8] p-2 text-sm text-[#7a4b00]">
          {e}
        </p>
      ))}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {meses.map((m) => (
          <Mes key={`${m.ano}-${m.mes}`} ano={m.ano} mes={m.mes} hoje={hoje} periodos={periodos} />
        ))}
      </div>

      {soNaPlataforma.length > 0 && (
        <div className="mt-5 rounded-md border border-[#e8b4a8] bg-[#fdf1ee] p-3">
          <p className="text-sm font-semibold text-[#8a2b1f]">Ainda fechado na plataforma, mas livre no site</p>
          <p className="mt-1 text-xs text-[#8a2b1f]">
            Estas datas foram desbloqueadas no site, mas continuam bloqueadas no Airbnb ou no Booking. Desbloqueie-as lá
            (ou peça ao Claude) para ficar tudo igual.
          </p>
          <ul className="mt-2 divide-y divide-black/5">
            {soNaPlataforma.map((p) => (
              <li key={`${p.origem}-${p.inicio}-${p.fim}`} className="py-2 text-sm">
                <span className={`mr-2 inline-block h-3 w-3 rounded-sm align-middle ${COR[p.origem]}`} />
                {dataPT(p.inicio)} → {p.fim > limite ? "fim do calendário" : dataPT(p.fim)}{" "}
                <span className="text-cinza">
                  ({diasEntre(p.inicio, p.fim)} noites · {p.nota})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
