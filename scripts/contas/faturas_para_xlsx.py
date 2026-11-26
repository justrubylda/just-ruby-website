"""Converte faturas.json (lido das pastas) numa folha para importar em /gestao/despesas.

Uso: python3 faturas_para_xlsx.py faturas.json nomes_nif.json saida.xlsx
"""
import json, re, sys
import openpyxl

ENTRADA, NOMES, SAIDA = sys.argv[1], sys.argv[2], sys.argv[3]
fs = json.load(open(ENTRADA))
mapa = json.load(open(NOMES)) if NOMES != "-" else {}

NIF_EMPRESA = "518785483"
PESSOAIS = set(filter(None, __import__("os").environ.get("NIFS_SOCIOS", "").split(",")))


def nome_do_texto(t):
    m = re.search(r"DADOS DO TRANSMITENTE.*?\n.*?NOME\s+([^\n]+)", t, re.S)
    if m:
        return re.sub(r"\s{2,}.*", "", m.group(1)).strip().title()
    m = re.search(r"Sede Fiscal:\s*([^\n|]+)", t)
    if m:
        return m.group(1).strip()
    if re.search(r"registocriminal\.justica", t):
        return "Registo Criminal (Justiça)"
    return None


# texto onde está a localidade da compra: o cabeçalho (nos talões vem a loja: "PINGO DOCE / SANTAREM") e,
# a seguir, a localidade do primeiro código postal que não é o da empresa. O site escolhe a localidade
# conhecida que aparece primeiro (cidadeDeTexto).
CLIENTE_RE = re.compile(r"JUST\s*RUBY|ANT[OÓ]NIO|EXMO|2005\s?-\s?0|2005\s?-\s?5|2000\s?-\s?222|518785483|^\s*SR\b|CLIENTE", re.I)
CP_EMPRESA = {"2005-546", "2005-020", "2005-022", "2000-222"}


def cidade(texto):
    segs = []
    for linha in [l for l in texto.splitlines() if l.strip()][:6]:
        for s_ in re.split(r"\s{2,}", linha.strip()):
            if not CLIENTE_RE.search(s_) and not re.search(r"sede|capital|matr", s_, re.I):
                segs.append(s_)
    cp = ""
    for linha in texto.splitlines():
        if re.search(r"sede|capital|matr[ií]c|c\.?\s?r\.?\s?c|registo|exmo|cliente", linha, re.I):
            continue
        m = next((m for m in re.finditer(r"\b(\d{4})\s?-\s?(\d{3})\s*([A-Za-zÀ-ú][A-Za-zÀ-ú .'-]{2,40})", linha)
                  if f"{m.group(1)}-{m.group(2)}" not in CP_EMPRESA), None)
        if m:
            cp = m.group(3)
            break
    return " ; ".join(segs) + " ;; " + cp


def casa(texto):
    t = texto.upper()
    if re.search(r"VIMIEIRO|SOMBREIREIROS|OLALHAS|MONTES.{0,20}TOMAR", t):
        return "Kingdom of Stone"
    if re.search(r"PISCA|CHARRUADA", t):
        return "Nosso Cantinho"
    return ""


def estrangeiro(texto):
    t = texto.lower()
    if "booking.com" in t:
        return ("Booking.com B.V.", "NL805734958B01", "Comissões das plataformas")
    if "airbnb" in t:
        return ("Airbnb Ireland UC", "IE9827384L", "Comissões das plataformas")
    if "anthropic" in t:
        return ("Anthropic", "", "Software e subscrições")
    if "openai" in t:
        return ("OpenAI", "", "Software e subscrições")
    return None


MESES = {"jan": 1, "feb": 2, "fev": 2, "mar": 3, "apr": 4, "abr": 4, "may": 5, "mai": 5, "jun": 6, "jul": 7,
         "aug": 8, "ago": 8, "sep": 9, "set": 9, "oct": 10, "out": 10, "nov": 11, "dec": 12, "dez": 12}
PASTA_MES = {"JAN": 1, "FEV": 2, "MAR": 3, "ABR": 4, "MAIO": 5, "MAI": 5, "JUN": 6, "JUL": 7, "AGO": 8, "SET": 9, "OUT": 10, "NOV": 11, "DEZ": 12}


