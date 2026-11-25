import Link from "next/link";
import { exigirSessao } from "../../lib/acesso";
import { GERAL, NIF_EMPRESA } from "../../lib/contas-comum";
import { listarDespesas, listarMovimentos } from "../../lib/contas";
import { temBaseDados } from "../../lib/db";
import { listarAlojamentos } from "../../lib/reservas";
import FormDespesa from "../../componentes/FormDespesa";
import { SemBaseDados, Titulo, cartao } from "../../componentes/ui";
import { opcoesPagamento } from "../opcoes";

export default async function NovaDespesa() {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const [als, movs, desp] = await Promise.all([listarAlojamentos(), listarMovimentos(), listarDespesas()]);
  const ocupados = new Set([...desp.map((d) => d.movimento_id), ...movs.map((m) => (m.parte_de ? m.id : null))].filter(Boolean) as number[]);
  const nova = { nif_cliente: NIF_EMPRESA, pago_por: "Empresa", estado: "Pendente" as const };
  return (
    <div>
      <Link href="/gestao/despesas" className="text-sm text-cinza hover:underline">
        ← Despesas
      </Link>
      <Titulo>Nova despesa</Titulo>
      <div className={cartao}>
        <FormDespesa despesa={nova} casas={[...als.map((a) => a.nome), GERAL]} movimentos={opcoesPagamento(nova, movs, ocupados)} />
      </div>
    </div>
  );
}
