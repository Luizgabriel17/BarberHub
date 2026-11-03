"use client";

import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import {
  criarAgendamentoDaBarbearia,
  listarHorariosDaBarbearia,
} from "@/app/[slug]/actions";
import type { AgendamentoResumo, HorarioLivre } from "@/server/contratos";
import { telefoneSchema } from "@/lib/validacao";
import type { BarbeiroPublico, ServicoPublico } from "./dados-demo";
import { barbeariaDemo, formatarMoeda, linkWhatsApp } from "./dados-demo";
import { formatarData, proximosDias } from "./grade-demo";

type Props = {
  slug: string;
  servicos: ServicoPublico[];
  barbeiros: BarbeiroPublico[];
  initialBarbeiroId: string;
};

const clienteSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo."),
  telefone: telefoneSchema,
});

function formatarHora(inicio: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: barbeariaDemo.fusoHorario,
  }).format(new Date(inicio));
}

function ShareManagementLink({ href }: { href: string }) {
  const [mensagem, setMensagem] = useState("");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(
        new URL(href, window.location.origin).toString(),
      );
      setMensagem("Link copiado.");
    } catch {
      setMensagem(
        "Não foi possível copiar automaticamente. Selecione e copie o link.",
      );
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="font-semibold">Link para cancelar ou remarcar</p>
      <a
        href={href}
        className="mt-2 block break-all text-base text-amber-900 underline underline-offset-4"
      >
        {href}
      </a>
      <button
        type="button"
        onClick={copiar}
        className="mt-3 min-h-11 rounded-lg border border-stone-400 px-4 text-base font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      >
        Copiar link
      </button>
      {mensagem ? (
        <p role="status" className="mt-2 text-base text-stone-700">
          {mensagem}
        </p>
      ) : null}
    </div>
  );
}

