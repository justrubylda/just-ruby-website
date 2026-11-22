// =====================================================================
//  O QUE FAZER NA ZONA: página /zona (e /en/area, /es/zona, /fr/region).
//  Uma secção por casa, com os sítios e as festas por perto.
//  Para acrescentar um sítio, copie um bloco { nome, nota } e traduza.
// =====================================================================

import type { Pagina } from "./i18n";

type Texto = { pt: string; en: string; es: string; fr: string };

export type Zona = {
  id: string; // âncora no endereço: /zona#tomar
  casa: string; // slug da casa mais perto
  titulo: Texto;
  intro: Texto;
  sitios: { nome: Texto; nota: Texto }[];
  festas: { nome: Texto; nota: Texto; pagina?: Pagina }[]; // pagina: link para uma página do site
};

export const zonas: Zona[] = [
  {
    id: "tomar",
    casa: "kingdom-of-stone",
    titulo: {
      pt: "Tomar e a albufeira de Castelo do Bode",
      en: "Tomar and the Castelo do Bode reservoir",
      es: "Tomar y el embalse de Castelo do Bode",
      fr: "Tomar et le lac de Castelo do Bode",
    },
    intro: {
      pt: "O Kingdom of Stone fica em Olalhas, a cerca de 20 minutos de Tomar, a cidade dos Templários, e perto da albufeira de Castelo do Bode.",
      en: "Kingdom of Stone is in Olalhas, about 20 minutes from Tomar, the city of the Knights Templar, and close to the Castelo do Bode reservoir.",
      es: "Kingdom of Stone está en Olalhas, a unos 20 minutos de Tomar, la ciudad de los templarios, y cerca del embalse de Castelo do Bode.",
      fr: "Le Kingdom of Stone se trouve à Olalhas, à environ 20 minutes de Tomar, la ville des Templiers, et près du lac de Castelo do Bode.",
    },
    sitios: [
      {
        nome: {
          pt: "Convento de Cristo e Castelo Templário",
          en: "Convent of Christ and Templar Castle",
          es: "Convento de Cristo y Castillo Templario",
          fr: "Couvent du Christ et château templier",
        },
        nota: {
          pt: "Património Mundial da UNESCO, antiga sede dos Templários e da Ordem de Cristo. Não perca a Charola e a janela manuelina.",
          en: "A UNESCO World Heritage Site and former seat of the Knights Templar and the Order of Christ. Don't miss the round church (Charola) and the Manueline window.",
          es: "Patrimonio Mundial de la UNESCO y antigua sede de los templarios y de la Orden de Cristo. No se pierda la Charola, la iglesia redonda, ni la ventana manuelina.",
          fr: "Classé au patrimoine mondial de l'UNESCO, ancien siège des Templiers et de l'ordre du Christ. Ne manquez pas la Charola, l'église ronde, ni la fenêtre manuéline.",
        },
      },
      {
        nome: { pt: "Centro histórico de Tomar", en: "Tomar old town", es: "Centro histórico de Tomar", fr: "Vieille ville de Tomar" },
        nota: {
          pt: "Ruas antigas junto ao rio Nabão, a Praça da República, a Igreja de São João Baptista e a sinagoga do século XV.",
          en: "Old streets along the Nabão river, Praça da República, the Church of São João Baptista and the 15th-century synagogue.",
          es: "Calles antiguas junto al río Nabão, la Praça da República, la iglesia de São João Baptista y la sinagoga del siglo XV.",
          fr: "Ruelles anciennes au bord du Nabão, la Praça da República, l'église de São João Baptista et la synagogue du XVe siècle.",
        },
      },
      {
        nome: {
          pt: "Mata Nacional dos Sete Montes",
          en: "Sete Montes woodland park",
          es: "Parque de la Mata dos Sete Montes",
          fr: "Parc de la Mata dos Sete Montes",
        },
        nota: {
          pt: "Um parque verde mesmo ao lado do convento, bom para passear à sombra.",
          en: "A green park right next to the convent, good for a walk in the shade.",
          es: "Un parque verde justo al lado del convento, ideal para pasear a la sombra.",
          fr: "Un parc verdoyant juste à côté du couvent, idéal pour se promener à l'ombre.",
        },
      },
      {
        nome: { pt: "Aqueduto dos Pegões", en: "Pegões Aqueduct", es: "Acueducto de Pegões", fr: "Aqueduc de Pegões" },
        nota: {
          pt: "Aqueduto monumental construído entre os séculos XVI e XVII para levar água ao Convento de Cristo.",
          en: "A monumental aqueduct built in the 16th and 17th centuries to carry water to the Convent of Christ.",
          es: "Acueducto monumental construido entre los siglos XVI y XVII para llevar agua al Convento de Cristo.",
          fr: "Aqueduc monumental construit aux XVIe et XVIIe siècles pour alimenter en eau le couvent du Christ.",
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
          pt: "Praias fluviais, passeios de barco, canoagem e desportos náuticos, perto da quinta.",
          en: "River beaches, boat trips, kayaking and water sports, close to the estate.",
          es: "Playas fluviales, paseos en barco, piragüismo y deportes náuticos, cerca de la finca.",
          fr: "Plages fluviales, promenades en bateau, canoë et sports nautiques, près du domaine.",
        },
      },
      {
        nome: { pt: "Dornes", en: "Dornes", es: "Dornes", fr: "Dornes" },
        nota: {
          pt: "Aldeia numa península da albufeira, com uma torre templária e vista sobre a água.",
          en: "A village on a peninsula in the reservoir, with a Templar tower and views over the water.",
          es: "Pueblo en una península del embalse, con una torre templaria y vistas al agua.",
          fr: "Village sur une presqu'île du lac, avec une tour templière et une vue sur l'eau.",
        },
      },
      {
        nome: { pt: "Castelo de Almourol", en: "Almourol Castle", es: "Castillo de Almourol", fr: "Château d'Almourol" },
        nota: {
          pt: "Um castelo numa pequena ilha do rio Tejo, perto de Vila Nova da Barquinha.",
          en: "A castle on a small island in the river Tagus, near Vila Nova da Barquinha.",
          es: "Un castillo en una pequeña isla del río Tajo, cerca de Vila Nova da Barquinha.",
          fr: "Un château sur un îlot du Tage, près de Vila Nova da Barquinha.",
        },
      },
      {
        nome: { pt: "Santuário de Fátima", en: "Sanctuary of Fátima", es: "Santuario de Fátima", fr: "Sanctuaire de Fátima" },
        nota: {
          pt: "A menos de uma hora de carro, para quem quiser juntar a visita à estadia.",
          en: "Less than an hour's drive away, for those who want to include a visit in their stay.",
          es: "A menos de una hora en coche, para quien quiera incluir la visita en su estancia.",
          fr: "À moins d'une heure de route, pour ceux qui souhaitent l'inclure dans leur séjour.",
        },
      },
    ],
    festas: [
      {
        nome: {
          pt: "Festa dos Tabuleiros",
          en: "Festa dos Tabuleiros (Festival of the Trays)",
          es: "Festa dos Tabuleiros (Fiesta de las Bandejas)",
          fr: "Festa dos Tabuleiros (fête des Plateaux)",
        },
        nota: {
          pt: "A grande festa de Tomar, de quatro em quatro anos. A próxima é em julho de 2027: convém reservar cedo.",
          en: "Tomar's great festival, held every four years. The next one is in July 2027, so it's worth booking early.",
          es: "La gran fiesta de Tomar, cada cuatro años. La próxima es en julio de 2027: conviene reservar pronto.",
          fr: "La grande fête de Tomar, tous les quatre ans. La prochaine a lieu en juillet 2027 : mieux vaut réserver tôt.",
        },
        pagina: "tabuleiros",
      },
    ],
  },
  {
    id: "santarem",
    casa: "o-nosso-cantinho",
    titulo: {
      pt: "Santarém e o Ribatejo",
      en: "Santarém and the Ribatejo",
      es: "Santarém y el Ribatejo",
      fr: "Santarém et le Ribatejo",
    },
    intro: {
      pt: "O Nosso Cantinho fica na Várzea, às portas de Santarém, a cidade sobre o Tejo conhecida como a capital do gótico.",
      en: "O Nosso Cantinho is in Várzea, on the edge of Santarém, the city above the Tagus known as Portugal's capital of Gothic.",
      es: "O Nosso Cantinho está en Várzea, a las puertas de Santarém, la ciudad sobre el Tajo conocida como la capital del gótico.",
      fr: "O Nosso Cantinho se trouve à Várzea, aux portes de Santarém, la ville qui domine le Tage, surnommée la capitale du gothique.",
    },
    sitios: [
      {
        nome: { pt: "Jardim das Portas do Sol", en: "Portas do Sol garden", es: "Jardín de las Portas do Sol", fr: "Jardin des Portas do Sol" },
        nota: {
          pt: "Miradouro dentro das muralhas, com vista sobre o Tejo e a lezíria.",
          en: "A viewpoint inside the old walls, looking out over the Tagus and the lezíria.",
          es: "Mirador dentro de las murallas, con vistas al Tajo y a la lezíria.",
          fr: "Belvédère à l'intérieur des remparts, avec vue sur le Tage et la lezíria.",
        },
      },
      {
        nome: { pt: "Centro histórico de Santarém", en: "Santarém old town", es: "Centro histórico de Santarém", fr: "Vieille ville de Santarém" },
        nota: {
          pt: "Igrejas e conventos góticos, a Sé, a Torre das Cabaças e a Igreja da Graça, onde está sepultado Pedro Álvares Cabral.",
          en: "Gothic churches and convents, the cathedral, the Torre das Cabaças and the Church of Graça, where Pedro Álvares Cabral is buried.",
          es: "Iglesias y conventos góticos, la catedral, la Torre das Cabaças y la iglesia de la Graça, donde está enterrado Pedro Álvares Cabral.",
          fr: "Églises et couvents gothiques, la cathédrale, la Torre das Cabaças et l'église de Graça, où repose Pedro Álvares Cabral.",
        },
      },
      {
        nome: { pt: "Lezíria do Tejo", en: "The Tagus lezíria", es: "La lezíria del Tajo", fr: "La lezíria du Tage" },
        nota: {
          pt: "Campo aberto à beira-rio, com cavalos, touros e a tradição dos campinos.",
          en: "Open riverside countryside, with horses, bulls and the tradition of the campinos, the Ribatejo horsemen.",
          es: "Campo abierto junto al río, con caballos, toros y la tradición de los campinos, los jinetes del Ribatejo.",
          fr: "Grands espaces au bord du fleuve, avec chevaux, taureaux et la tradition des campinos, les gardians du Ribatejo.",
        },
      },
      {
        nome: { pt: "Aldeias avieiras", en: "Avieiro fishing villages", es: "Aldeas avieiras", fr: "Villages avieiros" },
        nota: {
          pt: "Aldeias de pescadores com casas de madeira sobre estacas junto ao Tejo, como as Caneiras.",
          en: "Fishing villages with wooden houses on stilts along the Tagus, such as Caneiras.",
          es: "Pueblos de pescadores con casas de madera sobre pilotes junto al Tajo, como Caneiras.",
          fr: "Villages de pêcheurs aux maisons en bois sur pilotis au bord du Tage, comme Caneiras.",
        },
      },
      {
        nome: { pt: "Almeirim", en: "Almeirim", es: "Almeirim", fr: "Almeirim" },
        nota: {
          pt: "Do outro lado do rio, famosa pela sopa da pedra e pelos vinhos do Tejo.",
          en: "Across the river, famous for its stone soup (sopa da pedra) and Tejo wines.",
          es: "Al otro lado del río, famosa por la sopa de piedra (sopa da pedra) y los vinos del Tajo.",
          fr: "De l'autre côté du fleuve, célèbre pour sa soupe de pierre (sopa da pedra) et les vins du Tejo.",
        },
      },
      {
        nome: {
          pt: "Golegã e o Paul do Boquilobo",
          en: "Golegã and Paul do Boquilobo",
          es: "Golegã y el Paul do Boquilobo",
          fr: "Golegã et le Paul do Boquilobo",
        },
        nota: {
          pt: "A terra do cavalo e, ao lado, uma reserva natural com aves aquáticas.",
          en: "Portugal's horse capital and, next to it, a nature reserve with water birds.",
          es: "La capital del caballo y, al lado, una reserva natural con aves acuáticas.",
          fr: "La capitale du cheval et, juste à côté, une réserve naturelle d'oiseaux aquatiques.",
        },
      },
      {
        nome: {
          pt: "Serras de Aire e Candeeiros",
          en: "Serras de Aire e Candeeiros",
          es: "Sierras de Aire y Candeeiros",
          fr: "Serras de Aire e Candeeiros",
        },
        nota: {
          pt: "Parque natural a norte de Santarém, com grutas, miradouros e trilhos pedestres.",
          en: "A nature park north of Santarém, with caves, viewpoints and walking trails.",
          es: "Parque natural al norte de Santarém, con cuevas, miradores y rutas de senderismo.",
          fr: "Parc naturel au nord de Santarém, avec grottes, belvédères et sentiers de randonnée.",
        },
      },
    ],
    festas: [
      {
        nome: {
          pt: "Feira Nacional de Agricultura",
          en: "National Agriculture Fair",
          es: "Feria Nacional de Agricultura",
          fr: "Foire nationale de l'agriculture",
        },
        nota: {
          pt: "Todos os anos em junho, em Santarém, com animais, produtos da terra e tradição ribatejana.",
          en: "Every June in Santarém, with livestock, local produce and Ribatejo traditions.",
          es: "Cada junio en Santarém, con animales, productos de la tierra y tradición ribatejana.",
          fr: "Chaque année en juin à Santarém, avec animaux, produits du terroir et traditions du Ribatejo.",
        },
      },
      {
        nome: {
          pt: "Festival Nacional de Gastronomia",
          en: "National Gastronomy Festival",
          es: "Festival Nacional de Gastronomía",
          fr: "Festival national de gastronomie",
        },
        nota: {
          pt: "Todos os outonos na Casa do Campino, em Santarém. É o festival gastronómico mais antigo do país.",
          en: "Every autumn at the Casa do Campino in Santarém. It is the longest-running food festival in Portugal.",
          es: "Cada otoño en la Casa do Campino, en Santarém. Es el festival gastronómico más antiguo del país.",
          fr: "Chaque automne à la Casa do Campino, à Santarém. C'est le plus ancien festival gastronomique du pays.",
        },
      },
      {
        nome: {
          pt: "Feira Nacional do Cavalo",
          en: "National Horse Fair",
          es: "Feria Nacional del Caballo",
          fr: "Foire nationale du cheval",
        },
        nota: {
          pt: "Em novembro, pelo São Martinho, na Golegã.",
          en: "In November, around St Martin's Day, in Golegã.",
          es: "En noviembre, por San Martín, en Golegã.",
          fr: "En novembre, autour de la Saint-Martin, à Golegã.",
        },
      },
    ],
  },
];
