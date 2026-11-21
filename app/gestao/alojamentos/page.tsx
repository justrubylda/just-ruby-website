import { guardarAlojamentos } from "../acoes";
import { exigirSessao } from "../lib/acesso";
import { descricaoFatura } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos } from "../lib/reservas";
import { SemBaseDados, Titulo, botao, campo, cartao, rotulo } from "../componentes/ui";

export default async function Alojamentos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const als = await listarAlojamentos();
  const linhas = [...als, { nome: "", ordem: als.length + 1, antes_entrada: "Prestação de serviços de alojamento mobilado, Check in a", antes_saida: " e check out efectuado a", final: "", wifi_rede: "", wifi_senha: "" }];
  return (
    <div>
      <Titulo sub="Textos da fatura e Wi-Fi do guia do hóspede. Ficam na base de dados (não no código público do site).">
        Alojamentos
      </Titulo>
      {sp.ok && <p className="mb-4 rounded-md bg-[#e3f1e5] p-3 text-sm text-[#1f5f2b]">Guardado.</p>}
      <form action={guardarAlojamentos} className="space-y-4">
        {linhas.map((a, i) => (
          <fieldset key={i} className={cartao}>
            <input type="hidden" name="original" value={a.nome} />
            <div className="grid gap-3">
              <label className="block max-w-sm">
                <span className={rotulo}>{a.nome ? "Nome" : "Novo alojamento (opcional)"}</span>
                <input name="nome" defaultValue={a.nome} className={campo} />
              </label>
              <label className="block">
                <span className={rotulo}>Texto antes da data de check-in</span>
                <input name="antes_entrada" defaultValue={a.antes_entrada} className={campo} />
              </label>
              <label className="block">
                <span className={rotulo}>Texto antes da data de check-out</span>
                <input name="antes_saida" defaultValue={a.antes_saida} className={campo} />
              </label>
              <label className="block">
                <span className={rotulo}>Texto final (nº de registo AL, morada…)</span>
                <input name="final" defaultValue={a.final} className={campo} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={rotulo}>Rede Wi-Fi (aparece no guia do hóspede)</span>
                  <input name="wifi_rede" defaultValue={a.wifi_rede ?? ""} autoComplete="off" className={campo} />
                </label>
                <label className="block">
                  <span className={rotulo}>Palavra-passe Wi-Fi</span>
                  <input name="wifi_senha" defaultValue={a.wifi_senha ?? ""} autoComplete="off" className={campo} />
                </label>
              </div>
              {a.nome && (
                <p className="text-xs text-cinza">
                  Exemplo: {descricaoFatura({ al: a.nome, checkin: "2026-08-01", checkout: "2026-08-05" }, [a])}
                </p>
              )}
            </div>
          </fieldset>
        ))}
        <button className={botao}>Guardar</button>
      </form>
    </div>
  );
}
