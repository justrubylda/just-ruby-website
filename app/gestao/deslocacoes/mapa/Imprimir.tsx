"use client";

export default function Imprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-md bg-preto px-4 py-2.5 text-sm font-semibold text-white hover:bg-rocha"
    >
      Imprimir / guardar PDF
    </button>
  );
}
