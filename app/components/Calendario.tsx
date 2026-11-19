import { calendario, type Lingua } from "../i18n";
import { hojePT, somarDias, type Intervalo } from "../lib/disponibilidade";

// Calendário de disponibilidade: mostra os próximos meses com as noites já reservadas.
// Cada dia representa a noite que começa nesse dia (o dia de saída de um hóspede
// fica livre para a chegada do seguinte).


function ocupado(iso: string, intervalos: Intervalo[]) {
  return intervalos.some((i) => iso >= i.inicio && iso < i.fim);
}

function Mes({ ano, mes, hoje, intervalos, l }: { ano: number; mes: number; hoje: string; intervalos: Intervalo[]; l: Lingua }) {
  const t = calendario[l];
  const MESES = t.meses;
  const primeiro = new Date(Date.UTC(ano, mes, 1));
  const diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const desvio = (primeiro.getUTCDay() + 6) % 7; // segunda-feira primeiro
  const celulas: (string | null)[] = Array(desvio).fill(null);
  for (let d = 1; d <= diasNoMes; d++) {
    celulas.push(`${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  return (
    <div>
      <h3 className="font-sans text-base font-semibold capitalize">
        {MESES[mes]} {ano}
      </h3>
      <div role="grid" aria-label={`${MESES[mes]} ${ano}`} className="mt-3 grid grid-cols-7 gap-1 text-center text-sm">
        {t.dias.map((d, i) => (
          <div key={i} role="columnheader" aria-label={t.diasNome[i]} className="pb-1 text-xs text-cinza">
            {d}
          </div>
        ))}
        {celulas.map((iso, i) => {
          if (!iso) return <div key={`v${i}`} aria-hidden="true" />;
          const passado = iso < hoje;
          const reservado = !passado && ocupado(iso, intervalos);
          const dia = Number(iso.slice(8));
          return (
            <div
              key={iso}
              role="gridcell"
              aria-label={`${t.dia(dia, MESES[mes])}: ${passado ? t.passado : reservado ? t.reservado : t.livre}`}
              className={`flex aspect-square items-center justify-center rounded-sm ${
                passado
                  ? "text-xisto/30"
                  : reservado
                    ? "bg-rocha text-white/45 line-through decoration-white/30"
                    : "bg-white font-semibold text-xisto ring-1 ring-inset ring-ouro/40"
              } ${iso === hoje ? "outline outline-2 outline-offset-1 outline-ouro" : ""}`}
            >
              {dia}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendario({
  intervalos,
  meses = 4,
  l = "pt",
}: {
  intervalos: Intervalo[];
  meses?: number;
  l?: Lingua;
}) {
  const t = calendario[l];
  const hoje = hojePT();
  const [ano, mes] = hoje.split("-").map(Number);
  const lista = Array.from({ length: meses }, (_, i) => {
    const d = new Date(Date.UTC(ano, mes - 1 + i, 1));
    return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() };
  });
  const proximaLivre = (() => {
    let d = hoje;
    for (let i = 0; i < 400 && ocupado(d, intervalos); i++) d = somarDias(d, 1);
    return d;
  })();

  return (
    <div>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {lista.map((m) => (
          <Mes key={`${m.ano}-${m.mes}`} {...m} hoje={hoje} intervalos={intervalos} l={l} />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cinza">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-4 rounded-sm bg-white ring-1 ring-inset ring-ouro/40" /> {t.Livre}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-4 rounded-sm bg-rocha" /> {t.Reservado}
        </span>
        {proximaLivre !== hoje && (
          <span>
            {t.proxima} {t.dia(Number(proximaLivre.slice(8)), t.meses[Number(proximaLivre.slice(5, 7)) - 1])}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-cinza">
        {t.nota}
      </p>
    </div>
  );
}
