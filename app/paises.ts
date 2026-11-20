// Lista de países para o check-in online.
//
// Guardamos só os códigos ISO 3166-1 alfa-2 e deixamos o próprio browser escrever
// o nome na língua do hóspede (Intl.DisplayNames). Assim a lista aparece em
// português, inglês, espanhol ou francês sem termos quatro listas à mão.
//
// Os campos continuam a ser de escrita livre (<input list>): a lista é só sugestão,
// para quem tiver um país que não esteja aqui o poder escrever à mão.

export const CODIGOS_PAISES = [
  "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ",
  "CA","CD","CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ",
  "EC","EE","EG","ER","ES","ET",
  "FI","FJ","FM","FR",
  "GA","GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY",
  "HN","HR","HT","HU",
  "ID","IE","IL","IN","IQ","IR","IS","IT",
  "JM","JO","JP",
  "KE","KG","KH","KI","KM","KN","KP","KR","KW","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MR","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NE","NG","NI","NL","NO","NP","NR","NZ",
  "OM",
  "PA","PE","PG","PH","PK","PL","PS","PT","PW","PY",
  "QA",
  "RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY","SZ",
  "TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","US","UY","UZ",
  "VA","VC","VE","VN","VU",
  "WS",
  "YE",
  "ZA","ZM","ZW",
] as const;

// Lista de reserva, caso o browser não saiba escrever os nomes (Intl.DisplayNames).
const RESERVA = [
  "Portugal", "Espanha / Spain", "França / France", "Reino Unido / United Kingdom",
  "Alemanha / Germany", "Itália / Italy", "Países Baixos / Netherlands", "Bélgica / Belgium",
  "Suíça / Switzerland", "Irlanda / Ireland", "Polónia / Poland",
  "Estados Unidos / United States", "Canadá / Canada", "Brasil / Brazil",
  "Angola", "Cabo Verde", "Moçambique",
];

/** Nomes dos países na língua pedida, por ordem alfabética dessa língua. */
export function paisesEm(lingua: string): string[] {
  try {
    const nomes = new Intl.DisplayNames([lingua], { type: "region" });
    const lista = CODIGOS_PAISES.map((c) => nomes.of(c) ?? c);
    return lista.sort((a, b) => a.localeCompare(b, lingua));
  } catch {
    return RESERVA;
  }
}
