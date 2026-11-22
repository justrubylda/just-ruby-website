import { imagemPartilha } from "@/app/lib/imagemPartilha";

// Imagem que aparece quando o link é partilhado (WhatsApp, Facebook...).
export const alt = "JUST RUBY: Kingdom of Stone en Tomar y O Nosso Cantinho en Santarém, Portugal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return imagemPartilha("Casas rurales en Tomar y Santarém, Portugal", "Kingdom of Stone y O Nosso Cantinho");
}
