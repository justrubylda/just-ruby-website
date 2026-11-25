"""Extrato Combinado do Millennium (PDF) -> folha no formato da exportação (Data Lançamento, Data Valor, Descrição, Montante, Saldo)."""
import re, subprocess, sys
import openpyxl
pdf, saida = sys.argv[1], sys.argv[2]
t = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True).stdout.decode("utf8", "ignore")
ano = re.search(r"N\.\s*(\d{4})/\d{3}", t).group(1)
num = r"\d{1,3}(?: \d{3})*\.\d{2}"
linhas, prev = [], None
for l in t.splitlines():
    l = l.strip()
    m = re.match(r"SALDO INICIAL\s+(" + num + r")", l)
    if m:
        prev = float(m.group(1).replace(" ", ""))
        continue
    m = re.match(r"(\d{1,2})\.(\d{2})\s+(\d{1,2})\.(\d{2})\s+(.*?)\s{2,}(" + num + r")\s+(" + num + r")$", l)
    if not m or prev is None:
        continue
    saldo = float(m.group(7).replace(" ", ""))
    montante = round(saldo - prev, 2)
    if abs(abs(montante) - float(m.group(6).replace(" ", ""))) > 0.005:
        print("AVISO valor não bate:", l)
    prev = saldo
    d = f"{int(m.group(2)):02d}/{int(m.group(1)):02d}/{ano}"
    dv = f"{int(m.group(4)):02d}/{int(m.group(3)):02d}/{ano}"
    linhas.append([d, dv, re.sub(r"\s{2,}", "  ", m.group(5)).strip(), montante, saldo, "EUR"])
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Extrato"
ws.append(["Data Lançamento", "Data Valor", "Descrição", "Montante", "Saldo Contabilistico", "Moeda"])
for x in linhas: ws.append(x)
wb.save(saida)
print(len(linhas), "movimentos", linhas[0][0] if linhas else "", "->", linhas[-1][0] if linhas else "", "saldo final", prev)
