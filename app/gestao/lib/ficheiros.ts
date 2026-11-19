import "server-only";
import { inflateRawSync } from "node:zlib";

// Leitura de folhas de cálculo sem bibliotecas externas:
//  - .xlsx (Excel moderno, incluindo o ficheiro Faturacao_JustRuby.xlsx)
//  - .csv (Airbnb, Booking), separado por vírgulas, ponto e vírgula ou tabulações
//  - "xls" que na verdade é uma tabela HTML (o formato de exportação de algumas extranets)

export type Celula = { v: string | number | null; f: boolean }; // f = a célula tinha fórmula
export type Folha = { nome: string; linhas: Celula[][] };

// ---------- zip ----------
function unzip(buf: Buffer): Map<string, Buffer> {
  const ficheiros = new Map<string, Buffer>();
  let fimDir = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      fimDir = i;
      break;
    }
  }
  if (fimDir < 0) throw new Error("Ficheiro .xlsx inválido.");
  const total = buf.readUInt16LE(fimDir + 10);
  let p = buf.readUInt32LE(fimDir + 16);
  for (let n = 0; n < total; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const metodo = buf.readUInt16LE(p + 10);
    const tamComp = buf.readUInt32LE(p + 20);
    const lenNome = buf.readUInt16LE(p + 28);
    const lenExtra = buf.readUInt16LE(p + 30);
    const lenComent = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const nome = buf.toString("utf8", p + 46, p + 46 + lenNome);
    const lnNome = buf.readUInt16LE(local + 26);
    const lnExtra = buf.readUInt16LE(local + 28);
    const ini = local + 30 + lnNome + lnExtra;
    const dados = buf.subarray(ini, ini + tamComp);
    ficheiros.set(nome, metodo === 8 ? inflateRawSync(dados) : Buffer.from(dados));
    p += 46 + lenNome + lenExtra + lenComent;
  }
  return ficheiros;
}

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export function desentidade(s: string) {
  return s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const c = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(c) ? String.fromCodePoint(c) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

function colIndex(ref: string) {
  const letras = ref.match(/^[A-Z]+/)?.[0] ?? "A";
  let n = 0;
  for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function lerXlsx(buf: Buffer): Folha[] {
  const z = unzip(buf);
  const txt = (n: string) => z.get(n)?.toString("utf8") ?? "";
  const partilhadas: string[] = [];
  for (const si of txt("xl/sharedStrings.xml").match(/<si>[\s\S]*?<\/si>/g) ?? []) {
    const partes = [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]);
    partilhadas.push(desentidade(partes.join("")));
  }
  const rels = new Map<string, string>();
  for (const m of txt("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*>/g)) {
    const id = m[0].match(/Id="([^"]+)"/)?.[1];
    const alvo = m[0].match(/Target="([^"]+)"/)?.[1];
    if (id && alvo) rels.set(id, alvo.replace(/^\/?xl\//, "").replace(/^\//, ""));
  }
  const folhas: Folha[] = [];
  for (const m of txt("xl/workbook.xml").matchAll(/<sheet\b[^>]*>/g)) {
    const nome = desentidade(m[0].match(/name="([^"]*)"/)?.[1] ?? "");
    const rid = m[0].match(/r:id="([^"]+)"/)?.[1] ?? "";
    const caminho = `xl/${rels.get(rid) ?? ""}`;
    const xml = txt(caminho);
    const linhas: Celula[][] = [];
    for (const row of xml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
      const r = Number(row[0].match(/\br="(\d+)"/)?.[1] ?? linhas.length + 1) - 1;
      const linha: Celula[] = [];
      for (const c of (row[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = c[1];
        const corpo = c[2] ?? "";
        const ref = attrs.match(/\br="([A-Z]+)\d+"/)?.[1] ?? "";
        const tipo = attrs.match(/\bt="(\w+)"/)?.[1] ?? "n";
        const f = /<f\b/.test(corpo);
        const vRaw = corpo.match(/<v>([\s\S]*?)<\/v>/)?.[1];
        let v: string | number | null = null;
        if (tipo === "s" && vRaw != null) v = partilhadas[Number(vRaw)] ?? "";
        else if (tipo === "inlineStr") v = desentidade([...corpo.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(""));
        else if (tipo === "str" || tipo === "e") v = vRaw != null ? desentidade(vRaw) : null;
        else if (tipo === "b") v = vRaw === "1" ? 1 : 0;
        else if (vRaw != null && vRaw !== "") v = Number(vRaw);
        linha[ref ? colIndex(ref) : linha.length] = { v, f };
      }
      linhas[r] = Array.from(linha, (x) => x ?? { v: null, f: false });
    }
    folhas.push({ nome, linhas: Array.from(linhas, (x) => x ?? []) });
  }
  return folhas;
}

// ---------- csv ----------
function lerCsv(texto: string): Folha {
  texto = texto.replace(/^﻿/, "");
  const primeira = texto.split(/\r?\n/, 1)[0] ?? "";
  const contar = (c: string) => primeira.split(c).length - 1;
  const sep = [";", ",", "\t"].sort((a, b) => contar(b) - contar(a))[0];
  const linhas: Celula[][] = [];
  let linha: Celula[] = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) {
      if (ch === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else aspas = false;
      } else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) {
      linha.push({ v: campo, f: false });
      campo = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && texto[i + 1] === "\n") i++;
      linha.push({ v: campo, f: false });
      linhas.push(linha);
      linha = [];
      campo = "";
    } else campo += ch;
  }
  if (campo || linha.length) {
    linha.push({ v: campo, f: false });
    linhas.push(linha);
  }
  return { nome: "csv", linhas: linhas.filter((l) => l.some((c) => String(c.v ?? "").trim())) };
}

// ---------- tabela HTML ----------
function lerHtml(texto: string): Folha {
  const linhas: Celula[][] = [];
  for (const tr of texto.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const l: Celula[] = [];
    for (const td of tr[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)) {
      l.push({ v: desentidade(td[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim(), f: false });
    }
    if (l.length) linhas.push(l);
  }
  return { nome: "html", linhas };
}

export function lerFicheiro(buf: Buffer): Folha[] {
  if (buf.length < 4) throw new Error("O ficheiro está vazio.");
  if (buf[0] === 0x50 && buf[1] === 0x4b) return lerXlsx(buf);
  if (buf[0] === 0xd0 && buf[1] === 0xcf)
    throw new Error("Este é um .xls antigo. Abra-o e guarde como .xlsx ou .csv, e volte a carregar.");
  let texto: string;
  if (buf[0] === 0xff && buf[1] === 0xfe) texto = buf.subarray(2).toString("utf16le");
  else texto = buf.toString("utf8");
  if (/<table\b/i.test(texto)) return [lerHtml(texto)];
  return [lerCsv(texto)];
}
