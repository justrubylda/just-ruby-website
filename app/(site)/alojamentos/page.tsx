import type { Metadata } from "next";
import Alojamentos from "@/app/components/paginas/Alojamentos";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Alojamentos",
  description:
    "Kingdom of Stone, quinta com piscina em Olalhas (Tomar), e O Nosso Cantinho, vivenda T4 com piscina privada na Várzea (Santarém). Escolha a sua estadia e peça disponibilidade.",
  alternates: alternativas("pt", "alojamentos"),
};

export default function AlojamentosPage() {
  return <Alojamentos l="pt" />;
}
