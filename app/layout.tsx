import type { Metadata, Viewport } from "next";
import { Figtree, Marcellus } from "next/font/google";
import "./globals.css";
import JsonLd from "./components/JsonLd";
import { site } from "./site";

// Marcellus: letra de inscrição, lembra a pedra gravada. Figtree: texto corrido.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "JUST RUBY | Turismo Rural em Tomar e Santarém",
    template: "%s | JUST RUBY",
  },
  description:
    "Alojamentos de turismo rural em Tomar e Santarém: o Kingdom of Stone, quinta com piscina em Olalhas, e O Nosso Cantinho, vivenda com piscina na Várzea. Peça disponibilidade.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: site.nome,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

const organizacao = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.nome,
  legalName: site.empresa,
  url: site.url,
  email: site.email,
  taxID: site.nif,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Várzea",
    addressRegion: "Santarém",
    addressCountry: "PT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={`${marcellus.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizacao} />
        {children}
      </body>
    </html>
  );
}
