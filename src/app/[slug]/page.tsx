import { BookingFlow } from "@/components/publico/booking-flow";
import {
  barbeariaDemo,
  barbeirosDemo,
  servicosDemo,
} from "@/components/publico/dados-demo";
import { TituloPagina } from "@/components/publico/loja-publica";

export default async function AgendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ barbeiro?: string }>;
}) {
  const { slug } = await params;
  const { barbeiro } = await searchParams;
  const servicos = servicosDemo.filter((item) => item.ativo);
  const barbeiros = barbeirosDemo.filter((item) => item.ativo);

  return (
    <>
      <TituloPagina
        titulo="Agende seu horário"
        descricao={`Escolha o serviço, o profissional e o melhor horário na ${barbeariaDemo.nome}.`}
      />
      <BookingFlow
        slug={slug}
        servicos={servicos}
        barbeiros={barbeiros}
        initialBarbeiroId={
          barbeiro && barbeiros.some((item) => item.id === barbeiro)
            ? barbeiro
            : ""
        }
      />
    </>
  );
}
