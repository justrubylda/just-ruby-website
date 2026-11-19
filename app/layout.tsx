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
    alternateLocale: ["en_GB"],
    siteName: site.nome,
  },
  // Códigos de verificação do Google Search Console e do Bing Webmaster Tools.
  // Ficam na Vercel (Settings → Environment Variables) e só aparecem quando preenchidos.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

// Dados para o Google: a empresa e o site (nas duas línguas).
const redes = [site.instagram, site.facebook].filter(Boolean);
const organizacao = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organizacao`,
      name: site.nome,
      legalName: site.empresa,
      url: site.url,
      logo: `${site.url}/logo-just-ruby.png`,
      email: site.email,
      ...(site.telefone ? { telephone: `+${site.telefone}` } : {}),
      taxID: site.nif,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Várzea",
        addressRegion: "Santarém",
        addressCountry: "PT",
      },
      ...(redes.length ? { sameAs: redes } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#site`,
      name: site.nome,
      url: site.url,
      inLanguage: ["pt-PT", "en"],
      publisher: { "@id": `${site.url}/#organizacao` },
    },
  ],
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
