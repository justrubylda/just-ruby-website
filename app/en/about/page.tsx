import type { Metadata } from "next";
import Sobre from "@/app/components/paginas/Sobre";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "About us",
  description:
    "JUST RUBY is a small family-run tourism business based in Várzea, Santarém, with holiday houses in Tomar and Santarém, Portugal.",
  alternates: alternativas("en", "sobre"),
};

export default function AboutPage() {
  return <Sobre l="en" />;
}
