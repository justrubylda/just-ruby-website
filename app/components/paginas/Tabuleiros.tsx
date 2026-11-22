import Link from "next/link";
import CasaVisual from "@/app/components/CasaVisual";
import PageIntro from "@/app/components/PageIntro";
import PedidoForm from "@/app/components/PedidoForm";
import { rota, rotaCasa, ui, type Lingua } from "@/app/i18n";
import { ocupacaoTodas } from "@/app/lib/disponibilidade";
import { casaEm, getCasa } from "@/app/site";

// Página "onde ficar na Festa dos Tabuleiros". As datas exatas da festa são
// anunciadas pela Câmara de Tomar: quando saírem, acrescentar em "quandoTexto".
export const TEXTOS = {
  pt: {
    titulo: "Festa dos Tabuleiros 2027: onde ficar perto de Tomar",
    descricao:
      "A Festa dos Tabuleiros volta a Tomar em julho de 2027. Fique no Kingdom of Stone, quinta com piscina a 20 minutos de Tomar, ou n'O Nosso Cantinho, em Santarém. Reserve cedo.",
    h1: "Festa dos Tabuleiros 2027",
    intro:
      "A grande festa de Tomar volta em julho de 2027. Fique perto, numa casa só para si, e volte ao fim do dia para a piscina e o silêncio do campo.",
    quando: "Quando é",
    quandoTexto:
      "A Festa dos Tabuleiros faz-se de quatro em quatro anos, em Tomar. A próxima edição é em julho de 2027. As datas exatas e o programa são anunciados pela Câmara Municipal de Tomar.",
    oQue: "O que é",
    oQueTexto: [
      "É uma das festas mais antigas e conhecidas de Portugal. Nasceu das festas das colheitas e ganhou caráter religioso na Idade Média, ligada ao culto do Espírito Santo e à rainha Santa Isabel.",
      "O ponto alto é o Cortejo dos Tabuleiros: centenas de raparigas desfilam pelas ruas com tabuleiros à cabeça, feitos de pão, flores de papel e espigas, com uma coroa no topo. Durante a festa, as ruas do centro histórico enchem-se de flores de papel e as janelas de colchas.",
    ],
    ondeFicar: "Onde ficar",
    casas: {
      "kingdom-of-stone":
        "A cerca de 20 minutos do centro de Tomar, em Olalhas. Quatro quartos, piscina e sossego para descansar depois do cortejo: longe da confusão, perto da festa.",
      "o-nosso-cantinho":
        "Na Várzea, em Santarém, a menos de uma hora de carro de Tomar. Até 8 hóspedes e piscina privada: boa opção para grupos e famílias que queiram juntar a festa a outros passeios no Ribatejo.",
    } as Record<string, string>,
    conselhos: "Conselhos",
    conselhosLista: [
      "Reserve cedo: na semana da festa, a procura de alojamento à volta de Tomar é muito grande.",
      "Chegue cedo ao cortejo para ter lugar ao longo do percurso.",
      "Confirme as datas e o programa no site da Câmara Municipal de Tomar.",
    ],
    pedirTitulo: "Pedir disponibilidade para julho de 2027",
    pedirTexto: "Diga-nos as datas e quantas pessoas são. Respondemos com a disponibilidade e o preço.",
    maisZona: "Mais ideias para a zona",
  },
  en: {
    titulo: "Festa dos Tabuleiros 2027: where to stay near Tomar",
    descricao:
      "The Festa dos Tabuleiros returns to Tomar in July 2027. Stay at Kingdom of Stone, a farmhouse with a pool 20 minutes from Tomar, or at O Nosso Cantinho in Santarém. Book early.",
    h1: "Festa dos Tabuleiros 2027",
    intro:
      "Tomar's great festival returns in July 2027. Stay close by, in a house of your own, and come back at the end of the day to the pool and the quiet of the countryside.",
    quando: "When is it",
    quandoTexto:
      "The Festa dos Tabuleiros (Festival of the Trays) is held in Tomar every four years. The next edition is in July 2027. The exact dates and programme are announced by Tomar City Council.",
    oQue: "What it is",
    oQueTexto: [
      "It is one of the oldest and best-known festivals in Portugal. It grew out of harvest celebrations and took on a religious character in the Middle Ages, linked to the cult of the Holy Spirit and to Queen Saint Isabel.",
      "The highlight is the Procession of the Trays: hundreds of young women parade through the streets carrying trays on their heads, made of bread, paper flowers and ears of wheat, topped with a crown. During the festival, the streets of the old town fill with paper flowers and the windows with bedspreads.",
    ],
    ondeFicar: "Where to stay",
    casas: {
      "kingdom-of-stone":
        "About 20 minutes from Tomar's old town, in Olalhas. Four bedrooms, a pool and peace and quiet to rest after the procession: away from the crowds, close to the festival.",
      "o-nosso-cantinho":
        "In Várzea, Santarém, less than an hour's drive from Tomar. Up to 8 guests and a private pool: a good choice for groups and families who want to combine the festival with other trips around the Ribatejo.",
    } as Record<string, string>,
    conselhos: "Tips",
    conselhosLista: [
      "Book early: during the festival week, demand for accommodation around Tomar is very high.",
      "Arrive early for the procession to get a spot along the route.",
      "Check the dates and programme on the Tomar City Council website.",
    ],
    pedirTitulo: "Check availability for July 2027",
    pedirTexto: "Tell us your dates and how many of you there are. We'll reply with availability and the price.",
    maisZona: "More ideas for the area",
  },
  es: {
    titulo: "Festa dos Tabuleiros 2027: dónde alojarse cerca de Tomar",
    descricao:
      "La Festa dos Tabuleiros vuelve a Tomar en julio de 2027. Alójese en Kingdom of Stone, finca con piscina a 20 minutos de Tomar, o en O Nosso Cantinho, en Santarém. Reserve con antelación.",
    h1: "Festa dos Tabuleiros 2027",
    intro:
      "La gran fiesta de Tomar vuelve en julio de 2027. Quédese cerca, en una casa solo para usted, y vuelva al final del día a la piscina y al silencio del campo.",
    quando: "Cuándo es",
    quandoTexto:
      "La Festa dos Tabuleiros (Fiesta de las Bandejas) se celebra en Tomar cada cuatro años. La próxima edición es en julio de 2027. Las fechas exactas y el programa los anuncia el Ayuntamiento de Tomar.",
    oQue: "Qué es",
    oQueTexto: [
      "Es una de las fiestas más antiguas y conocidas de Portugal. Nació de las fiestas de la cosecha y adquirió carácter religioso en la Edad Media, ligada al culto del Espíritu Santo y a la reina Santa Isabel.",
      "El momento culminante es el Cortejo de los Tabuleiros: cientos de jóvenes desfilan por las calles con bandejas sobre la cabeza, hechas de pan, flores de papel y espigas, coronadas en lo alto. Durante la fiesta, las calles del centro histórico se llenan de flores de papel y las ventanas de colchas.",
    ],
    ondeFicar: "Dónde alojarse",
    casas: {
      "kingdom-of-stone":
        "A unos 20 minutos del centro de Tomar, en Olalhas. Cuatro dormitorios, piscina y tranquilidad para descansar después del cortejo: lejos del bullicio, cerca de la fiesta.",
      "o-nosso-cantinho":
        "En Várzea, Santarém, a menos de una hora en coche de Tomar. Hasta 8 huéspedes y piscina privada: buena opción para grupos y familias que quieran combinar la fiesta con otras excursiones por el Ribatejo.",
    } as Record<string, string>,
    conselhos: "Consejos",
    conselhosLista: [
      "Reserve con antelación: durante la semana de la fiesta, la demanda de alojamiento en torno a Tomar es muy alta.",
      "Llegue pronto al cortejo para encontrar sitio a lo largo del recorrido.",
      "Confirme las fechas y el programa en la web del Ayuntamiento de Tomar.",
    ],
    pedirTitulo: "Consultar disponibilidad para julio de 2027",
    pedirTexto: "Díganos las fechas y cuántas personas son. Le respondemos con la disponibilidad y el precio.",
    maisZona: "Más ideas para la zona",
  },
  fr: {
    titulo: "Festa dos Tabuleiros 2027 : où dormir près de Tomar",
    descricao:
      "La Festa dos Tabuleiros revient à Tomar en juillet 2027. Séjournez au Kingdom of Stone, domaine avec piscine à 20 minutes de Tomar, ou à O Nosso Cantinho, à Santarém. Réservez tôt.",
    h1: "Festa dos Tabuleiros 2027",
    intro:
      "La grande fête de Tomar revient en juillet 2027. Logez tout près, dans une maison rien que pour vous, et retrouvez le soir la piscine et le calme de la campagne.",
    quando: "Quand",
    quandoTexto:
      "La Festa dos Tabuleiros (fête des Plateaux) a lieu à Tomar tous les quatre ans. La prochaine édition aura lieu en juillet 2027. Les dates exactes et le programme sont annoncés par la mairie de Tomar.",
    oQue: "Qu'est-ce que c'est",
    oQueTexto: [
      "C'est l'une des fêtes les plus anciennes et les plus connues du Portugal. Née des fêtes des moissons, elle a pris un caractère religieux au Moyen Âge, liée au culte du Saint-Esprit et à la reine sainte Isabelle.",
      "Le temps fort est le cortège des Tabuleiros : des centaines de jeunes filles défilent dans les rues en portant sur la tête des plateaux faits de pain, de fleurs en papier et d'épis de blé, surmontés d'une couronne. Pendant la fête, les rues de la vieille ville se couvrent de fleurs en papier et les fenêtres de couvre-lits.",
    ],
    ondeFicar: "Où dormir",
    casas: {
      "kingdom-of-stone":
        "À environ 20 minutes du centre de Tomar, à Olalhas. Quatre chambres, une piscine et le calme pour se reposer après le cortège : loin de la foule, près de la fête.",
      "o-nosso-cantinho":
        "À Várzea, Santarém, à moins d'une heure de route de Tomar. Jusqu'à 8 personnes et piscine privée : une bonne option pour les groupes et les familles qui veulent associer la fête à d'autres excursions dans le Ribatejo.",
    } as Record<string, string>,
    conselhos: "Conseils",
    conselhosLista: [
      "Réservez tôt : pendant la semaine de la fête, la demande d'hébergement autour de Tomar est très forte.",
      "Arrivez tôt pour le cortège afin d'avoir une place le long du parcours.",
      "Vérifiez les dates et le programme sur le site de la mairie de Tomar.",
    ],
    pedirTitulo: "Demander les disponibilités pour juillet 2027",
    pedirTexto: "Indiquez-nous vos dates et le nombre de personnes. Nous vous répondrons avec les disponibilités et le prix.",
    maisZona: "Plus d'idées pour la région",
  },
};

