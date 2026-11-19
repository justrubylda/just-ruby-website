"use client";

export default function BotaoApagar({ texto = "Apagar esta reserva" }: { texto?: string }) {
  return (
    <button
      className="text-sm font-semibold text-[#8a2b1f] underline-offset-4 hover:underline"
      onClick={(e) => {
        if (!window.confirm("Apagar definitivamente? Não dá para desfazer.")) e.preventDefault();
      }}
    >
      {texto}
    </button>
  );
}
