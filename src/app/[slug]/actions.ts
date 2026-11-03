"use server";

import { z } from "zod";
import { buscarBarbearia } from "@/components/publico/dados-demo";
import { resolverBarbeariaPorSlug } from "@/lib/barbearia";
import { slugSchema, telefoneSchema } from "@/lib/validacao";
import {
  cancelarPorToken,
  criarAgendamento,
  ForaDoPrazoError,
  HorarioIndisponivelError,
  listarHorariosLivres,
  obterPorToken,
  remarcarPorToken,
  solicitarAssinatura,
} from "@/server/contratos";

const entradaHorariosSchema = z.object({
  slug: slugSchema,
  servicoIds: z.array(z.string().min(1)).min(1),
  barbeiroId: z.string().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
});

const entradaAgendamentoSchema = z.object({
  slug: slugSchema,
  servicoIds: z.array(z.string().min(1)).min(1),
  barbeiroId: z.string().optional(),
  inicio: z.string().datetime({ offset: true }),
  nome: z.string().trim().min(2).max(120),
  telefone: telefoneSchema,
});

const entradaTokenSchema = z.string().trim().min(1).max(128);

const entradaRemarcacaoSchema = z.object({
  token: entradaTokenSchema,
  novoInicio: z.string().datetime({ offset: true }),
});

const entradaAssinaturaSchema = z.object({
  slug: slugSchema,
  planoId: z.string().min(1),
  nome: z.string().trim().min(2).max(120),
  telefone: telefoneSchema,
});

async function resolverIdBarbearia(slug: string): Promise<string> {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
    const demonstracao = buscarBarbearia(slug);
    if (demonstracao?.ativa) return demonstracao.id;
  }

  const barbearia = await resolverBarbeariaPorSlug(slug);
  if (!barbearia) throw new Error("Esta barbearia não está disponível.");
  return barbearia.id;
}

export async function listarHorariosDaBarbearia(input: unknown) {
  const dados = entradaHorariosSchema.parse(input);
  const barbeariaId = await resolverIdBarbearia(dados.slug);
  return listarHorariosLivres({ ...dados, barbeariaId });
}

export async function criarAgendamentoDaBarbearia(input: unknown) {
  const dados = entradaAgendamentoSchema.parse(input);
  try {
    await resolverIdBarbearia(dados.slug);
    const agendamento = await criarAgendamento(dados);
    return { ok: true as const, agendamento };
  } catch (error) {
    if (error instanceof HorarioIndisponivelError) {
      return {
        ok: false as const,
        codigo: "HORARIO_INDISPONIVEL",
        mensagem: error.message,
      };
    }
    throw error;
  }
}

export async function obterAgendamentoPorToken(input: unknown) {
  const token = entradaTokenSchema.parse(input);
  return obterPorToken(token);
}

export async function listarHorariosParaRemarcar(input: unknown) {
  const dados = z
    .object({
      token: entradaTokenSchema,
      data: entradaHorariosSchema.shape.data,
    })
    .parse(input);
  const agendamento = await obterPorToken(dados.token);
  if (!agendamento) throw new Error("Agendamento não encontrado.");
  return listarHorariosLivres({
    barbeariaId: agendamento.barbeariaId,
    servicoIds: agendamento.servicos.map((servico) => servico.id),
    barbeiroId: agendamento.barbeiroId,
    data: dados.data,
  });
}

export async function cancelarAgendamentoPorToken(input: unknown) {
  const token = entradaTokenSchema.parse(input);
  try {
    await cancelarPorToken(token);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ForaDoPrazoError) {
      const naoEncontrado = error.message === "Agendamento não encontrado.";
      return {
        ok: false as const,
        codigo: naoEncontrado ? "NAO_ENCONTRADO" : "FORA_DO_PRAZO",
        mensagem: error.message,
      };
    }
    throw error;
  }
}

export async function remarcarAgendamentoPorToken(input: unknown) {
  const dados = entradaRemarcacaoSchema.parse(input);
  try {
    const agendamento = await remarcarPorToken(dados.token, dados.novoInicio);
    return { ok: true as const, agendamento };
  } catch (error) {
    if (error instanceof HorarioIndisponivelError) {
      const naoEncontrado = error.message === "Agendamento não encontrado.";
      return {
        ok: false as const,
        codigo: naoEncontrado ? "NAO_ENCONTRADO" : "HORARIO_INDISPONIVEL",
        mensagem: error.message,
      };
    }
    if (error instanceof ForaDoPrazoError) {
      return {
        ok: false as const,
        codigo: "FORA_DO_PRAZO",
        mensagem: error.message,
      };
    }
    throw error;
  }
}

export async function solicitarAssinaturaDaBarbearia(input: unknown) {
  const dados = entradaAssinaturaSchema.parse(input);
  await resolverIdBarbearia(dados.slug);
  await solicitarAssinatura(dados);
  return { ok: true as const };
}
