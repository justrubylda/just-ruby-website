import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagem de partilha da versão inglesa (WhatsApp, Facebook...).
export const alt = "JUST RUBY: Kingdom of Stone in Tomar and O Nosso Cantinho in Santarém, Portugal";
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
        <div style={{ fontSize: 42, marginTop: 34, color: "#e8e5df" }}>Holiday homes in Tomar and Santarém, Portugal</div>
        <div style={{ fontSize: 30, marginTop: 12, color: "#cfcac2" }}>Kingdom of Stone and O Nosso Cantinho</div>
      </div>
    ),
    size
  );
}
