import { imagemPartilha } from "@/app/lib/imagemPartilha";

// Imagem que aparece quando o link é partilhado (WhatsApp, Facebook...).
export const alt = "JUST RUBY: Kingdom of Stone em Tomar e O Nosso Cantinho em Santarém";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return imagemPartilha("Turismo rural em Tomar e Santarém", "Kingdom of Stone e O Nosso Cantinho");
}
