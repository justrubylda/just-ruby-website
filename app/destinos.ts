// =====================================================================
//  PÁGINAS DE DESTINO: "onde ficar" para quem procura um sítio ou um
//  evento concreto (Festa dos Tabuleiros, Castelo do Bode, feiras do CNEMA).
//  Cada página existe nas 4 línguas; os endereços estão em app/i18n.ts.
//  Para mudar um texto, edite aqui. Para uma página nova: acrescente um
//  bloco, um endereço em i18n.ts e os ficheiros page.tsx (ver README).
// =====================================================================

import type { Lingua, Pagina } from "./i18n";

export type Seccao = { titulo: string; paragrafos?: string[]; lista?: string[] };

export type TextosDestino = {
  titulo: string; // título no Google e no separador do navegador
  descricao: string; // descrição no Google
  h1: string;
  intro: string;
  seccoes: Seccao[];
  ondeFicar: string;
  casas: Record<string, string>; // slug da casa → texto; a ordem é a ordem na página
  pedirTitulo: string;
  pedirTexto: string;
  maisZona: string;
};

export type Destino = {
  pagina: Pagina;
  casaInicial: string; // casa escolhida no formulário
  zona: string; // âncora da página "O que fazer na zona"
  imagem: string; // imagem de partilha
  textos: Record<Lingua, TextosDestino>;
};

