import { ImageResponse } from "next/og";

// Imagem que aparece quando o link do site é partilhado (WhatsApp, Facebook...).
// Quando houver fotos profissionais, pode trocar este ficheiro por
// app/opengraph-image.jpg (1200x630).
export const alt = "JUST RUBY: Kingdom of Stone em Tomar e O Nosso Cantinho em Santarém";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "serif",
        }}
      >
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
          <path d="M18 10h28l12 14-26 32L6 24z" stroke="#d6b56a" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M6 24h52M18 10l6 14 8 32 8-32 6-14M24 24l8-14 8 14" stroke="#d6b56a" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <div style={{ fontSize: 96, letterSpacing: 18, color: "#d6b56a", marginTop: 36 }}>JUST RUBY</div>
        <div style={{ width: 140, height: 2, background: "#b08d3c", marginTop: 28 }} />
        <div style={{ fontSize: 40, marginTop: 32, color: "#e8e5df" }}>
          Turismo rural em Tomar e Santarém
        </div>
        <div style={{ fontSize: 30, marginTop: 14, color: "#cfcac2" }}>
          Kingdom of Stone e O Nosso Cantinho
        </div>
      </div>
    ),
    size
  );
}
