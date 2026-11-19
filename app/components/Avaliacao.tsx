import { ui, type Lingua } from "../i18n";
import type { Casa } from "../site";

// Nota real dos hóspedes numa plataforma (ex.: 9,2 de 10 no Booking.com), com link para a ver lá.
export default function Avaliacao({
  avaliacao,
  l,
  claro = false,
  className = "",
}: {
  avaliacao: NonNullable<Casa["avaliacao"]>;
  l: Lingua;
  claro?: boolean; // texto claro, sobre fundo escuro
  className?: string;
}) {
  return (
    <p className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-display text-2xl leading-none ${claro ? "text-ouro-claro" : "text-ouro-escuro"}`}>
        {ui[l].nota(avaliacao.nota)}
      </span>
      <a
        href={avaliacao.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline-offset-4 hover:underline ${claro ? "text-nevoa" : "text-cinza"}`}
      >
        {ui[l].avaliacao(avaliacao.plataforma)}
      </a>
    </p>
  );
}
