"use client";

// Menus que atualizam a página logo que se muda a opção (filtros por ano, alojamento, etc.).
export function SelectAuto({
  name,
  value,
  opcoes,
  rotulo,
}: {
  name: string;
  value: string;
  opcoes: { valor: string; texto: string }[];
  rotulo: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-cinza">{rotulo}</span>
      <select
        name={name}
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="mt-1 block w-full rounded-md border border-black/15 bg-white px-3 py-2.5 text-base text-xisto"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );
}
