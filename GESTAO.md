# Área de gestão (/gestao)

Reservas e faturação da JUST RUBY LDA dentro do site: painel, reservas, por faturar,
pedidos do site, importação (Excel, Airbnb, Booking) e leitura automática dos calendários.

**Os dados nunca ficam no código** (o repositório é público): ficam numa base de dados
Neon ligada pela Vercel. Também os textos das faturas (moradas, nº de registo AL) ficam
na base de dados e editam-se em /gestao/alojamentos.

## Configuração na Vercel (uma vez)

1. **Base de dados** — Projeto → Storage → Create Database → Neon (plano gratuito,
   região Frankfurt) → ligar ao projeto em Production e Preview. Cria a variável
   `DATABASE_URL` sozinha.
2. **Palavra-passe** — Settings → Environment Variables → `GESTAO_PALAVRA_PASSE`
   (Production e Preview).
3. **Calendários** — as variáveis `ICAL_KINGDOM_OF_STONE` e `ICAL_O_NOSSO_CANTINHO`
   (já usadas pela disponibilidade) têm de estar ativas também em Preview para testar.
4. **Opcional: leitura diária** — `CRON_SECRET` (qualquer texto comprido). A Vercel chama
   /api/gestao/sincronizar todas as manhãs (vercel.json). Sem ela, a leitura faz-se
   na mesma ao abrir o painel (no máximo de 3 em 3 horas) ou com o botão.
5. Voltar a publicar (Redeploy).

## Primeira utilização

Entrar em /gestao → Importar → carregar `Faturacao_JustRuby.xlsx` (histórico de
2020–2026 e textos das faturas). Pode repetir-se: o que já existe não é duplicado.

## Como as reservas entram

| Origem | Como | O que traz |
| --- | --- | --- |
| Airbnb / Booking (iCal) | automático | datas e, no Airbnb, o código da reserva |
| CSV do Airbnb | Importar | código, hóspede, noites, valor bruto, taxa |
| Exportação do Booking | Importar | nº da reserva, hóspede, preço, comissão |
| Formulário do site | automático | pedido em /gestao/pedidos → “Criar reserva” |
| À mão | Reservas → Nova | tudo |

As importações completam as reservas que já existem (pelo código, pela origem no Excel
ou pelas datas no mesmo alojamento) em vez de as duplicar.

## Faturação

/gestao/faturar lista as estadias terminadas sem nº de fatura, com a descrição pronta a
copiar para o CentralGest Cloud. A emissão automática fica para quando houver acesso à
API do CentralGest.

## Código

- `proxy.ts` — protege /gestao (cookie assinado; `app/gestao/lib/sessao.ts`)
- `app/gestao/lib/db.ts` — ligação e criação das tabelas (na primeira utilização)
- `app/gestao/lib/calculos.ts` — contas (IVA, líquido, estado), iguais às da folha Excel
- `app/gestao/lib/importar.ts`, `ficheiros.ts` — leitura de .xlsx/.csv/tabelas HTML
- `app/gestao/lib/sincronizar.ts` — calendários iCal
- `app/api/pedidos` — guarda os pedidos do formulário público
