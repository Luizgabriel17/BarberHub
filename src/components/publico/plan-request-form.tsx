"use client";

import { useState } from "react";
import { z } from "zod";
import { solicitarAssinaturaDaBarbearia } from "@/app/[slug]/actions";

const solicitacaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  telefone: z
    .string()
    .trim()
    .regex(/^[+\d\s().-]{10,20}$/, "Informe seu telefone com DDD."),
});

export function PlanRequestForm({
  slug,
  planoId,
}: {
  slug: string;
  planoId: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function solicitar(formData: FormData) {
    const resultado = solicitacaoSchema.safeParse({
      nome: formData.get("nome"),
      telefone: formData.get("telefone"),
    });
    if (!resultado.success) {
      setMensagem(
        resultado.error.issues[0]?.message ??
          "Confira seus dados e tente novamente.",
      );
      return;
    }

    try {
      await solicitarAssinaturaDaBarbearia({
        slug,
        planoId,
        nome: resultado.data.nome,
        telefone: resultado.data.telefone,
      });
      setMensagem(
        "Solicitação enviada. A barbearia entrará em contato para combinar o pagamento via Pix.",
      );
      setAberto(false);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setMensagem(`Não foi possível enviar a solicitação: ${error.message}`);
    }
  }

  return (
    <div className="mt-4">
      {!aberto ? (
        <button
          type="button"
          onClick={() => {
            setAberto(true);
            setMensagem("");
          }}
          className="min-h-12 rounded-xl border border-amber-800 px-5 text-base font-semibold text-amber-900 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
        >
          Quero assinar
        </button>
      ) : (
        <form
          action={solicitar}
          className="space-y-3 rounded-xl bg-stone-50 p-4"
        >
          <h3 className="font-bold">Solicitar este plano</h3>
          <label
            className="block text-base font-semibold"
            htmlFor={`nome-${planoId}`}
          >
            Nome
            <input
              id={`nome-${planoId}`}
              name="nome"
              required
              minLength={2}
              autoComplete="name"
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-400 bg-white px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            />
          </label>
          <label
            className="block text-base font-semibold"
            htmlFor={`telefone-${planoId}`}
          >
            Telefone com DDD
            <input
              id={`telefone-${planoId}`}
              name="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              minLength={10}
              maxLength={20}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-400 bg-white px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            />
          </label>
          {mensagem ? (
            <p role="alert" className="text-base text-red-800">
              {mensagem}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="min-h-12 rounded-xl bg-amber-700 px-5 text-base font-semibold text-white hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
            >
              Enviar solicitação
            </button>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="min-h-12 rounded-xl border border-stone-400 px-5 text-base font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            >
              Voltar
            </button>
          </div>
        </form>
      )}
      {!aberto && mensagem ? (
        <p role="status" className="mt-3 text-base text-emerald-800">
          {mensagem}
        </p>
      ) : null}
    </div>
  );
}
