import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LojaPublica } from "@/components/publico/loja-publica";
import { buscarBarbearia } from "@/components/publico/dados-demo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const barbearia = buscarBarbearia(slug);
  if (!barbearia?.ativa)
    return { title: "Barbearia não encontrada | BarberHub" };

  return {
    title: `${barbearia.nome} | BarberHub`,
    description: `Agende seu horário na ${barbearia.nome}.`,
    applicationName: barbearia.nome,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: barbearia.nome,
    },
    formatDetection: { telephone: false },
    icons: {
      icon: [
        { url: "/icons/barberhub-192.svg", type: "image/svg+xml" },
        { url: "/icons/barberhub-512.svg", type: "image/svg+xml" },
      ],
      apple: "/icons/barberhub-192.svg",
    },
  };
}

export default async function Layout({ children, params }: Props) {
  const { slug } = await params;
  const barbearia = buscarBarbearia(slug);
  if (!barbearia?.ativa) notFound();

  return <LojaPublica barbearia={barbearia}>{children}</LojaPublica>;
}