export const destinos: Destino[] = [
  // ------------------------------------------------------------------
  {
    pagina: "tabuleiros",
    casaInicial: "kingdom-of-stone",
    zona: "tomar",
    imagem: "/fotos/kos-piscina-casa.jpg",
    textos: {
      pt: {
        titulo: "Festa dos Tabuleiros 2027: onde ficar perto de Tomar",
        descricao:
          "A Festa dos Tabuleiros volta a Tomar em julho de 2027. Fique no Kingdom of Stone, quinta com piscina a 20 minutos de Tomar, ou n'O Nosso Cantinho, em Santarém. Reserve cedo.",
        h1: "Festa dos Tabuleiros 2027",
        intro:
          "A grande festa de Tomar volta em julho de 2027. Fique perto, numa casa só para si, e volte ao fim do dia para a piscina e o silêncio do campo.",
        seccoes: [
          {
            titulo: "Quando é",
            paragrafos: [
              "A Festa dos Tabuleiros faz-se de quatro em quatro anos, em Tomar. A próxima edição é em julho de 2027. As datas exatas e o programa são anunciados pela Câmara Municipal de Tomar.",
            ],
          },
          {
            titulo: "O que é",
            paragrafos: [
              "É uma das festas mais antigas e conhecidas de Portugal. Nasceu das festas das colheitas e ganhou caráter religioso na Idade Média, ligada ao culto do Espírito Santo e à rainha Santa Isabel.",
              "O ponto alto é o Cortejo dos Tabuleiros: centenas de raparigas desfilam pelas ruas com tabuleiros à cabeça, feitos de pão, flores de papel e espigas, com uma coroa no topo. Durante a festa, as ruas do centro histórico enchem-se de flores de papel e as janelas de colchas.",
            ],
          },
          {
            titulo: "Conselhos",
            lista: [
              "Reserve cedo: na semana da festa, a procura de alojamento à volta de Tomar é muito grande.",
              "Chegue cedo ao cortejo para ter lugar ao longo do percurso.",
              "Confirme as datas e o programa no site da Câmara Municipal de Tomar.",
            ],
          },
        ],
        ondeFicar: "Onde ficar",
        casas: {
          "kingdom-of-stone":
            "A cerca de 20 minutos do centro de Tomar, em Olalhas. Quatro quartos, piscina e sossego para descansar depois do cortejo: longe da confusão, perto da festa.",
          "o-nosso-cantinho":
            "Na Várzea, em Santarém, a menos de uma hora de carro de Tomar. Até 8 hóspedes e piscina privada: boa opção para grupos e famílias que queiram juntar a festa a outros passeios no Ribatejo.",
        },
        pedirTitulo: "Pedir disponibilidade para julho de 2027",
        pedirTexto: "Diga-nos as datas e quantas pessoas são. Respondemos com a disponibilidade e o preço.",
        maisZona: "Mais ideias para a zona",
      },
      en: {
        titulo: "Festa dos Tabuleiros 2027: where to stay near Tomar",
        descricao:
          "The Festa dos Tabuleiros returns to Tomar in July 2027. Stay at Kingdom of Stone, a farmhouse with a pool 20 minutes from Tomar, or at O Nosso Cantinho in Santarém. Book early.",
        h1: "Festa dos Tabuleiros 2027",
        intro:
          "Tomar's great festival returns in July 2027. Stay close by, in a house of your own, and come back at the end of the day to the pool and the quiet of the countryside.",
        seccoes: [
          {
            titulo: "When is it",
            paragrafos: [
              "The Festa dos Tabuleiros (Festival of the Trays) is held in Tomar every four years. The next edition is in July 2027. The exact dates and programme are announced by Tomar City Council.",
            ],
          },
          {
            titulo: "What it is",
            paragrafos: [
              "It is one of the oldest and best-known festivals in Portugal. It grew out of harvest celebrations and took on a religious character in the Middle Ages, linked to the cult of the Holy Spirit and to Queen Saint Isabel.",
              "The highlight is the Procession of the Trays: hundreds of young women parade through the streets carrying trays on their heads, made of bread, paper flowers and ears of wheat, topped with a crown. During the festival, the streets of the old town fill with paper flowers and the windows with bedspreads.",
            ],
          },
          {
            titulo: "Tips",
            lista: [
              "Book early: during the festival week, demand for accommodation around Tomar is very high.",
              "Arrive early for the procession to get a spot along the route.",
              "Check the dates and programme on the Tomar City Council website.",
            ],
          },
        ],
        ondeFicar: "Where to stay",
        casas: {
          "kingdom-of-stone":
            "About 20 minutes from Tomar's old town, in Olalhas. Four bedrooms, a pool and peace and quiet to rest after the procession: away from the crowds, close to the festival.",
          "o-nosso-cantinho":
            "In Várzea, Santarém, less than an hour's drive from Tomar. Up to 8 guests and a private pool: a good choice for groups and families who want to combine the festival with other trips around the Ribatejo.",
        },
        pedirTitulo: "Check availability for July 2027",
        pedirTexto: "Tell us your dates and how many of you there are. We'll reply with availability and the price.",
        maisZona: "More ideas for the area",
      },
      es: {
        titulo: "Festa dos Tabuleiros 2027: dónde alojarse cerca de Tomar",
        descricao:
          "La Festa dos Tabuleiros vuelve a Tomar en julio de 2027. Alójese en Kingdom of Stone, finca con piscina a 20 minutos de Tomar, o en O Nosso Cantinho, en Santarém. Reserve con antelación.",
        h1: "Festa dos Tabuleiros 2027",
        intro:
          "La gran fiesta de Tomar vuelve en julio de 2027. Quédese cerca, en una casa solo para usted, y vuelva al final del día a la piscina y al silencio del campo.",
        seccoes: [
          {
            titulo: "Cuándo es",
            paragrafos: [
              "La Festa dos Tabuleiros (Fiesta de las Bandejas) se celebra en Tomar cada cuatro años. La próxima edición es en julio de 2027. Las fechas exactas y el programa los anuncia el Ayuntamiento de Tomar.",
            ],
          },
          {
            titulo: "Qué es",
            paragrafos: [
              "Es una de las fiestas más antiguas y conocidas de Portugal. Nació de las fiestas de la cosecha y adquirió carácter religioso en la Edad Media, ligada al culto del Espíritu Santo y a la reina Santa Isabel.",
              "El momento culminante es el Cortejo de los Tabuleiros: cientos de jóvenes desfilan por las calles con bandejas sobre la cabeza, hechas de pan, flores de papel y espigas, coronadas en lo alto. Durante la fiesta, las calles del centro histórico se llenan de flores de papel y las ventanas de colchas.",
            ],
          },
          {
            titulo: "Consejos",
            lista: [
              "Reserve con antelación: durante la semana de la fiesta, la demanda de alojamiento en torno a Tomar es muy alta.",
              "Llegue pronto al cortejo para encontrar sitio a lo largo del recorrido.",
              "Confirme las fechas y el programa en la web del Ayuntamiento de Tomar.",
            ],
          },
        ],
        ondeFicar: "Dónde alojarse",
        casas: {
          "kingdom-of-stone":
            "A unos 20 minutos del centro de Tomar, en Olalhas. Cuatro dormitorios, piscina y tranquilidad para descansar después del cortejo: lejos del bullicio, cerca de la fiesta.",
          "o-nosso-cantinho":
            "En Várzea, Santarém, a menos de una hora en coche de Tomar. Hasta 8 huéspedes y piscina privada: buena opción para grupos y familias que quieran combinar la fiesta con otras excursiones por el Ribatejo.",
        },
        pedirTitulo: "Consultar disponibilidad para julio de 2027",
        pedirTexto: "Díganos las fechas y cuántas personas son. Le respondemos con la disponibilidad y el precio.",
        maisZona: "Más ideas para la zona",
      },
      fr: {
        titulo: "Festa dos Tabuleiros 2027 : où dormir près de Tomar",
        descricao:
          "La Festa dos Tabuleiros revient à Tomar en juillet 2027. Séjournez au Kingdom of Stone, domaine avec piscine à 20 minutes de Tomar, ou à O Nosso Cantinho, à Santarém. Réservez tôt.",
        h1: "Festa dos Tabuleiros 2027",
        intro:
          "La grande fête de Tomar revient en juillet 2027. Logez tout près, dans une maison rien que pour vous, et retrouvez le soir la piscine et le calme de la campagne.",
        seccoes: [
          {
            titulo: "Quand",
            paragrafos: [
              "La Festa dos Tabuleiros (fête des Plateaux) a lieu à Tomar tous les quatre ans. La prochaine édition aura lieu en juillet 2027. Les dates exactes et le programme sont annoncés par la mairie de Tomar.",
            ],
          },
          {
            titulo: "Qu'est-ce que c'est",
            paragrafos: [
              "C'est l'une des fêtes les plus anciennes et les plus connues du Portugal. Née des fêtes des moissons, elle a pris un caractère religieux au Moyen Âge, liée au culte du Saint-Esprit et à la reine sainte Isabelle.",
              "Le temps fort est le cortège des Tabuleiros : des centaines de jeunes filles défilent dans les rues en portant sur la tête des plateaux faits de pain, de fleurs en papier et d'épis de blé, surmontés d'une couronne. Pendant la fête, les rues de la vieille ville se couvrent de fleurs en papier et les fenêtres de couvre-lits.",
            ],
          },
          {
            titulo: "Conseils",
            lista: [
              "Réservez tôt : pendant la semaine de la fête, la demande d'hébergement autour de Tomar est très forte.",
              "Arrivez tôt pour le cortège afin d'avoir une place le long du parcours.",
              "Vérifiez les dates et le programme sur le site de la mairie de Tomar.",
            ],
          },
        ],
        ondeFicar: "Où dormir",
        casas: {
          "kingdom-of-stone":
            "À environ 20 minutes du centre de Tomar, à Olalhas. Quatre chambres, une piscine et le calme pour se reposer après le cortège : loin de la foule, près de la fête.",
          "o-nosso-cantinho":
            "À Várzea, Santarém, à moins d'une heure de route de Tomar. Jusqu'à 8 personnes et piscine privée : une bonne option pour les groupes et les familles qui veulent associer la fête à d'autres excursions dans le Ribatejo.",
        },
        pedirTitulo: "Demander les disponibilités pour juillet 2027",
        pedirTexto: "Indiquez-nous vos dates et le nombre de personnes. Nous vous répondrons avec les disponibilités et le prix.",
        maisZona: "Plus d'idées pour la région",
      },
    },
  },

  // ------------------------------------------------------------------
  {
    pagina: "castelo",
    casaInicial: "kingdom-of-stone",
    zona: "tomar",
    imagem: "/fotos/kos-albufeira.jpg",
    textos: {
      pt: {
        titulo: "Praia fluvial de Montes e Castelo do Bode: casa com piscina a 1,4 km",
        descricao:
          "O Kingdom of Stone fica a cerca de 1,4 km da praia fluvial de Montes, na albufeira de Castelo do Bode, perto de Tomar. Quinta com piscina e 4 quartos, para famílias e grupos.",
        h1: "Castelo do Bode e a praia fluvial de Montes",
        intro:
          "O Kingdom of Stone fica a cerca de 1,4 km da praia fluvial de Montes, na albufeira de Castelo do Bode. De manhã, a piscina da quinta; à tarde, um mergulho no rio.",
        seccoes: [
          {
            titulo: "A praia fluvial de Montes",
            paragrafos: [
              "É uma das praias fluviais mais sossegadas do concelho de Tomar, na margem da albufeira de Castelo do Bode, junto à aldeia de Montes, em Olalhas.",
              "A água tem a classificação de Qualidade de Ouro da Quercus. É uma praia pequena e natural: leve guarda-sol e merenda, e chegue cedo nos fins de semana de verão.",
            ],
          },
          {
            titulo: "A albufeira de Castelo do Bode",
            paragrafos: [
              "A barragem de Castelo do Bode, no rio Zêzere, forma um lago com cerca de 60 km de comprimento, entre serras, pinhal e pequenas aldeias.",
              "Ao longo das margens há praias fluviais, clubes náuticos e miradouros. A navegação tem regras próprias, por razões ambientais.",
            ],
          },
          {
            titulo: "O que fazer",
            lista: [
              "Nadar nas praias fluviais: a de Montes, mesmo ao lado, e outras ao longo da albufeira.",
              "Experimentar wakeboard: há cinco cable parks ao longo da albufeira, como o do Lago Azul, em Ferreira do Zêzere, com aulas para principiantes.",
              "Andar de caiaque, de gaivota ou de barco nos clubes náuticos da albufeira.",
              "Caminhar ou pedalar na Grande Rota do Zêzere, que acompanha o rio a pé, de bicicleta e de canoa.",
              "Visitar Dornes, aldeia com uma torre templária numa península da albufeira.",
              "Ver o pôr do sol sobre a água e voltar à quinta para um jantar no forno a lenha.",
            ],
          },
          {
            titulo: "Conselhos",
            lista: [
              "Confirme a época balnear e a vigilância antes de ir: muitas praias fluviais não têm nadador-salvador.",
              "A água é doce, fresca e sem ondas: boa para crianças, sempre com um adulto por perto.",
              "Nos fins de semana de julho e agosto, chegue cedo: o estacionamento junto às praias é pequeno.",
            ],
          },
        ],
        ondeFicar: "Onde ficar",
        casas: {
          "kingdom-of-stone":
            "A quinta fica a cerca de 1,4 km da praia fluvial de Montes e a cerca de 20 minutos de Tomar. Quatro quartos, piscina, forno a lenha e churrasqueira: uma base sossegada para dias inteiros junto à água.",
        },
        pedirTitulo: "Pedir disponibilidade no Kingdom of Stone",
        pedirTexto: "Diga-nos as datas e quantas pessoas são. Respondemos com a disponibilidade e o preço.",
        maisZona: "Mais ideias para a zona",
      },
      en: {
        titulo: "Montes river beach and Castelo do Bode: house with pool 1.4 km away",
        descricao:
          "Kingdom of Stone is about 1.4 km from the Montes river beach on the Castelo do Bode reservoir, near Tomar. A farmhouse with a pool and 4 bedrooms, for families and groups.",
        h1: "Castelo do Bode and the Montes river beach",
        intro:
          "Kingdom of Stone is about 1.4 km from the Montes river beach on the Castelo do Bode reservoir. Mornings by the estate's pool; afternoons swimming in the river.",
        seccoes: [
          {
            titulo: "The Montes river beach",
            paragrafos: [
              "It is one of the quietest river beaches in the municipality of Tomar, on the shore of the Castelo do Bode reservoir, next to the village of Montes in Olalhas.",
              "Its water is rated Gold Quality by Quercus, the Portuguese environmental association. It is a small, natural beach: bring a parasol and a picnic, and arrive early on summer weekends.",
            ],
          },
          {
            titulo: "The Castelo do Bode reservoir",
            paragrafos: [
              "The Castelo do Bode dam on the river Zêzere forms a lake around 60 km long, among hills, pine forest and small villages.",
              "Along its shores you will find river beaches, water sports clubs and viewpoints. Boating has its own rules, for environmental reasons.",
            ],
          },
          {
            titulo: "Things to do",
            lista: [
              "Swim at the river beaches: Montes, right next door, and others around the reservoir.",
              "Try wakeboarding: there are five cable parks around the reservoir, such as the one at Lago Azul in Ferreira do Zêzere, with lessons for beginners.",
              "Go kayaking, pedal-boating or boating with the reservoir's water sports clubs.",
              "Walk or cycle the Grande Rota do Zêzere, which follows the river on foot, by bike and by canoe.",
              "Visit Dornes, a village with a Templar tower on a peninsula in the reservoir.",
              "Watch the sunset over the water and head back to the estate for dinner from the wood-fired oven.",
            ],
          },
          {
            titulo: "Tips",
            lista: [
              "Check the bathing season and lifeguard cover before you go: many river beaches have no lifeguard.",
              "The water is fresh, calm and without waves: good for children, always with an adult nearby.",
              "On July and August weekends, arrive early: parking by the beaches is limited.",
            ],
          },
        ],
        ondeFicar: "Where to stay",
        casas: {
          "kingdom-of-stone":
            "The estate is about 1.4 km from the Montes river beach and about 20 minutes from Tomar. Four bedrooms, a pool, a wood-fired oven and a barbecue: a quiet base for whole days by the water.",
        },
        pedirTitulo: "Check availability at Kingdom of Stone",
        pedirTexto: "Tell us your dates and how many of you there are. We'll reply with availability and the price.",
        maisZona: "More ideas for the area",
      },
      es: {
        titulo: "Playa fluvial de Montes y Castelo do Bode: casa con piscina a 1,4 km",
        descricao:
          "Kingdom of Stone está a unos 1,4 km de la playa fluvial de Montes, en el embalse de Castelo do Bode, cerca de Tomar. Finca con piscina y 4 dormitorios, para familias y grupos.",
        h1: "Castelo do Bode y la playa fluvial de Montes",
        intro:
          "Kingdom of Stone está a unos 1,4 km de la playa fluvial de Montes, en el embalse de Castelo do Bode. Por la mañana, la piscina de la finca; por la tarde, un baño en el río.",
        seccoes: [
          {
            titulo: "La playa fluvial de Montes",
            paragrafos: [
              "Es una de las playas fluviales más tranquilas del municipio de Tomar, a orillas del embalse de Castelo do Bode, junto al pueblo de Montes, en Olalhas.",
              "Su agua tiene la clasificación de Calidad de Oro de Quercus, la asociación ambiental portuguesa. Es una playa pequeña y natural: lleve sombrilla y algo de comer, y llegue pronto los fines de semana de verano.",
            ],
          },
          {
            titulo: "El embalse de Castelo do Bode",
            paragrafos: [
              "La presa de Castelo do Bode, en el río Zêzere, forma un lago de unos 60 km de largo, entre sierras, pinares y pequeños pueblos.",
              "En sus orillas hay playas fluviales, clubes náuticos y miradores. La navegación tiene normas propias, por razones ambientales.",
            ],
          },
          {
            titulo: "Qué hacer",
            lista: [
              "Bañarse en las playas fluviales: la de Montes, justo al lado, y otras a lo largo del embalse.",
              "Probar el wakeboard: hay cinco cable parks a lo largo del embalse, como el de Lago Azul, en Ferreira do Zêzere, con clases para principiantes.",
              "Salir en kayak, en hidropedal o en barco con los clubes náuticos del embalse.",
              "Caminar o pedalear por la Grande Rota do Zêzere, que sigue el río a pie, en bicicleta y en canoa.",
              "Visitar Dornes, pueblo con una torre templaria en una península del embalse.",
              "Ver la puesta de sol sobre el agua y volver a la finca para cenar algo del horno de leña.",
            ],
          },
          {
            titulo: "Consejos",
            lista: [
              "Consulte la temporada de baño y la vigilancia antes de ir: muchas playas fluviales no tienen socorrista.",
              "El agua es dulce, fresca y sin olas: buena para niños, siempre con un adulto cerca.",
              "Los fines de semana de julio y agosto, llegue pronto: el aparcamiento junto a las playas es pequeño.",
            ],
          },
        ],
        ondeFicar: "Dónde alojarse",
        casas: {
          "kingdom-of-stone":
            "La finca está a unos 1,4 km de la playa fluvial de Montes y a unos 20 minutos de Tomar. Cuatro dormitorios, piscina, horno de leña y barbacoa: una base tranquila para pasar días enteros junto al agua.",
        },
        pedirTitulo: "Consultar disponibilidad en Kingdom of Stone",
        pedirTexto: "Díganos las fechas y cuántas personas son. Le respondemos con la disponibilidad y el precio.",
        maisZona: "Más ideas para la zona",
      },
      fr: {
        titulo: "Plage fluviale de Montes et Castelo do Bode : maison avec piscine à 1,4 km",
        descricao:
          "Le Kingdom of Stone est à environ 1,4 km de la plage fluviale de Montes, sur le lac de Castelo do Bode, près de Tomar. Domaine avec piscine et 4 chambres, pour familles et groupes.",
        h1: "Castelo do Bode et la plage fluviale de Montes",
        intro:
          "Le Kingdom of Stone est à environ 1,4 km de la plage fluviale de Montes, sur le lac de Castelo do Bode. Le matin, la piscine du domaine ; l'après-midi, une baignade dans la rivière.",
        seccoes: [
          {
            titulo: "La plage fluviale de Montes",
            paragrafos: [
              "C'est l'une des plages fluviales les plus tranquilles de la commune de Tomar, au bord du lac de Castelo do Bode, près du village de Montes, à Olalhas.",
              "Son eau est classée « Qualité Or » par Quercus, l'association environnementale portugaise. C'est une petite plage naturelle : prévoyez un parasol et un pique-nique, et arrivez tôt les week-ends d'été.",
            ],
          },
          {
            titulo: "Le lac de Castelo do Bode",
            paragrafos: [
              "Le barrage de Castelo do Bode, sur le Zêzere, forme un lac d'environ 60 km de long, entre collines, pinèdes et petits villages.",
              "Sur ses rives, on trouve des plages fluviales, des clubs nautiques et des belvédères. La navigation y a ses propres règles, pour des raisons environnementales.",
            ],
          },
          {
            titulo: "Que faire",
            lista: [
              "Se baigner aux plages fluviales : celle de Montes, juste à côté, et d'autres tout autour du lac.",
              "S'essayer au wakeboard : il y a cinq téléskis nautiques autour du lac, comme celui de Lago Azul, à Ferreira do Zêzere, avec des cours pour débutants.",
              "Faire du kayak, du pédalo ou du bateau avec les clubs nautiques du lac.",
              "Marcher ou pédaler sur la Grande Rota do Zêzere, qui suit la rivière à pied, à vélo et en canoë.",
              "Visiter Dornes, village avec une tour templière sur une presqu'île du lac.",
              "Regarder le coucher du soleil sur l'eau et rentrer au domaine pour un dîner au four à bois.",
            ],
          },
          {
            titulo: "Conseils",
            lista: [
              "Vérifiez la saison de baignade et la surveillance avant d'y aller : beaucoup de plages fluviales n'ont pas de maître-nageur.",
              "L'eau est douce, fraîche et sans vagues : idéale pour les enfants, toujours avec un adulte à proximité.",
              "Les week-ends de juillet et d'août, arrivez tôt : le stationnement près des plages est limité.",
            ],
          },
        ],
        ondeFicar: "Où dormir",
        casas: {
          "kingdom-of-stone":
            "Le domaine est à environ 1,4 km de la plage fluviale de Montes et à environ 20 minutes de Tomar. Quatre chambres, une piscine, un four à bois et un barbecue : une base tranquille pour des journées entières au bord de l'eau.",
        },
        pedirTitulo: "Demander les disponibilités au Kingdom of Stone",
        pedirTexto: "Indiquez-nous vos dates et le nombre de personnes. Nous vous répondrons avec les disponibilités et le prix.",
        maisZona: "Plus d'idées pour la région",
      },
    },
  },

  // ------------------------------------------------------------------
  {
    pagina: "cnema",
    casaInicial: "o-nosso-cantinho",
    zona: "santarem",
    imagem: "/fotos/cantinho-piscina.jpg",
    textos: {
      pt: {
        titulo: "Alojamento perto do CNEMA, em Santarém: casa para equipas e grupos",
        descricao:
          "O Nosso Cantinho, na Várzea, fica a cerca de 10 km do CNEMA. Vivenda com 4 quartos, até 8 pessoas e piscina, para expositores e visitantes da Feira Nacional de Agricultura, da AgroGlobal e de outras feiras.",
        h1: "Alojamento perto do CNEMA",
        intro:
          "Vem a Santarém para uma feira ou um congresso no CNEMA? O Nosso Cantinho, na Várzea, é uma casa inteira para a equipa, a cerca de 10 km do recinto.",
        seccoes: [
          {
            titulo: "Feiras no CNEMA",
            lista: [
              "Feira Nacional de Agricultura / Feira do Ribatejo: todos os anos em junho.",
              "AgroGlobal: 7, 8 e 9 de setembro de 2027, a maior feira agrícola profissional da Península Ibérica.",
              "Outras feiras, salões e congressos ao longo do ano: consulte a agenda do CNEMA.",
            ],
          },
          {
            titulo: "Uma casa em vez de um hotel",
            lista: [
              "A casa inteira para a equipa: 4 quartos (3 de casal e 1 com duas camas), 2 casas de banho, até 8 pessoas.",
              "Cozinha equipada, sala e jardim para jantar e preparar o dia seguinte.",
              "Estacionamento privado.",
              "Piscina privada para descontrair ao fim do dia.",
              "Fatura em nome da empresa, com NIF.",
            ],
          },
          {
            titulo: "Conselhos",
            lista: [
              "Reserve assim que souber as datas: nas semanas das grandes feiras, a procura de alojamento em Santarém é muito grande.",
              "Para estadias longas ou várias equipas, fale connosco: fazemos uma proposta.",
            ],
          },
        ],
        ondeFicar: "Onde ficar",
        casas: {
          "o-nosso-cantinho":
            "Na Várzea, a cerca de 10 km do CNEMA e perto do centro de Santarém. Vivenda com piscina privada, 4 quartos, jardim, churrasqueira e estacionamento privado.",
        },
        pedirTitulo: "Pedir proposta para a sua feira",
        pedirTexto: "Diga-nos as datas e quantas pessoas são. Respondemos com a disponibilidade e o preço.",
        maisZona: "O que fazer em Santarém",
      },
      en: {
        titulo: "Accommodation near CNEMA, Santarém: a house for teams and groups",
        descricao:
          "O Nosso Cantinho, in Várzea, is about 10 km from CNEMA. A villa with 4 bedrooms, up to 8 guests and a pool, for exhibitors and visitors to the National Agriculture Fair, AgroGlobal and other trade fairs.",
        h1: "Accommodation near CNEMA",
        intro:
          "Coming to Santarém for a trade fair or a conference at CNEMA? O Nosso Cantinho, in Várzea, is a whole house for your team, about 10 km from the venue.",
        seccoes: [
          {
            titulo: "Trade fairs at CNEMA",
            lista: [
              "National Agriculture Fair / Ribatejo Fair (Feira Nacional de Agricultura): every year in June.",
              "AgroGlobal: 7, 8 and 9 September 2027, the largest professional agricultural fair in the Iberian Peninsula.",
              "Other fairs, shows and conferences throughout the year: check the CNEMA calendar.",
            ],
          },
          {
            titulo: "A house instead of a hotel",
            lista: [
              "The whole house for your team: 4 bedrooms (3 double and 1 twin), 2 bathrooms, up to 8 people.",
              "An equipped kitchen, living room and garden for dinner and planning the next day.",
              "Private parking.",
              "A private pool to unwind at the end of the day.",
              "Invoices issued to your company.",
            ],
          },
          {
            titulo: "Tips",
            lista: [
              "Book as soon as you know your dates: during the big fairs, demand for accommodation in Santarém is very high.",
              "For long stays or several teams, get in touch: we'll make you an offer.",
            ],
          },
        ],
        ondeFicar: "Where to stay",
        casas: {
          "o-nosso-cantinho":
            "In Várzea, about 10 km from CNEMA and close to Santarém city centre. A villa with a private pool, 4 bedrooms, a garden, a barbecue and private parking.",
        },
        pedirTitulo: "Ask for a quote for your trade fair",
        pedirTexto: "Tell us your dates and how many of you there are. We'll reply with availability and the price.",
        maisZona: "Things to do in Santarém",
      },
      es: {
        titulo: "Alojamiento cerca del CNEMA, en Santarém: casa para equipos y grupos",
        descricao:
          "O Nosso Cantinho, en Várzea, está a unos 10 km del CNEMA. Villa con 4 dormitorios, hasta 8 personas y piscina, para expositores y visitantes de la Feria Nacional de Agricultura, AgroGlobal y otras ferias.",
        h1: "Alojamiento cerca del CNEMA",
        intro:
          "¿Viene a Santarém para una feria o un congreso en el CNEMA? O Nosso Cantinho, en Várzea, es una casa entera para su equipo, a unos 10 km del recinto.",
        seccoes: [
          {
            titulo: "Ferias en el CNEMA",
            lista: [
              "Feria Nacional de Agricultura / Feria del Ribatejo: todos los años en junio.",
              "AgroGlobal: 7, 8 y 9 de septiembre de 2027, la mayor feria agrícola profesional de la Península Ibérica.",
              "Otras ferias, salones y congresos durante todo el año: consulte la agenda del CNEMA.",
            ],
          },
          {
            titulo: "Una casa en lugar de un hotel",
            lista: [
              "La casa entera para su equipo: 4 dormitorios (3 dobles y 1 con dos camas), 2 baños, hasta 8 personas.",
              "Cocina equipada, salón y jardín para cenar y preparar el día siguiente.",
              "Aparcamiento privado.",
              "Piscina privada para relajarse al final del día.",
              "Factura a nombre de su empresa.",
            ],
          },
          {
            titulo: "Consejos",
            lista: [
              "Reserve en cuanto sepa las fechas: durante las grandes ferias, la demanda de alojamiento en Santarém es muy alta.",
              "Para estancias largas o varios equipos, hable con nosotros: le hacemos una propuesta.",
            ],
          },
        ],
        ondeFicar: "Dónde alojarse",
        casas: {
          "o-nosso-cantinho":
            "En Várzea, a unos 10 km del CNEMA y cerca del centro de Santarém. Villa con piscina privada, 4 dormitorios, jardín, barbacoa y aparcamiento privado.",
        },
        pedirTitulo: "Pedir presupuesto para su feria",
        pedirTexto: "Díganos las fechas y cuántas personas son. Le respondemos con la disponibilidad y el precio.",
        maisZona: "Qué hacer en Santarém",
      },
      fr: {
        titulo: "Hébergement près du CNEMA, à Santarém : une maison pour équipes et groupes",
        descricao:
          "O Nosso Cantinho, à Várzea, est à environ 10 km du CNEMA. Villa de 4 chambres, jusqu'à 8 personnes, avec piscine, pour les exposants et visiteurs de la Foire nationale de l'agriculture, d'AgroGlobal et d'autres salons.",
        h1: "Hébergement près du CNEMA",
        intro:
          "Vous venez à Santarém pour un salon ou un congrès au CNEMA ? O Nosso Cantinho, à Várzea, est une maison entière pour votre équipe, à environ 10 km du parc des expositions.",
        seccoes: [
          {
            titulo: "Salons au CNEMA",
            lista: [
              "Foire nationale de l'agriculture / Foire du Ribatejo : chaque année en juin.",
              "AgroGlobal : 7, 8 et 9 septembre 2027, le plus grand salon agricole professionnel de la péninsule Ibérique.",
              "D'autres foires, salons et congrès toute l'année : consultez l'agenda du CNEMA.",
            ],
          },
          {
            titulo: "Une maison plutôt qu'un hôtel",
            lista: [
              "La maison entière pour votre équipe : 4 chambres (3 doubles et 1 à deux lits), 2 salles de bains, jusqu'à 8 personnes.",
              "Cuisine équipée, salon et jardin pour dîner et préparer le lendemain.",
              "Parking privé.",
              "Piscine privée pour se détendre en fin de journée.",
              "Facture au nom de votre entreprise.",
            ],
          },
          {
            titulo: "Conseils",
            lista: [
              "Réservez dès que vous connaissez vos dates : pendant les grands salons, la demande d'hébergement à Santarém est très forte.",
              "Pour de longs séjours ou plusieurs équipes, contactez-nous : nous vous ferons une proposition.",
            ],
          },
        ],
        ondeFicar: "Où dormir",
        casas: {
          "o-nosso-cantinho":
            "À Várzea, à environ 10 km du CNEMA et près du centre de Santarém. Villa avec piscine privée, 4 chambres, jardin, barbecue et parking privé.",
        },
        pedirTitulo: "Demander un devis pour votre salon",
        pedirTexto: "Indiquez-nous vos dates et le nombre de personnes. Nous vous répondrons avec les disponibilités et le prix.",
        maisZona: "Que faire à Santarém",
      },
    },
  },
];

export const getDestino = (p: Pagina) => destinos.find((d) => d.pagina === p);
