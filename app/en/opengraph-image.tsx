import { imagemPartilha } from "@/app/lib/imagemPartilha";

// Imagem que aparece quando o link é partilhado (WhatsApp, Facebook...).
export const alt = "JUST RUBY: Kingdom of Stone in Tomar and O Nosso Cantinho in Santarém, Portugal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return imagemPartilha("Holiday homes in Tomar and Santarém, Portugal", "Kingdom of Stone and O Nosso Cantinho");
}
