"use client";

import type { FormEvent, ReactNode } from "react";

export const inputClasses =
  "mt-1 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800";

export function Cartao({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function Aviso({
  children,
  erro = false,
}: {
  children: ReactNode;
  erro?: boolean;
}) {
  return (
    <p
      role={erro ? "alert" : "status"}
      className={`rounded-xl p-4 text-base ${
        erro ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"
      }`}
    >
      {children}
    </p>
  );
}

export function ConfirmarFormulario({
  children,
  pergunta,
  ...props
}: {
  children: ReactNode;
  pergunta: string;
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
}) {
  function confirmar(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(pergunta)) event.preventDefault();
  }

  return (
    <form {...props} onSubmit={confirmar}>
      {children}
    </form>
  );
}
