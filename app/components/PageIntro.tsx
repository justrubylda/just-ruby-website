// Abertura das páginas interiores: título grande, alinhado à esquerda, sobre preto.
export default function PageIntro({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-preto text-white">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
        <h1 className="max-w-4xl text-5xl md:text-7xl">{titulo}</h1>
        <span className="filete mt-8" aria-hidden="true" />
        {texto && <p className="mt-8 max-w-2xl text-lg text-nevoa md:text-xl">{texto}</p>}
        {children}
      </div>
    </section>
  );
}
