// =====================================================================
//  GUIA DO HÓSPEDE — o link que se envia depois da reserva.
//    https://www.justruby.pt/guia/kingdom-of-stone
//    https://www.justruby.pt/guia/o-nosso-cantinho
//
//  O CÓDIGO DO COFRE NUNCA SE ESCREVE AQUI (o repositório é público).
//  Vai no próprio link, depois do #:  .../guia/kingdom-of-stone#1234
//  Quem abrir esse link vê o código; quem abrir o link sem # não vê.
//
//  Wi-Fi: fica em variáveis de ambiente na Vercel (também não vai para aqui):
//    WIFI_REDE_KINGDOM_OF_STONE, WIFI_SENHA_KINGDOM_OF_STONE
//    WIFI_REDE_O_NOSSO_CANTINHO, WIFI_SENHA_O_NOSSO_CANTINHO
//
//  Textos em 4 línguas: pt, en, es, fr. Campos vazios ficam escondidos.
// =====================================================================

export const LINGUAS = ["pt", "en", "es", "fr"] as const;
export type Lingua = (typeof LINGUAS)[number];
export type L = Record<Lingua, string>;

export type Passo = { titulo: L; texto?: L; fotos?: { src: string; alt: string }[] };

export type Guia = {
  slug: string; // igual ao da casa em app/site.ts
  local: L;
  capa: { src: string; alt: string };
  checkIn: L;
  checkInNota?: L;
  checkOut?: L; // ex.: { pt: "até às 11h00", ... }. Vazio = não aparece.
  avisoChegada?: L; // ex.: caução. Vazio = não aparece.
  mapa: string;
  mapaNota: L;
  passos: Passo[];
  cofreDepois: L; // o que fazer depois de tirar as chaves
  galeria?: { src: string; alt: string }[];
  casa: L[]; // o que a casa tem
  regras: L[];
  saida: L[]; // lista antes de sair
  perto: { nome: L; nota: L }[];
  hospedesMax: number;
};

/** Contacto dos anfitriões para os hóspedes (WhatsApp e telefone). */
export const anfitrioes = {
  nomes: "Bruno & Rúbia",
  nome: "Bruno",
  telefone: "351961736593",
  telefoneVisivel: "+351 961 736 593",
};

const regrasBase: L[] = [
  {
    pt: "Não é permitido fumar dentro de casa.",
    en: "No smoking indoors.",
    es: "No se permite fumar dentro de la casa.",
    fr: "Il est interdit de fumer à l’intérieur.",
  },
  {
    pt: "Festas ou eventos só com autorização prévia.",
    en: "Parties or events only with prior approval.",
    es: "Fiestas o eventos solo con autorización previa.",
    fr: "Fêtes ou événements uniquement avec accord préalable.",
  },
  {
    pt: "Silêncio entre as 22h00 e as 08h00, por respeito aos vizinhos.",
    en: "Quiet hours from 10 pm to 8 am, out of respect for the neighbours.",
    es: "Silencio entre las 22:00 y las 08:00, por respeto a los vecinos.",
    fr: "Silence entre 22h00 et 8h00, par respect pour les voisins.",
  },
  {
    pt: "Só os hóspedes registados podem pernoitar.",
    en: "Only registered guests may stay overnight.",
    es: "Solo los huéspedes registrados pueden pernoctar.",
    fr: "Seuls les voyageurs enregistrés peuvent passer la nuit.",
  },
  {
    pt: "Piscina: crianças sempre acompanhadas por um adulto e nada de copos de vidro à volta da piscina.",
    en: "Pool: children must always be supervised by an adult, and no glass around the pool.",
    es: "Piscina: los niños siempre acompañados por un adulto y nada de vasos de cristal alrededor de la piscina.",
    fr: "Piscine : enfants toujours accompagnés d’un adulte, et pas de verre autour de la piscine.",
  },
  {
    pt: "Animais de estimação só com autorização prévia.",
    en: "Pets only with prior approval.",
    es: "Mascotas solo con autorización previa.",
    fr: "Animaux uniquement avec accord préalable.",
  },
];

