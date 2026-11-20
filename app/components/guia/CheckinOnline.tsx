"use client";

import { useId, useMemo, useState } from "react";
import type { Lingua } from "../../guias";
import { paisesEm } from "../../paises";
import Copiar from "./Copiar";
import { useLingua } from "./Lingua";

// NÃO ESTÁ EM USO (20/11/2026): o guia deixou de pedir os dados dos hóspedes.
// O componente fica aqui para poder voltar sem ser refeito — basta importá-lo
// outra vez em app/(hospedes)/guia/[slug]/page.tsx.
//
// Check-in online: o hóspede preenche os dados de cada pessoa (obrigatórios por lei
// para o registo de hóspedes) e o formulário prepara uma mensagem para o anfitrião.
// A página não guarda nada: os dados só seguem na mensagem que o hóspede enviar.

type Txt = Record<Lingua, string>;
const t = (pt: string, en: string, es: string, fr: string): Txt => ({ pt, en, es, fr });

const X = {
  estadia: t("Estadia", "Stay", "Estancia", "Séjour"),
  entrada: t("Data de entrada", "Arrival date", "Fecha de entrada", "Date d’arrivée"),
  saida: t("Data de saída", "Departure date", "Fecha de salida", "Date de départ"),
  hora: t("Hora prevista de chegada", "Expected arrival time", "Hora prevista de llegada", "Heure d’arrivée prévue"),
  telefone: t("Telemóvel do responsável", "Lead guest’s mobile", "Móvil del responsable", "Portable du responsable"),
  email: t("Email (opcional)", "Email (optional)", "Email (opcional)", "E-mail (facultatif)"),
  quantos: t("Número de hóspedes (incluindo crianças)", "Number of guests (including children)", "Número de huéspedes (incluidos niños)", "Nombre de voyageurs (enfants compris)"),
  hospede: t("Hóspede", "Guest", "Huésped", "Voyageur"),
  responsavel: t("responsável", "lead guest", "responsable", "responsable"),
  nome: t("Nome completo (como no documento)", "Full name (as on the document)", "Nombre completo (como en el documento)", "Nom complet (comme sur le document)"),
  nascimento: t("Data de nascimento", "Date of birth", "Fecha de nacimiento", "Date de naissance"),
  nacionalidade: t("Nacionalidade", "Nationality", "Nacionalidad", "Nationalité"),
  residencia: t("País de residência", "Country of residence", "País de residencia", "Pays de résidence"),
  tipoDoc: t("Tipo de documento", "Document type", "Tipo de documento", "Type de document"),
  numDoc: t("N.º do documento", "Document number", "N.º de documento", "N° du document"),
  paisDoc: t("País emissor", "Issuing country", "País de expedición", "Pays de délivrance"),
  notas: t("Observações (opcional)", "Notes (optional)", "Observaciones (opcional)", "Remarques (facultatif)"),
  aceito: t("Li e aceito as regras da casa.", "I have read and accept the house rules.", "He leído y acepto las normas de la casa.", "J’ai lu et j’accepte le règlement de la maison."),
  privacidade: t(
    "Os dados servem apenas para o registo obrigatório de hóspedes junto das autoridades e para a fatura. Esta página não guarda nada: os dados só seguem na mensagem que enviar.",
    "Your details are used only for the mandatory guest registration with the authorities and for the invoice. This page stores nothing: the details only travel in the message you send.",
    "Los datos solo se usan para el registro obligatorio de huéspedes ante las autoridades y para la factura. Esta página no guarda nada: los datos solo viajan en el mensaje que envíe.",
    "Vos données servent uniquement à l’enregistrement obligatoire des voyageurs auprès des autorités et à la facture. Cette page n’enregistre rien : les données ne voyagent que dans le message que vous envoyez."
  ),
  preparar: t("Preparar mensagem de check-in", "Prepare check-in message", "Preparar mensaje de check-in", "Préparer le message d’enregistrement"),
  faltam: t("Faltam campos por preencher. Estão assinalados.", "Some fields are missing. They are marked.", "Faltan campos por rellenar. Están marcados.", "Certains champs sont vides. Ils sont signalés."),
  datas: t("A data de saída tem de ser depois da data de entrada.", "The departure date must be after the arrival date.", "La fecha de salida debe ser posterior a la de entrada.", "La date de départ doit être après la date d’arrivée."),
  falta: t("Falta só enviar", "One last step: send it", "Solo falta enviarlo", "Dernière étape : l’envoyer"),
  concluido: t("O check-in fica concluído quando recebermos esta mensagem.", "Your check-in is complete once we receive this message.", "El check-in se completa cuando recibamos este mensaje.", "L’enregistrement est terminé dès que nous recevons ce message."),
  enviarWa: t("Enviar por WhatsApp", "Send via WhatsApp", "Enviar por WhatsApp", "Envoyer par WhatsApp"),
  mensagem: t("Mensagem", "Message", "Mensaje", "Message"),
};

