import { notFound } from "next/navigation";
import { PlanRequestForm } from "@/components/publico/plan-request-form";
import {
  barbeariaDemo,
  formatarMoeda,
  planosDemo,
} from "@/components/publico/dados-demo";
import { EstadoVazio, TituloPagina } from "@/components/publico/loja-publica";

export default async function PlanosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!barbeariaDemo.assinaturasAtivas) notFound();
  const planos = planosDemo.filter((item) => item.ativo);

  return (
    <>
      <TituloPagina
        titulo="Planos"
        descricao="Escolha um plano e fale com a barbearia para começar."
      />
      <section
        aria-labelledby="pix-heading"
        className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"
      >
        <h2 id="pix-heading" className="text-lg font-bold">
          Pagamento via Pix
        </h2>
        <p className="mt-2 text-base text-stone-700">Chave Pix da barbearia</p>
        <code className="mt-1 block break-all rounded-lg bg-white p-3 text-base">
          {barbeariaDemo.chavePix}
        </code>
      </section>

      {planos.length === 0 ? (
        <EstadoVazio mensagem="Nenhum plano disponível no momento." />
      ) : (
        <ul className="space-y-4">
          {planos.map((plano) => (
            <li
              key={plano.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{plano.nome}</h2>
                <p className="font-bold text-amber-800">
                  {formatarMoeda(plano.precoMensal)}
                  <span className="font-normal text-stone-600"> / mês</span>
                </p>
              </div>
              <p className="mt-2 text-base leading-7 text-stone-600">
                {plano.descricao}
              </p>
              <p className="mt-3 text-base font-medium text-stone-500">
                {plano.limiteUsosCiclo === null
                  ? "Usos ilimitados"
                  : `${plano.limiteUsosCiclo} usos por ciclo`}
              </p>
              <PlanRequestForm slug={slug} planoId={plano.id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
