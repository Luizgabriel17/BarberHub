import Image from "next/image";
import Link from "next/link";
import {
  BotaoLink,
  EstadoVazio,
  TituloPagina,
} from "@/components/publico/loja-publica";
import { barbeirosDemo } from "@/components/publico/dados-demo";

export default async function EquipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const barbeiros = barbeirosDemo.filter((item) => item.ativo);

  return (
    <>
      <TituloPagina
        titulo="Nossa equipe"
        descricao="Profissionais que cuidam de cada detalhe."
      />
      {barbeiros.length === 0 ? (
        <EstadoVazio mensagem="A equipe ainda não foi cadastrada. Volte em breve." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {barbeiros.map((barbeiro) => (
            <li
              key={barbeiro.id}
              className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-2xl font-bold text-amber-900">
                <Image
                  src={`/api/foto/barbeiro/${barbeiro.id}`}
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="absolute inset-0 size-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span aria-hidden="true">
                  {barbeiro.nome.charAt(0).toLocaleUpperCase("pt-BR")}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold">{barbeiro.nome}</h2>
                <p className="mt-1 text-base text-stone-600">Barbeiro</p>
                <Link
                  href={`/${slug}?barbeiro=${encodeURIComponent(barbeiro.id)}`}
                  className="mt-2 inline-flex min-h-11 items-center font-semibold text-amber-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-700"
                >
                  Agendar com {barbeiro.nome}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
