"""Lê faturas (PDF/JPG) e tira os dados fiscais.

1. Código QR da AT (obrigatório nas faturas portuguesas): NIF emitente (A), NIF adquirente (B),
   tipo (D), data (F), nº (G), ATCUD (H), IVA total (N), total (O).
2. Sem QR: texto (camada de texto do PDF ou OCR em português) com expressões regulares.
O fornecedor e a morada (para a casa) saem do texto.

Uso: python3 ler_faturas.py <pasta> <saida.json>   (só lê ficheiros que ainda não estão na saída)
"""
import json, os, re, subprocess, sys, tempfile
import cv2
import numpy as np

RAIZ, SAIDA = sys.argv[1], sys.argv[2]
EXT = (".pdf", ".jpg", ".jpeg", ".png")

det = cv2.QRCodeDetector()
try:
    det_a = cv2.QRCodeDetectorAruco()
except Exception:  # noqa: BLE001
    det_a = None


import zxingcpp


def qr_de_imagem(img):
    try:
        for r in zxingcpp.read_barcodes(img):
            t = r.text
            if t and t.startswith("A:") and "*" in t:
                return t
    except Exception:  # noqa: BLE001
        pass
    for d in (det, det_a):
        if d is None:
            continue
        for escala in (1.0, 0.5, 1.5):
            im = img if escala == 1.0 else cv2.resize(img, None, fx=escala, fy=escala, interpolation=cv2.INTER_AREA)
            try:
                ok, textos, _, _ = d.detectAndDecodeMulti(im)
            except Exception:  # noqa: BLE001
                ok, textos = False, []
            if ok:
                for t in textos:
                    if t and t.startswith("A:") and "*" in t:
                        return t
            try:
                t, _, _ = d.detectAndDecode(im)
            except Exception:  # noqa: BLE001
                t = ""
            if t and t.startswith("A:") and "*" in t:
                return t
    return None


def paginas(caminho, n=3, dpi=300):
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", str(dpi), "-l", str(n), "-png", caminho, f"{tmp}/p"], capture_output=True, timeout=120)
        for f in sorted(os.listdir(tmp)):
            img = cv2.imread(os.path.join(tmp, f), cv2.IMREAD_GRAYSCALE)
            if img is not None:
                yield img


def texto_pdf(caminho):
    r = subprocess.run(["pdftotext", "-l", "3", "-layout", caminho, "-"], capture_output=True, timeout=60)
    return r.stdout.decode("utf8", "ignore")


def ocr(img):
    with tempfile.NamedTemporaryFile(suffix=".png") as f:
        cv2.imwrite(f.name, img)
        r = subprocess.run(["tesseract", f.name, "-", "-l", "por", "--psm", "6"], capture_output=True, timeout=120)
        return r.stdout.decode("utf8", "ignore")


def ler_qr(t):
    campos = {}
    for parte in t.split("*"):
        if ":" in parte:
            k, v = parte.split(":", 1)
            campos[k] = v
    def num(k):
        try:
            return round(float(campos[k]), 2)
        except Exception:  # noqa: BLE001
            return None
    data = campos.get("F", "")
    return {
        "nif_fornecedor": campos.get("A"),
        "nif_cliente": campos.get("B"),
        "tipo": campos.get("D"),
        "estado_doc": campos.get("E"),
        "data": f"{data[:4]}-{data[4:6]}-{data[6:8]}" if len(data) == 8 else None,
        "documento": campos.get("G"),
        "atcud": campos.get("H"),
        "iva": num("N"),
        "total": num("O"),
    }


NUM = r"-?\d{1,3}(?:[ .]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2})"


def para_num(s):
    s = s.replace(" ", "")
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    try:
        return round(float(s), 2)
    except ValueError:
        return None


