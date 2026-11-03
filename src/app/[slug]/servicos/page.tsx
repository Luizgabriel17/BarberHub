import {
  BotaoLink,
  EstadoVazio,
  TituloPagina,
} from "@/components/publico/loja-publica";
import { formatarMoeda, servicosDemo } from "@/components/publico/dados-demo";

export default async function ServicosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servicos = servicosDemo.filter((item) => item.ativo);

  return (
    <>
      <TituloPagina
        titulo="Nossos serviços"
        descricao="Veja as opções e escolha o que combina com você."
      />
      {servicos.length === 0 ? (
        <EstadoVazio mensagem="Ainda não há serviços disponíveis. Volte em breve." />
      ) : (
        <ul className="space-y-3">
          {servicos.map((servico) => (
            <li
              key={servico.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{servico.nome}</h2>
                <p className="text-lg font-bold text-amber-800">
                  {formatarMoeda(servico.preco)}
                </p>
              </div>
              <p className="mt-2 text-base leading-7 text-stone-600">
                {servico.descricao}
              </p>
              <p className="mt-3 text-base font-medium text-stone-500">
                {servico.duracaoMin} minutos
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <BotaoLink href={`/${slug}`}>Agendar um serviço</BotaoLink>
      </div>
    </>
  );
}