const ORDEM = ["kingdom-of-stone", "o-nosso-cantinho"];

export default async function Tabuleiros({ l }: { l: Lingua }) {
  const t = TEXTOS[l];
  const casas = ORDEM.map((s) => getCasa(s))
    .filter((c) => c !== undefined)
    .map((c) => casaEm(c, l));

  return (
    <>
      <PageIntro titulo={t.h1} texto={t.intro} />

      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="space-y-14">
          <section>
            <h2 className="text-3xl md:text-4xl">{t.quando}</h2>
            <p className="mt-6 max-w-2xl text-lg">{t.quandoTexto}</p>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">{t.oQue}</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg">
              {t.oQueTexto.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">{t.conselhos}</h2>
            <ul className="mt-6 max-w-2xl space-y-3">
              {t.conselhosLista.map((c) => (
                <li key={c} className="flex gap-3 text-lg">
                  <span aria-hidden="true" className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro" />
                  {c}
                </li>
              ))}
            </ul>
            <Link
              href={`${rota(l, "zona")}#tomar`}
              className="mt-8 inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
            >
              {t.maisZona}
            </Link>
          </section>
        </div>

        <aside id="pedido" className="scroll-mt-24 self-start bg-pedra p-6 md:p-8 lg:sticky lg:top-24">
          <h2 className="text-3xl">{t.pedirTitulo}</h2>
          <p className="mt-3 text-cinza">{t.pedirTexto}</p>
          <div className="mt-6">
            <PedidoForm casaInicial="kingdom-of-stone" tema="claro" ocupado={await ocupacaoTodas()} l={l} />
          </div>
        </aside>
      </div>

      <section className="bg-preto text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <h2 className="text-4xl md:text-5xl">{t.ondeFicar}</h2>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            {casas.map((c) => (
              <article key={c.slug}>
                <Link href={rotaCasa(l, c.slug)} className="group block">
                  <CasaVisual casa={c} sizes="(min-width: 768px) 50vw, 100vw" className="relative aspect-[4/3]" />
                  <p className="mt-5 text-ouro-claro">{c.local}</p>
                  <h3 className="mt-1 text-3xl group-hover:text-ouro-claro md:text-4xl">{c.nome}</h3>
                </Link>
                <p className="mt-3 max-w-xl text-nevoa">{t.casas[c.slug]}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={rotaCasa(l, c.slug)}
                    className="rounded-sm bg-ouro px-5 py-3 font-semibold text-preto transition-colors hover:bg-ouro-claro"
                  >
                    {ui[l].ver(c.nome)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
