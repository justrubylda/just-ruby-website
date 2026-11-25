# Ler faturas e extratos (fora do site)

Ferramentas usadas pelo Claude para trazer as faturas de despesa das pastas do OneDrive para /gestao/despesas.

1. `ler_faturas.py <pasta> <saida.json>` — lê PDFs/JPGs: código QR das Finanças (NIF, nº, data, total, IVA);
   sem QR, o texto do PDF ou OCR (tesseract, português). Precisa de `opencv-python`, `zxing-cpp`, `pdftoppm`, `tesseract`.
2. `faturas_para_xlsx.py <saida.json> <nomes_nif.json> <faturas.xlsx>` — folha pronta a importar em /gestao/despesas
   (ou em Banco → Carregar extrato). `nomes_nif.json` (NIF → nome/categoria) não fica no repositório; os nomes
   também se tiram das despesas que já estão na base de dados. `NIFS_SOCIOS` (variável) evita que o NIF dos
   sócios seja lido como emitente.
3. `extrato_pdf.py <Extrato Combinado.pdf> <extrato.xlsx>` — extrato mensal em PDF do Millennium no formato da
   exportação em Excel (o sinal de cada movimento sai da variação do saldo).

A importação no site não duplica: faturas pelo NIF + nº (ou nº + valor, ou valor + data + fornecedor);
movimentos pela descrição ou pela data + valor + saldo.
