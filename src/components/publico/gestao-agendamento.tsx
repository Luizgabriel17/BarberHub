"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cancelarAgendamentoPorToken,
  listarHorariosParaRemarcar,
  obterAgendamentoPorToken,
  remarcarAgendamentoPorToken,
} from "@/app/[slug]/actions";
import type { AgendamentoResumo, HorarioLivre } from "@/server/contratos";
import { barbeariaDemo, barbeirosDemo, linkWhatsApp } from "./dados-demo";
import { formatarData, proximosDias } from "./grade-demo";

function formatarHora(inicio: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: barbeariaDemo.fusoHorario,
  }).format(new Date(inicio));
}

export function GestaoAgendamento({ token }: { token: string }) {
  const [agendamento, setAgendamento] = useState<AgendamentoResumo | null>(
    null,
  );
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");
  const [prazoExpirado, setPrazoExpirado] = useState(false);
  const [remarcando, setRemarcando] = useState(false);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [horarios, setHorarios] = useState<HorarioLivre[]>([]);
  const [horario, setHorario] = useState<HorarioLivre | null>(null);
  const dias = useMemo(proximosDias, []);
  const [data, setData] = useState(dias[0] ?? "");

  useEffect(() => {
    let ativo = true;
    obterAgendamentoPorToken(token)
      .then((resultado) => {
        if (ativo) {
          setAgendamento(resultado);
          if (!resultado)
            setErro("Não encontramos um agendamento associado a este link.");
        }
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o agendamento.",
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregado(true);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  useEffect(() => {
    if (!remarcando || !agendamento || agendamento.status !== "confirmado")
      return;
    let ativo = true;
    setCarregandoHorarios(true);
    setHorarios([]);
    setHorario(null);
    setErro("");

    listarHorariosParaRemarcar({ token, data })
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
        if (ativo) setCarregandoHorarios(false);
      });

    return () => {
      ativo = false;
    };
  }, [agendamento, data, remarcando, token]);

  if (!carregado) {
    return (
      <p role="status" className="text-base text-stone-600">
        Carregando agendamento…
      </p>
    );
  }

  if (!agendamento) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="text-base font-bold uppercase tracking-wide text-amber-800">
          BarberHub
        </p>
        <h1 className="mt-2 text-2xl font-bold">Link de gestão</h1>
        <p role="alert" className="mt-3 text-base leading-7 text-stone-700">
          {erro ||
            "Este link não possui um agendamento. Confira se foi digitado corretamente."}
        </p>
        <Link
          href="/navalha"
          className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-amber-700 px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
        >
          Ir para a página da barbearia
        </Link>
      </section>
    );
  }

  const inicio = new Date(agendamento.inicio);
  const dentroDoPrazo = (inicio.getTime() - Date.now()) / 3_600_000 >= 2;
  const barbeiro =
    barbeirosDemo.find((item) => item.id === agendamento.barbeiroId)?.nome ??
    "Equipe";
  const textoWhatsApp = `Olá! Preciso de ajuda com meu horário de ${inicio.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: barbeariaDemo.fusoHorario })}.`;

  async function cancelar() {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;
    const atual = agendamento;
    if (!atual) return;
    setErro("");
    try {
      const resultado = await cancelarAgendamentoPorToken(token);
      if (!resultado.ok) {
        if (resultado.codigo === "FORA_DO_PRAZO") setPrazoExpirado(true);
        setErro(
          resultado.codigo === "FORA_DO_PRAZO"
            ? "O prazo para cancelar terminou. Fale com a barbearia pelo WhatsApp."
            : resultado.mensagem,
        );
        return;
      }
      setAgendamento({ ...atual, status: "cancelado" });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErro(`Não foi possível cancelar: ${error.message}`);
    }
  }

  async function remarcar() {
    if (!horario) {
      setErro("Escolha um novo horário.");
      return;
    }
    setErro("");
    try {
      const resultado = await remarcarAgendamentoPorToken({
        token,
        novoInicio: horario.inicio,
      });
      if (!resultado.ok) {
        if (resultado.codigo === "FORA_DO_PRAZO") setPrazoExpirado(true);
        setErro(
          resultado.codigo === "FORA_DO_PRAZO"
            ? "O prazo para remarcar terminou. Fale com a barbearia pelo WhatsApp."
            : resultado.mensagem,
        );
        if (resultado.codigo === "HORARIO_INDISPONIVEL") setHorario(null);
        return;
      }
      setAgendamento(resultado.agendamento);
      setRemarcando(false);
      setHorario(null);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErro(`Não foi possível remarcar: ${error.message}`);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-base font-bold uppercase tracking-wide text-amber-800">
        {barbeariaDemo.nome}
      </p>
      <h1 className="mt-2 text-2xl font-bold">Gerenciar agendamento</h1>
      <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p
          className={`font-semibold ${agendamento.status === "cancelado" ? "text-red-800" : "text-emerald-800"}`}
        >
          {agendamento.status === "cancelado"
            ? "Agendamento cancelado"
            : "Agendamento confirmado"}
        </p>
        <dl className="mt-4 space-y-3 text-base">
          <div>
            <dt className="font-semibold">Cliente</dt>
            <dd className="mt-1 text-stone-700">{agendamento.clienteNome}</dd>
          </div>
          <div>
            <dt className="font-semibold">Serviços</dt>
            <dd className="mt-1 text-stone-700">
              {agendamento.servicos.map((servico) => servico.nome).join(", ")}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Profissional</dt>
            <dd className="mt-1 text-stone-700">{barbeiro}</dd>
          </div>
          <div>
            <dt className="font-semibold">Data e hora</dt>
            <dd className="mt-1 text-stone-700">
              {inicio.toLocaleString("pt-BR", {
                dateStyle: "full",
                timeStyle: "short",
                timeZone: barbeariaDemo.fusoHorario,
              })}
            </dd>
          </div>
        </dl>
      </section>

      {erro ? (
        <p role="alert" className="mt-4 text-base font-medium text-red-800">
          {erro}
        </p>
      ) : null}
      {(!dentroDoPrazo || prazoExpirado) &&
      agendamento.status === "confirmado" ? (
        <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-base leading-7 text-stone-800">
            O prazo de 2 horas para cancelar ou remarcar este horário terminou.
            Fale diretamente com a barbearia para verificar o que é possível
            fazer.
          </p>
          <a
            href={linkWhatsApp(textoWhatsApp)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
          >
            Falar no WhatsApp
          </a>
        </section>
      ) : null}

      {dentroDoPrazo &&
      !prazoExpirado &&
      agendamento.status === "confirmado" ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={cancelar}
            className="min-h-12 rounded-xl border border-red-800 px-5 font-semibold text-red-900 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
          >
            Cancelar horário
          </button>
          <button
            type="button"
            onClick={() => {
              setRemarcando((valor) => !valor);
              setErro("");
            }}
            className="min-h-12 rounded-xl bg-amber-700 px-5 font-semibold text-white hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
          >
            {remarcando ? "Fechar remarcação" : "Remarcar"}
          </button>
        </div>
      ) : null}

      {remarcando &&
      dentroDoPrazo &&
      !prazoExpirado &&
      agendamento.status === "confirmado" ? (
        <section className="mt-5 space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold">Escolha um novo horário</h2>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            aria-label="Próximos dias"
          >
            {dias.map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => {
                  setData(dia);
                  setErro("");
                }}
                aria-pressed={data === dia}
                className={`min-h-14 min-w-24 rounded-xl border px-3 text-base font-semibold capitalize ${data === dia ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800`}
              >
                {formatarData(dia)}
              </button>
            ))}
          </div>
          {carregandoHorarios ? (
            <p role="status" className="text-base text-stone-600">
              Buscando horários livres…
            </p>
          ) : horarios.length === 0 ? (
            <p className="text-base leading-7 text-stone-700">
              Não há horários disponíveis neste dia. Escolha outra data.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {horarios.map((item) => (
                <button
                  key={`${item.inicio}-${item.barbeiroId}`}
                  type="button"
                  onClick={() => setHorario(item)}
                  aria-pressed={horario?.inicio === item.inicio}
                  className={`min-h-12 rounded-lg border px-3 text-base font-semibold ${horario?.inicio === item.inicio ? "border-amber-800 bg-amber-700 text-white" : "border-stone-300 bg-white hover:bg-amber-50"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800`}
                >
                  {formatarHora(item.inicio)}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={!horario || carregandoHorarios}
            onClick={remarcar}
            className="min-h-12 w-full rounded-xl bg-amber-700 px-5 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
          >
            Confirmar novo horário
          </button>
          <p className="text-base leading-6 text-stone-600">
            Horários exibidos no fuso {barbeariaDemo.fusoHorario}.
          </p>
        </section>
      ) : null}

      {agendamento.status === "cancelado" ? (
        <p className="mt-5 rounded-xl bg-stone-100 p-4 text-base leading-7 text-stone-700">
          Este horário foi cancelado. Para marcar outro, volte à página da
          barbearia.
        </p>
      ) : null}
      <Link
        href="/navalha"
        className="mt-5 inline-flex min-h-11 items-center font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-800"
      >
        Voltar à barbearia
      </Link>
    </div>
  );
}
