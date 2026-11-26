<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JUST RUBY — regras de trabalho (Claude, ChatGPT/Codex e qualquer outro agente)

Este ficheiro é lido por todos os agentes (o `CLAUDE.md` só aponta para aqui). Escrever sempre em **português de Portugal**.

## O projeto
Site e gestão da JUST RUBY LDA (justruby.pt): duas casas, **Kingdom of Stone** (Montes, Tomar) e **O Nosso Cantinho** (Várzea, Santarém), até 8 hóspedes cada. Next.js + Tailwind, base de dados Neon, deploy automático na Vercel. 4 línguas (pt, en, es, fr). O Bruno é o dono; fala-se com ele em português.
Mapa dos ficheiros: `README.md` (site) e `GESTAO.md` (área /gestao). Ler esses dois antes de mexer.

## Como se trabalha
1. **Alterações primeiro no ramo `pre-visualizacao`** (pré-visualização na Vercel). Só vão para `main` (produção) quando o Bruno disser. Perguntar antes de cada passagem para `main`.
2. **Nunca `push --force`.** Há vários agentes a trabalhar no mesmo repositório: antes de publicar, ir buscar `origin/main` e `origin/pre-visualizacao` e pôr o trabalho por cima (merge ou rebase, sem forçar).
3. **Correr `npm run build` antes de publicar.** Se falhar, não se publica.
4. Commits em português, claros e pequenos.
5. **Exceção:** uma tarefa agendada do Claude atualiza `app/zona.ts` e `app/destinos.ts` (agenda e atrações) às segundas e publica direto no `main`. Quem mexer nesses dois ficheiros deve ir buscar o `main` primeiro, para não haver conflitos.

## Regras que não se quebram
- **Os nomes das casas não mudam** no site (Kingdom of Stone, O Nosso Cantinho). Mudam-se só títulos e descrições para o Google, quando o Bruno pedir.
- **O repositório é PÚBLICO.** Nunca escrever aqui: palavras-passe, chaves, tokens, links privados de calendários, códigos do cofre, dados bancários ou de contabilidade, nomes e dados de hóspedes, nem IDs de anúncios. Esses dados ficam na base de dados (Neon), nas variáveis da Vercel ou no repositório privado.
- **Não apagar** `public/google0ad3daf97fc3a9de.html` (validação do Google) nem `public/e154ed0d9f37f053de98af3301e42f9f.txt` (chave IndexNow).
- Não usar `dynamicParams = false` (o site regenera as 4 línguas com `revalidatePath("/", "layout")`).
- Nunca escrever nem guardar palavras-passe do Bruno. Ele inicia sessão nos sítios e dá as autorizações.
- Preços, reservas, faturas e despesas: não inventar valores. Perguntar.
- Emitir faturas e comunicar à AT só com confirmação explícita do Bruno na conversa.

## Conhecimento partilhado (fora deste repositório)
O estado atual do projeto, as decisões do Bruno, a faturação (CentralGest), a contabilidade, as deslocações e as ideias em estudo estão no repositório **privado** `justrubylda/just-ruby-conhecimento` (ver o `AGENTS.md` dele). **Ler antes de começar** uma tarefa nova e **atualizar no fim**: o que mudou, o que ficou decidido e o que falta. Se não tiveres acesso a esse repositório, pede ao Bruno o resumo em vez de adivinhar.
