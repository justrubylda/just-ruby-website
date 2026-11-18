import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagem que aparece quando o link do site é partilhado (WhatsApp, Facebook...).
export const alt = "JUST RUBY: Kingdom of Stone em Tomar e O Nosso Cantinho em Santarém";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo-just-ruby.png"), "base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 110px",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "serif",
        }}
      >
        <img src={`data:image/png;base64,${logo}`} height={190} width={484} alt="" />
        <div style={{ width: 140, height: 2, background: "#c29a58", marginTop: 44 }} />
        <div style={{ fontSize: 42, marginTop: 34, color: "#e8e5df" }}>Turismo rural em Tomar e Santarém</div>
        <div style={{ fontSize: 30, marginTop: 12, color: "#cfcac2" }}>Kingdom of Stone e O Nosso Cantinho</div>
      </div>
    ),
    size
  );
}
