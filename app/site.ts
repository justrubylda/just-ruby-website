// =====================================================================
//  DADOS DO SITE: edite só este ficheiro.
//  Tudo o que está aqui aparece automaticamente nas páginas
//  (alojamentos, galeria, contactos, rodapé e Google), em português
//  e, nos campos "en", na versão inglesa do site (/en).
//
//  Campos vazios ("") ficam escondidos no site até serem preenchidos.
//  O menu e os endereços das páginas estão em app/i18n.ts.
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

// alt: descrição da foto em português; en: a mesma descrição em inglês.
export type Foto = { src: string; alt: string; en: string };

// Textos da casa na versão inglesa do site.
export type CasaEn = {
  doNome: string; // "for Kingdom of Stone"
  local: string;
  tipo: string;
  frase: string;
  descricao: string[];
  destaques: string[];
  comodidades: string[];
  capacidade: string;
  verLabel: string;
  perto: { nome: string; nota: string }[];
};

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
  quartos: number; // para o Google
  checkOut: string; // ex.: "11:00". Vazio = não aparece.
  comodidades: string[]; // lista curta (aparece na página da casa e vai para o Google)
  verLabel: string; // texto do link "Ver a quinta" / "Ver a casa"
  perto: { nome: string; nota: string }[];

  // Fotos: coloque os ficheiros em /public/fotos/ e escreva aqui o caminho.
  // "alt" descreve a foto em português e "en" em inglês.
  // A primeira foto é a capa. Ex.: { src: "/fotos/kos-piscina.jpg", alt: "Piscina da quinta ao fim da tarde", en: "Pool in the late afternoon" }
  fotos: Foto[];

  rnal: string; // n.º de registo de Alojamento Local (deve aparecer no site)
  airbnb: string; // link do anúncio no Airbnb
  booking: string; // link do anúncio no Booking.com

  // Nota real dos hóspedes numa plataforma. Atualizar quando mudar. null = não aparece.
  avaliacao: { nota: number; plataforma: string; link: string } | null;

  en: CasaEn;
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
    quartos: 4,
    checkOut: "",
    comodidades: ["Piscina", "Ar condicionado", "Forno a lenha", "Churrasqueira", "Jardim", "Lareira", "Wi-Fi"],
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
      { src: "/fotos/kos-piscina-casa.jpg", alt: "Piscina do Kingdom of Stone com a casa ao fundo, entre pinheiros", en: "Kingdom of Stone pool with the house behind, among pine trees" },
      { src: "/fotos/kos-piscina-reflexo.jpg", alt: "Piscina com as árvores refletidas na água", en: "Pool with the trees reflected in the water" },
      { src: "/fotos/kos-piscina-por-do-sol.jpg", alt: "Piscina ao pôr do sol", en: "Pool at sunset" },
      { src: "/fotos/kos-sala.jpg", alt: "Sala com sofás, lareira e paredes de pedra", en: "Living room with sofas, fireplace and stone walls" },
      { src: "/fotos/kos-quarto-casal.jpg", alt: "Quarto de casal com colcha de patchwork", en: "Double bedroom with a patchwork bedspread" },
      { src: "/fotos/kos-quarto-verde.jpg", alt: "Quarto com cama de ferro e colcha verde", en: "Bedroom with an iron bed and a green bedspread" },
      { src: "/fotos/kos-quarto-azul.jpg", alt: "Quarto com cama individual e janela azul", en: "Bedroom with a single bed and a blue window" },
      { src: "/fotos/kos-sala-jantar.jpg", alt: "Sala de jantar com mesa redonda e cristaleira", en: "Dining room with a round table and a glass cabinet" },
      { src: "/fotos/kos-cozinha-lareira.jpg", alt: "Cozinha com lareira grande", en: "Kitchen with a large fireplace" },
      { src: "/fotos/kos-forno-churrasqueira.jpg", alt: "Forno a lenha e churrasqueira em pedra", en: "Stone wood-fired oven and barbecue" },
      { src: "/fotos/kos-pergula.jpg", alt: "Pérgula com videira em frente à casa", en: "Vine-covered pergola in front of the house" },
      { src: "/fotos/kos-casa-loendros.jpg", alt: "Casa branca com loendros floridos", en: "White house with flowering oleanders" },
    ],
    rnal: "",
    airbnb: "https://www.airbnb.com/rooms/51944903",
    booking: "",
    avaliacao: null,
    en: {
      doNome: "for Kingdom of Stone",
      local: "Olalhas, Tomar",
      tipo: "Farmhouse with pool",
      frase: "A five-hectare country estate with a pool, about 20 minutes from Tomar.",
      descricao: [
        "Kingdom of Stone is a country estate of about five hectares in Olalhas, in the municipality of Tomar, close to the Castelo do Bode reservoir.",
        "The house has 4 bedrooms, 2 bathrooms, a living room and air conditioning. Outside there is a pool, a garden, a vine-covered pergola, a wood-fired oven and a barbecue. It is a place to slow down: quiet mornings, afternoons by the pool and silent nights.",
        "Tomar and the Convent of Christ are a short drive away, for those who want to add some history to their rest.",
      ],
      destaques: [
        "Swimming pool",
        "4 bedrooms and 2 bathrooms",
        "Wood-fired oven and barbecue",
        "Estate of about 5 hectares",
      ],
      comodidades: ["Swimming pool", "Air conditioning", "Wood-fired oven", "Barbecue", "Garden", "Fireplace", "Wi-Fi"],
      capacidade: "",
      verLabel: "See the estate",
      perto: [
        {
          nome: "Convent of Christ",
          nota: "UNESCO World Heritage Site and former Templar headquarters, in Tomar.",
        },
        {
          nome: "Castelo do Bode reservoir",
          nota: "River beaches, boat trips and water sports.",
        },
        {
          nome: "Tomar old town",
          nota: "Old streets along the Nabão river and the Sete Montes woodland park.",
        },
      ],
    },
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
    quartos: 4,
    checkOut: "11:00",
    comodidades: [
      "Piscina privada",
      "Jardim",
      "Churrasqueira",
      "Estacionamento privado",
      "Lareira",
      "Cozinha equipada",
      "Berço gratuito",
      "Wi-Fi",
    ],
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
      { src: "/fotos/cantinho-piscina.jpg", alt: "Piscina d’O Nosso Cantinho com escadas, rodeada pela casa amarela", en: "O Nosso Cantinho pool with steps, surrounded by the yellow house" },
      { src: "/fotos/cantinho-arco-piscina.jpg", alt: "A piscina vista através de um arco na parede", en: "The pool seen through an arch in the wall" },
      { src: "/fotos/cantinho-piscina-terraco.jpg", alt: "Piscina e terraço com chapéus de sol", en: "Pool and terrace with parasols" },
      { src: "/fotos/cantinho-esplanada.jpg", alt: "Mesa exterior para oito pessoas ao fim do dia", en: "Outdoor table for eight in the evening" },
      { src: "/fotos/cantinho-jardim-casa.jpg", alt: "Casa amarela com jardim e árvore em frente", en: "Yellow house with a garden and a tree in front" },
      { src: "/fotos/cantinho-jardim.jpg", alt: "Jardim relvado com árvores", en: "Lawn garden with trees" },
      { src: "/fotos/cantinho-sala.jpg", alt: "Sala com sofás claros", en: "Living room with light-coloured sofas" },
      { src: "/fotos/cantinho-sala-lareira.jpg", alt: "Sala com lareira e televisão", en: "Living room with fireplace and television" },
      { src: "/fotos/cantinho-cozinha.jpg", alt: "Cozinha equipada com forno e máquina de lavar", en: "Equipped kitchen with oven and washing machine" },
      { src: "/fotos/cantinho-sala-jantar.jpg", alt: "Mesa de jantar junto à janela", en: "Dining table by the window" },
      { src: "/fotos/cantinho-quarto-casal.jpg", alt: "Quarto de casal com janela para o jardim", en: "Double bedroom with a window onto the garden" },
      { src: "/fotos/cantinho-quarto-2.jpg", alt: "Quarto de casal com cortinas cor de laranja", en: "Double bedroom with orange curtains" },
      { src: "/fotos/cantinho-quarto-3.jpg", alt: "Quarto de casal com cómoda e espelho", en: "Double bedroom with a chest of drawers and a mirror" },
      { src: "/fotos/cantinho-quarto-4.jpg", alt: "Quarto com sofá-cama", en: "Bedroom with a sofa bed" },
      { src: "/fotos/cantinho-churrasqueira.jpg", alt: "Churrasqueira e cozinha exterior", en: "Barbecue and outdoor kitchen" },
    ],
    rnal: "",
    airbnb: "https://www.airbnb.com/rooms/16760512",
    booking: "https://www.booking.com/hotel/pt/o-nosso-cantinho-private-pool.html",
    avaliacao: {
      nota: 9.2,
      plataforma: "Booking.com",
      link: "https://www.booking.com/hotel/pt/o-nosso-cantinho-private-pool.html",
    },
    en: {
      doNome: "for O Nosso Cantinho",
      local: "Várzea, Santarém",
      tipo: "Villa with private pool",
      frase: "A villa with a private pool and room for the whole family, in Várzea, on the edge of Santarém.",
      descricao: [
        "O Nosso Cantinho is a four-bedroom villa with outbuildings and a private pool in Várzea, a quiet village on the edge of Santarém.",
        "There is room for families and groups: 4 bedrooms, 2 bathrooms, a garden, a barbecue and private parking.",
        "It is a good base for exploring Santarém, the Tagus floodplain (the lezíria) and the rest of the Ribatejo.",
      ],
      destaques: [
        "Private pool",
        "4 bedrooms and 2 bathrooms",
        "Garden and barbecue",
        "Close to Santarém city centre",
      ],
      comodidades: [
        "Private pool",
        "Garden",
        "Barbecue",
        "Private parking",
        "Fireplace",
        "Equipped kitchen",
        "Free cot",
        "Wi-Fi",
      ],
      capacidade: "Up to 8 guests (3 double bedrooms and 1 twin room)",
      verLabel: "See the house",
      perto: [
        {
          nome: "Portas do Sol garden",
          nota: "A viewpoint over the Tagus and the lezíria, at the top of the city.",
        },
        {
          nome: "Santarém old town",
          nota: "Known as Portugal's capital of Gothic, with medieval churches and convents.",
        },
        {
          nome: "The Tagus lezíria",
          nota: "Open countryside, horses and Ribatejo traditions.",
        },
      ],
    },
  },
];

export const getCasa = (slug: string) => casas.find((c) => c.slug === slug);

// A casa com os textos na língua pedida (as fotos ficam com o "alt" dessa língua).
export function casaEm(casa: Casa, l: "pt" | "en"): Casa {
  if (l === "pt") return casa;
  const { doNome, local, tipo, frase, descricao, destaques, comodidades, capacidade, verLabel, perto } = casa.en;
  return {
    ...casa,
    doNome,
    local,
    tipo,
    frase,
    descricao,
    destaques,
    comodidades,
    capacidade,
    verLabel,
    perto,
    fotos: casa.fotos.map((f) => ({ ...f, alt: f.en })),
  };
}

export const casasEm = (l: "pt" | "en") => casas.map((c) => casaEm(c, l));

export const whatsappLink = (texto = "Olá! Gostaria de saber a disponibilidade.") =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`
    : "";

export const emailLink = (assunto: string, corpo = "") =>
  `mailto:${site.email}?subject=${encodeURIComponent(assunto)}${
    corpo ? `&body=${encodeURIComponent(corpo)}` : ""
  }`;
