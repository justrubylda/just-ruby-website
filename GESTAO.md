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

- Por casa: preço da noite, de sexta e sábado e mínimo de noites.
- Taxa de limpeza: um só valor, igual nas duas casas, cobrado uma vez por estadia (aparece no cartão da casa, no total e na mensagem do pedido).
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

## Despesas, banco e resumo

- **/gestao/despesas** — faturas de fornecedores: data, fornecedor, NIFs, nº, casa, categoria, total, IVA,
  quem pagou e estado (Pendente, Pago pela empresa, Por repor, Reposto). IVA dedutível = faturas com o NIF da
  empresa (518785483). "Foi paga por um sócio?" passa a despesa para Por repor.
- **/gestao/banco** — movimentos da conta do Millennium. Carrega-se o extrato em Excel (ou a folha de acerto
  `Acerto_Particular_Empresa_JustRuby.xlsx`, que traz o extrato classificado e as faturas); repetir períodos
  não duplica. Cada movimento tem tipo (Despesa, Receita Airbnb/Booking/direta, Reposição aos sócios, …),
  categoria e casa, pelas **regras** (texto da descrição → tipo/categoria/casa; os códigos de contrato da
  Endesa, Águas de Santarém e Tranquilidade já dizem a casa). O que se muda à mão não é alterado pelas regras.
- **Conferência automática** (ao importar e com "Conferir agora"), só quando não há dúvida:
  saída ↔ fatura (mesmo valor, 7 dias antes a 75 depois da fatura); transferência para os sócios ↔ conjunto
  único de despesas Por repor com essa soma; entrada ↔ reserva (valor recebido ou total, 90 dias antes da
  entrada a 60 depois da saída). O resto liga-se à mão em cada movimento.
- **/gestao/resumo** — por ano: recebido e pago no banco por mês, faturas de despesa e IVA dedutível,
  despesas por categoria e casa, saídas sem fatura (documentos em falta para o contabilista), recebido sem
  fatura, valor a repor aos sócios. "Por faturar" avisa das entradas no banco sem reserva.
- Excel para o contabilista: `/gestao/exportar/contas?tipo=despesas|banco&ano=…`.
- Linhas coladas (separadas por tabulações) com cabeçalho também entram — é assim que a tarefa no portátil
  passa as faturas lidas das pastas do OneDrive.
- Código: `app/gestao/lib/contas.ts` (tabelas `despesas`, `movimentos`, `regras_banco`; leitura, regras,
  conferência), `lib/contas-comum.ts`, `acoes-contas.ts`.

## Código

- `proxy.ts` — protege /gestao (cookie assinado; `app/gestao/lib/sessao.ts`)
- `app/gestao/lib/db.ts` — ligação e criação das tabelas (na primeira utilização)
- `app/gestao/lib/calculos.ts` — contas (IVA, líquido, estado), iguais às da folha Excel
- `app/gestao/lib/importar.ts`, `ficheiros.ts` — leitura de .xlsx/.csv/tabelas HTML
- `app/gestao/lib/sincronizar.ts` — calendários iCal
- `app/api/pedidos` — guarda os pedidos do formulário público