const saidaBase: L[] = [
  {
    pt: "Loiça lavada e arrumada",
    en: "Dishes washed and put away",
    es: "Vajilla lavada y guardada",
    fr: "Vaisselle lavée et rangée",
  },
  {
    pt: "Lixo nos contentores, com os recicláveis separados",
    en: "Rubbish in the bins, with recycling separated",
    es: "Basura en los contenedores, con el reciclaje separado",
    fr: "Déchets dans les conteneurs, recyclables triés",
  },
  {
    pt: "Ar condicionado, luzes e aparelhos desligados",
    en: "Air conditioning, lights and appliances switched off",
    es: "Aire acondicionado, luces y aparatos apagados",
    fr: "Climatisation, lumières et appareils éteints",
  },
  {
    pt: "Janelas fechadas e portas trancadas",
    en: "Windows closed and doors locked",
    es: "Ventanas cerradas y puertas con llave",
    fr: "Fenêtres fermées et portes verrouillées",
  },
  {
    pt: "Chaves de volta ao cofre, com os dígitos baralhados",
    en: "Keys back in the key safe, with the digits scrambled",
    es: "Llaves de vuelta en la caja, con los dígitos mezclados",
    fr: "Clés remises dans la boîte, chiffres brouillés",
  },
  {
    pt: "Uma mensagem a avisar que já saíram",
    en: "A message to let us know you have left",
    es: "Un mensaje para avisarnos de que ya han salido",
    fr: "Un message pour nous dire que vous êtes partis",
  },
];

const checkIn17: L = {
  pt: "a partir das 17h00",
  en: "from 5:00 pm",
  es: "a partir de las 17:00",
  fr: "à partir de 17h00",
};
const salvoCombinado: L = {
  pt: "Salvo outro horário combinado connosco.",
  en: "Unless agreed otherwise with us.",
  es: "Salvo otro horario acordado con nosotros.",
  fr: "Sauf autre horaire convenu avec nous.",
};

