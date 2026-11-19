import type { Metadata } from "next";
import Alojamentos from "@/app/components/paginas/Alojamentos";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Accommodation",
  description:
    "Kingdom of Stone, a farmhouse with pool in Olalhas (Tomar), and O Nosso Cantinho, a four-bedroom villa with a private pool in Várzea (Santarém). Choose your stay and check availability.",
  alternates: alternativas("en", "alojamentos"),
};

export default function AccommodationPage() {
  return <Alojamentos l="en" />;
}