def data_texto(t):
    m = re.search(r"\b([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}),? (20\d\d)", t)
    if m and m.group(1).lower()[:3] in MESES:
        return f"{m.group(3)}-{MESES[m.group(1).lower()[:3]]:02d}-{int(m.group(2)):02d}"
    m = re.search(r"\b(\d{1,2})(?: de)? ([A-Za-zç]{3})[a-zç]*\.?(?: de)? (20\d\d)", t)
    if m and m.group(2).lower()[:3] in MESES:
        return f"{m.group(3)}-{MESES[m.group(2).lower()[:3]]:02d}-{int(m.group(1)):02d}"
    m = re.search(r"\b(\d{2})\.(\d{2})\.(20\d\d)\b", t)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    return None


def data_pasta(rel):
    m = re.search(r"(?i)(JAN|FEV|MAR|ABR|MAIO|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[A-Z]*[ _-]?(20)?(25|26)\b", rel.upper())
    if m:
        return f"20{m.group(3)}-{PASTA_MES[m.group(1).upper()]:02d}-01"
    return None


linhas, revisao, ignorados = [], [], []
for x in fs:
    f = x["ficheiro"]
    rel = f.split("FATURAS - DESPESAS/", 1)[-1]
    nome = rel.rsplit("/", 1)[-1]
    d = x.get("dados") or {}
    texto = x.get("texto", "")
    if x.get("erro") or nome.startswith("427 ") or re.match(r"(?i)(recibo|receipt)", nome):
        ignorados.append((rel, "relatório/recibo"))
        continue
    tipo = (d.get("tipo") or "").upper()
    if tipo in ("RG", "RC"):
        ignorados.append((rel, f"recibo {tipo}"))
        continue
    ext = estrangeiro(texto) if not d.get("nif_fornecedor") else None
    nif = d.get("nif_fornecedor") or (ext[1] if ext else "")
    if nif in PESSOAIS:  # NIF dos sócios lido por engano como emitente
        nif = ""
    info = mapa.get(nif, {}) if nif else {}
    fornecedor = info.get("nome") or (ext[0] if ext else None) or nome_do_texto(texto) or d.get("fornecedor") or ""
    categoria = info.get("categoria") or (ext[2] if ext else "")
    total = d.get("total")
    if total is None:
        revisao.append((rel, "sem total"))
        continue
    if tipo == "NC" or re.search(r"(?i)nota de cr[eé]dito", nome):
        total = -abs(total)
    pasta = rel.upper()
    pago_por, estado = "", ""
    if "PAGO CONTA PARTICULAR" in pasta:
        pago_por, estado = "Bruno", "Por repor"
    origem_dados = "QR das Finanças" if x.get("qr") else ("OCR" if x.get("ocr") else "texto do PDF")
    nota = "" if x.get("qr") else f"Lido do {origem_dados} — confirmar valores"
    data = d.get("data")
    if data and data[:4] == "2626":
        data = "2026" + data[4:]
    if not data or not ("2025" <= data[:4] <= "2026"):
        data = data_texto(texto) or None
    if not data or not ("2025" <= data[:4] <= "2026"):
        data = data_pasta(rel)
        if data:
            nota = (nota + "; " if nota else "") + "data aproximada (mês da pasta)"
    doc = d.get("documento")
    if not doc:
        m = re.search(r"(?i)invoice (?:number|no\.?|#)\s*:?\s*([A-Z0-9-]{5,})", texto)
        if m:
            doc = m.group(1)
    d["data"], d["documento"] = data, doc
    linhas.append([
        d.get("data") or "", fornecedor, nif, d.get("documento") or "", d.get("nif_cliente") or "",
        total, d.get("iva"), info.get("casa") or casa(texto), categoria, estado, pago_por, rel, nota, cidade(texto),
    ])
    if not x.get("qr"):
        revisao.append((rel, f"{fornecedor} {d.get('data')} {total}"))

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Faturas despesas"
ws.append(["Data", "Fornecedor", "NIF fornecedor", "Nº documento", "NIF cliente", "Total", "IVA", "Casa", "Categoria", "Estado", "Pago por", "Ficheiro", "Notas", "Cidade"])
for l in linhas:
    ws.append(l)
wb.save(SAIDA)
print(f"{len(linhas)} faturas; {len(ignorados)} ignorados; {len(revisao)} para rever (sem QR ou sem total)")
json.dump({"ignorados": ignorados, "revisao": revisao}, open(SAIDA + ".relatorio.json", "w"), ensure_ascii=False, indent=1)