const DOCS: { v: string; t: Txt }[] = [
  { v: "Passaporte", t: t("Passaporte", "Passport", "Pasaporte", "Passeport") },
  { v: "Cartão de cidadão / ID nacional", t: t("Cartão de cidadão / ID nacional", "National ID card", "DNI / documento nacional", "Carte d’identité") },
  { v: "Autorização de residência", t: t("Autorização de residência", "Residence permit", "Permiso de residencia", "Titre de séjour") },
  { v: "Outro", t: t("Outro", "Other", "Otro", "Autre") },
];

const dataPT = (iso: string) => iso.split("-").reverse().join("/");

export default function CheckinOnline({
  casa,
  telefone,
  maxHospedes,
}: {
  casa: string;
  telefone: string;
  maxHospedes: number;
}) {
  const { lingua: L } = useLingua();
  const id = useId();
  // Todos os países, escritos na língua que o hóspede escolheu.
  const paises = useMemo(() => paisesEm(L), [L]);
  const [n, setN] = useState(2);
  const [erro, setErro] = useState("");
  const [texto, setTexto] = useState("");

  const campo =
    "mt-1.5 block w-full rounded-sm border border-xisto/25 bg-white px-3 py-2.5 text-base text-xisto aria-[invalid=true]:border-[#9a2b1f] aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-[#9a2b1f]";
  const rotulo = "block text-sm font-semibold";
  const caixa = "grid gap-4 border-t border-xisto/15 pt-5 sm:grid-cols-2";

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    let primeiro: HTMLElement | null = null;
    f.querySelectorAll<HTMLInputElement>("[required]").forEach((el) => {
      const mau = el.type === "checkbox" ? !el.checked : !el.value.trim();
      el.setAttribute("aria-invalid", String(mau));
      if (mau && !primeiro) primeiro = el;
    });
    const v = (nome: string) => (f.elements.namedItem(nome) as HTMLInputElement | null)?.value.trim() ?? "";
    const entrada = v("entrada");
    const saida = v("saida");
    const datasMas = !!entrada && !!saida && saida <= entrada;
    if (datasMas) {
      const el = f.elements.namedItem("saida") as HTMLInputElement;
      el.setAttribute("aria-invalid", "true");
      primeiro ??= el;
    }
    if (primeiro) {
      setErro(datasMas && !f.querySelector("[required][aria-invalid=true]:not([name=saida])") ? X.datas[L] : X.faltam[L]);
      setTexto("");
      (primeiro as HTMLElement).focus();
      return;
    }
    setErro("");

    const noites = Math.round((Date.parse(saida) - Date.parse(entrada)) / 86400000);
    const linhas = [
      `CHECK-IN ONLINE · ${casa}`,
      `Entrada: ${dataPT(entrada)} · Saída: ${dataPT(saida)} (${noites} ${noites === 1 ? "noite" : "noites"})`,
      `Chegada prevista: ${v("hora")}`,
      `Contacto: ${v("telefone")}${v("email") ? ` · ${v("email")}` : ""}`,
      "",
      `HÓSPEDES (${n})`,
    ];
    for (let i = 1; i <= n; i++) {
      linhas.push(`${i}. ${v(`nome${i}`)}${i === 1 ? " (responsável)" : ""}`);
      linhas.push(`   Nascimento: ${dataPT(v(`nasc${i}`))} · Nacionalidade: ${v(`nac${i}`)} · Residência: ${v(`res${i}`)}`);
      linhas.push(`   ${v(`tipo${i}`)} n.º ${v(`doc${i}`)} · Emitido por: ${v(`pais${i}`)}`);
    }
    if (v("notas")) linhas.push("", `Observações: ${v("notas")}`);
    linhas.push("", "Regras da casa lidas e aceites.");
    setTexto(linhas.join("\n"));
    setTimeout(() => document.getElementById(`${id}-res`)?.scrollIntoView({ block: "start" }), 50);
  }

  const limparInvalido = (e: React.FormEvent) => {
    const el = e.target as HTMLInputElement;
    if (el.getAttribute("aria-invalid") === "true" && (el.type === "checkbox" ? el.checked : el.value.trim())) {
      el.setAttribute("aria-invalid", "false");
    }
  };

  return (
    <div>
      <form onSubmit={enviar} onInput={limparInvalido} onChange={limparInvalido} noValidate className="grid gap-6">
        <datalist id={`${id}-paises`}>
          {paises.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-display text-xl">{X.estadia[L]}</legend>
          <label className={rotulo}>
            {X.entrada[L]}
            <input name="entrada" type="date" required className={campo} />
          </label>
          <label className={rotulo}>
            {X.saida[L]}
            <input name="saida" type="date" required className={campo} />
          </label>
          <label className={rotulo}>
            {X.hora[L]}
            <input name="hora" type="time" required className={campo} />
          </label>
          <label className={rotulo}>
            {X.telefone[L]}
            <input name="telefone" type="tel" inputMode="tel" autoComplete="tel" required className={campo} />
          </label>
          <label className={`${rotulo} sm:col-span-2`}>
            {X.email[L]}
            <input name="email" type="email" autoComplete="email" className={campo} />
          </label>
          <label className={`${rotulo} sm:col-span-2`}>
            {X.quantos[L]}
            <select value={n} onChange={(e) => setN(Number(e.target.value))} className={campo}>
              {Array.from({ length: maxHospedes }, (_, i) => i + 1).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        {Array.from({ length: n }, (_, k) => k + 1).map((i) => (
          <fieldset key={i} className={caixa}>
            <legend className="float-left mb-1 w-full font-display text-xl">
              {X.hospede[L]} {i}
              {i === 1 && <span className="font-sans text-base text-cinza"> · {X.responsavel[L]}</span>}
            </legend>
            <label className={`${rotulo} sm:col-span-2`}>
              {X.nome[L]}
              <input name={`nome${i}`} required autoComplete={i === 1 ? "name" : "off"} className={campo} />
            </label>
            <label className={rotulo}>
              {X.nascimento[L]}
              <input name={`nasc${i}`} type="date" required className={campo} />
            </label>
            <label className={rotulo}>
              {X.nacionalidade[L]}
              <input name={`nac${i}`} list={`${id}-paises`} required className={campo} />
            </label>
            <label className={rotulo}>
              {X.residencia[L]}
              <input name={`res${i}`} list={`${id}-paises`} required className={campo} />
            </label>
            <label className={rotulo}>
              {X.tipoDoc[L]}
              <select name={`tipo${i}`} className={campo}>
                {DOCS.map((d) => (
                  <option key={d.v} value={d.v}>
                    {d.t[L]}
                  </option>
                ))}
              </select>
            </label>
            <label className={rotulo}>
              {X.numDoc[L]}
              <input name={`doc${i}`} required autoComplete="off" className={campo} />
            </label>
            <label className={rotulo}>
              {X.paisDoc[L]}
              <input name={`pais${i}`} list={`${id}-paises`} required className={campo} />
            </label>
          </fieldset>
        ))}

        <div className="grid gap-4 border-t border-xisto/15 pt-5">
          <label className={rotulo}>
            {X.notas[L]}
            <textarea name="notas" rows={3} className={campo} />
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="regras" required className="mt-1 h-5 w-5 accent-[#7d5f2a]" />
            <span>
              <a href="#regras" className="underline underline-offset-4">
                {X.aceito[L]}
              </a>
            </span>
          </label>
          <p className="text-sm text-cinza">{X.privacidade[L]}</p>
          {erro && (
            <p role="alert" className="font-semibold text-[#9a2b1f]">
              {erro}
            </p>
          )}
          <button type="submit" className="justify-self-start rounded-sm bg-preto px-6 py-3.5 font-semibold text-white hover:bg-xisto">
            {X.preparar[L]}
          </button>
        </div>
      </form>

      {texto && (
        <div id={`${id}-res`} className="mt-8 scroll-mt-32 bg-pedra p-5">
          <h3 className="text-2xl">{X.falta[L]}</h3>
          <p className="mt-2 text-cinza">{X.concluido[L]}</p>
          <label className="mt-4 block text-sm font-semibold">
            {X.mensagem[L]}
            <textarea readOnly value={texto} rows={12} className={`${campo} font-mono text-sm`} />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-[#1f7a4a] px-6 py-3.5 font-semibold text-white hover:bg-[#186139]"
            >
              {X.enviarWa[L]}
            </a>
            <Copiar valor={texto} />
          </div>
        </div>
      )}
    </div>
  );
}
