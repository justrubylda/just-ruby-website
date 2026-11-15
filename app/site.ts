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
    "Turismo rural no centro de Portugal: o Kingdom of Stone, uma quinta com piscina em Tomar, e O Nosso Cantinho, uma vivenda na Várzea, em Santarém.",

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
    frase: "Uma quinta de cinco hectares com piscina, no campo perto de Tomar.",
    descricao: [
      "O Kingdom of Stone é uma quinta com cerca de cinco hectares em Olalhas, no concelho de Tomar, perto da albufeira de Castelo do Bode.",
      "Tem piscina e muito espaço ao ar livre. É um sítio para abrandar: manhãs calmas, tardes na piscina e noites sem ruído.",
      "Tomar e o Convento de Cristo ficam a curta distância de carro, para quem quiser juntar história ao descanso.",
    ],
    destaques: [
      "Quinta com cerca de 5 hectares",
      "Piscina",
      "Campo e silêncio",
      "Perto de Tomar e de Castelo do Bode",
    ],
    capacidade: "",
    piscina: true,
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
    fotos: [],
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
    tipo: "Vivenda T4 com anexos",
    frase: "Uma vivenda com espaço para a família, na Várzea, às portas de Santarém.",
    descricao: [
      "O Nosso Cantinho é uma vivenda T4 com anexos na Várzea, uma aldeia tranquila às portas de Santarém.",
      "Tem espaço para famílias e grupos, com o conforto de uma casa a sério e a cidade a poucos minutos.",
      "É uma boa base para conhecer Santarém, a lezíria e o resto do Ribatejo.",
    ],
    destaques: [
      "Vivenda T4 com anexos",
      "Espaço para famílias e grupos",
      "Aldeia calma",
      "Perto do centro de Santarém",
    ],
    capacidade: "",
    piscina: false,
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
    fotos: [],
    rnal: "",
    airbnb: "",
    booking: "",
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
