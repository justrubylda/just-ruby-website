import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagem que aparece quando um link do site é partilhado (WhatsApp, Facebook...).
// Usada pelos ficheiros opengraph-image de cada língua.
export const tamanhoPartilha = { width: 1200, height: 630 };

export async function imagemPartilha(linha1: string, linha2: string) {
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
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img src={`data:image/png;base64,${logo}`} height={190} width={484} alt="" />
        <div style={{ width: 140, height: 2, background: "#c29a58", marginTop: 44 }} />
        <div style={{ fontSize: 42, marginTop: 34, color: "#e8e5df" }}>{linha1}</div>
        <div style={{ fontSize: 30, marginTop: 12, color: "#cfcac2" }}>{linha2}</div>
      </div>
    ),
    tamanhoPartilha
  );
}
