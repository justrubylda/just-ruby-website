import { exigirSessao } from "../../lib/acesso";
import { dataPT, eur } from "../../lib/calculos";
import { temBaseDados } from "../../lib/db";
import { lerParametros, listarDeslocacoes, listarMesesFechados } from "../../lib/deslocacoes";
import { PESSOAS, mesPorExtenso, totalizar, valores, type Pessoa } from "../../lib/deslocacoes-comum";
import { SemBaseDados } from "../../componentes/ui";
import Imprimir from "./Imprimir";

// Mapa mensal de deslocações em serviço de um sócio-gerente, em A4 horizontal, para imprimir e assinar.

export default async function Mapa({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : "";
  const pessoa = (PESSOAS as readonly string[]).includes(sp.pessoa ?? "") ? (sp.pessoa as Pessoa) : null;
  if (!mes || !pessoa) return <p>Escolha o mês e a pessoa.</p>;
  const [p, todas, fechados] = await Promise.all([lerParametros(), listarDeslocacoes(mes), listarMesesFechados()]);
  const lista = todas.filter((d) => d.pessoa === pessoa && d.estado !== "Excluída");
  const t = totalizar(lista, p);
  const dados = p.pessoas[pessoa];
  const autoriza = p.pessoas[p.autoriza];
  const estado = fechados.find((f) => f.mes === mes && f.pessoa === pessoa);
  const propostas = lista.filter((d) => d.estado === "Proposta").length;
  const th = "border border-black/40 bg-[#1f3864] px-1.5 py-1 text-[10px] font-semibold text-white";
  const td = "border border-black/30 px-1.5 py-1 text-[10.5px] align-middle";

  return (
    <div className="mapa mx-auto max-w-[1100px] bg-white p-6 text-black print:p-0">
      <style>{`@page { size: A4 landscape; margin: 10mm; }`}</style>
      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <Imprimir />
        {!estado?.fechado_em && (
          <span className="text-sm font-semibold text-[#8a2b1f]">
            Rascunho: o mês ainda não está fechado{propostas ? ` (${propostas} proposta(s) por confirmar)` : ""}.
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-lg font-bold">MAPA DE DESLOCAÇÕES EM SERVIÇO – {mesPorExtenso(mes).toUpperCase()}</h1>
          <table className="mt-2 text-[11px]">
            <tbody>
              {[
                ["Entidade", "JUST RUBY LDA · NIPC 518785483"],
                ["Beneficiário", dados.nome],
                ["Cargo", dados.cargo],
                ["NIF", dados.nif],
                ["Viatura própria", dados.matricula],
                ["Domicílio", p.domicilio],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td className="pr-3 font-semibold">{a}:</td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <div className="w-44 border-2 border-[#1f3864] text-center">
            <div className="bg-[#1f3864] py-1 text-[11px] font-bold text-white">TOTAL A PAGAR</div>
            <div className="bg-[#ddebf7] py-3 text-2xl font-bold text-[#1f3864]">{eur(t.total)}</div>
            <div className="py-1 text-[10px]">
              {estado?.pago_em ? `Pago a ${dataPT(estado.pago_em)}` : estado?.fechado_em ? "Por pagar" : "Rascunho"}
            </div>
          </div>
          <table className="w-48 border-2 border-[#1f3864] text-[10.5px]">
            <tbody>
              <tr>
                <td colSpan={2} className="bg-[#1f3864] py-1 text-center font-bold text-white">
                  RESUMO DO MÊS
                </td>
              </tr>
              {[
                ["Deslocações", String(t.deslocacoes)],
                ["Km percorridos", `${t.km} km`],
                ["Valor km", eur(t.valorKm)],
                ["Refeições", String(t.refeicoes)],
                ["Ajudas de custo", eur(t.ajudas)],
              ].map(([a, b]) => (
                <tr key={a} className="odd:bg-[#ddebf7]">
                  <td className="px-2 py-0.5">{a}</td>
                  <td className="px-2 py-0.5 text-right font-semibold">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <table className="mt-4 w-full border-collapse tabular-nums">
        <thead>
          <tr>
            {["Data", "Saída", "Regresso", "Percurso", "Motivo / trabalho realizado", "Matrícula", "Km", "Valor km",
              "Almoços", "Jantares", "Noites", "Ajudas de custo", "Total", "Prova / documento"].map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.map((d) => {
            const v = valores(d, p);
            return (
              <tr key={d.id}>
                <td className={`${td} whitespace-nowrap text-center`}>{dataPT(d.data)}</td>
                <td className={`${td} text-center`}>{d.saida}</td>
                <td className={`${td} text-center`}>{d.regresso}</td>
                <td className={td}>{d.percurso}</td>
                <td className={td}>{d.motivo}</td>
                <td className={`${td} whitespace-nowrap text-center`}>{d.matricula}</td>
                <td className={`${td} text-center`}>{d.km || ""}</td>
                <td className={`${td} whitespace-nowrap text-right`}>{v.km ? eur(v.km) : ""}</td>
                <td className={`${td} text-center`}>{d.almocos || ""}</td>
                <td className={`${td} text-center`}>{d.jantares || ""}</td>
                <td className={`${td} text-center`}>{d.noites || ""}</td>
                <td className={`${td} whitespace-nowrap text-right`}>{v.ajudas ? eur(v.ajudas) : ""}</td>
                <td className={`${td} whitespace-nowrap text-right font-semibold`}>{eur(v.total)}</td>
                <td className={td}>{d.prova}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={6} className={`${td} bg-[#1f3864] text-right text-white`}>
              TOTAIS
            </td>
            <td className={`${td} bg-[#1f3864] text-center text-white`}>{t.km}</td>
            <td className={`${td} bg-[#1f3864] text-right text-white`}>{eur(t.valorKm)}</td>
            <td className={`${td} bg-[#1f3864] text-center text-white`}>{lista.reduce((s, d) => s + (d.almocos || 0), 0)}</td>
            <td className={`${td} bg-[#1f3864] text-center text-white`}>{lista.reduce((s, d) => s + (d.jantares || 0), 0)}</td>
            <td className={`${td} bg-[#1f3864] text-center text-white`}>{lista.reduce((s, d) => s + (d.noites || 0), 0)}</td>
            <td className={`${td} bg-[#1f3864] text-right text-white`}>{eur(t.ajudas)}</td>
            <td className={`${td} bg-[#1f3864] text-right text-white`}>{eur(t.total)}</td>
            <td className={`${td} bg-[#1f3864]`} />
          </tr>
        </tfoot>
      </table>

      <p className="mt-2 text-[9.5px] text-black/70">
        Valores: {eur(p.valorKm)}/km; ajuda de custo diária {eur(p.diaria)} ({Math.round(p.pctAlmoco * 100)}% por almoço,{" "}
        {Math.round(p.pctJantar * 100)}% por jantar, {Math.round(p.pctNoite * 100)}% por noite com alojamento pago). Sem ajuda de
        custo por refeições ou alojamento pagos pela empresa.
      </p>

      <p className="mt-4 text-[11px]">
        Declaro que as deslocações acima foram efetuadas ao serviço da JUST RUBY LDA, nas datas e com os motivos indicados.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-10 text-[11px]">
        <div>
          <div className="font-bold">O(A) BENEFICIÁRIO(A)</div>
          <div>
            {dados.nome} – {dados.cargo}
          </div>
          <div className="mt-8 border-b border-black" />
          <div className="mt-1">Data: ____ / ____ / ________</div>
        </div>
        <div>
          <div className="font-bold">AUTORIZADO PELA GERÊNCIA</div>
          <div>
            {autoriza.nome} – {autoriza.cargo}
            {p.referenciaAta && `, ao abrigo da ${p.referenciaAta}`}
          </div>
          <div className="mt-8 border-b border-black" />
          <div className="mt-1">Data: ____ / ____ / ________</div>
        </div>
      </div>
      <p className="mt-4 text-[9px] italic text-black/60">Guardar junto a este mapa as provas indicadas na última coluna.</p>
    </div>
  );
}