export const guias: Guia[] = [
  {
    slug: "kingdom-of-stone",
    local: { pt: "Olalhas, Tomar", en: "Olalhas, Tomar", es: "Olalhas, Tomar", fr: "Olalhas, Tomar" },
    capa: { src: "/fotos/kos-piscina-casa.jpg", alt: "Piscina do Kingdom of Stone com a casa ao fundo" },
    checkIn: checkIn17,
    checkInNota: salvoCombinado,
    mapa: "https://maps.app.goo.gl/41xUhWKytGMnzdKv6",
    mapaNota: {
      pt: "Usem este link para não se perderem: o GPS pelo nome da rua pode levar ao sítio errado.",
      en: "Please use this link so you don’t get lost: searching by street name can take you to the wrong place.",
      es: "Usen este enlace para no perderse: buscar por el nombre de la calle puede llevar al sitio equivocado.",
      fr: "Utilisez ce lien pour ne pas vous perdre : la recherche par nom de rue peut mener au mauvais endroit.",
    },
    passos: [
      {
        titulo: {
          pt: "Sigam o link do Maps até à rua",
          en: "Follow the Maps link to the street",
          es: "Sigan el enlace de Maps hasta la calle",
          fr: "Suivez le lien Maps jusqu’à la rue",
        },
        texto: {
          pt: "A chegada é por esta rua. Virem à esquerda e depois à direita, sempre por alcatrão.",
          en: "You arrive along this road. Turn left, then right, staying on the paved road.",
          es: "Se llega por esta calle. Giren a la izquierda y luego a la derecha, siempre por asfalto.",
          fr: "On arrive par cette rue. Tournez à gauche puis à droite, en restant sur la route goudronnée.",
        },
        fotos: [
          { src: "/guia/kos-rua-1.jpg", alt: "Rua de chegada" },
          { src: "/guia/kos-rua-2.jpg", alt: "Rua de chegada com casa branca à esquerda" },
          { src: "/guia/kos-rua-vinha.jpg", alt: "Rua junto à vinha" },
        ],
      },
      {
        titulo: {
          pt: "Ao verem a casa, virem à esquerda até ao portão verde",
          en: "When you see the house, turn left to the green gate",
          es: "Al ver la casa, giren a la izquierda hasta el portón verde",
          fr: "En voyant la maison, tournez à gauche jusqu’au portail vert",
        },
        texto: {
          pt: "A casa é branca, de piso térreo, com chaminé alta.",
          en: "It’s a white single-storey house with a tall chimney.",
          es: "La casa es blanca, de una sola planta, con una chimenea alta.",
          fr: "C’est une maison blanche de plain-pied avec une haute cheminée.",
        },
      },
      {
        titulo: {
          pt: "Abram o portão e vão em direção ao forno a lenha",
          en: "Open the gate and head to the wood-fired oven",
          es: "Abran el portón y vayan hacia el horno de leña",
          fr: "Ouvrez le portail et dirigez-vous vers le four à bois",
        },
        texto: {
          pt: "O forno fica à direita de quem entra, junto à churrasqueira. Do lado oposto está o cofre, pendurado junto à videira.",
          en: "The oven is on the right as you come in, next to the barbecue. On the opposite side you’ll see the key safe hanging by the grapevine.",
          es: "El horno está a la derecha al entrar, junto a la barbacoa. En el lado opuesto verán la caja de llaves colgada junto a la parra.",
          fr: "Le four est à droite en entrant, à côté du barbecue. Du côté opposé, la boîte à clés est accrochée près de la vigne.",
        },
        fotos: [{ src: "/guia/kos-portao-forno.jpg", alt: "Portão aberto com o forno a lenha ao fundo, à direita" }],
      },
      {
        titulo: {
          pt: "Abram o cofre das chaves",
          en: "Open the key safe",
          es: "Abran la caja de llaves",
          fr: "Ouvrez la boîte à clés",
        },
        texto: {
          pt: "Puxem a tampa preta para baixo, marquem o código, pressionem o botão preto para baixo e abram a tampa.",
          en: "Pull the black cover down, enter the code, press the black button down and open the lid.",
          es: "Bajen la tapa negra, marquen el código, presionen el botón negro hacia abajo y abran la tapa.",
          fr: "Abaissez le cache noir, composez le code, appuyez sur le bouton noir vers le bas et ouvrez le couvercle.",
        },
        fotos: [{ src: "/guia/kos-cofre.jpg", alt: "Cofre das chaves junto à videira" }],
      },
    ],
    cofreDepois: {
      pt: "Aí estão as chaves do vosso Reino. Voltem a fechar o cofre e baralhem os dígitos.",
      en: "There are the keys to your Kingdom. Please close the safe again and scramble the digits.",
      es: "Ahí están las llaves de su Reino. Vuelvan a cerrar la caja y mezclen los dígitos.",
      fr: "Voici les clés de votre Royaume. Refermez la boîte et brouillez les chiffres.",
    },
    galeria: [
      { src: "/fotos/kos-sala.jpg", alt: "Sala com lareira e paredes de pedra" },
      { src: "/fotos/kos-pergula.jpg", alt: "Pérgula com videira em frente à casa" },
      { src: "/fotos/kos-forno-churrasqueira.jpg", alt: "Forno a lenha e churrasqueira" },
    ],
    casa: [
      { pt: "Piscina", en: "Swimming pool", es: "Piscina", fr: "Piscine" },
      { pt: "4 quartos e 2 casas de banho", en: "4 bedrooms and 2 bathrooms", es: "4 dormitorios y 2 baños", fr: "4 chambres et 2 salles de bain" },
      { pt: "Ar condicionado e sala de estar", en: "Air conditioning and living room", es: "Aire acondicionado y salón", fr: "Climatisation et salon" },
      { pt: "Forno a lenha e churrasqueira", en: "Wood-fired oven and barbecue", es: "Horno de leña y barbacoa", fr: "Four à bois et barbecue" },
      { pt: "Quinta com cerca de 5 hectares", en: "A farm of about 5 hectares", es: "Finca de unas 5 hectáreas", fr: "Domaine d’environ 5 hectares" },
      {
        pt: "Praia fluvial a cerca de 1 km, no rio Zêzere",
        en: "River beach about 1 km away, on the Zêzere",
        es: "Playa fluvial a 1 km, en el río Zêzere",
        fr: "Plage fluviale à environ 1 km, sur le Zêzere",
      },
    ],
    regras: regrasBase,
    saida: saidaBase,
    perto: [
      {
        nome: { pt: "Convento de Cristo", en: "Convent of Christ", es: "Convento de Cristo", fr: "Couvent du Christ" },
        nota: {
          pt: "Património Mundial da UNESCO e antiga sede dos Templários, em Tomar.",
          en: "UNESCO World Heritage Site and former Templar headquarters, in Tomar.",
          es: "Patrimonio Mundial de la UNESCO y antigua sede templaria, en Tomar.",
          fr: "Patrimoine mondial de l’UNESCO et ancien siège des Templiers, à Tomar.",
        },
      },
      {
        nome: {
          pt: "Albufeira de Castelo do Bode",
          en: "Castelo do Bode reservoir",
          es: "Embalse de Castelo do Bode",
          fr: "Lac de Castelo do Bode",
        },
        nota: {
          pt: "Praias fluviais, passeios de barco e desportos náuticos.",
          en: "River beaches, boat trips and water sports.",
          es: "Playas fluviales, paseos en barco y deportes náuticos.",
          fr: "Plages fluviales, balades en bateau et sports nautiques.",
        },
      },
      {
        nome: {
          pt: "Centro histórico de Tomar",
          en: "Tomar old town",
          es: "Centro histórico de Tomar",
          fr: "Centre historique de Tomar",
        },
        nota: {
          pt: "Ruas antigas junto ao rio Nabão e a Mata dos Sete Montes.",
          en: "Old streets by the Nabão river and the Sete Montes woods.",
          es: "Calles antiguas junto al río Nabão y el parque de los Sete Montes.",
          fr: "Ruelles anciennes au bord du Nabão et le parc des Sete Montes.",
        },
      },
    ],
    hospedesMax: 8,
  },
  {
    slug: "o-nosso-cantinho",
    local: { pt: "Várzea, Santarém", en: "Várzea, Santarém", es: "Várzea, Santarém", fr: "Várzea, Santarém" },
    capa: { src: "/fotos/cantinho-piscina.jpg", alt: "Piscina d’O Nosso Cantinho com a casa amarela à volta" },
    checkIn: checkIn17,
    checkInNota: salvoCombinado,
    checkOut: { pt: "até às 11h00", en: "by 11:00 am", es: "hasta las 11:00", fr: "avant 11h00" },
    avisoChegada: {
      pt: "É pedida uma caução de 300 € em numerário à chegada, devolvida na saída depois de vermos a casa.",
      en: "A €300 cash deposit is required on arrival and returned at check-out after we check the house.",
      es: "Se pide una fianza de 300 € en efectivo a la llegada, que se devuelve a la salida tras revisar la casa.",
      fr: "Une caution de 300 € en espèces est demandée à l’arrivée et rendue au départ après vérification de la maison.",
    },
    mapa: "https://goo.gl/maps/2QRChiywW912",
    mapaNota: {
      pt: "Para evitar enganos no caminho, siga sempre pela localização exata.",
      en: "To avoid any confusion on the way, please follow the exact location.",
      es: "Para evitar confusiones por el camino, siga siempre la ubicación exacta.",
      fr: "Pour éviter toute erreur de chemin, suivez toujours la localisation exacte.",
    },
    passos: [
      {
        titulo: {
          pt: "Dirija-se ao portão verde da esquerda",
          en: "Head to the green gate on the left",
          es: "Diríjase al portón verde de la izquierda",
          fr: "Dirigez-vous vers le portail vert de gauche",
        },
        texto: {
          pt: "À chegada vai encontrar dois portões verdes em frente à propriedade. Siga para o da esquerda.",
          en: "On arrival you’ll see two large green gates in front of the property. Go to the one on the left.",
          es: "Al llegar verá dos portones verdes frente a la propiedad. Diríjase al de la izquierda.",
          fr: "À votre arrivée, vous verrez deux portails verts devant la propriété. Allez vers celui de gauche.",
        },
      },
      {
        titulo: {
          pt: "Encontre o cofre junto à caixa do correio",
          en: "Find the key safe by the mailbox",
          es: "Busque la caja de llaves junto al buzón",
          fr: "Trouvez la boîte à clés près de la boîte aux lettres",
        },
        texto: {
          pt: "Está no exterior, ao lado da caixa do correio.",
          en: "It’s on the outside, next to the mailbox.",
          es: "Está en el exterior, junto al buzón.",
          fr: "Elle est à l’extérieur, à côté de la boîte aux lettres.",
        },
      },
      {
        titulo: {
          pt: "Abra o cofre",
          en: "Open the key safe",
          es: "Abra la caja",
          fr: "Ouvrez la boîte à clés",
        },
        texto: {
          pt: "Introduza o código e pressione ao mesmo tempo os dois botões laterais. As chaves estão lá dentro.",
          en: "Enter the code, then press both side buttons at the same time. The keys are inside.",
          es: "Introduzca el código y presione a la vez los dos botones laterales. Las llaves están dentro.",
          fr: "Saisissez le code, puis appuyez simultanément sur les deux boutons latéraux. Les clés sont à l’intérieur.",
        },
      },
    ],
    cofreDepois: {
      pt: "Depois de tirar as chaves, volte a fechar o cofre e baralhe os dígitos.",
      en: "Once you have the keys, please close the safe again and scramble the digits.",
      es: "Después de sacar las llaves, vuelva a cerrar la caja y mezcle los dígitos.",
      fr: "Une fois les clés récupérées, refermez la boîte et brouillez les chiffres.",
    },
    galeria: [
      { src: "/fotos/cantinho-esplanada.jpg", alt: "Mesa exterior junto à piscina" },
      { src: "/fotos/cantinho-sala-lareira.jpg", alt: "Sala com lareira" },
      { src: "/fotos/cantinho-cozinha.jpg", alt: "Cozinha equipada" },
    ],
    casa: [
      { pt: "Piscina privada (sazonal)", en: "Private pool (seasonal)", es: "Piscina privada (de temporada)", fr: "Piscine privée (saisonnière)" },
      { pt: "4 quartos e 2 casas de banho", en: "4 bedrooms and 2 bathrooms", es: "4 dormitorios y 2 baños", fr: "4 chambres et 2 salles de bain" },
      { pt: "Jardim e churrasqueira", en: "Garden and barbecue", es: "Jardín y barbacoa", fr: "Jardin et barbecue" },
      { pt: "Ar condicionado e lareira", en: "Air conditioning and fireplace", es: "Aire acondicionado y chimenea", fr: "Climatisation et cheminée" },
      { pt: "Estacionamento privado gratuito", en: "Free private parking", es: "Aparcamiento privado gratuito", fr: "Parking privé gratuit" },
      { pt: "Berço gratuito mediante pedido (0 a 3 anos)", en: "Free cot on request (ages 0–3)", es: "Cuna gratuita bajo petición (0 a 3 años)", fr: "Lit bébé gratuit sur demande (0 à 3 ans)" },
    ],
    regras: regrasBase,
    saida: saidaBase,
    perto: [
      {
        nome: {
          pt: "Jardim das Portas do Sol",
          en: "Portas do Sol garden",
          es: "Jardín de las Portas do Sol",
          fr: "Jardin des Portas do Sol",
        },
        nota: {
          pt: "Miradouro sobre o Tejo e a lezíria, no alto de Santarém.",
          en: "A viewpoint over the Tagus and its plains, at the top of Santarém.",
          es: "Mirador sobre el Tajo y la vega, en lo alto de Santarém.",
          fr: "Belvédère sur le Tage et ses plaines, en haut de Santarém.",
        },
      },
      {
        nome: {
          pt: "Centro histórico de Santarém",
          en: "Santarém old town",
          es: "Centro histórico de Santarém",
          fr: "Centre historique de Santarém",
        },
        nota: {
          pt: "Conhecida como a capital do gótico, com igrejas e conventos medievais.",
          en: "Known as Portugal’s Gothic capital, with medieval churches and convents.",
          es: "Conocida como la capital del gótico, con iglesias y conventos medievales.",
          fr: "Surnommée la capitale du gothique, avec ses églises et couvents médiévaux.",
        },
      },
      {
        nome: { pt: "Lezíria do Tejo", en: "Tagus lowlands", es: "Vega del Tajo", fr: "Plaine du Tage" },
        nota: {
          pt: "Campo aberto, cavalos e tradição ribatejana.",
          en: "Open countryside, horses and Ribatejo traditions.",
          es: "Campo abierto, caballos y tradición ribatejana.",
          fr: "Grands espaces, chevaux et traditions du Ribatejo.",
        },
      },
    ],
    hospedesMax: 8,
  },
];

export const getGuia = (slug: string) => guias.find((g) => g.slug === slug);

/** Wi-Fi da casa, lido das variáveis de ambiente (nunca do código). */
export function wifiDe(slug: string) {
  const sufixo = slug.toUpperCase().replace(/-/g, "_");
  const rede = process.env[`WIFI_REDE_${sufixo}`]?.trim() ?? "";
  const senha = process.env[`WIFI_SENHA_${sufixo}`]?.trim() ?? "";
  return rede ? { rede, senha } : null;
}
