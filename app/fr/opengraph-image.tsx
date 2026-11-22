import { imagemPartilha } from "@/app/lib/imagemPartilha";

// Imagem que aparece quando o link é partilhado (WhatsApp, Facebook...).
export const alt = "JUST RUBY : Kingdom of Stone à Tomar et O Nosso Cantinho à Santarém, Portugal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return imagemPartilha("Maisons de vacances à Tomar et Santarém, Portugal", "Kingdom of Stone et O Nosso Cantinho");
}
