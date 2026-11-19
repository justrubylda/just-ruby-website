// =====================================================================
//  LÍNGUAS DO SITE: português (principal) e inglês (/en).
//  Aqui ficam os endereços de cada página nas duas línguas, o menu e os
//  textos comuns (cabeçalho, rodapé, formulário e calendário).
//  Os textos de cada página estão no próprio ficheiro da página,
//  em app/components/paginas/.
// =====================================================================

import type { Metadata } from "next";

export type Lingua = "pt" | "en";
export const linguas: Lingua[] = ["pt", "en"];

export type Pagina =
  | "inicio"
  | "alojamentos"
  | "zona"
  | "sobre"
  | "galeria"
  | "contactos"
  | "privacidade";

const ROTAS: Record<Pagina, Record<Lingua, string>> = {
  inicio: { pt: "/", en: "/en" },
  alojamentos: { pt: "/alojamentos", en: "/en/accommodation" },
  zona: { pt: "/zona", en: "/en/area" },
  sobre: { pt: "/sobre", en: "/en/about" },
  galeria: { pt: "/galeria", en: "/en/gallery" },
  contactos: { pt: "/contactos", en: "/en/contact" },
  privacidade: { pt: "/privacidade", en: "/en/privacy" },
};

export const paginas = Object.keys(ROTAS) as Pagina[];

export const rota = (l: Lingua, p: Pagina) => ROTAS[p][l];
export const rotaCasa = (l: Lingua, slug: string) => `${ROTAS.alojamentos[l]}/${slug}`;

// Código de língua para o Google (hreflang) e para o atributo lang.
export const codigo: Record<Lingua, string> = { pt: "pt-PT", en: "en" };

// Endereço canónico e versões noutras línguas (hreflang), para o metadata de cada página.
export function alternativas(l: Lingua, p: Pagina, slug?: string): Metadata["alternates"] {
  const pt = slug ? rotaCasa("pt", slug) : rota("pt", p);
  const en = slug ? rotaCasa("en", slug) : rota("en", p);
  return {
    canonical: l === "pt" ? pt : en,
    languages: { "pt-PT": pt, en, "x-default": pt },
  };
}

// Língua de um endereço e o endereço equivalente na outra língua (para o seletor PT/EN).
export function linguaDe(pathname: string): Lingua {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";
}

export function noutraLingua(pathname: string): string {
  const de = linguaDe(pathname);
  const para: Lingua = de === "pt" ? "en" : "pt";
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
};

// Menu principal (cabeçalho e rodapé).
export const menu = (l: Lingua) =>
  (Object.keys(ROTULOS[l]) as Pagina[]).map((p) => ({
    href: rota(l, p),
    label: ROTULOS[l][p] as string,
  }));

// Textos comuns a várias páginas.
export const ui = {
  pt: {
    saltar: "Saltar para o conteúdo",
    paginaInicial: "página inicial",
    menuPrincipal: "Menu principal",
    abrirMenu: "Abrir menu",
    fecharMenu: "Fechar menu",
    pedir: "Pedir disponibilidade",
    outraLingua: "EN",
    outraLinguaNome: "Read this page in English",
    rodapeFrase: "Turismo rural em Tomar e Santarém. Recebemos cada hóspede pessoalmente.",
    paginas: "Páginas",
    contactos: "Contactos",
    zona: "O que fazer na zona",
    sede: "sede em",
    registoAL: "registo de Alojamento Local n.º",
    livro: "Livro de Reclamações",
    privacidade: "Política de privacidade",
    whatsappAria: "Falar connosco por WhatsApp",
    whatsappTexto: "Olá! Gostaria de saber a disponibilidade.",
    ver: (nome: string) => `Ver ${nome}`,
    nota: (n: number) => n.toLocaleString("pt-PT", { minimumFractionDigits: 1 }),
    avaliacao: (plataforma: string) => `de 10 no ${plataforma}`,
  },
  en: {
    saltar: "Skip to content",
    paginaInicial: "home page",
    menuPrincipal: "Main menu",
    abrirMenu: "Open menu",
    fecharMenu: "Close menu",
    pedir: "Check availability",
    outraLingua: "PT",
    outraLinguaNome: "Ver esta página em português",
    rodapeFrase: "Country houses in Tomar and Santarém, Portugal. We welcome every guest personally.",
    paginas: "Pages",
    contactos: "Contact",
    zona: "Things to do nearby",
    sede: "registered office in",
    registoAL: "Local Accommodation (AL) registration no.",
    livro: "Complaints Book (Livro de Reclamações)",
    privacidade: "Privacy policy",
    whatsappAria: "Chat with us on WhatsApp",
    whatsappTexto: "Hello! I'd like to check availability.",
    ver: (nome: string) => `See ${nome}`,
    nota: (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1 }),
    avaliacao: (plataforma: string) => `out of 10 on ${plataforma}`,
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
};