export function BookingFlow({
  slug,
  servicos,
  barbeiros,
  initialBarbeiroId,
}: Props) {
  const dias = useMemo(proximosDias, []);
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [servicoIds, setServicoIds] = useState<string[]>([]);
  const [barbeiroId, setBarbeiroId] = useState(initialBarbeiroId);
  const [data, setData] = useState(dias[0] ?? "");
  const [horario, setHorario] = useState<HorarioLivre | null>(null);
  const [horarios, setHorarios] = useState<HorarioLivre[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [agendamento, setAgendamento] = useState<AgendamentoResumo | null>(
    null,
  );

  const selecionados = servicos.filter((servico) =>
    servicoIds.includes(servico.id),
  );
  const duracaoTotal = selecionados.reduce(
    (total, servico) => total + servico.duracaoMin,
    0,
  );
  const valorTotal = selecionados.reduce(
    (total, servico) => total + servico.preco,
    0,
  );
  const servicoIdsChave = servicoIds.join(",");

  useEffect(() => {
    if (passo !== 2) return;
    let ativo = true;
    setCarregando(true);
    setHorario(null);
    setHorarios([]);
    setErro("");

    listarHorariosDaBarbearia({
      slug,
      servicoIds: servicoIdsChave.split(",").filter(Boolean),
      ...(barbeiroId ? { barbeiroId } : {}),
      data,
    })
      .then((resultado) => {
        if (ativo) setHorarios(resultado);
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os horários.",
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [barbeiroId, data, passo, servicoIdsChave, slug]);

  function alternarServico(id: string) {
    setServicoIds((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id],
    );
    setErro("");
    setAviso("");
  }

  function selecionarData(dia: string) {
    setData(dia);
    setErro("");
    setAviso("");
  }

  async function criarReserva(formData: FormData) {
    const resultado = clienteSchema.safeParse({
      nome: formData.get("nome"),
      telefone: formData.get("telefone"),
    });
    if (!resultado.success) {
      setErro(
        resultado.error.issues[0]?.message ??
          "Confira seus dados e tente novamente.",
      );
      return;
    }
    if (!horario) {
      setErro("Escolha um horário disponível antes de confirmar.");
      setPasso(2);
      return;
    }

    setEnviando(true);
    try {
      const resposta = await criarAgendamentoDaBarbearia({
        slug,
        servicoIds,
        barbeiroId: barbeiroId || horario.barbeiroId,
        inicio: horario.inicio,
        nome: resultado.data.nome,
        telefone: resultado.data.telefone,
      });
      if (!resposta.ok) {
        setAviso(`${resposta.mensagem} Escolha outro horário.`);
        setHorario(null);
        setPasso(2);
        return;
      }

      setAgendamento(resposta.agendamento);
      setErro("");
      setAviso("");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErro(`Não foi possível confirmar o horário: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  }

  if (agendamento) {
    const horaMarcada = new Date(agendamento.inicio);
    const urlGestao = `/gestao/${agendamento.tokenGestao}`;
    const textoWhatsApp = `Olá! Acabei de solicitar um horário na ${barbeariaDemo.nome} para ${horaMarcada.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: barbeariaDemo.fusoHorario })}. Link de gestão: ${new URL(urlGestao, window.location.origin).toString()}`;
    const whatsappUrl = linkWhatsApp(textoWhatsApp);

    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <p className="text-base font-bold uppercase tracking-wide text-emerald-800">
          Agendamento confirmado
        </p>
        <h2 className="mt-2 text-2xl font-bold">Confira seu horário</h2>
        <p className="mt-3 text-base leading-7 text-stone-700">
          {horaMarcada.toLocaleString("pt-BR", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: barbeariaDemo.fusoHorario,
          })}
        </p>
        <p className="mt-2 text-base text-stone-700">
          {agendamento.servicos.map((servico) => servico.nome).join(" + ")} ·{" "}
          {formatarMoeda(agendamento.valorTotal)}
        </p>
        <p className="mt-3 text-base leading-7 text-stone-600">
          A confirmação foi processada pela agenda da barbearia. Guarde o link
          de gestão caso precise fazer uma alteração.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 text-base font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 sm:w-auto"
        >
          Chamar a barbearia no WhatsApp
        </a>
        <ShareManagementLink href={urlGestao} />
        <p className="mt-3 text-base text-stone-600">
          Guarde o link: ele permite cancelar ou remarcar este horário conforme
          o prazo da barbearia.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <ol aria-label="Etapas do agendamento" className="grid grid-cols-3 gap-2">
        {["Serviço", "Horário", "Seus dados"].map((rotulo, indice) => {
          const numero = indice + 1;
          const atual = passo === numero;
          return (
            <li
              key={rotulo}
              aria-current={atual ? "step" : undefined}
              className={`rounded-lg px-2 py-2 text-center text-base font-semibold ${atual ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-600"}`}
            >
              <span className="sr-only">Etapa {numero}: </span>
              {rotulo}
            </li>
          );
        })}
      </ol>

      {passo === 1 ? (
        <section aria-labelledby="servicos-title" className="space-y-4">
          <div>
            <h2 id="servicos-title" className="text-lg font-bold">
              1. Escolha um ou mais serviços
            </h2>
            <div className="mt-3 space-y-3">
              {servicos.map((servico) => {
                const marcado = servicoIds.includes(servico.id);
                return (
                  <label
                    key={servico.id}
                    className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-4 ${marcado ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-white"}`}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarServico(servico.id)}
                      className="mt-1 size-5 accent-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap justify-between gap-2 font-semibold">
                        <span>{servico.nome}</span>
                        <span>{formatarMoeda(servico.preco)}</span>
                      </span>
                      <span className="mt-1 block text-base text-stone-600">
                        {servico.duracaoMin} min
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <fieldset>
            <legend className="text-lg font-bold">2. Escolha o barbeiro</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 ${barbeiroId === "" ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-white"}`}
              >
                <input
                  type="radio"
                  name="barbeiro"
                  checked={barbeiroId === ""}
                  onChange={() => setBarbeiroId("")}
                  className="size-5 accent-amber-800"
                />
                <span className="font-semibold">Qualquer barbeiro</span>
              </label>
              {barbeiros.map((barbeiro) => (
                <label
                  key={barbeiro.id}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 ${barbeiroId === barbeiro.id ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-white"}`}
                >
                  <input
                    type="radio"
                    name="barbeiro"
                    checked={barbeiroId === barbeiro.id}
                    onChange={() => setBarbeiroId(barbeiro.id)}
                    className="size-5 accent-amber-800"
                  />
                  <span className="font-semibold">{barbeiro.nome}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {erro ? (
            <p role="alert" className="text-base font-medium text-red-800">
              {erro}
            </p>
          ) : null}
          <button
            type="button"
            disabled={servicoIds.length === 0}
            onClick={() => {
              setPasso(2);
              setErro("");
            }}
            className="min-h-12 w-full rounded-xl bg-amber-700 px-5 text-base font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
          >
            Continuar
          </button>
        </section>
      ) : null}

      {passo === 2 ? (
        <section aria-labelledby="horarios-title" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="horarios-title" className="text-lg font-bold">
              Escolha um dia e horário
            </h2>
            <button
              type="button"
              onClick={() => setPasso(1)}
              className="min-h-11 px-3 font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-800"
            >
              Voltar
            </button>
          </div>
          {aviso ? (
            <p
              role="alert"
              className="rounded-xl bg-amber-50 p-4 text-base leading-7 text-amber-950"
            >
              {aviso}
            </p>
          ) : null}
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            aria-label="Próximos dias"
          >
            {dias.map((dia) => (
              <button
                key={dia}
                type="button"
                aria-pressed={data === dia}
                onClick={() => selecionarData(dia)}
                className={`min-h-14 min-w-24 rounded-xl border px-3 text-base font-semibold capitalize ${data === dia ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800`}
              >
                {formatarData(dia)}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="min-h-16 rounded-xl bg-white p-4">
            {carregando ? (
              <p role="status" className="text-base text-stone-600">
                Buscando horários livres…
              </p>
            ) : horarios.length === 0 ? (
              <p className="text-base leading-7 text-stone-700">
                Não há horários disponíveis neste dia. Escolha outra data.
              </p>
            ) : (
              <>
                <p className="mb-3 text-base font-semibold">
                  Horários disponíveis
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {horarios.map((item) => (
                    <button
                      key={`${item.inicio}-${item.barbeiroId}`}
                      type="button"
                      aria-pressed={horario?.inicio === item.inicio}
                      onClick={() => {
                        setHorario(item);
                        setErro("");
                        setAviso("");
                      }}
                      className={`min-h-12 rounded-lg border px-3 text-base font-semibold ${horario?.inicio === item.inicio ? "border-amber-800 bg-amber-700 text-white" : "border-stone-300 bg-white hover:bg-amber-50"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800`}
                    >
                      {formatarHora(item.inicio)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {erro ? (
            <p role="alert" className="text-base font-medium text-red-800">
              {erro}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!horario || carregando}
            onClick={() => {
              setPasso(3);
              setErro("");
            }}
            className="min-h-12 w-full rounded-xl bg-amber-700 px-5 text-base font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
          >
            Continuar
          </button>
        </section>
      ) : null}

      {passo === 3 ? (
        <form
          aria-labelledby="dados-title"
          className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
          action={criarReserva}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="dados-title" className="text-lg font-bold">
              Confira e confirme
            </h2>
            <button
              type="button"
              onClick={() => setPasso(2)}
              className="min-h-11 px-3 font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-800"
            >
              Voltar
            </button>
          </div>
          <dl className="space-y-2 rounded-xl bg-stone-50 p-4 text-base">
            <div>
              <dt className="inline font-semibold">Serviços: </dt>
              <dd className="inline">
                {selecionados.map((servico) => servico.nome).join(", ")}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Profissional: </dt>
              <dd className="inline">
                {barbeiros.find((item) => item.id === horario?.barbeiroId)
                  ?.nome ?? "Qualquer barbeiro"}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Data e hora: </dt>
              <dd className="inline">
                {horario
                  ? `${formatarData(horario.inicio.slice(0, 10))} às ${formatarHora(horario.inicio)}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Duração: </dt>
              <dd className="inline">{duracaoTotal} min</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Total: </dt>
              <dd className="inline font-bold">{formatarMoeda(valorTotal)}</dd>
            </div>
          </dl>
          <label className="block text-base font-semibold" htmlFor="nome">
            Seu nome
            <input
              id="nome"
              name="nome"
              autoComplete="name"
              required
              minLength={2}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-400 px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            />
          </label>
          <label className="block text-base font-semibold" htmlFor="telefone">
            Telefone com DDD
            <input
              id="telefone"
              name="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              minLength={10}
              maxLength={20}
              placeholder="(11) 99999-9999"
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-400 px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            />
          </label>
          {erro ? (
            <p role="alert" className="text-base font-medium text-red-800">
              {erro}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={enviando}
            className="min-h-12 w-full rounded-xl bg-amber-700 px-5 text-base font-semibold text-white hover:bg-amber-800 disabled:cursor-wait disabled:bg-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
          >
            {enviando ? "Confirmando…" : "Confirmar agendamento"}
          </button>
        </form>
      ) : null}
      {passo !== 1 ? (
        <p className="text-base text-stone-600">
          Horários exibidos no fuso {barbeariaDemo.fusoHorario}.
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        Etapa {passo} de 3
      </p>
    </div>
  );
}
