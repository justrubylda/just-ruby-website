import type { Metadata } from "next";
import Alojamentos from "@/app/components/paginas/Alojamentos";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Alojamientos",
  description:
    "Kingdom of Stone, finca con piscina en Olalhas (Tomar), y O Nosso Cantinho, villa de cuatro dormitorios con piscina privada en Várzea (Santarém). Elija su estancia y consulte la disponibilidad.",
  alternates: alternativas("es", "alojamentos"),
};

export default function AlojamientosPage() {
  return <Alojamentos l="es" />;
}
