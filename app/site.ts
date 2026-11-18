// =====================================================================
//  DADOS DO SITE: edite só este ficheiro.
//  Tudo o que está aqui aparece automaticamente nas páginas
//  (menu, alojamentos, galeria, contactos, rodapé e Google).
//
//  Campos vazios ("") ficam escondidos no site até serem preenchidos.
// =====================================================================

export const site = {
  nome: "JUST RUBY",
  empresa: "JUST RUBY LDA",
  nif: "518785483",
  sede: "Várzea, Santarém",
  anfitrioes: "o Bruno e a Rúbia", // aparece em "Somos o Bruno e a Rúbia"
  url: "https://www.justruby.pt",
  descricao:
    "Turismo rural no centro de Portugal: o Kingdom of Stone, uma quinta com piscina em Tomar, e O Nosso Cantinho, uma vivenda com piscina na Várzea, em Santarém.",

  email: "just_ruby@outlook.pt",

  // Número com indicativo, só algarismos. Ex.: "351912345678"
  // Enquanto estiver vazio, os botões de WhatsApp e telefone não aparecem.
  whatsapp: "",
  telefone: "",

  instagram: "", // ex.: "https://www.instagram.com/justruby"
  facebook: "", // ex.: "https://www.facebook.com/justruby"

  // Obrigatório por lei em sites de empresas em Portugal.
  livroReclamacoes: "https://www.livroreclamacoes.pt",
};

export const menu = [
  { href: "/", label: "Início" },
  { href: "/alojamentos", label: "Alojamentos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/galeria", label: "Galeria" },
  { href: "/contactos", label: "Contactos" },
];

export type Foto = { src: string; alt: string };

export type Casa = {
  slug: string;
  nome: string;
  doNome: string; // como se diz "do ...": "do Kingdom of Stone", "d'O Nosso Cantinho"
  cidade: string; // aparece por cima do nome
  local: string; // localidade mostrada ao público (a morada exata só vai na confirmação)
  freguesia: string; // para o Google
  tipo: string;
  frase: string; // uma linha de apresentação
  descricao: string[]; // um parágrafo por linha
  destaques: string[];
  capacidade: string; // ex.: "Até 8 hóspedes". Vazio = não aparece.
  piscina: boolean;
  verLabel: string; // texto do link "Ver a quinta" / "Ver a casa"
  perto: { nome: string; nota: string }[];

  // Fotos: coloque os ficheiros em /public/fotos/ e escreva aqui o caminho.
  // A primeira foto é a capa. Ex.: { src: "/fotos/kos-piscina.jpg", alt: "Piscina da quinta ao fim da tarde" }
  fotos: Foto[];

  rnal: string; // n.º de registo de Alojamento Local (deve aparecer no site)
  airbnb: string; // link do anúncio no Airbnb
  booking: string; // link do anúncio no Booking.com
};

