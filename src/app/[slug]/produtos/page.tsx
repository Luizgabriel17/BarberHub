import Image from "next/image";
import { EstadoVazio, TituloPagina } from "@/components/publico/loja-publica";
import { formatarMoeda, produtosDemo } from "@/components/publico/dados-demo";

export default function ProdutosPage() {
  const produtos = produtosDemo.filter((item) => item.ativo);

  return (
    <>
      <TituloPagina
        titulo="Produtos"
        descricao="Itens selecionados para cuidar do seu visual em casa."
      />
      {produtos.length === 0 ? (
        <EstadoVazio mensagem="Nenhum produto disponível no momento." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {produtos.map((produto) => (
            <li
              key={produto.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative grid aspect-[4/3] place-items-center bg-stone-100">
                <Image
                  src={`/api/foto/produto/${produto.id}`}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span
                  aria-hidden="true"
                  className="text-base font-medium text-stone-500"
                >
                  Foto em breve
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{produto.nome}</h2>
                  <p className="shrink-0 font-bold text-amber-800">
                    {formatarMoeda(produto.preco)}
                  </p>
                </div>
                <p className="mt-2 text-base leading-7 text-stone-600">
                  {produto.descricao}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
