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
    sede: "sede em",
    registoAL: "registo de Alojamento Local n.º",
    livro: "Livro de Reclamações",
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
    sede: "registered office in",
    registoAL: "Local Accommodation (AL) registration no.",
    livro: "Complaints Book (Livro de Reclamações)",
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
    sede: "con sede en",
    registoAL: "registro de Alojamiento Local (AL) n.º",
    livro: "Libro de Reclamaciones (Livro de Reclamações)",
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
    sede: "siège à",
    registoAL: "n° d'enregistrement d'hébergement local (AL)",
    livro: "Livre de réclamations (Livro de Reclamações)",
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
