# JUST RUBY — justruby.pt

Site da JUST RUBY LDA (turismo rural em Tomar e Santarém), feito em Next.js e publicado na Vercel.
Cada alteração enviada para o ramo `main` no GitHub fica online sozinha em 1 a 2 minutos.

## Editar textos, contactos e alojamentos

Quase tudo está num único ficheiro: **`app/site.ts`**. No GitHub, abra o ficheiro, carregue no lápis (Edit), altere e carregue em **Commit changes**.

- **WhatsApp e telefone**: só algarismos, com indicativo. Ex.: `whatsapp: "351912345678"`. Enquanto estiver vazio, os botões de WhatsApp não aparecem.
- **Airbnb e Booking**: cole o link do anúncio em `airbnb` e `booking` de cada casa. Aparece a opção "Também pode reservar no Airbnb ou no Booking.com".
- **Registo de Alojamento Local**: preencha `rnal` de cada casa. O número aparece na página da casa e no rodapé (é obrigatório na publicidade do AL).
- **Capacidade**: ex.: `capacidade: "Até 8 hóspedes"`.
- **Textos**: `frase`, `descricao`, `destaques`, `comodidades` e `perto` de cada casa. A versão inglesa de cada texto está no bloco `en` da mesma casa.
- **Nota dos hóspedes**: `avaliacao` (ex.: 9,2 no Booking.com). Atualize quando a nota mudar; `null` esconde-a.

Campos vazios (`""`) ficam escondidos no site.

## Línguas: português, inglês, espanhol e francês

O site tem as mesmas páginas em inglês (`/en`), espanhol (`/es`) e francês (`/fr`).
O seletor de língua no cabeçalho leva à mesma página na língua escolhida, e o Google recebe a indicação de que as versões são a mesma página (hreflang).

- Textos das casas: blocos `en`, `es` e `fr` de cada casa em `app/site.ts`; fotos: campos `en`, `es` e `fr` de cada foto.
- Textos das páginas: no topo de cada ficheiro em `app/components/paginas/` (partes `pt`, `en`, `es` e `fr`).
- Menu, endereços das páginas, rodapé, formulário e calendário: `app/i18n.ts`.
- Página "O que fazer na zona" (`/zona`): `app/zona.ts`.
- Páginas "onde ficar": Festa dos Tabuleiros (`/festa-dos-tabuleiros`), Castelo do Bode e praia fluvial de Montes (`/castelo-do-bode`) e alojamento perto do CNEMA (`/cnema-santarem`). Os textos das 4 línguas estão em `app/destinos.ts`. Quando a Câmara de Tomar anunciar as datas da Festa dos Tabuleiros, acrescentá-las na secção "Quando é".

## Google Search Console, Bing e IndexNow

- **Google Search Console**: propriedade `https://www.justruby.pt/` (conta JUST RUBY LDA), validada pelo ficheiro `public/google0ad3daf97fc3a9de.html`. **Não apagar esse ficheiro.**
- **Bing Webmaster Tools**: site importado do Search Console.
- **IndexNow**: todas as manhãs, a tarefa da Vercel (`/api/gestao/sincronizar`) avisa o Bing quando há uma publicação nova, com todas as páginas do mapa do site (só uma vez por publicação). A chave está em `app/lib/indexnow.ts` e no ficheiro `public/e154ed0d9f37f053de98af3301e42f9f.txt`; **não apagar esse ficheiro**.

## Pôr fotografias

1. No GitHub, abra a pasta `public/fotos` e carregue as fotos (**Add file → Upload files**). Use nomes simples, sem espaços nem acentos, ex.: `kos-piscina.jpg`.
2. Em `app/site.ts`, na casa certa, preencha `fotos` (a primeira é a capa):

```ts
fotos: [
  { src: "/fotos/kos-piscina.jpg", alt: "Piscina da quinta ao fim da tarde" },
  { src: "/fotos/kos-sala.jpg", alt: "Sala com lareira" },
],
```

O `alt` descreve a foto em poucas palavras (ajuda o Google e quem usa leitores de ecrã).
As fotos aparecem logo na página inicial, na página da casa e na Galeria.

## Guia do hóspede (link para enviar depois da reserva)

Uma página por casa, em português, inglês, espanhol e francês. Não aparece no Google nem no menu.

- Kingdom of Stone: `https://www.justruby.pt/guia/kingdom-of-stone`
- O Nosso Cantinho: `https://www.justruby.pt/guia/o-nosso-cantinho`

**Código do cofre:** nunca se escreve no código do site, que é público. Acrescente-o ao link, depois de `#`:
`https://www.justruby.pt/guia/kingdom-of-stone#1234`. Quem abre esse link vê o código e pode copiá-lo.
Quem abre o link sem `#` vê a indicação "enviado por mensagem antes da chegada".

Os textos estão em `app/guias.ts`: horas, caminho, regras, lista de saída, etc.
Para mostrar a hora de check-out, preencha `checkOut`.

**Wi-Fi:** escreve-se em `justruby.pt/gestao` → Alojamentos (rede e palavra-passe de cada casa).
Fica na base de dados: nem no código público nem na Vercel. Sem rede preenchida, a secção do Wi-Fi não aparece.

## Calendário sincronizado com o Airbnb e o Booking

Cada casa mostra as noites ocupadas, e o formulário de pedido avisa se alguém pedir datas já reservadas.
O site lê os calendários (iCal) de exportação do Airbnb e do Booking e atualiza-se de hora a hora.

Os links de exportação são privados, por isso ficam na Vercel e não no código. Em Settings → Environment Variables:

- `ICAL_KINGDOM_OF_STONE` = link do Airbnb e link do Booking, separados por um espaço
- `ICAL_O_NOSSO_CANTINHO` = link do Airbnb e link do Booking, separados por um espaço

Depois de as gravar, faça "Redeploy" na Vercel.
O site só usa as datas: nomes, códigos de reserva e telefones que venham nos calendários são ignorados.

### Bloquear datas: só no site

Os bloqueios (contrato, uso próprio, obras…) fazem-se em `justruby.pt/gestao` → **Calendário**.
O site publica um calendário privado por casa (`/api/calendario/<casa>.ics?t=…`, links na mesma página)
que o Airbnb e o Booking importam: fecham essas datas sozinhos, normalmente dentro de algumas horas.
As reservas registadas na gestão que não são do Airbnb nem do Booking (Direto, Site, Contrato…) também entram.

Entre o Airbnb e o Booking, as reservas passam diretamente (cada plataforma importa a outra).
O Kingdom of Stone no Booking exporta só datas reservadas, porque o anúncio está fechado no Booking.

## Para programadores

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

Páginas públicas em `app/(site)/`: início, `alojamentos/` (e uma por casa), `sobre/`, `galeria/`, `contactos/`, `privacidade/`. Guia do hóspede em `app/(hospedes)/guia/[slug]`. Calendário em `app/lib/disponibilidade.ts`. O sitemap, o robots.txt, o ícone e a imagem de partilha são gerados pelos ficheiros `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` e `app/opengraph-image.tsx`.
