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

## Calendário e bloqueios (/gestao/calendario)

O site é o calendário principal dos bloqueios. Bloqueia-se aqui (casa, primeira noite, dia em que
fica livre, motivo); o site publica `/api/calendario/<casa>.ics?t=<código>` com os bloqueios e as
reservas que não são do Airbnb nem do Booking. O código é criado na primeira utilização (tabela
`config`, chave `calendario_codigo`) e os links aparecem na página, prontos a copiar para a
importação de calendário do Airbnb e do Booking. As reservas do Airbnb e do Booking não entram
neste calendário (as plataformas já as trocam entre si).

As páginas públicas das casas juntam Airbnb + Booking + estes bloqueios.

## Preços (/gestao/precos)

- Por casa: preço da noite, de sexta e sábado, limpeza (uma vez por estadia) e mínimo de noites.
- Épocas especiais (Natal, agosto, festas): substituem os outros preços nessas noites e podem ter outro mínimo.
- O site mostra o preço por baixo de cada dia livre no calendário, "desde X € / noite" na página da casa e o total da estadia quando o hóspede escolhe as datas. O pedido fica registado com esse total e, ao criar a reserva a partir do pedido, o total já vem preenchido.
- Ao lado de cada preço aparece o valor a pôr no Airbnb e no Booking para receber o mesmo depois da comissão (as comissões editam-se na mesma página). As plataformas não aceitam mudanças automáticas sem um gestor de canais pago, por isso esses valores passam-se lá à mão (ou pelo Claude, no navegador).
- Sem preços definidos, o site continua como antes: "respondemos com o preço".

## Sair da gestão

"Ver o site" (no topo) abre o site normal sem sair; "Sair" termina a sessão e volta à página inicial do site.

## Wi-Fi do guia do hóspede

Em /gestao/alojamentos (campos "Rede Wi-Fi" e "Palavra-passe Wi-Fi"). O guia lê-os da base de dados.

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