def ler_texto(t):
    """Campos tirados do texto quando não há QR (ou para completar)."""
    o = {}
    nifs = re.findall(r"(?<!\d)(\d{9})(?!\d)", t.replace(" ", " "))
    validos = [n for n in nifs if n[0] in "1235689" and nif_ok(n)]
    outros = [n for n in validos if n != "518785483"]
    if outros:
        o["nif_fornecedor"] = outros[0]
    if "518785483" in validos:
        o["nif_cliente"] = "518785483"
    m = re.search(r"\b(FT|FS|FR|NC|ND|FAC|VD|TV)\s?[A-Z0-9]*[ /][A-Z0-9/.-]*\d", t)
    if m:
        o["documento"] = re.sub(r"\s+", " ", m.group(0)).strip()
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", t) or None
    if m:
        o["data"] = m.group(0)
    else:
        m = re.search(r"(\d{2})[/.-](\d{2})[/.-](\d{4})", t)
        if m:
            o["data"] = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    # total a pagar (depois de descontos) tem prioridade sobre o "TOTAL" antes da poupança
    for pad in (r"total\s+(a\s+pagar|pago|do\s+documento|documento|geral|fatura|c/\s*iva|com\s+iva|eur|€)", r"(valor|montante)\s+a\s+pagar", r"total\s*:"):
        vals = []
        for linha in t.splitlines():
            if re.search(pad, linha, re.I):
                vals += [para_num(x) for x in re.findall(NUM, linha)]
        vals = [x for x in vals if x is not None and 0 < abs(x) < 100000]
        if vals:
            o["total"] = vals[-1]
            return o
    totais = []
    for linha in t.splitlines():
        if re.search(r"total", linha, re.I) and not re.search(r"sub-?total|total (s/|sem|il[ií]quido)|incid", linha, re.I):
            totais += [para_num(x) for x in re.findall(NUM, linha)]
    totais = [x for x in totais if x is not None and 0 < abs(x) < 100000]
    if totais:
        o["total"] = max(totais)
    return o


def nif_ok(n):
    s = sum(int(n[i]) * (9 - i) for i in range(8))
    c = 11 - s % 11
    return int(n[8]) == (0 if c >= 10 else c)


def fornecedor(t):
    linhas = [l.strip() for l in t.splitlines() if l.strip()]
    for l in linhas[:25]:
        m = re.search(r"([A-ZÀ-Ü0-9][\w&.,'’ -]{2,60}?\b(LDA|L\.DA|S\.?A\.?|UNIPESSOAL|SGPS|S\.L\.|LIMITED|LTD|BV|B\.V\.|GMBH|S\.A\.R\.L\.)\b\.?)", l, re.I)
        if m and not re.search(r"just ?ruby", m.group(1), re.I):
            return re.sub(r"\s{2,}", " ", m.group(1)).strip(" ,.-")
    for l in linhas[:8]:
        l2 = re.sub(r"\s{2,}.*", "", l)
        if len(l2) > 3 and not re.search(r"just ?ruby|fatura|original|duplicado|p[aá]gina|^\d", l2, re.I):
            return l2[:60]
    return None


def processar(caminho):
    r = {"ficheiro": caminho, "qr": None}
    texto = ""
    imgs = []
    if caminho.lower().endswith(".pdf"):
        texto = texto_pdf(caminho)
        imgs = list(paginas(caminho))
    else:
        img = cv2.imread(caminho, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            if max(img.shape) > 3000:
                f = 3000 / max(img.shape)
                img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
            imgs = [img]
    for img in imgs:
        q = qr_de_imagem(img)
        if q:
            r["qr"] = q
            break
    if (len(texto.strip()) < 300 or not re.search(r"\d{9}", texto)) and imgs and not r["qr"]:
        texto = "\n".join(ocr(i) for i in imgs[:2])
        r["ocr"] = True
    r["texto"] = texto[:6000]
    dados = ler_qr(r["qr"]) if r["qr"] else {}
    extra = ler_texto(texto)
    for k, v in extra.items():
        if not dados.get(k):
            dados[k] = v
    dados["fornecedor"] = fornecedor(texto)
    r["dados"] = dados
    return r


def seguro(c):
    try:
        return c, processar(c)
    except Exception as e:  # noqa: BLE001
        return c, {"ficheiro": c, "erro": str(e)}


def main():
    feitos = {}
    if os.path.exists(SAIDA):
        feitos = {x["ficheiro"]: x for x in json.load(open(SAIDA))}
    todos = []
    for d, _, fs in os.walk(RAIZ):
        for f in fs:
            if f.lower().endswith(EXT):
                todos.append(os.path.join(d, f))
    novos = [c for c in sorted(todos) if c not in feitos]
    from multiprocessing import Pool
    with Pool(int(os.environ.get("PROCS", "4"))) as pool:
        for i, (c, r) in enumerate(pool.imap_unordered(seguro, novos)):
            feitos[c] = r
            if i % 25 == 0:
                json.dump(list(feitos.values()), open(SAIDA, "w"), ensure_ascii=False)
                print(f"{i + 1}/{len(novos)}", flush=True)
    json.dump(list(feitos.values()), open(SAIDA, "w"), ensure_ascii=False)
    com_qr = sum(1 for x in feitos.values() if x.get("qr"))
    print(f"feitos {len(feitos)}, com QR {com_qr}")


if __name__ == "__main__":
    main()
