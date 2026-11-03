"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo } from "react";
import type { BarbeariaPublica } from "./dados-demo";
import { InstallPrompt } from "./pwa";

type Props = {
  barbearia: BarbeariaPublica;
  children: ReactNode;
};

export function LojaPublica({ barbearia, children }: Props) {
  const pathname = usePathname();
  const abas = useMemo(
    () => [
      { href: `/${barbearia.slug}`, label: "Agendar", icon: "＋" },
      { href: `/${barbearia.slug}/servicos`, label: "Serviços", icon: "✂" },
      { href: `/${barbearia.slug}/equipe`, label: "Equipe", icon: "♙" },
      ...(barbearia.assinaturasAtivas
        ? [{ href: `/${barbearia.slug}/planos`, label: "Planos", icon: "◇" }]
        : []),
      { href: `/${barbearia.slug}/produtos`, label: "Produtos", icon: "▣" },
    ],
    [barbearia],
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href={`/${barbearia.slug}`}
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
          >
            <span className="block text-base font-semibold uppercase tracking-[0.18em] text-amber-800">
              BarberHub
            </span>
            <span className="block text-xl font-bold">{barbearia.nome}</span>
          </Link>
          <InstallPrompt />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <nav
        aria-label="Navegação da barbearia"
        className="fixed inset-x-0 bottom-0 z-20 overflow-x-auto border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(28,25,23,0.08)] backdrop-blur"
      >
        <ul className="mx-auto flex min-h-16 w-max min-w-full max-w-3xl justify-center">
          {abas.map((aba) => {
            const ativa = pathname === aba.href;
            return (
              <li key={aba.href} className="min-w-[72px] flex-1">
                <Link
                  aria-current={ativa ? "page" : undefined}
                  href={aba.href}
                  className={`flex min-h-16 min-w-[72px] flex-col items-center justify-center gap-0.5 px-1 text-center text-base leading-tight font-semibold focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-700 ${
                    ativa
                      ? "text-amber-800"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span aria-hidden="true" className="text-xl leading-5">
                    {aba.icon}
                  </span>
                  <span>{aba.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function TituloPagina({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao?: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {titulo}
      </h1>
      {descricao ? (
        <p className="mt-2 text-base leading-7 text-stone-600">{descricao}</p>
      ) : null}
    </header>
  );
}

export function BotaoLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-700 px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
    >
      {children}
    </Link>
  );
}

export function EstadoVazio({ mensagem }: { mensagem: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-base leading-7 text-stone-700">
      {mensagem}
    </p>
  );
}
