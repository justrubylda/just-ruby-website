// =====================================================================
//  O QUE FAZER NA ZONA: página /zona (e /en/area em inglês).
//  Uma secção por casa, com os sítios e as festas por perto.
//  Para acrescentar um sítio, copie um bloco { nome, nota } e traduza.
// =====================================================================

type Texto = { pt: string; en: string };

export type Zona = {
  id: string; // âncora no endereço: /zona#tomar
  casa: string; // slug da casa mais perto
  titulo: Texto;
  intro: Texto;
  sitios: { nome: Texto; nota: Texto }[];
  festas: { nome: Texto; nota: Texto }[];
};

export const zonas: Zona[] = [
  {
    id: "tomar",
    casa: "kingdom-of-stone",
    titulo: {
      pt: "Tomar e a albufeira de Castelo do Bode",
      en: "Tomar and the Castelo do Bode reservoir",
    },
    intro: {
      pt: "O Kingdom of Stone fica em Olalhas, a cerca de 20 minutos de Tomar, a cidade dos Templários, e perto da albufeira de Castelo do Bode.",
      en: "Kingdom of Stone is in Olalhas, about 20 minutes from Tomar, the city of the Knights Templar, and close to the Castelo do Bode reservoir.",
    },
    sitios: [
      {
        nome: { pt: "Convento de Cristo e Castelo Templário", en: "Convent of Christ and Templar Castle" },
        nota: {
          pt: "Património Mundial da UNESCO, antiga sede dos Templários e da Ordem de Cristo. Não perca a Charola e a janela manuelina.",
          en: "A UNESCO World Heritage Site and former seat of the Knights Templar and the Order of Christ. Don't miss the round church (Charola) and the Manueline window.",
        },
      },
      {
        nome: { pt: "Centro histórico de Tomar", en: "Tomar old town" },
        nota: {
          pt: "Ruas antigas junto ao rio Nabão, a Praça da República, a Igreja de São João Baptista e a sinagoga do século XV.",
          en: "Old streets along the Nabão river, Praça da República, the Church of São João Baptista and the 15th-century synagogue.",
        },
      },
      {
        nome: { pt: "Mata Nacional dos Sete Montes", en: "Sete Montes woodland park" },
        nota: {
          pt: "Um parque verde mesmo ao lado do convento, bom para passear à sombra.",
          en: "A green park right next to the convent, good for a walk in the shade.",
        },
      },
      {
        nome: { pt: "Aqueduto dos Pegões", en: "Pegões Aqueduct" },
        nota: {
          pt: "Aqueduto monumental construído entre os séculos XVI e XVII para levar água ao Convento de Cristo.",
          en: "A monumental aqueduct built in the 16th and 17th centuries to carry water to the Convent of Christ.",
        },
      },
      {
        nome: { pt: "Albufeira de Castelo do Bode", en: "Castelo do Bode reservoir" },
        nota: {
          pt: "Praias fluviais, passeios de barco, canoagem e desportos náuticos, perto da quinta.",
          en: "River beaches, boat trips, kayaking and water sports, close to the estate.",
        },
      },
      {
        nome: { pt: "Dornes", en: "Dornes" },
        nota: {
          pt: "Aldeia numa península da albufeira, com uma torre templária e vista sobre a água.",
          en: "A village on a peninsula in the reservoir, with a Templar tower and views over the water.",
        },
      },
      {
        nome: { pt: "Castelo de Almourol", en: "Almourol Castle" },
        nota: {
          pt: "Um castelo numa pequena ilha do rio Tejo, perto de Vila Nova da Barquinha.",
          en: "A castle on a small island in the river Tagus, near Vila Nova da Barquinha.",
        },
      },
      {
        nome: { pt: "Santuário de Fátima", en: "Sanctuary of Fátima" },
        nota: {
          pt: "A menos de uma hora de carro, para quem quiser juntar a visita à estadia.",
          en: "Less than an hour's drive away, for those who want to include a visit in their stay.",
        },
      },
    ],
    festas: [
      {
        nome: { pt: "Festa dos Tabuleiros", en: "Festa dos Tabuleiros (Festival of the Trays)" },
        nota: {
          pt: "A grande festa de Tomar, de quatro em quatro anos. A próxima é em julho de 2027: convém reservar cedo.",
          en: "Tomar's great festival, held every four years. The next one is in July 2027, so it's worth booking early.",
        },
      },
    ],
  },
  {
    id: "santarem",
    casa: "o-nosso-cantinho",
    titulo: {
      pt: "Santarém e o Ribatejo",
      en: "Santarém and the Ribatejo",
    },
    intro: {
      pt: "O Nosso Cantinho fica na Várzea, às portas de Santarém, a cidade sobre o Tejo conhecida como a capital do gótico.",
      en: "O Nosso Cantinho is in Várzea, on the edge of Santarém, the city above the Tagus known as Portugal's capital of Gothic.",
    },
    sitios: [
      {
        nome: { pt: "Jardim das Portas do Sol", en: "Portas do Sol garden" },
        nota: {
          pt: "Miradouro dentro das muralhas, com vista sobre o Tejo e a lezíria.",
          en: "A viewpoint inside the old walls, looking out over the Tagus and the lezíria.",
        },
      },
      {
        nome: { pt: "Centro histórico de Santarém", en: "Santarém old town" },
        nota: {
          pt: "Igrejas e conventos góticos, a Sé, a Torre das Cabaças e a Igreja da Graça, onde está sepultado Pedro Álvares Cabral.",
          en: "Gothic churches and convents, the cathedral, the Torre das Cabaças and the Church of Graça, where Pedro Álvares Cabral is buried.",
        },
      },
      {
        nome: { pt: "Lezíria do Tejo", en: "The Tagus lezíria" },
        nota: {
          pt: "Campo aberto à beira-rio, com cavalos, touros e a tradição dos campinos.",
          en: "Open riverside countryside, with horses, bulls and the tradition of the campinos, the Ribatejo horsemen.",
        },
      },
      {
        nome: { pt: "Aldeias avieiras", en: "Avieiro fishing villages" },
        nota: {
          pt: "Aldeias de pescadores com casas de madeira sobre estacas junto ao Tejo, como as Caneiras.",
          en: "Fishing villages with wooden houses on stilts along the Tagus, such as Caneiras.",
        },
      },
      {
        nome: { pt: "Almeirim", en: "Almeirim" },
        nota: {
          pt: "Do outro lado do rio, famosa pela sopa da pedra e pelos vinhos do Tejo.",
          en: "Across the river, famous for its stone soup (sopa da pedra) and Tejo wines.",
        },
      },
      {
        nome: { pt: "Golegã e o Paul do Boquilobo", en: "Golegã and Paul do Boquilobo" },
        nota: {
          pt: "A terra do cavalo e, ao lado, uma reserva natural com aves aquáticas.",
          en: "Portugal's horse capital and, next to it, a nature reserve with water birds.",
        },
      },
      {
        nome: { pt: "Serras de Aire e Candeeiros", en: "Serras de Aire e Candeeiros" },
        nota: {
          pt: "Parque natural a norte de Santarém, com grutas, miradouros e trilhos pedestres.",
          en: "A nature park north of Santarém, with caves, viewpoints and walking trails.",
        },
      },
    ],
    festas: [
      {
        nome: { pt: "Feira Nacional de Agricultura", en: "National Agriculture Fair" },
        nota: {
          pt: "Todos os anos em junho, em Santarém, com animais, produtos da terra e tradição ribatejana.",
          en: "Every June in Santarém, with livestock, local produce and Ribatejo traditions.",
        },
      },
      {
        nome: { pt: "Festival Nacional de Gastronomia", en: "National Gastronomy Festival" },
        nota: {
          pt: "Todos os outonos na Casa do Campino, em Santarém. É o festival gastronómico mais antigo do país.",
          en: "Every autumn at the Casa do Campino in Santarém. It is the longest-running food festival in Portugal.",
        },
      },
      {
        nome: { pt: "Feira Nacional do Cavalo", en: "National Horse Fair" },
        nota: {
          pt: "Em novembro, pelo São Martinho, na Golegã.",
          en: "In November, around St Martin's Day, in Golegã.",
        },
      },
    ],
  },
];
