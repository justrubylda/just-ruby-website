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

## Para programadores

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

Páginas em `app/`: início, `alojamentos/` (e uma página por casa em `alojamentos/[slug]`), `sobre/`, `galeria/`, `contactos/`, `privacidade/`. O sitemap, o robots.txt, o ícone e a imagem de partilha são gerados pelos ficheiros `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` e `app/opengraph-image.tsx`.
