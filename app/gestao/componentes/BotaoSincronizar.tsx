"use client";

import { useActionState } from "react";
import { sincronizarAgora, type Relatorio } from "../acoes";
import { botaoSec } from "./ui";

export default function BotaoSincronizar() {
  const [r, acao, aCorrer] = useActionState<Relatorio | null>(sincronizarAgora, null);
  return (
    <form action={acao}>
      <button className={botaoSec} disabled={aCorrer}>
        {aCorrer ? "A ler calendários…" : "Sincronizar Airbnb e Booking"}
      </button>
      {r && (
        <div className={`mt-2 rounded-md p-3 text-sm ${r.ok ? "bg-[#e3f1e5] text-[#1f5f2b]" : "bg-[#fde8b8] text-[#7a4b00]"}`}>
          <p className="font-semibold">{r.titulo}</p>
          {r.linhas.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {r.linhas.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
