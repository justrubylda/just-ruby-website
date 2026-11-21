import { passarParaSiteAcao } from "../acoes";
import { dataPT, diasEntre } from "../lib/calculos";
import type { Origem, Periodo } from "../lib/calendario";

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

const cobre = (a: { inicio: string; fim: string }, b: { inicio: string; fim: string }) => a.inicio <= b.inicio && a.fim >= b.fim;

export default function CalendarioCasa({
  al,
  hoje,
  periodos,
  erros,
}: {
  al: string;
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
  // Bloqueios feitos diretamente nas plataformas que ainda não estão no site.
  const porPassar = periodos.filter(
    (p) => (p.origem === "airbnb-bloqueio" || p.origem === "booking") && !doSite.some((s) => cobre(s, p)),
  );
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

      {porPassar.length > 0 && (
        <div className="mt-5 rounded-md border border-black/10 p-3">
          <p className="text-sm font-semibold">Bloqueios feitos no Airbnb ou no Booking que ainda não estão no site</p>
          <p className="mt-1 text-xs text-cinza">
            Para o site passar a mandar nestas datas, passe-as para o site. Depois podem ser desbloqueadas na
            plataforma: continuam fechadas, agora por ordem do site.
          </p>
          <ul className="mt-2 divide-y divide-black/5">
            {porPassar.map((p) => (
              <li key={`${p.origem}-${p.inicio}-${p.fim}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className={`mr-2 inline-block h-3 w-3 rounded-sm align-middle ${COR[p.origem]}`} />
                  {dataPT(p.inicio)} → {p.fim > limite ? "fim do calendário" : dataPT(p.fim)}{" "}
                  <span className="text-cinza">
                    ({diasEntre(p.inicio, p.fim)} noites · {p.nota})
                  </span>
                </span>
                <form action={passarParaSiteAcao}>
                  <input type="hidden" name="al" value={al} />
                  <input type="hidden" name="inicio" value={p.inicio < hoje ? hoje : p.inicio} />
                  <input type="hidden" name="fim" value={p.fim} />
                  <input type="hidden" name="motivo" value={`Vindo de: ${p.nota}`} />
                  <button className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold hover:border-black/40">
                    Passar para o site
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
