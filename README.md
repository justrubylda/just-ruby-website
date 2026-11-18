# JUST RUBY — justruby.pt

Site da JUST RUBY LDA (turismo rural em Tomar e Santarém), feito em Next.js e publicado na Vercel.
Cada alteração enviada para o ramo `main` no GitHub fica online sozinha em 1 a 2 minutos.

## Editar textos, contactos e alojamentos

Quase tudo está num único ficheiro: **`app/site.ts`**. No GitHub, abra o ficheiro, carregue no lápis (Edit), altere e carregue em **Commit changes**.

- **WhatsApp e telefone**: só algarismos, com indicativo. Ex.: `whatsapp: "351912345678"`. Enquanto estiver vazio, os botões de WhatsApp não aparecem.
- **Airbnb e Booking**: cole o link do anúncio em `airbnb` e `booking` de cada casa. Aparece a opção "Também pode reservar no Airbnb ou no Booking.com".
- **Registo de Alojamento Local**: preencha `rnal` de cada casa. O número aparece na página da casa e no rodapé.
- **Capacidade**: ex.: `capacidade: "Até 8 hóspedes"`.
- **Textos**: `frase`, `descricao`, `destaques` e `perto` de cada casa.

Campos vazios (`""`) ficam escondidos no site.

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

**Wi-Fi:** na Vercel, em Settings → Environment Variables, crie:
`WIFI_REDE_KINGDOM_OF_STONE`, `WIFI_SENHA_KINGDOM_OF_STONE`, `WIFI_REDE_O_NOSSO_CANTINHO`, `WIFI_SENHA_O_NOSSO_CANTINHO`.
Sem estas variáveis, a secção do Wi-Fi não aparece.

## Calendário sincronizado com o Airbnb e o Booking

Cada casa mostra as noites ocupadas, e o formulário de pedido avisa se alguém pedir datas já reservadas.
O site lê os calendários (iCal) de exportação do Airbnb e do Booking e atualiza-se de hora a hora.

Os links de exportação são privados, por isso ficam na Vercel e não no código. Em Settings → Environment Variables:

- `ICAL_KINGDOM_OF_STONE` = link do Airbnb e link do Booking, separados por um espaço
- `ICAL_O_NOSSO_CANTINHO` = link do Airbnb e link do Booking, separados por um espaço

Depois de as gravar, faça "Redeploy" na Vercel. Sem estas variáveis, o calendário não aparece.
O site só usa as datas: nomes, códigos de reserva e telefones que venham nos calendários são ignorados.

## Para programadores

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

Páginas públicas em `app/(site)/`: início, `alojamentos/` (e uma por casa), `sobre/`, `galeria/`, `contactos/`, `privacidade/`. Guia do hóspede em `app/(hospedes)/guia/[slug]`. Calendário em `app/lib/disponibilidade.ts`. O sitemap, o robots.txt, o ícone e a imagem de partilha são gerados pelos ficheiros `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` e `app/opengraph-image.tsx`.
