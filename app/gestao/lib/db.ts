import "server-only";
import postgres from "postgres";

// Base de dados da gestão (Neon, ligada pela Vercel). O endereço vem da variável
// DATABASE_URL, que a integração Neon da Vercel cria sozinha. Nada fica no código.

type Sql = postgres.Sql<{ numeric: number; date: string }>;
const g = globalThis as unknown as { __jrSql?: Sql; __jrTabelas?: Promise<void> };

const urlBaseDados = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const temBaseDados = () => Boolean(urlBaseDados());

export function sql(): Sql {
  if (!g.__jrSql) {
    const url = urlBaseDados();
    if (!url) throw new Error("Falta ligar a base de dados (DATABASE_URL).");
    g.__jrSql = postgres(url, {
      prepare: false, // necessário com o "pooler" da Neon
      max: Number(process.env.DB_MAX_CONEXOES) || 3,
      idle_timeout: 20,
      connect_timeout: 15,
      onnotice: () => {},
      types: {
        // datas como texto "AAAA-MM-DD" (sem fusos horários) e números como números
        date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x },
        numeric: { to: 1700, from: [1700], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
      },
    }) as unknown as Sql;
  }
  return g.__jrSql;
}

const TABELAS = `
create table if not exists reservas (
  id serial primary key,
  checkin date,
  checkout date,
  noites integer,
  al text,
  plataforma text,
  hospede text,
  nif text,
  morada text,
  cod_reserva text,
  hospedes integer,
  total numeric(12,2),
  comissao numeric(12,2),
  recebido numeric(12,2),
  limpeza numeric(12,2),
  taxa_iva numeric(6,4) not null default 0.06,
  fatura text,
  recibo text,
  notas text,
  origem text,
  fonte text,
  ical_uid text,
  pedido_id integer,
  cancelada boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists reservas_checkin on reservas (checkin);
create index if not exists reservas_cod on reservas (cod_reserva);
create unique index if not exists reservas_ical on reservas (ical_uid) where ical_uid is not null;

create table if not exists pedidos (
  id serial primary key,
  criado_em timestamptz not null default now(),
  casa text,
  chegada date,
  partida date,
  hospedes integer,
  nome text,
  mensagem text,
  via text,
  estado text not null default 'novo',
  reserva_id integer
);

create table if not exists alojamentos (
  nome text primary key,
  ordem integer not null default 0,
  antes_entrada text not null default '',
  antes_saida text not null default '',
  final text not null default ''
);
insert into alojamentos (nome, ordem, antes_entrada, antes_saida, final) values
  ('Nosso Cantinho', 1, 'Prestação de serviços de alojamento mobilado, Check in a', ' e check out efectuado a', ''),
  ('Kingdom of Stone', 2, 'Prestação de serviços de alojamento mobilado, AL 150817 - Kingdom of Stone - Check in a', ' e check out efectuado a', ''),
  ('Torras', 3, 'Santarém - Cedência temporária de espaço - período de', ' a', '')
on conflict (nome) do nothing;

create table if not exists config (
  chave text primary key,
  valor text
);

create table if not exists chaves_acesso (
  id text primary key,
  chave_publica text not null,
  contador bigint not null default 0,
  transportes text,
  nome text,
  criado_em timestamptz not null default now(),
  usado_em timestamptz
);

create table if not exists desafios (
  desafio text primary key,
  expira timestamptz not null
);

create table if not exists bloqueios (
  id serial primary key,
  al text not null,
  inicio date not null,
  fim date not null,
  motivo text,
  criado_em timestamptz not null default now()
);
create index if not exists bloqueios_fim on bloqueios (fim);
alter table bloqueios add column if not exists origem text not null default 'site';

-- bloqueios vindos das plataformas que se desbloquearam no site: não voltam a entrar sozinhos
create table if not exists bloqueios_ignorados (
  al text not null,
  origem text not null,
  fim date not null,
  criado_em timestamptz not null default now(),
  primary key (al, origem, fim)
);
alter table bloqueios_ignorados add column if not exists ate date;

-- preços por noite (o site é a referência; Airbnb e Booking calculam-se com a comissão)
create table if not exists precos (
  al text primary key,
  base numeric(10,2),
  fim_semana numeric(10,2),
  limpeza numeric(10,2),
  noites_min integer not null default 2,
  atualizado_em timestamptz not null default now()
);
create table if not exists precos_periodos (
  id serial primary key,
  al text not null,
  nome text,
  inicio date not null,
  fim date not null,
  preco numeric(10,2) not null,
  noites_min integer
);

alter table pedidos add column if not exists preco numeric(10,2);
alter table alojamentos add column if not exists wifi_rede text not null default '';
alter table alojamentos add column if not exists wifi_senha text not null default '';

-- vendas do CentralGest Cloud (copiadas da lista de Vendas), para cruzar com as reservas
create table if not exists faturas_cg (
  doc text primary key,
  data date not null,
  cliente text,
  nif text,
  total numeric(12,2) not null,
  por_receber numeric(12,2),
  estado text,
  atualizado_em timestamptz not null default now()
);

-- recibos (RG) do CentralGest: pagamentos das faturas FT; os anulados ficam marcados
create table if not exists recibos_cg (
  doc text primary key,
  data date not null,
  cliente text,
  total numeric(12,2) not null,
  anulado boolean not null default false,
  atualizado_em timestamptz not null default now()
);

-- despesas da empresa (faturas de fornecedores), com a ligação ao pagamento no banco
create table if not exists despesas (
  id serial primary key,
  data date,
  fornecedor text,
  nif_fornecedor text,
  documento text,
  nif_cliente text,
  casa text,
  categoria text,
  base numeric(12,2),
  iva numeric(12,2),
  total numeric(12,2) not null,
  pago_por text not null default 'Empresa',
  estado text not null default 'Pendente',
  movimento_id integer,
  reposicao_id integer,
  ficheiro text,
  notas text,
  origem text,
  chave text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists despesas_chave on despesas (chave) where chave is not null;
create index if not exists despesas_data on despesas (data);

-- movimentos da conta da empresa (extratos do Millennium bcp)
create table if not exists movimentos (
  id serial primary key,
  conta text not null default 'Millennium',
  data date not null,
  data_valor date,
  descricao text not null default '',
  montante numeric(12,2) not null,
  saldo numeric(12,2),
  classe text not null default 'Por classificar',
  categoria text,
  casa text,
  reserva_id integer,
  notas text,
  manual boolean not null default false,
  origem text,
  chave text not null,
  criado_em timestamptz not null default now()
);
create unique index if not exists movimentos_chave on movimentos (chave);
-- pagamento parcial: o movimento é mais uma parte do pagamento desta despesa (ex.: sinal + resto de um carro)
alter table movimentos add column if not exists parte_de integer;
-- recebimento de uma estadia faturada que não entrou na conta da empresa (a título particular)
alter table reservas add column if not exists recebido_por text;
-- false = só uma referência (ex.: "provável: conta em comum") que o Bruno tem de confirmar no site
alter table reservas add column if not exists recebido_confirmado boolean not null default true;
-- IVA que se pode deduzir, quando não é o IVA todo da fatura (ex.: viatura a GPL, 50%)
alter table despesas add column if not exists iva_dedutivel numeric(12,2);
create index if not exists movimentos_data on movimentos (data);

-- regras para classificar os movimentos pelo texto da descrição
create table if not exists regras_banco (
  id serial primary key,
  texto text not null,
  sentido text,
  classe text not null,
  categoria text,
  casa text,
  ordem integer not null default 100
);

-- mapas de deslocações dos sócios-gerentes (km e ajudas de custo)
create table if not exists deslocacoes (
  id serial primary key,
  data date not null,
  pessoa text not null,
  saida text,
  regresso text,
  percurso text not null default '',
  motivo text not null default '',
  matricula text,
  km numeric(8,1) not null default 0,
  almocos integer not null default 0,
  jantares integer not null default 0,
  noites integer not null default 0,
  prova text,
  reserva_id integer,
  estado text not null default 'Confirmada',
  auto boolean not null default false,
  chave text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists deslocacoes_chave on deslocacoes (chave) where chave is not null;
create index if not exists deslocacoes_data on deslocacoes (data);
create table if not exists deslocacoes_meses (
  mes text not null,
  pessoa text not null,
  fechado_em timestamptz,
  pago_em date,
  movimento_id integer,
  primary key (mes, pessoa)
);
`;

/** Cria as tabelas na primeira utilização (não apaga nada se já existirem). */
export function garantirTabelas() {
  if (!g.__jrTabelas) {
    g.__jrTabelas = sql()
      .unsafe(TABELAS)
      .then(() => undefined)
      .catch((e) => {
        g.__jrTabelas = undefined;
        throw e;
      });
  }
  return g.__jrTabelas;
}

export async function lerConfig(chave: string) {
  const [l] = await sql()`select valor from config where chave = ${chave}`;
  return (l?.valor as string | undefined) ?? null;
}

export async function gravarConfig(chave: string, valor: string) {
  await sql()`insert into config (chave, valor) values (${chave}, ${valor})
    on conflict (chave) do update set valor = excluded.valor`;
}
