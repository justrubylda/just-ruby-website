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

// alt: descrição da foto em português; en, es, fr: a mesma descrição em inglês, espanhol e francês.
export type Foto = { src: string; alt: string; en: string; es: string; fr: string };

// Textos da casa nas outras línguas do site (inglês, espanhol, francês).
export type CasaTextos = {
  doNome: string; // "for Kingdom of Stone", "del Kingdom of Stone", "pour le Kingdom of Stone"
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
  // "alt" descreve a foto em português; "en", "es" e "fr" em inglês, espanhol e francês.
  // A primeira foto é a capa. Ex.: { src: "/fotos/kos-piscina.jpg", alt: "Piscina da quinta ao fim da tarde", en: "Pool in the late afternoon", es: "Piscina al final de la tarde", fr: "Piscine en fin d'après-midi" }
  fotos: Foto[];

  rnal: string; // n.º de registo de Alojamento Local (deve aparecer no site)
  airbnb: string; // link do anúncio no Airbnb
  booking: string; // link do anúncio no Booking.com

  // Nota real dos hóspedes numa plataforma. Atualizar quando mudar. null = não aparece.
  avaliacao: { nota: number; plataforma: string; link: string } | null;

  en: CasaTextos;
  es: CasaTextos;
  fr: CasaTextos;
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
      { src: "/fotos/kos-piscina-casa.jpg", alt: "Piscina do Kingdom of Stone com a casa ao fundo, entre pinheiros", en: "Kingdom of Stone pool with the house behind, among pine trees", es: "Piscina del Kingdom of Stone con la casa al fondo, entre pinos", fr: "Piscine du Kingdom of Stone avec la maison au fond, entre les pins" },
      { src: "/fotos/kos-piscina-reflexo.jpg", alt: "Piscina com as árvores refletidas na água", en: "Pool with the trees reflected in the water", es: "Piscina con los árboles reflejados en el agua", fr: "Piscine où se reflètent les arbres" },
      { src: "/fotos/kos-piscina-por-do-sol.jpg", alt: "Piscina ao pôr do sol", en: "Pool at sunset", es: "Piscina al atardecer", fr: "Piscine au coucher du soleil" },
      { src: "/fotos/kos-sala.jpg", alt: "Sala com sofás, lareira e paredes de pedra", en: "Living room with sofas, fireplace and stone walls", es: "Salón con sofás, chimenea y paredes de piedra", fr: "Salon avec canapés, cheminée et murs en pierre" },
      { src: "/fotos/kos-sala-pedra.jpg", alt: "Sala com teto de madeira e sofás", en: "Living room with a wooden ceiling and sofas", es: "Salón con techo de madera y sofás", fr: "Salon avec plafond en bois et canapés" },
      { src: "/fotos/kos-quarto-casal.jpg", alt: "Quarto de casal com colcha de patchwork", en: "Double bedroom with a patchwork bedspread", es: "Dormitorio doble con colcha de patchwork", fr: "Chambre double avec couvre-lit en patchwork" },
      { src: "/fotos/kos-quarto-verde.jpg", alt: "Quarto com cama de ferro e colcha verde", en: "Bedroom with an iron bed and a green bedspread", es: "Dormitorio con cama de hierro y colcha verde", fr: "Chambre avec lit en fer forgé et couvre-lit vert" },
      { src: "/fotos/kos-quarto-azul.jpg", alt: "Quarto com cama individual e janela azul", en: "Bedroom with a single bed and a blue window", es: "Dormitorio con cama individual y ventana azul", fr: "Chambre avec lit simple et fenêtre bleue" },
      { src: "/fotos/kos-casa-de-banho-banheira.jpg", alt: "Casa de banho com banheira", en: "Bathroom with a freestanding bathtub", es: "Baño con bañera", fr: "Salle de bains avec baignoire" },
      { src: "/fotos/kos-casa-de-banho-duche.jpg", alt: "Casa de banho com duche", en: "Bathroom with a shower", es: "Baño con ducha", fr: "Salle d'eau avec douche" },
      { src: "/fotos/kos-sala-jantar.jpg", alt: "Sala de jantar com mesa redonda e cristaleira", en: "Dining room with a round table and a glass cabinet", es: "Comedor con mesa redonda y vitrina", fr: "Salle à manger avec table ronde et vaisselier vitré" },
      { src: "/fotos/kos-cozinha-lareira.jpg", alt: "Cozinha com lareira grande", en: "Kitchen with a large fireplace", es: "Cocina con una gran chimenea", fr: "Cuisine avec une grande cheminée" },
      { src: "/fotos/kos-forno-churrasqueira.jpg", alt: "Forno a lenha e churrasqueira em pedra", en: "Stone wood-fired oven and barbecue", es: "Horno de leña y barbacoa de piedra", fr: "Four à bois et barbecue en pierre" },
      { src: "/fotos/kos-pergula.jpg", alt: "Pérgula com videira em frente à casa", en: "Vine-covered pergola in front of the house", es: "Pérgola con parra delante de la casa", fr: "Pergola couverte de vigne devant la maison" },
      { src: "/fotos/kos-casa-loendros.jpg", alt: "Casa branca com loendros floridos", en: "White house with flowering oleanders", es: "Casa blanca con adelfas en flor", fr: "Maison blanche avec des lauriers-roses en fleurs" },
      { src: "/fotos/kos-jardim-flores.jpg", alt: "Jardim florido em frente à casa", en: "Flowering garden in front of the house", es: "Jardín florido delante de la casa", fr: "Jardin fleuri devant la maison" },
      { src: "/fotos/kos-albufeira.jpg", alt: "Margem da albufeira de Castelo do Bode", en: "Shore of the Castelo do Bode reservoir", es: "Orilla del embalse de Castelo do Bode", fr: "Rive du lac de barrage de Castelo do Bode" },
      { src: "/fotos/kos-albufeira-barco.jpg", alt: "Barcos na albufeira de Castelo do Bode", en: "Boats on the Castelo do Bode reservoir", es: "Barcos en el embalse de Castelo do Bode", fr: "Bateaux sur le lac de Castelo do Bode" },
      { src: "/fotos/kos-albufeira-aerea.jpg", alt: "Albufeira de Castelo do Bode vista do ar", en: "Aerial view of the Castelo do Bode reservoir", es: "Vista aérea del embalse de Castelo do Bode", fr: "Vue aérienne du lac de Castelo do Bode" },
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
    es: {
      doNome: "del Kingdom of Stone",
      local: "Olalhas, Tomar",
      tipo: "Finca con piscina",
      frase: "Una finca de cinco hectáreas con piscina, en pleno campo, a unos 20 minutos de Tomar.",
      descricao: [
        "Kingdom of Stone es una finca de unas cinco hectáreas en Olalhas, en el municipio de Tomar, cerca del embalse de Castelo do Bode.",
        "La casa tiene 4 dormitorios, 2 baños, salón y aire acondicionado. Fuera hay piscina, jardín, una pérgola con parra, horno de leña y barbacoa. Es un lugar para bajar el ritmo: mañanas tranquilas, tardes en la piscina y noches en silencio.",
        "Tomar y el Convento de Cristo quedan a poca distancia en coche, para quien quiera sumar historia al descanso.",
      ],
      destaques: [
        "Piscina",
        "4 dormitorios y 2 baños",
        "Horno de leña y barbacoa",
        "Finca de unas 5 hectáreas",
      ],
      comodidades: [
        "Piscina",
        "Aire acondicionado",
        "Horno de leña",
        "Barbacoa",
        "Jardín",
        "Chimenea",
        "Wi-Fi",
      ],
      capacidade: "",
      verLabel: "Ver la finca",
      perto: [
        { nome: "Convento de Cristo", nota: "Patrimonio Mundial de la UNESCO y antigua sede de los templarios, en Tomar." },
        { nome: "Embalse de Castelo do Bode", nota: "Playas fluviales, paseos en barco y deportes náuticos." },
        { nome: "Centro histórico de Tomar", nota: "Calles antiguas junto al río Nabão y el parque de la Mata dos Sete Montes." },
      ],
    },
    fr: {
      doNome: "pour le Kingdom of Stone",
      local: "Olalhas, Tomar",
      tipo: "Domaine avec piscine",
      frase: "Un domaine de cinq hectares avec piscine, en pleine campagne, à environ 20 minutes de Tomar.",
      descricao: [
        "Le Kingdom of Stone est un domaine d'environ cinq hectares à Olalhas, dans la commune de Tomar, près du lac de barrage de Castelo do Bode.",
        "La maison compte 4 chambres, 2 salles de bains, un salon et la climatisation. Dehors, il y a une piscine, un jardin, une pergola couverte de vigne, un four à bois et un barbecue. C'est un lieu pour ralentir : matinées calmes, après-midi au bord de la piscine et nuits silencieuses.",
        "Tomar et le couvent du Christ sont à quelques minutes en voiture, pour ceux qui veulent ajouter un peu d'histoire au repos.",
      ],
      destaques: [
        "Piscine",
        "4 chambres et 2 salles de bains",
        "Four à bois et barbecue",
        "Domaine d'environ 5 hectares",
      ],
      comodidades: [
        "Piscine",
        "Climatisation",
        "Four à bois",
        "Barbecue",
        "Jardin",
        "Cheminée",
        "Wi-Fi",
      ],
      capacidade: "",
      verLabel: "Voir le domaine",
      perto: [
        { nome: "Couvent du Christ", nota: "Classé au patrimoine mondial de l'UNESCO, ancien siège des Templiers, à Tomar." },
        { nome: "Lac de Castelo do Bode", nota: "Plages fluviales, promenades en bateau et sports nautiques." },
        { nome: "Vieille ville de Tomar", nota: "Ruelles anciennes au bord du Nabão et le parc de la Mata dos Sete Montes." },
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
      { src: "/fotos/cantinho-piscina.jpg", alt: "Piscina d’O Nosso Cantinho com escadas, rodeada pela casa amarela", en: "O Nosso Cantinho pool with steps, surrounded by the yellow house", es: "Piscina de O Nosso Cantinho con escalera, rodeada por la casa amarilla", fr: "Piscine d'O Nosso Cantinho avec escalier, entourée par la maison jaune" },
      { src: "/fotos/cantinho-piscina-panoramica.jpg", alt: "Vista larga da piscina e da casa amarela", en: "Wide view of the pool and the yellow house", es: "Vista amplia de la piscina y la casa amarilla", fr: "Vue d'ensemble de la piscine et de la maison jaune" },
      { src: "/fotos/cantinho-arco-piscina.jpg", alt: "A piscina vista através de um arco na parede", en: "The pool seen through an arch in the wall", es: "La piscina vista a través de un arco en el muro", fr: "La piscine vue à travers une arche dans le mur" },
      { src: "/fotos/cantinho-piscina-terraco.jpg", alt: "Piscina e terraço com chapéus de sol", en: "Pool and terrace with parasols", es: "Piscina y terraza con sombrillas", fr: "Piscine et terrasse avec parasols" },
      { src: "/fotos/cantinho-esplanada.jpg", alt: "Mesa exterior para oito pessoas ao fim do dia", en: "Outdoor table for eight in the evening", es: "Mesa exterior para ocho personas al atardecer", fr: "Table extérieure pour huit personnes en fin de journée" },
      { src: "/fotos/cantinho-espreguicadeiras.jpg", alt: "Espreguiçadeiras e mesa à sombra dos guarda-sóis", en: "Sun loungers and a table under the parasols", es: "Tumbonas y mesa a la sombra de las sombrillas", fr: "Transats et table à l'ombre des parasols" },
      { src: "/fotos/cantinho-arco-azulejo.jpg", alt: "Muro com arco e painel de azulejos", en: "Wall with an arch and a tile panel", es: "Muro con arco y panel de azulejos", fr: "Mur avec arche et panneau d'azulejos" },
      { src: "/fotos/cantinho-azulejo.jpg", alt: "Painel de azulejos pintado à mão", en: "Hand-painted tile panel", es: "Panel de azulejos pintado a mano", fr: "Panneau d'azulejos peint à la main" },
      { src: "/fotos/cantinho-jardim-casa.jpg", alt: "Casa amarela com jardim e árvore em frente", en: "Yellow house with a garden and a tree in front", es: "Casa amarilla con jardín y un árbol delante", fr: "Maison jaune avec jardin et un arbre devant" },
      { src: "/fotos/cantinho-jardim.jpg", alt: "Jardim relvado com árvores", en: "Lawn garden with trees", es: "Jardín de césped con árboles", fr: "Jardin avec pelouse et arbres" },
      { src: "/fotos/cantinho-sala.jpg", alt: "Sala com sofás claros", en: "Living room with light-coloured sofas", es: "Salón con sofás claros", fr: "Salon avec canapés clairs" },
      { src: "/fotos/cantinho-sala-lareira.jpg", alt: "Sala com lareira e televisão", en: "Living room with fireplace and television", es: "Salón con chimenea y televisión", fr: "Salon avec cheminée et télévision" },
      { src: "/fotos/cantinho-cozinha.jpg", alt: "Cozinha equipada com forno e máquina de lavar", en: "Equipped kitchen with oven and washing machine", es: "Cocina equipada con horno y lavadora", fr: "Cuisine équipée avec four et lave-linge" },
      { src: "/fotos/cantinho-sala-jantar.jpg", alt: "Mesa de jantar junto à janela", en: "Dining table by the window", es: "Mesa de comedor junto a la ventana", fr: "Table à manger près de la fenêtre" },
      { src: "/fotos/cantinho-quarto-casal.jpg", alt: "Quarto de casal com janela para o jardim", en: "Double bedroom with a window onto the garden", es: "Dormitorio doble con ventana al jardín", fr: "Chambre double avec fenêtre sur le jardin" },
      { src: "/fotos/cantinho-quarto-berco.jpg", alt: "Quarto de casal com berço", en: "Double bedroom with a cot", es: "Dormitorio doble con cuna", fr: "Chambre double avec lit bébé" },
      { src: "/fotos/cantinho-quarto-2.jpg", alt: "Quarto de casal com cortinas cor de laranja", en: "Double bedroom with orange curtains", es: "Dormitorio doble con cortinas naranjas", fr: "Chambre double avec rideaux orange" },
      { src: "/fotos/cantinho-quarto-3.jpg", alt: "Quarto de casal com cómoda e espelho", en: "Double bedroom with a chest of drawers and a mirror", es: "Dormitorio doble con cómoda y espejo", fr: "Chambre double avec commode et miroir" },
      { src: "/fotos/cantinho-quarto-4.jpg", alt: "Quarto com sofá-cama", en: "Bedroom with a sofa bed", es: "Dormitorio con sofá cama", fr: "Chambre avec canapé-lit" },
      { src: "/fotos/cantinho-casa-de-banho.jpg", alt: "Casa de banho com lavatório duplo", en: "Bathroom with a double washbasin", es: "Baño con lavabo doble", fr: "Salle de bains avec double vasque" },
      { src: "/fotos/cantinho-casa-de-banho-duche.jpg", alt: "Casa de banho com duche", en: "Bathroom with a shower", es: "Baño con ducha", fr: "Salle d'eau avec douche" },
      { src: "/fotos/cantinho-churrasqueira.jpg", alt: "Churrasqueira e cozinha exterior", en: "Barbecue and outdoor kitchen", es: "Barbacoa y cocina exterior", fr: "Barbecue et cuisine d'été" },
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
    es: {
      doNome: "de O Nosso Cantinho",
      local: "Várzea, Santarém",
      tipo: "Villa con piscina privada",
      frase: "Una villa con piscina privada y espacio para toda la familia, en Várzea, a las puertas de Santarém.",
      descricao: [
        "O Nosso Cantinho es una villa de cuatro dormitorios con anexos y piscina privada en Várzea, un pueblo tranquilo a las puertas de Santarém.",
        "Hay espacio para familias y grupos: 4 dormitorios, 2 baños, jardín, barbacoa y aparcamiento privado.",
        "Es una buena base para conocer Santarém, la vega del Tajo (la lezíria) y el resto del Ribatejo.",
      ],
      destaques: [
        "Piscina privada",
        "4 dormitorios y 2 baños",
        "Jardín y barbacoa",
        "Cerca del centro de Santarém",
      ],
      comodidades: [
        "Piscina privada",
        "Jardín",
        "Barbacoa",
        "Aparcamiento privado",
        "Chimenea",
        "Cocina equipada",
        "Cuna gratuita",
        "Wi-Fi",
      ],
      capacidade: "Hasta 8 huéspedes (3 dormitorios dobles y 1 con dos camas)",
      verLabel: "Ver la casa",
      perto: [
        { nome: "Jardín de las Portas do Sol", nota: "Mirador sobre el Tajo y la lezíria, en lo alto de la ciudad." },
        { nome: "Centro histórico de Santarém", nota: "Conocida como la capital del gótico, con iglesias y conventos medievales." },
        { nome: "La lezíria del Tajo", nota: "Campo abierto, caballos y tradición ribatejana." },
      ],
    },
    fr: {
      doNome: "pour O Nosso Cantinho",
      local: "Várzea, Santarém",
      tipo: "Villa avec piscine privée",
      frase: "Une villa avec piscine privée et de la place pour toute la famille, à Várzea, aux portes de Santarém.",
      descricao: [
        "O Nosso Cantinho est une villa de quatre chambres avec dépendances et piscine privée à Várzea, un village tranquille aux portes de Santarém.",
        "Il y a de la place pour les familles et les groupes : 4 chambres, 2 salles de bains, un jardin, un barbecue et un parking privé.",
        "C'est un bon point de départ pour découvrir Santarém, la plaine du Tage (la lezíria) et le reste du Ribatejo.",
      ],
      destaques: [
        "Piscine privée",
        "4 chambres et 2 salles de bains",
        "Jardin et barbecue",
        "Près du centre de Santarém",
      ],
      comodidades: [
        "Piscine privée",
        "Jardin",
        "Barbecue",
        "Parking privé",
        "Cheminée",
        "Cuisine équipée",
        "Lit bébé gratuit",
        "Wi-Fi",
      ],
      capacidade: "Jusqu'à 8 personnes (3 chambres doubles et 1 chambre à deux lits)",
      verLabel: "Voir la maison",
      perto: [
        { nome: "Jardin des Portas do Sol", nota: "Belvédère sur le Tage et la lezíria, en haut de la ville." },
        { nome: "Vieille ville de Santarém", nota: "Surnommée la capitale du gothique, avec ses églises et couvents médiévaux." },
        { nome: "La lezíria du Tage", nota: "Grands espaces, chevaux et traditions du Ribatejo." },
      ],
    },
  },
];

export const getCasa = (slug: string) => casas.find((c) => c.slug === slug);

// A casa com os textos na língua pedida (as fotos ficam com o "alt" dessa língua).
export function casaEm(casa: Casa, l: "pt" | "en" | "es" | "fr"): Casa {
  if (l === "pt") return casa;
  const { doNome, local, tipo, frase, descricao, destaques, comodidades, capacidade, verLabel, perto } = casa[l];
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
    fotos: casa.fotos.map((f) => ({ ...f, alt: f[l] })),
  };
}

export const casasEm = (l: "pt" | "en" | "es" | "fr") => casas.map((c) => casaEm(c, l));

export const whatsappLink = (texto = "Olá! Gostaria de saber a disponibilidade.") =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`
    : "";

export const emailLink = (assunto: string, corpo = "") =>
  `mailto:${site.email}?subject=${encodeURIComponent(assunto)}${
    corpo ? `&body=${encodeURIComponent(corpo)}` : ""
  }`;
