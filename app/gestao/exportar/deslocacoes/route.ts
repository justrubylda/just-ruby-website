import { temSessao } from "../../lib/acesso";
import { temBaseDados } from "../../lib/db";
import { lerParametros, listarDeslocacoes } from "../../lib/deslocacoes";
import { PESSOAS, valores } from "../../lib/deslocacoes-comum";
import { criarXlsx, type Coluna, type Valor } from "../../lib/xlsx";

// Deslocações em Excel (?mes=AAAA-MM ou ?ano=AAAA, &pessoa=Bruno|Rúbia opcional). Para o contabilista.
export async function GET(request: Request) {
  if (!(await temSessao())) return new Response("Sem sessão", { status: 401 });
  if (!temBaseDados()) return new Response("Sem base de dados", { status: 503 });
  const u = new URL(request.url);
  const mes = u.searchParams.get("mes") ?? "";
  const ano = u.searchParams.get("ano") ?? "";
  const pessoa = u.searchParams.get("pessoa") ?? "";
  const periodo = /^\d{4}-\d{2}$/.test(mes) ? mes : /^\d{4}$/.test(ano) ? ano : new Date().getFullYear().toString();
  const [p, todas] = await Promise.all([lerParametros(), listarDeslocacoes()]);
  const lista = todas.filter(
    (d) =>
      d.data.startsWith(periodo) &&
      d.estado !== "Excluída" &&
      (!(PESSOAS as readonly string[]).includes(pessoa) || d.pessoa === pessoa)
  );
  const colunas: Coluna[] = [
    { titulo: "Data", tipo: "data", largura: 11 },
    { titulo: "Sócio-gerente", tipo: "texto", largura: 18 },
    { titulo: "Saída", tipo: "texto", largura: 8 },
    { titulo: "Regresso", tipo: "texto", largura: 9 },
    { titulo: "Percurso", tipo: "texto", largura: 34 },
    { titulo: "Motivo", tipo: "texto", largura: 50 },
    { titulo: "Matrícula", tipo: "texto", largura: 11 },
    { titulo: "Km", tipo: "numero", largura: 7, somar: true },
    { titulo: "Valor km", tipo: "euro", largura: 11, somar: true },
    { titulo: "Almoços", tipo: "numero", largura: 8, somar: true },
    { titulo: "Jantares", tipo: "numero", largura: 8, somar: true },
    { titulo: "Noites", tipo: "numero", largura: 7, somar: true },
    { titulo: "Ajudas de custo", tipo: "euro", largura: 13, somar: true },
    { titulo: "Total", tipo: "euro", largura: 11, somar: true },
    { titulo: "Prova", tipo: "texto", largura: 40 },
    { titulo: "Estado", tipo: "texto", largura: 11 },
  ];
  const linhas: Valor[][] = lista.map((d) => {
    const v = valores(d, p);
    return [
      d.data, p.pessoas[d.pessoa].nome, d.saida, d.regresso, d.percurso, d.motivo, d.matricula, d.km, v.km,
      d.almocos, d.jantares, d.noites, v.ajudas, v.total, d.prova, d.estado,
    ];
  });
  const nome = `deslocacoes-${periodo}${(PESSOAS as readonly string[]).includes(pessoa) ? `-${pessoa}` : ""}`;
  return new Response(new Uint8Array(criarXlsx("Deslocações", colunas, linhas)), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(nome)}.xlsx"`,
    },
  });
}
