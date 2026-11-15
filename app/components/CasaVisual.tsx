import Image from "next/image";
import type { Casa } from "../site";

// Mostra a foto de capa da casa. Sem fotos, mostra um painel de pedra
// com moldura dourada, para o layout ficar completo desde já.
// O className tem de dar a posição: "relative aspect-[4/3]" ou "absolute inset-0".
export default function CasaVisual({
  casa,
  sizes,
  prioridade = false,
  gravura = true,
  className = "",
}: {
  casa: Casa;
  sizes: string;
  prioridade?: boolean;
  gravura?: boolean; // nome da terra gravado na pedra (só sem foto)
  className?: string;
}) {
  const capa = casa.fotos[0];

  return (
    <div
      className={`overflow-hidden ${capa ? "bg-rocha" : "pedra"} ${className}`}
    >
      {capa ? (
        <Image
          src={capa.src}
          alt={capa.alt}
          fill
          sizes={sizes}
          loading={prioridade ? "eager" : "lazy"}
          fetchPriority={prioridade ? "high" : "auto"}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-4 overflow-hidden border border-ouro/35 md:inset-6"
        >
          {gravura && (
            <span className="gravado absolute left-5 top-3 whitespace-nowrap font-display text-[15vw] leading-none md:left-8 md:top-5 md:text-[7.5vw] 2xl:text-[8rem]">
              {casa.cidade}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
