import Link from "next/link";
import { notFound } from "next/navigation";
import { apagarDespesaAcao } from "../../acoes-contas";
import { exigirSessao } from "../../lib/acesso";
import { dataPT, eur } from "../../lib/calculos";
import { GERAL } from "../../lib/contas-comum";
import { listarDespesas, listarMovimentos, obterDespesa } from "../../lib/contas";
import { temBaseDados } from "../../lib/db";
import { listarAlojamentos } from "../../lib/reservas";
import BotaoApagar from "../../componentes/BotaoApagar";
import FormDespesa from "../../componentes/FormDespesa";
import { SemBaseDados, Titulo, cartao } from "../../componentes/ui";
import { opcoesPagamento } from "../opcoes";

export default async function EditarDespesa({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const { id } = await params;
  const d = await obterDespesa(Number(id));
  if (!d) notFound();
  const [als, movs, desp] = await Promise.all([listarAlojamentos(), listarMovimentos(), listarDespesas()]);
  const ocupados = new Set(desp.map((x) => x.movimento_id).filter(Boolean) as number[]);
  const casas = [...new Set([...als.map((a) => a.nome), GERAL, ...(d.casa ? [d.casa] : [])])];
  const repos = d.reposicao_id ? movs.find((m) => m.id === d.reposicao_id) : null;
  return (
    <div>
      <Link href="/gestao/despesas" className="text-sm text-cinza hover:underline">
        ← Despesas
      </Link>
      <Titulo sub={[d.origem && `origem: ${d.origem}`, repos && `reposta a ${dataPT(repos.data)} (${eur(-repos.montante)})`].filter(Boolean).join(" · ") || undefined}>
        {d.fornecedor || "Despesa"}
      </Titulo>
      <div className={cartao}>
        <FormDespesa despesa={d} casas={casas} movimentos={opcoesPagamento(d, movs, ocupados)} />
      </div>
      <form action={apagarDespesaAcao} className="mt-6">
        <input type="hidden" name="id" value={d.id} />
        <BotaoApagar texto="Apagar esta despesa" />
      </form>
    </div>
  );
}
