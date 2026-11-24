// =====================================================================
//  LÍNGUAS DO SITE: português (principal), inglês (/en), espanhol (/es)
//  e francês (/fr).
//  Aqui ficam os endereços de cada página em cada língua, o menu e os
//  textos comuns (cabeçalho, rodapé, formulário e calendário).
//  Os textos de cada página estão no próprio ficheiro da página,
//  em app/components/paginas/.
// =====================================================================

import type { Metadata } from "next";

export type Lingua = "pt" | "en" | "es" | "fr";
export const linguas: Lingua[] = ["pt", "en", "es", "fr"];

export type Pagina =
  | "inicio"
  | "alojamentos"
  | "zona"
  | "tabuleiros"
  | "castelo"
  | "cnema"
  | "sobre"
  | "galeria"
  | "contactos"
  | "privacidade";

const ROTAS: Record<Pagina, Record<Lingua, string>> = {
  inicio: { pt: "/", en: "/en", es: "/es", fr: "/fr" },
  alojamentos: { pt: "/alojamentos", en: "/en/accommodation", es: "/es/alojamientos", fr: "/fr/hebergements" },
  zona: { pt: "/zona", en: "/en/area", es: "/es/zona", fr: "/fr/region" },
  tabuleiros: {
    pt: "/festa-dos-tabuleiros",
    en: "/en/festa-dos-tabuleiros",
    es: "/es/festa-dos-tabuleiros",
    fr: "/fr/festa-dos-tabuleiros",
  },
  castelo: {
    pt: "/castelo-do-bode",
    en: "/en/castelo-do-bode",
    es: "/es/castelo-do-bode",
    fr: "/fr/castelo-do-bode",
  },
  cnema: {
    pt: "/cnema-santarem",
    en: "/en/cnema-santarem",
    es: "/es/cnema-santarem",
    fr: "/fr/cnema-santarem",
  },
  sobre: { pt: "/sobre", en: "/en/about", es: "/es/sobre-nosotros", fr: "/fr/a-propos" },
  galeria: { pt: "/galeria", en: "/en/gallery", es: "/es/galeria", fr: "/fr/galerie" },
  contactos: { pt: "/contactos", en: "/en/contact", es: "/es/contacto", fr: "/fr/contact" },
  privacidade: { pt: "/privacidade", en: "/en/privacy", es: "/es/privacidad", fr: "/fr/confidentialite" },
};

export const paginas = Object.keys(ROTAS) as Pagina[];

export const rota = (l: Lingua, p: Pagina) => ROTAS[p][l];
export const rotaCasa = (l: Lingua, slug: string) => `${ROTAS.alojamentos[l]}/${slug}`;

// Código de língua para o Google (hreflang) e para o atributo lang.
export const codigo: Record<Lingua, string> = { pt: "pt-PT", en: "en", es: "es", fr: "fr" };
// Língua para a pré-visualização dos links partilhados (Facebook, WhatsApp...).
export const localeOG: Record<Lingua, string> = { pt: "pt_PT", en: "en_GB", es: "es_ES", fr: "fr_FR" };
// Nome de cada língua, escrito nessa língua (seletor do cabeçalho).
export const nomeLingua: Record<Lingua, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
};

// Endereço canónico e versões noutras línguas (hreflang), para o metadata de cada página.
export function alternativas(l: Lingua, p: Pagina, slug?: string): Metadata["alternates"] {
  const em = (x: Lingua) => (slug ? rotaCasa(x, slug) : rota(x, p));
  return {
    canonical: em(l),
    languages: {
      ...Object.fromEntries(linguas.map((x) => [codigo[x], em(x)])),
      "x-default": em("pt"),
    },
  };
}

