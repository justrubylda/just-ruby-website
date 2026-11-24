import "server-only";
import { deflateRawSync } from "node:zlib";

// Escreve um ficheiro Excel (.xlsx) simples sem bibliotecas externas:
// uma folha, cabeçalho a negrito e fixo, filtros, larguras de coluna,
// datas e euros com formato português e uma linha de totais.

export type TipoColuna = "texto" | "numero" | "euro" | "data" | "percentagem";
export type Coluna = { titulo: string; tipo: TipoColuna; largura?: number; somar?: boolean };
export type Valor = string | number | null | undefined;

// ---------- zip ----------
const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b: Buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABELA_CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(ficheiros: { nome: string; dados: string }[]): Buffer {
  const partes: Buffer[] = [];
  const centrais: Buffer[] = [];
  let pos = 0;
  for (const f of ficheiros) {
    const nome = Buffer.from(f.nome, "utf8");
    const bruto = Buffer.from(f.dados, "utf8");
    const comp = deflateRawSync(bruto);
    const crc = crc32(bruto);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // nomes em UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(0, 10);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(bruto.length, 22);
    local.writeUInt16LE(nome.length, 26);
    local.writeUInt16LE(0, 28);
    partes.push(local, nome, comp);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(0, 12);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(bruto.length, 24);
    central.writeUInt16LE(nome.length, 28);
    central.writeUInt32LE(pos, 42);
    centrais.push(central, nome);
    pos += local.length + nome.length + comp.length;
  }
  const dir = Buffer.concat(centrais);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(ficheiros.length, 8);
  fim.writeUInt16LE(ficheiros.length, 10);
  fim.writeUInt32LE(dir.length, 12);
  fim.writeUInt32LE(pos, 16);
  return Buffer.concat([...partes, dir, fim]);
}

// ---------- folha ----------
const esc = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function letra(i: number) {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** Data "AAAA-MM-DD" → número de série do Excel. */
function serie(iso: string) {
  const t = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(t) ? t / 86_400_000 + 25569 : null;
}

// estilos: 0 normal · 1 cabeçalho · 2 data · 3 euro · 4 percentagem · 5 euro total · 6 texto total
const ESTILO: Record<TipoColuna, number> = { texto: 0, numero: 0, euro: 3, data: 2, percentagem: 4 };

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="#,##0.00 &quot;€&quot;"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEDE7DC"/></patternFill></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="7">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="9" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

export function criarXlsx(nomeFolha: string, colunas: Coluna[], linhas: Valor[][]): Buffer {
  const ultimaCol = letra(colunas.length - 1);
  const n = linhas.length;
  const rows: string[] = [];
  const cel = (ref: string, v: Valor, tipo: TipoColuna) => {
    if (v == null || v === "") return "";
    if (tipo === "data" && typeof v === "string") {
      const s = serie(v);
      return s == null ? "" : `<c r="${ref}" s="2"><v>${s}</v></c>`;
    }
    if (typeof v === "number" && Number.isFinite(v)) return `<c r="${ref}" s="${ESTILO[tipo]}"><v>${v}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(String(v))}</t></is></c>`;
  };
  rows.push(
    `<row r="1">${colunas.map((c, j) => `<c r="${letra(j)}1" s="1" t="inlineStr"><is><t>${esc(c.titulo)}</t></is></c>`).join("")}</row>`
  );
  linhas.forEach((l, i) => {
    const r = i + 2;
    rows.push(`<row r="${r}">${colunas.map((c, j) => cel(`${letra(j)}${r}`, l[j], c.tipo)).join("")}</row>`);
  });
  // linha de totais (SUBTOTAL acompanha os filtros)
  const rt = n + 3;
  const tot = colunas
    .map((c, j) => {
      const ref = `${letra(j)}${rt}`;
      if (j === 0) return `<c r="${ref}" s="6" t="inlineStr"><is><t>Total</t></is></c>`;
      if (!c.somar || n === 0) return "";
      return `<c r="${ref}" s="${c.tipo === "euro" ? 5 : 6}"><f>SUBTOTAL(9,${letra(j)}2:${letra(j)}${n + 1})</f></c>`;
    })
    .join("");
  rows.push(`<row r="${rt}">${tot}</row>`);

  const cols = colunas
    .map((c, j) => `<col min="${j + 1}" max="${j + 1}" width="${c.largura ?? 12}" customWidth="1"/>`)
    .join("");
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${cols}</cols>
<sheetData>${rows.join("")}</sheetData>
<autoFilter ref="A1:${ultimaCol}${Math.max(1, n + 1)}"/>
</worksheet>`;

  const nome = esc(nomeFolha.slice(0, 31));
  return zip([
    {
      nome: "[Content_Types].xml",
      dados: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      nome: "_rels/.rels",
      dados: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      nome: "xl/workbook.xml",
      dados: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${nome}" sheetId="1" r:id="rId1"/></sheets>
<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${nome.replace(/'/g, "''")}'!$A$1:$${ultimaCol}$${Math.max(1, n + 1)}</definedName></definedNames>
</workbook>`,
    },
    {
      nome: "xl/_rels/workbook.xml.rels",
      dados: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { nome: "xl/worksheets/sheet1.xml", dados: sheet },
    { nome: "xl/styles.xml", dados: STYLES },
  ]);
}
