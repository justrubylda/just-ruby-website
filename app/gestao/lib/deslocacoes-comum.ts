// Mapas de deslocações dos sócios-gerentes (km e ajudas de custo): tipos e contas, sem base de dados.
// Usado no servidor, na página e no mapa para imprimir.

export const PESSOAS = ["Bruno", "Rúbia"] as const;
export type Pessoa = (typeof PESSOAS)[number];

export const ESTADOS_DESLOCACAO = ["Proposta", "Confirmada", "Excluída"] as const;
export type EstadoDeslocacao = (typeof ESTADOS_DESLOCACAO)[number];

export type Deslocacao = {
  id: number;
  data: string;
  pessoa: Pessoa;
  saida: string | null;
  regresso: string | null;
  percurso: string;
  motivo: string;
  matricula: string | null;
  km: number;
  almocos: number;
  jantares: number;
  noites: number;
  prova: string | null;
  reserva_id: number | null;
  estado: EstadoDeslocacao;
  auto: boolean;
  chave: string | null;
};

export type MesFechado = {
  mes: string; // AAAA-MM
  pessoa: Pessoa;
  fechado_em: string | null;
  pago_em: string | null;
  movimento_id: number | null;
};

/** Destino habitual de cada alojamento: o que se propõe em cada saída de hóspedes. */
export type Destino = {
  al: string;
  destino: string;
  km: number;
  pessoa: Pessoa;
  motivo: string;
  saida: string;
  regresso: string;
  almocos: number;
  jantares: number;
};

export type DadosPessoa = { nome: string; cargo: string; nif: string; matricula: string };

export type Parametros = {
  valorKm: number;
  diaria: number;
  pctAlmoco: number;
  pctJantar: number;
  pctNoite: number;
  tributacao: number;
  domicilio: string;
  autoriza: Pessoa;
  referenciaAta: string;
  pessoas: Record<Pessoa, DadosPessoa>;
  destinos: Destino[];
};

// Os nomes, NIF e matrículas ficam na base de dados (o código é público): aqui só os valores por defeito.
export const PARAMETROS_BASE: Parametros = {
  valorKm: 0.4,
  diaria: 50.2,
  pctAlmoco: 0.25,
  pctJantar: 0.25,
  pctNoite: 0.5,
  tributacao: 0.05,
  domicilio: "",
  autoriza: "Bruno",
  referenciaAta: "",
  pessoas: {
    Bruno: { nome: "Bruno", cargo: "Sócio-gerente", nif: "", matricula: "" },
    Rúbia: { nome: "Rúbia", cargo: "Sócia-gerente", nif: "", matricula: "" },
  },
  destinos: [
    {
      al: "Kingdom of Stone",
      destino: "Montes (Tomar)",
      km: 180,
      pessoa: "Rúbia",
      motivo: "Limpeza AL Kingdom of Stone",
      saida: "09:00",
      regresso: "22:00",
      almocos: 1,
      jantares: 1,
    },
    {
      al: "Nosso Cantinho",
      destino: "Várzea Santarém",
      km: 16,
      pessoa: "Rúbia",
      motivo: "AL O Nosso Cantinho – compras e supervisão da limpeza",
      saida: "",
      regresso: "",
      almocos: 0,
      jantares: 0,
    },
  ],
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export const percursoPara = (destino: string) => `Domicílio → ${destino} → Domicílio`;

export function valores(d: Pick<Deslocacao, "km" | "almocos" | "jantares" | "noites">, p: Parametros) {
  const km = r2((d.km || 0) * p.valorKm);
  const ajudas = r2(
    ((d.almocos || 0) * p.pctAlmoco + (d.jantares || 0) * p.pctJantar + (d.noites || 0) * p.pctNoite) * p.diaria
  );
  return { km, ajudas, total: r2(km + ajudas) };
}

export type Totais = { deslocacoes: number; km: number; valorKm: number; refeicoes: number; ajudas: number; total: number };

export function totalizar(lista: Deslocacao[], p: Parametros): Totais {
  const t: Totais = { deslocacoes: 0, km: 0, valorKm: 0, refeicoes: 0, ajudas: 0, total: 0 };
  for (const d of lista) {
    if (d.estado === "Excluída") continue;
    const v = valores(d, p);
    t.deslocacoes += 1;
    t.km += d.km || 0;
    t.valorKm += v.km;
    t.refeicoes += (d.almocos || 0) + (d.jantares || 0);
    t.ajudas += v.ajudas;
    t.total += v.total;
  }
  t.valorKm = r2(t.valorKm);
  t.ajudas = r2(t.ajudas);
  t.total = r2(t.total);
  return t;
}

/** Avisos de cada linha (o que pode ser posto em causa numa inspeção). */
export function avisosLinha(d: Deslocacao, outras: Deslocacao[], refeicoesEmpresa: Set<string>) {
  const a: string[] = [];
  if ((d.almocos || d.jantares) && (!d.saida || !d.regresso)) a.push("Tem refeições mas faltam as horas de saída e regresso.");
  if (d.almocos && d.saida && d.regresso && !(d.saida <= "13:00" && d.regresso >= "14:00"))
    a.push("O almoço só conta se estiver fora entre as 13h e as 14h.");
  if (d.jantares && d.saida && d.regresso && !(d.saida <= "20:00" && d.regresso >= "21:00"))
    a.push("O jantar só conta se estiver fora entre as 20h e as 21h.");
  if ((d.almocos || d.jantares) && refeicoesEmpresa.has(d.data))
    a.push("Há uma refeição paga pela empresa neste dia: não pode ter também ajuda de custo.");
  if (!d.km && !d.almocos && !d.jantares) a.push("Sem km nem refeições.");
  if (!d.prova) a.push("Sem prova indicada.");
  const repetida = outras.find(
    (o) => o.id !== d.id && o.estado !== "Excluída" && o.data === d.data && o.pessoa === d.pessoa && o.percurso === d.percurso
  );
  if (repetida) a.push("Há outra deslocação igual neste dia.");
  return a;
}

export const NOMES_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
export const mesPorExtenso = (mes: string) => `${NOMES_MES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`;