// Língua de um endereço e o endereço equivalente noutra língua (seletor do cabeçalho).
export function linguaDe(pathname: string): Lingua {
  for (const l of linguas) {
    if (l !== "pt" && (pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return l;
  }
  return "pt";
}

export function caminhoEm(pathname: string, para: Lingua): string {
  const de = linguaDe(pathname);
  const caminho = pathname.replace(/\/+$/, "") || "/";
  for (const p of paginas) {
    if (caminho === ROTAS[p][de]) return ROTAS[p][para];
  }
  const casas = ROTAS.alojamentos[de] + "/";
  if (caminho.startsWith(casas)) return ROTAS.alojamentos[para] + "/" + caminho.slice(casas.length);
  return ROTAS.inicio[para];
}

const ROTULOS: Record<Lingua, Partial<Record<Pagina, string>>> = {
  pt: {
    inicio: "Início",
    alojamentos: "Alojamentos",
    sobre: "Sobre",
    galeria: "Galeria",
    contactos: "Contactos",
  },
  en: {
    inicio: "Home",
    alojamentos: "Accommodation",
    sobre: "About",
    galeria: "Gallery",
    contactos: "Contact",
  },
  es: {
    inicio: "Inicio",
    alojamentos: "Alojamientos",
    sobre: "Sobre nosotros",
    galeria: "Galería",
    contactos: "Contacto",
  },
  fr: {
    inicio: "Accueil",
    alojamentos: "Hébergements",
    sobre: "À propos",
    galeria: "Galerie",
    contactos: "Contact",
  },
};

// Menu principal (cabeçalho e rodapé).
export const menu = (l: Lingua) =>
  (Object.keys(ROTULOS[l]) as Pagina[]).map((p) => ({
    href: rota(l, p),
    label: ROTULOS[l][p] as string,
  }));

const nota = (locale: string) => (n: number) => n.toLocaleString(locale, { minimumFractionDigits: 1 });

// Textos comuns a várias páginas.
export const ui = {
  pt: {
    saltar: "Saltar para o conteúdo",
    paginaInicial: "página inicial",
    menuPrincipal: "Menu principal",
    abrirMenu: "Abrir menu",
    fecharMenu: "Fechar menu",
    pedir: "Pedir disponibilidade",
    linguas: "Língua",
    rodapeFrase: "Turismo rural em Tomar e Santarém. Recebemos cada hóspede pessoalmente.",
    paginas: "Páginas",
    contactos: "Contactos",
    zona: "O que fazer na zona",
    tabuleiros: "Festa dos Tabuleiros 2027",
    castelo: "Castelo do Bode e praia de Montes",
    cnema: "Alojamento perto do CNEMA",
    sede: "sede em",
    registoAL: "registo de Alojamento Local n.º",
    livro: "Livro de Reclamações",
    areaReservada: "Área reservada",
    privacidade: "Política de privacidade",
    whatsappAria: "Falar connosco por WhatsApp",
    whatsappTexto: "Olá! Gostaria de saber a disponibilidade.",
    ver: (nome: string) => `Ver ${nome}`,
    nota: nota("pt-PT"),
    avaliacao: (plataforma: string) => `de 10 no ${plataforma}`,
  },
  en: {
    saltar: "Skip to content",
    paginaInicial: "home page",
    menuPrincipal: "Main menu",
    abrirMenu: "Open menu",
    fecharMenu: "Close menu",
    pedir: "Check availability",
    linguas: "Language",
    rodapeFrase: "Country houses in Tomar and Santarém, Portugal. We welcome every guest personally.",
    paginas: "Pages",
    contactos: "Contact",
    zona: "Things to do nearby",
    tabuleiros: "Festa dos Tabuleiros 2027",
    castelo: "Castelo do Bode and Montes beach",
    cnema: "Accommodation near CNEMA",
    sede: "registered office in",
    registoAL: "Local Accommodation (AL) registration no.",
    livro: "Complaints Book (Livro de Reclamações)",
    areaReservada: "Private area",
    privacidade: "Privacy policy",
    whatsappAria: "Chat with us on WhatsApp",
    whatsappTexto: "Hello! I'd like to check availability.",
    ver: (nome: string) => `See ${nome}`,
    nota: nota("en-GB"),
    avaliacao: (plataforma: string) => `out of 10 on ${plataforma}`,
  },
  es: {
    saltar: "Ir al contenido",
    paginaInicial: "página de inicio",
    menuPrincipal: "Menú principal",
    abrirMenu: "Abrir menú",
    fecharMenu: "Cerrar menú",
    pedir: "Consultar disponibilidad",
    linguas: "Idioma",
    rodapeFrase: "Casas rurales en Tomar y Santarém, Portugal. Recibimos a cada huésped personalmente.",
    paginas: "Páginas",
    contactos: "Contacto",
    zona: "Qué hacer en la zona",
    tabuleiros: "Festa dos Tabuleiros 2027",
    castelo: "Castelo do Bode y playa de Montes",
    cnema: "Alojamiento cerca del CNEMA",
    sede: "con sede en",
    registoAL: "registro de Alojamiento Local (AL) n.º",
    livro: "Libro de Reclamaciones (Livro de Reclamações)",
    areaReservada: "Área privada",
    privacidade: "Política de privacidad",
    whatsappAria: "Escríbanos por WhatsApp",
    whatsappTexto: "¡Hola! Me gustaría consultar la disponibilidad.",
    ver: (nome: string) => `Ver ${nome}`,
    nota: nota("es-ES"),
    avaliacao: (plataforma: string) => `de 10 en ${plataforma}`,
  },
  fr: {
    saltar: "Aller au contenu",
    paginaInicial: "page d'accueil",
    menuPrincipal: "Menu principal",
    abrirMenu: "Ouvrir le menu",
    fecharMenu: "Fermer le menu",
    pedir: "Demander les disponibilités",
    linguas: "Langue",
    rodapeFrase: "Maisons de campagne à Tomar et Santarém, au Portugal. Nous accueillons chaque hôte personnellement.",
    paginas: "Pages",
    contactos: "Contact",
    zona: "Que faire dans la région",
    tabuleiros: "Festa dos Tabuleiros 2027",
    castelo: "Castelo do Bode et plage de Montes",
    cnema: "Hébergement près du CNEMA",
    sede: "siège à",
    registoAL: "n° d'enregistrement d'hébergement local (AL)",
    livro: "Livre de réclamations (Livro de Reclamações)",
    areaReservada: "Espace privé",
    privacidade: "Politique de confidentialité",
    whatsappAria: "Nous écrire sur WhatsApp",
    whatsappTexto: "Bonjour ! Je voudrais connaître vos disponibilités.",
    ver: (nome: string) => `Voir ${nome}`,
    nota: nota("fr-FR"),
    avaliacao: (plataforma: string) => `sur 10 (${plataforma})`,
  },
};

export const calendario = {
  pt: {
    meses: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
    dias: ["S", "T", "Q", "Q", "S", "S", "D"],
    diasNome: ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"],
    dia: (d: number, mes: string) => `${d} de ${mes}`,
    passado: "já passou",
    reservado: "reservado",
    livre: "livre",
    Livre: "Livre",
    Reservado: "Reservado",
    proxima: "Próxima noite livre:",
    nota: "Sincronizado com o Airbnb e o Booking, de hora a hora. A confirmação final é sempre nossa.",
  },
  en: {
    meses: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    dias: ["M", "T", "W", "T", "F", "S", "S"],
    diasNome: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    dia: (d: number, mes: string) => `${d} ${mes}`,
    passado: "past",
    reservado: "booked",
    livre: "available",
    Livre: "Available",
    Reservado: "Booked",
    proxima: "Next available night:",
    nota: "Synced with Airbnb and Booking.com every hour. We always confirm your dates personally.",
  },
  es: {
    meses: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    dias: ["L", "M", "X", "J", "V", "S", "D"],
    diasNome: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
    dia: (d: number, mes: string) => `${d} de ${mes}`,
    passado: "ya pasó",
    reservado: "reservado",
    livre: "libre",
    Livre: "Libre",
    Reservado: "Reservado",
    proxima: "Próxima noche libre:",
    nota: "Sincronizado con Airbnb y Booking.com cada hora. La confirmación final siempre es nuestra.",
  },
  fr: {
    meses: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    dias: ["L", "M", "M", "J", "V", "S", "D"],
    diasNome: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    dia: (d: number, mes: string) => `${d} ${mes}`,
    passado: "passé",
    reservado: "réservé",
    livre: "libre",
    Livre: "Libre",
    Reservado: "Réservé",
    proxima: "Prochaine nuit libre :",
    nota: "Synchronisé avec Airbnb et Booking.com toutes les heures. Nous confirmons toujours vos dates personnellement.",
  },
};

export const formulario = {
  pt: {
    naoPreencher: "Não preencher",
    alojamento: "Alojamento",
    escolha: "Escolha um alojamento",
    chegada: "Chegada",
    partida: "Partida",
    pessoas: "Número de pessoas",
    nome: "O seu nome",
    mensagem: "Mensagem",
    opcional: "(opcional)",
    exemplo: "Por exemplo: vamos com crianças, ou chegamos tarde.",
    porWhatsapp: "Enviar pedido por WhatsApp",
    porEmail: "Enviar pedido por email",
    erroCasa: "Escolha o alojamento.",
    erroDatas: "Indique as datas de chegada e de partida.",
    erroPassado: "A data de chegada já passou. Escolha uma data a partir de hoje.",
    erroOrdem: "A data de partida tem de ser depois da data de chegada.",
    erroOcupado: "Essas datas já estão ocupadas. Veja o calendário de disponibilidade ou escolha outras datas.",
    erroPessoas: "Indique quantas pessoas vêm.",
    ola: (doNome: string) => `Olá! Gostaria de saber a disponibilidade ${doNome}.`,
    lChegada: "Chegada",
    lPartida: "Partida",
    lHospedes: "Hóspedes",
    lNome: "Nome",
    assunto: (nome: string) => `Disponibilidade ${nome}`,
    notaAntes: (comWhatsapp: boolean) =>
      `O pedido abre no seu ${comWhatsapp ? "WhatsApp ou " : ""}email, já escrito, para confirmar antes de enviar. Respondemos com a disponibilidade e o preço. Guardamos o pedido só para lhe responder (`,
    notaLink: "política de privacidade",
    notaDepois: ").",
  },
  en: {
    naoPreencher: "Do not fill in",
    alojamento: "House",
    escolha: "Choose a house",
    chegada: "Arrival",
    partida: "Departure",
    pessoas: "Number of guests",
    nome: "Your name",
    mensagem: "Message",
    opcional: "(optional)",
    exemplo: "For example: we're travelling with children, or we'll arrive late.",
    porWhatsapp: "Send request by WhatsApp",
    porEmail: "Send request by email",
    erroCasa: "Please choose a house.",
    erroDatas: "Please enter your arrival and departure dates.",
    erroPassado: "The arrival date has already passed. Please choose a date from today.",
    erroOrdem: "The departure date must be after the arrival date.",
    erroOcupado: "Those dates are already booked. Check the availability calendar or choose other dates.",
    erroPessoas: "Please tell us how many guests are coming.",
    ola: (paraNome: string) => `Hello! I'd like to check availability ${paraNome}.`,
    lChegada: "Arrival",
    lPartida: "Departure",
    lHospedes: "Guests",
    lNome: "Name",
    assunto: (nome: string) => `Availability – ${nome}`,
    notaAntes: (comWhatsapp: boolean) =>
      `Your request opens in ${comWhatsapp ? "WhatsApp or " : ""}your email, already written, so you can check it before sending. We reply with availability and the price. We keep your request only to answer you (`,
    notaLink: "privacy policy",
    notaDepois: ").",
  },
  es: {
    naoPreencher: "No rellenar",
    alojamento: "Alojamiento",
    escolha: "Elija un alojamiento",
    chegada: "Llegada",
    partida: "Salida",
    pessoas: "Número de personas",
    nome: "Su nombre",
    mensagem: "Mensaje",
    opcional: "(opcional)",
    exemplo: "Por ejemplo: vamos con niños o llegamos tarde.",
    porWhatsapp: "Enviar solicitud por WhatsApp",
    porEmail: "Enviar solicitud por email",
    erroCasa: "Elija el alojamiento.",
    erroDatas: "Indique las fechas de llegada y de salida.",
    erroPassado: "La fecha de llegada ya ha pasado. Elija una fecha a partir de hoy.",
    erroOrdem: "La fecha de salida tiene que ser posterior a la de llegada.",
    erroOcupado: "Esas fechas ya están ocupadas. Consulte el calendario de disponibilidad o elija otras fechas.",
    erroPessoas: "Indique cuántas personas vienen.",
    ola: (paraNome: string) => `¡Hola! Me gustaría consultar la disponibilidad ${paraNome}.`,
    lChegada: "Llegada",
    lPartida: "Salida",
    lHospedes: "Huéspedes",
    lNome: "Nombre",
    assunto: (nome: string) => `Disponibilidad ${nome}`,
    notaAntes: (comWhatsapp: boolean) =>
      `La solicitud se abre en su ${comWhatsapp ? "WhatsApp o en su " : ""}email, ya escrita, para que la revise antes de enviarla. Le respondemos con la disponibilidad y el precio. Guardamos la solicitud solo para responderle (`,
    notaLink: "política de privacidad",
    notaDepois: ").",
  },
  fr: {
    naoPreencher: "Ne pas remplir",
    alojamento: "Hébergement",
    escolha: "Choisissez un hébergement",
    chegada: "Arrivée",
    partida: "Départ",
    pessoas: "Nombre de personnes",
    nome: "Votre nom",
    mensagem: "Message",
    opcional: "(facultatif)",
    exemplo: "Par exemple : nous venons avec des enfants, ou nous arriverons tard.",
    porWhatsapp: "Envoyer la demande par WhatsApp",
    porEmail: "Envoyer la demande par e-mail",
    erroCasa: "Choisissez l'hébergement.",
    erroDatas: "Indiquez les dates d'arrivée et de départ.",
    erroPassado: "La date d'arrivée est déjà passée. Choisissez une date à partir d'aujourd'hui.",
    erroOrdem: "La date de départ doit être postérieure à la date d'arrivée.",
    erroOcupado: "Ces dates sont déjà réservées. Consultez le calendrier des disponibilités ou choisissez d'autres dates.",
    erroPessoas: "Indiquez le nombre de personnes.",
    ola: (paraNome: string) => `Bonjour ! Je voudrais connaître vos disponibilités ${paraNome}.`,
    lChegada: "Arrivée",
    lPartida: "Départ",
    lHospedes: "Personnes",
    lNome: "Nom",
    assunto: (nome: string) => `Disponibilités – ${nome}`,
    notaAntes: (comWhatsapp: boolean) =>
      `Votre demande s'ouvre dans ${comWhatsapp ? "WhatsApp ou dans " : ""}votre messagerie, déjà rédigée, pour que vous puissiez la vérifier avant de l'envoyer. Nous répondons avec les disponibilités et le prix. Nous gardons votre demande uniquement pour vous répondre (`,
    notaLink: "politique de confidentialité",
    notaDepois: ").",
  },
};

// Calendário para escolher as datas no pedido de disponibilidade.
export const escolherDatas = {
  pt: {
    titulo: "Datas",
    escolhaCasa: "Escolha o alojamento para ver as datas livres.",
    escolhaChegada: "Escolha o dia de chegada",
    escolhaPartida: "Agora escolha o dia de partida",
    minimo: (n: number) => `A partir desse dia, a estadia mínima é de ${n} noites.`,
    ocupadoPelo: "Há noites ocupadas nesse intervalo. Escolha outro dia de partida.",
    noites: (n: number) => (n === 1 ? "1 noite" : `${n} noites`),
    limpar: "Limpar datas",
    anterior: "Mês anterior",
    seguinte: "Mês seguinte",
    ocupado: "ocupado",
    livre: "livre",
    Livre: "Livre",
    Ocupado: "Ocupado",
    porNoite: "/noite",
    desde: (p: string) => `Desde ${p} por noite`,
    estadia: (n: number, p: string) => `${n === 1 ? "1 noite" : `${n} noites`} × ${p} (média)`,
    limpeza: "Taxa de limpeza",
    maisLimpeza: (p: string) => `+ ${p} de taxa de limpeza por estadia`,
    lEstadia: "Estadia",
    total: "Total",
    notaPreco: "Preço da reserva direta, sem as taxas do Airbnb ou do Booking. Confirmamos sempre por mensagem.",
    lPreco: "Total indicado no site",
    escolher: "Escolher",
    noCalendario: "Escolha as datas no calendário de disponibilidade.",
    porNoiteLongo: "por noite",
  },
  en: {
    titulo: "Dates",
    escolhaCasa: "Choose a house to see the available dates.",
    escolhaChegada: "Choose your arrival day",
    escolhaPartida: "Now choose your departure day",
    minimo: (n: number) => `From that day, the minimum stay is ${n} nights.`,
    ocupadoPelo: "Some nights in that range are booked. Choose another departure day.",
    noites: (n: number) => (n === 1 ? "1 night" : `${n} nights`),
    limpar: "Clear dates",
    anterior: "Previous month",
    seguinte: "Next month",
    ocupado: "booked",
    livre: "available",
    Livre: "Available",
    Ocupado: "Booked",
    porNoite: "/night",
    desde: (p: string) => `From ${p} per night`,
    estadia: (n: number, p: string) => `${n === 1 ? "1 night" : `${n} nights`} × ${p} (average)`,
    limpeza: "Cleaning fee",
    maisLimpeza: (p: string) => `+ ${p} cleaning fee per stay`,
    lEstadia: "Stay",
    total: "Total",
    notaPreco: "Direct booking price, without Airbnb or Booking.com fees. We always confirm by message.",
    lPreco: "Total shown on the website",
    escolher: "Choose",
    noCalendario: "Choose your dates on the availability calendar.",
    porNoiteLongo: "per night",
  },
  es: {
    titulo: "Fechas",
    escolhaCasa: "Elija el alojamiento para ver las fechas libres.",
    escolhaChegada: "Elija el día de llegada",
    escolhaPartida: "Ahora elija el día de salida",
    minimo: (n: number) => `A partir de ese día, la estancia mínima es de ${n} noches.`,
    ocupadoPelo: "Hay noches ocupadas en ese intervalo. Elija otro día de salida.",
    noites: (n: number) => (n === 1 ? "1 noche" : `${n} noches`),
    limpar: "Borrar fechas",
    anterior: "Mes anterior",
    seguinte: "Mes siguiente",
    ocupado: "ocupado",
    livre: "libre",
    Livre: "Libre",
    Ocupado: "Ocupado",
    porNoite: "/noche",
    desde: (p: string) => `Desde ${p} por noche`,
    estadia: (n: number, p: string) => `${n === 1 ? "1 noche" : `${n} noches`} × ${p} (media)`,
    limpeza: "Tarifa de limpieza",
    maisLimpeza: (p: string) => `+ ${p} de tarifa de limpieza por estancia`,
    lEstadia: "Estancia",
    total: "Total",
    notaPreco: "Precio de la reserva directa, sin las comisiones de Airbnb o Booking. Siempre confirmamos por mensaje.",
    lPreco: "Total indicado en la web",
    escolher: "Elegir",
    noCalendario: "Elija las fechas en el calendario de disponibilidad.",
    porNoiteLongo: "por noche",
  },
  fr: {
    titulo: "Dates",
    escolhaCasa: "Choisissez la maison pour voir les dates libres.",
    escolhaChegada: "Choisissez le jour d'arrivée",
    escolhaPartida: "Choisissez maintenant le jour de départ",
    minimo: (n: number) => `À partir de ce jour, le séjour minimum est de ${n} nuits.`,
    ocupadoPelo: "Certaines nuits de cet intervalle sont réservées. Choisissez un autre jour de départ.",
    noites: (n: number) => (n === 1 ? "1 nuit" : `${n} nuits`),
    limpar: "Effacer les dates",
    anterior: "Mois précédent",
    seguinte: "Mois suivant",
    ocupado: "réservé",
    livre: "libre",
    Livre: "Libre",
    Ocupado: "Réservé",
    porNoite: "/nuit",
    desde: (p: string) => `À partir de ${p} la nuit`,
    estadia: (n: number, p: string) => `${n === 1 ? "1 nuit" : `${n} nuits`} × ${p} (moyenne)`,
    limpeza: "Frais de ménage",
    maisLimpeza: (p: string) => `+ ${p} de frais de ménage par séjour`,
    lEstadia: "Séjour",
    total: "Total",
    notaPreco: "Prix de la réservation directe, sans les frais d'Airbnb ou de Booking. Nous confirmons toujours par message.",
    lPreco: "Total indiqué sur le site",
    escolher: "Choisir",
    noCalendario: "Choisissez vos dates dans le calendrier des disponibilités.",
    porNoiteLongo: "par nuit",
  },
};

// Barra de pesquisa da página inicial (casa, datas, pessoas) e fotografias.
export const pesquisa = {
  pt: {
    alojamento: "Alojamento",
    escolher: "Escolher a casa",
    datas: "Datas",
    escolherDatas: "Escolher datas",
    pessoas: "Pessoas",
    menos: "Menos uma pessoa",
    mais: "Mais uma pessoa",
    ver: "Ver disponibilidade",
    escolhaCasaPrimeiro: "Escolha primeiro o alojamento:",
    fechar: "Fechar",
    pausar: "Pausar as fotografias",
    continuar: "Continuar as fotografias",
    anterior: "Fotografia anterior",
    seguinte: "Fotografia seguinte",
    foto: (n: number, total: number) => `Fotografia ${n} de ${total}`,
  },
  en: {
    alojamento: "House",
    escolher: "Choose a house",
    datas: "Dates",
    escolherDatas: "Add dates",
    pessoas: "Guests",
    menos: "One guest fewer",
    mais: "One more guest",
    ver: "Check availability",
    escolhaCasaPrimeiro: "First choose a house:",
    fechar: "Close",
    pausar: "Pause the photos",
    continuar: "Play the photos",
    anterior: "Previous photo",
    seguinte: "Next photo",
    foto: (n: number, total: number) => `Photo ${n} of ${total}`,
  },
  es: {
    alojamento: "Alojamiento",
    escolher: "Elegir la casa",
    datas: "Fechas",
    escolherDatas: "Elegir fechas",
    pessoas: "Personas",
    menos: "Una persona menos",
    mais: "Una persona más",
    ver: "Ver disponibilidad",
    escolhaCasaPrimeiro: "Primero elija el alojamiento:",
    fechar: "Cerrar",
    pausar: "Pausar las fotos",
    continuar: "Reanudar las fotos",
    anterior: "Foto anterior",
    seguinte: "Foto siguiente",
    foto: (n: number, total: number) => `Foto ${n} de ${total}`,
  },
  fr: {
    alojamento: "Maison",
    escolher: "Choisir la maison",
    datas: "Dates",
    escolherDatas: "Choisir les dates",
    pessoas: "Personnes",
    menos: "Une personne de moins",
    mais: "Une personne de plus",
    ver: "Voir les disponibilités",
    escolhaCasaPrimeiro: "Choisissez d’abord la maison :",
    fechar: "Fermer",
    pausar: "Mettre les photos en pause",
    continuar: "Reprendre les photos",
    anterior: "Photo précédente",
    seguinte: "Photo suivante",
    foto: (n: number, total: number) => `Photo ${n} sur ${total}`,
  },
};