export const casas: Casa[] = [
  {
    slug: "kingdom-of-stone",
    nome: "Kingdom of Stone",
    doNome: "do Kingdom of Stone",
    cidade: "Tomar",
    local: "Olalhas, Tomar",
    freguesia: "Olalhas",
    tipo: "Quinta com piscina",
    frase: "Uma quinta de cinco hectares com piscina, no campo, a cerca de 20 minutos de Tomar.",
    descricao: [
      "O Kingdom of Stone é uma quinta com cerca de cinco hectares em Olalhas, no concelho de Tomar, perto da albufeira de Castelo do Bode.",
      "A casa tem 4 quartos, 2 casas de banho, sala e ar condicionado. Lá fora há piscina, jardim, pérgula com videira, forno a lenha e churrasqueira. É um sítio para abrandar: manhãs calmas, tardes na piscina e noites sem ruído.",
      "Tomar e o Convento de Cristo ficam a curta distância de carro, para quem quiser juntar história ao descanso.",
    ],
    destaques: [
      "Piscina",
      "4 quartos e 2 casas de banho",
      "Forno a lenha e churrasqueira",
      "Quinta com cerca de 5 hectares",
    ],
    capacidade: "",
    piscina: true,
    verLabel: "Ver a quinta",
    perto: [
      {
        nome: "Convento de Cristo",
        nota: "Património Mundial da UNESCO e antiga sede dos Templários, em Tomar.",
      },
      {
        nome: "Albufeira de Castelo do Bode",
        nota: "Praias fluviais, passeios de barco e desportos náuticos.",
      },
      {
        nome: "Centro histórico de Tomar",
        nota: "Ruas antigas junto ao rio Nabão e a Mata dos Sete Montes.",
      },
    ],
    fotos: [
      { src: "/fotos/kos-piscina-casa.jpg", alt: "Piscina do Kingdom of Stone com a casa ao fundo, entre pinheiros" },
      { src: "/fotos/kos-piscina-reflexo.jpg", alt: "Piscina com as árvores refletidas na água" },
      { src: "/fotos/kos-piscina-por-do-sol.jpg", alt: "Piscina ao pôr do sol" },
      { src: "/fotos/kos-sala.jpg", alt: "Sala com sofás, lareira e paredes de pedra" },
      { src: "/fotos/kos-quarto-casal.jpg", alt: "Quarto de casal com colcha de patchwork" },
      { src: "/fotos/kos-quarto-verde.jpg", alt: "Quarto com cama de ferro e colcha verde" },
      { src: "/fotos/kos-quarto-azul.jpg", alt: "Quarto com cama individual e janela azul" },
      { src: "/fotos/kos-sala-jantar.jpg", alt: "Sala de jantar com mesa redonda e cristaleira" },
      { src: "/fotos/kos-cozinha-lareira.jpg", alt: "Cozinha com lareira grande" },
      { src: "/fotos/kos-forno-churrasqueira.jpg", alt: "Forno a lenha e churrasqueira em pedra" },
      { src: "/fotos/kos-pergula.jpg", alt: "Pérgula com videira em frente à casa" },
      { src: "/fotos/kos-casa-loendros.jpg", alt: "Casa branca com loendros floridos" },
    ],
    rnal: "",
    airbnb: "",
    booking: "",
  },
  {
    slug: "o-nosso-cantinho",
    nome: "O Nosso Cantinho",
    doNome: "d'O Nosso Cantinho",
    cidade: "Santarém",
    local: "Várzea, Santarém",
    freguesia: "Várzea",
    tipo: "Vivenda com piscina privada",
    frase: "Uma vivenda com piscina privada e espaço para a família, na Várzea, às portas de Santarém.",
    descricao: [
      "O Nosso Cantinho é uma vivenda T4 com anexos e piscina privada na Várzea, uma aldeia tranquila às portas de Santarém.",
      "Tem espaço para famílias e grupos: 4 quartos, 2 casas de banho, jardim, churrasqueira e estacionamento privado.",
      "É uma boa base para conhecer Santarém, a lezíria e o resto do Ribatejo.",
    ],
    destaques: [
      "Piscina privada",
      "4 quartos e 2 casas de banho",
      "Jardim e churrasqueira",
      "Perto do centro de Santarém",
    ],
    capacidade: "Até 8 hóspedes (3 quartos de casal e 1 com duas camas)",
    piscina: true,
    verLabel: "Ver a casa",
    perto: [
      {
        nome: "Jardim das Portas do Sol",
        nota: "Miradouro sobre o Tejo e a lezíria, no alto da cidade.",
      },
      {
        nome: "Centro histórico de Santarém",
        nota: "Conhecido como a capital do gótico, com igrejas e conventos medievais.",
      },
      {
        nome: "Lezíria do Tejo",
        nota: "Campo aberto, cavalos e tradição ribatejana.",
      },
    ],
    fotos: [
      { src: "/fotos/cantinho-piscina.jpg", alt: "Piscina d’O Nosso Cantinho com escadas, rodeada pela casa amarela" },
      { src: "/fotos/cantinho-arco-piscina.jpg", alt: "A piscina vista através de um arco na parede" },
      { src: "/fotos/cantinho-piscina-terraco.jpg", alt: "Piscina e terraço com chapéus de sol" },
      { src: "/fotos/cantinho-esplanada.jpg", alt: "Mesa exterior para oito pessoas ao fim do dia" },
      { src: "/fotos/cantinho-jardim-casa.jpg", alt: "Casa amarela com jardim e árvore em frente" },
      { src: "/fotos/cantinho-jardim.jpg", alt: "Jardim relvado com árvores" },
      { src: "/fotos/cantinho-sala.jpg", alt: "Sala com sofás claros" },
      { src: "/fotos/cantinho-sala-lareira.jpg", alt: "Sala com lareira e televisão" },
      { src: "/fotos/cantinho-cozinha.jpg", alt: "Cozinha equipada com forno e máquina de lavar" },
      { src: "/fotos/cantinho-sala-jantar.jpg", alt: "Mesa de jantar junto à janela" },
      { src: "/fotos/cantinho-quarto-casal.jpg", alt: "Quarto de casal com janela para o jardim" },
      { src: "/fotos/cantinho-quarto-2.jpg", alt: "Quarto de casal com cortinas cor de laranja" },
      { src: "/fotos/cantinho-quarto-3.jpg", alt: "Quarto de casal com cómoda e espelho" },
      { src: "/fotos/cantinho-quarto-4.jpg", alt: "Quarto com sofá-cama" },
      { src: "/fotos/cantinho-churrasqueira.jpg", alt: "Churrasqueira e cozinha exterior" },
    ],
    rnal: "",
    airbnb: "",
    booking: "https://www.booking.com/hotel/pt/o-nosso-cantinho-private-pool.html",
  },
];

export const getCasa = (slug: string) => casas.find((c) => c.slug === slug);

export const whatsappLink = (texto = "Olá! Gostaria de saber a disponibilidade.") =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`
    : "";

export const emailLink = (assunto: string, corpo = "") =>
  `mailto:${site.email}?subject=${encodeURIComponent(assunto)}${
    corpo ? `&body=${encodeURIComponent(corpo)}` : ""
  }`;
