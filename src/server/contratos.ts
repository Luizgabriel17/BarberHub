export type ServicoSelecionado = {
  id: string;
  nome: string;
  preco: number;
  duracaoMin: number;
};

export type AgendamentoResumo = {
  id: string;
  barbeariaId: string;
  clienteNome: string;
  telefone: string;
  barbeiroId: string;
  inicio: string;
  fim: string;
  status: "confirmado" | "concluido" | "cancelado" | "nao_compareceu";
  valorTotal: number;
  tokenGestao: string;
  servicos: ServicoSelecionado[];
};

export type AgendamentoPainel = {
  id: string;
  clienteNome: string;
  telefone: string;
  barbeiroId: string;
  barbeiroNome: string;
  inicio: string;
  fim: string;
  status: "confirmado" | "concluido" | "cancelado" | "nao_compareceu";
  valorTotal: number;
  servicos: ServicoSelecionado[];
};

export type AssinaturaPainel = {
  id: string;
  clienteNome: string;
  planoNome: string;
  status: "pendente" | "ativa" | "vencida" | "cancelada";
  validade: string | null;
  usosNoCiclo: number;
  limiteUsos?: number | null;
};

export type HorarioLivre = {
  inicio: string;
  barbeiroId: string;
};

export type ListarHorariosLivresInput = {
  barbeariaId: string;
  servicoIds: string[];
  barbeiroId?: string;
  data: string;
};

export type CriarAgendamentoInput = {
  slug: string;
  servicoIds: string[];
  barbeiroId?: string;
  inicio: string;
  nome: string;
  telefone: string;
};

export type CriarAgendamentoManualInput = {
  servicoIds: string[];
  barbeiroId: string;
  inicio: string;
  nome: string;
  telefone: string;
};

export type AlterarStatusInput = {
  usarAssinatura?: boolean;
};

export type ConflitoBloqueioInput = {
  barbeiroId?: string;
  inicio: string;
  fim: string;
};

export type SolicitarAssinaturaInput = {
  slug: string;
  planoId: string;
  nome: string;
  telefone: string;
};

export type ServicoDisponivel = {
  id: string;
  nome: string;
  duracaoMin: number;
  preco: number;
};

export type AgendaDiaItem = {
  id: string;
  clienteNome: string;
  telefone: string;
  barbeiroId: string;
  barbeiroNome: string;
  inicio: string;
  fim: string;
  status: "confirmado" | "concluido" | "cancelado" | "nao_compareceu";
};

export type HorarioLivreCalculoInput = {
  data: string;
  expediente: Array<{ abre: string; fecha: string }>;
  bloqueios: Array<{ barbeiroId?: string; inicio: string; fim: string }>;
  agendamentos: Array<{ barbeiroId: string; inicio: string; fim: string }>;
  barbeiros: string[];
  barbeiroId?: string;
  servicoDuracaoMin: number;
  intervaloMin: number;
  antecedenciaMinMinutos: number;
  janelaMaxDias: number;
  agora?: Date;
  fusoHorario?: string;
};

export class HorarioIndisponivelError extends Error {
  constructor(message = "Esse horário não está mais disponível.") {
    super(message);
    this.name = "HorarioIndisponivelError";
  }
}

export class ForaDoPrazoError extends Error {
  constructor(message = "A antecedência mínima foi atingida. Só o proprietário pode alterar este agendamento.") {
    super(message);
    this.name = "ForaDoPrazoError";
  }
}

const SERVICOS_EXEMPLO: ServicoDisponivel[] = [
  { id: "svc-corte", nome: "Corte", duracaoMin: 30, preco: 45 },
  { id: "svc-barba", nome: "Barba", duracaoMin: 30, preco: 35 },
  { id: "svc-combo", nome: "Corte + Barba", duracaoMin: 60, preco: 75 },
];

const BARBEIROS_EXEMPLO = [
  { id: "barbeiro-carlos", nome: "Carlos" },
  { id: "barbeiro-rafael", nome: "Rafael" },
  { id: "barbeiro-mateus", nome: "Mateus" },
];

const AGENDAMENTOS_EXEMPLO: AgendamentoResumo[] = [
  {
    id: "ag-1",
    barbeariaId: "barbearia-navalha",
    clienteNome: "João",
    telefone: "+5511999001000",
    barbeiroId: "barbeiro-carlos",
    inicio: "2026-11-03T09:30:00-03:00",
    fim: "2026-11-03T10:00:00-03:00",
    status: "confirmado",
    valorTotal: 45,
    tokenGestao: "A1B2C3D4E5F6G7H8",
    servicos: [SERVICOS_EXEMPLO[0]],
  },
  {
    id: "ag-2",
    barbeariaId: "barbearia-navalha",
    clienteNome: "Pedro",
    telefone: "+5511888002000",
    barbeiroId: "barbeiro-rafael",
    inicio: "2026-11-03T11:00:00-03:00",
    fim: "2026-11-03T12:00:00-03:00",
    status: "confirmado",
    valorTotal: 75,
    tokenGestao: "Z9Y8X7W6V5U4T3S2",
    servicos: [SERVICOS_EXEMPLO[2]],
  },
];

export function normalizarTelefone(telefone: string): string {
  return telefone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function parseDateTime(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${value}`);
  }
  return parsed;
}

function toBarbeariaIso(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return `${local.toISOString().slice(0, 19)}-03:00`;
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateFromBarbearia(date: string, time: string): Date {
  return new Date(`${date}T${time}:00-03:00`);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

export function calcularHorariosLivres(input: HorarioLivreCalculoInput): string[] {
  const agora = input.agora ?? new Date();
  const data = input.data;
  const intervaloMin = input.intervaloMin || 30;
  const duracaoMin = input.servicoDuracaoMin || 30;
  const antecedenciaMin = input.antecedenciaMinMinutos || 0;
  const barbeirosAtivos = input.barbeiroId ? [input.barbeiroId] : input.barbeiros;
  const slots: string[] = [];

  const targetDate = new Date(`${data}T00:00:00-03:00`);
  const maxDate = addMinutes(agora, input.janelaMaxDias * 24 * 60);
  if (targetDate > maxDate) {
    return [];
  }

  const expedientePorDia = input.expediente.filter((periodo) => {
    const abertura = toDateFromBarbearia(data, periodo.abre);
    const fechamento = toDateFromBarbearia(data, periodo.fecha);
    return abertura < fechamento;
  });

  if (expedientePorDia.length === 0) {
    return [];
  }

  for (const barbeiroId of barbeirosAtivos) {
    const bloqueiosBarbeiro = input.bloqueios.filter(
      (bloqueio) => bloqueio.barbeiroId === barbeiroId && bloqueio.inicio.startsWith(data),
    );
    const bloqueiosGerais = input.bloqueios.filter((bloqueio) => !bloqueio.barbeiroId && bloqueio.inicio.startsWith(data));
    const agendamentosBarbeiro = input.agendamentos.filter(
      (agendamento) => agendamento.barbeiroId === barbeiroId && agendamento.inicio.startsWith(data),
    );

    for (const expediente of expedientePorDia) {
      const inicioExpediente = toDateFromBarbearia(data, expediente.abre);
      const fimExpediente = toDateFromBarbearia(data, expediente.fecha);
      const limiteSlot = addMinutes(agora, antecedenciaMin);

      for (let cursor = inicioExpediente; cursor < fimExpediente; cursor = addMinutes(cursor, intervaloMin)) {
        const fimSlot = addMinutes(cursor, duracaoMin);
        if (fimSlot > fimExpediente) continue;
        if (cursor < agora) continue;
        if (cursor < limiteSlot) continue;

        const conflitoBloqueio = bloqueiosBarbeiro.some((bloqueio) => {
          const inicioBloqueio = parseDateTime(bloqueio.inicio);
          const fimBloqueio = parseDateTime(bloqueio.fim);
          return overlaps(cursor, fimSlot, inicioBloqueio, fimBloqueio);
        });
        if (conflitoBloqueio) continue;

        const conflitoBloqueioGeral = bloqueiosGerais.some((bloqueio) => {
          const inicioBloqueio = parseDateTime(bloqueio.inicio);
          const fimBloqueio = parseDateTime(bloqueio.fim);
          return overlaps(cursor, fimSlot, inicioBloqueio, fimBloqueio);
        });
        if (conflitoBloqueioGeral) continue;

        const conflitoAgendamento = agendamentosBarbeiro.some((agendamento) => {
          const inicioAgendamento = parseDateTime(agendamento.inicio);
          const fimAgendamento = parseDateTime(agendamento.fim);
          return overlaps(cursor, fimSlot, inicioAgendamento, fimAgendamento);
        });

        if (conflitoAgendamento) continue;

        slots.push(`${toBarbeariaIso(cursor)}|${barbeiroId}`);
      }
    }
  }

  return Array.from(new Set(slots))
    .map((value) => value.split("|")[0])
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime());
}

export async function listarHorariosLivres(
  i: ListarHorariosLivresInput,
): Promise<HorarioLivre[]> {
  const servicoSelecionado = i.servicoIds
    .map((id) => SERVICOS_EXEMPLO.find((servico) => servico.id === id))
    .filter((servico): servico is ServicoDisponivel => Boolean(servico));

  const duracaoTotal = servicoSelecionado.reduce((total, servico) => total + servico.duracaoMin, 0);
  const barbeiros = i.barbeiroId
    ? BARBEIROS_EXEMPLO.filter((barbeiro) => barbeiro.id === i.barbeiroId).map((barbeiro) => barbeiro.id)
    : BARBEIROS_EXEMPLO.map((barbeiro) => barbeiro.id);

  const disponibilidade = calcularHorariosLivres({
    data: i.data,
    expediente: [{ abre: "09:00", fecha: "19:00" }],
    bloqueios: [{ barbeiroId: "barbeiro-carlos", inicio: "2026-11-03T12:00:00-03:00", fim: "2026-11-03T13:00:00-03:00" }],
    agendamentos: AGENDAMENTOS_EXEMPLO.map((agendamento) => ({
      barbeiroId: agendamento.barbeiroId,
      inicio: agendamento.inicio,
      fim: agendamento.fim,
    })),
    barbeiros,
    barbeiroId: i.barbeiroId,
    servicoDuracaoMin: duracaoTotal || 30,
    intervaloMin: 30,
    antecedenciaMinMinutos: 30,
    janelaMaxDias: 7,
    agora: new Date(),
    fusoHorario: "America/Sao_Paulo",
  });

  return disponibilidade.slice(0, 10).map((inicio) => ({
    inicio,
    barbeiroId: i.barbeiroId ?? BARBEIROS_EXEMPLO.find((barbeiro) => inicio.includes(barbeiro.id))?.id ?? BARBEIROS_EXEMPLO[0].id,
  }));
}

export async function criarAgendamento(i: CriarAgendamentoInput): Promise<AgendamentoResumo> {
  const dados = i;
  const telefone = normalizarTelefone(dados.telefone);
  const servicos = dados.servicoIds
    .map((id) => SERVICOS_EXEMPLO.find((servico) => servico.id === id))
    .filter((servico): servico is ServicoDisponivel => Boolean(servico));

  if (servicos.length === 0) {
    throw new HorarioIndisponivelError("Selecione ao menos um serviço.");
  }

  const duracaoTotal = servicos.reduce((total, servico) => total + servico.duracaoMin, 0);
  const agendamentos = AGENDAMENTOS_EXEMPLO.map((agendamento) => ({
    barbeiroId: agendamento.barbeiroId,
    inicio: agendamento.inicio,
    fim: agendamento.fim,
  }));

  const barbeiroId = dados.barbeiroId ?? BARBEIROS_EXEMPLO[0].id;
  const inicio = new Date(dados.inicio);
  const fim = addMinutes(inicio, duracaoTotal);

  const horarioLivre = calcularHorariosLivres({
    data: getLocalDateKey(inicio),
    expediente: [{ abre: "09:00", fecha: "19:00" }],
    bloqueios: [],
    agendamentos,
    barbeiros: [barbeiroId],
    barbeiroId,
    servicoDuracaoMin: duracaoTotal,
    intervaloMin: 30,
    antecedenciaMinMinutos: 30,
    janelaMaxDias: 7,
    agora: new Date(),
    fusoHorario: "America/Sao_Paulo",
  });

  const horarioDisponivel = horarioLivre.some((slot) => new Date(slot).getTime() === inicio.getTime());
  if (!horarioDisponivel) {
    throw new HorarioIndisponivelError();
  }

  return {
    id: `ag-${Math.random().toString(16).slice(2, 10)}`,
    barbeariaId: "barbearia-navalha",
    clienteNome: dados.nome,
    telefone,
    barbeiroId,
    inicio: dados.inicio,
    fim: fim.toISOString(),
    status: "confirmado",
    valorTotal: servicos.reduce((total, servico) => total + servico.preco, 0),
    tokenGestao: `token-${Math.random().toString(36).slice(2, 10)}`,
    servicos,
  };
}

export async function obterPorToken(token: string): Promise<AgendamentoResumo | null> {
  const existente = AGENDAMENTOS_EXEMPLO.find((agendamento) => agendamento.tokenGestao === token);
  return existente ?? null;
}

export async function cancelarPorToken(token: string): Promise<void> {
  const agendamento = await obterPorToken(token);
  if (!agendamento) {
    throw new ForaDoPrazoError("Agendamento não encontrado.");
  }

  const inicio = new Date(agendamento.inicio);
  const agora = new Date();
  const diferencaHoras = (inicio.getTime() - agora.getTime()) / 3_600_000;
  if (diferencaHoras < 2) {
    throw new ForaDoPrazoError();
  }
}

export async function remarcarPorToken(token: string, novoInicio: string): Promise<AgendamentoResumo> {
  const agendamento = await obterPorToken(token);
  if (!agendamento) {
    throw new HorarioIndisponivelError("Agendamento não encontrado.");
  }

  const novoAgendamento = await criarAgendamento({
    slug: "navalha",
    servicoIds: agendamento.servicos.map((servico) => servico.id),
    barbeiroId: agendamento.barbeiroId,
    inicio: novoInicio,
    nome: agendamento.clienteNome,
    telefone: agendamento.telefone,
  });

  return {
    ...novoAgendamento,
    tokenGestao: agendamento.tokenGestao,
    id: agendamento.id,
  };
}

export async function solicitarAssinatura(i: SolicitarAssinaturaInput): Promise<void> {
  void i;
}

export async function agendaDoDia(barbeariaId: string, data: string): Promise<AgendamentoPainel[]> {
  void barbeariaId;
  return AGENDAMENTOS_EXEMPLO.filter((agendamento) => agendamento.barbeariaId === barbeariaId)
    .filter((agendamento) => agendamento.inicio.startsWith(data))
    .map((agendamento) => ({
      id: agendamento.id,
      clienteNome: agendamento.clienteNome,
      telefone: agendamento.telefone,
      barbeiroId: agendamento.barbeiroId,
      barbeiroNome: BARBEIROS_EXEMPLO.find((barbeiro) => barbeiro.id === agendamento.barbeiroId)?.nome ?? "Equipe",
      inicio: agendamento.inicio,
      fim: agendamento.fim,
      status: agendamento.status,
      valorTotal: agendamento.valorTotal,
      servicos: agendamento.servicos,
    }));
}

export async function agendaDaSemana(barbeariaId: string, dataInicial: string): Promise<AgendamentoPainel[]> {
  void barbeariaId;
  return agendaDoDia(barbeariaId, dataInicial);
}

export async function criarAgendamentoManual(
  barbeariaId: string,
  i: CriarAgendamentoManualInput,
): Promise<AgendamentoResumo> {
  void barbeariaId;
  return criarAgendamento({
    slug: "navalha",
    servicoIds: i.servicoIds,
    barbeiroId: i.barbeiroId,
    inicio: i.inicio,
    nome: i.nome,
    telefone: i.telefone,
  });
}

export async function alterarStatus(
  barbeariaId: string,
  agendamentoId: string,
  status: "concluido" | "nao_compareceu" | "cancelado",
  opcoes?: AlterarStatusInput,
): Promise<void> {
  void barbeariaId;
  void agendamentoId;
  void status;
  void opcoes;
}

export async function remarcarAgendamento(
  barbeariaId: string,
  agendamentoId: string,
  novoInicio: string,
): Promise<void> {
  void barbeariaId;
  void agendamentoId;
  void novoInicio;
}

export async function conflitosDoBloqueio(
  barbeariaId: string,
  i: ConflitoBloqueioInput,
): Promise<AgendamentoPainel[]> {
  void barbeariaId;
  const inicio = new Date(i.inicio);
  const fim = new Date(i.fim);
  return AGENDAMENTOS_EXEMPLO.filter((agendamento) => {
    const agendamentoInicio = new Date(agendamento.inicio);
    const agendamentoFim = new Date(agendamento.fim);
    const mesmoBarbeiro = !i.barbeiroId || agendamento.barbeiroId === i.barbeiroId;
    return mesmoBarbeiro && agendamentoInicio < fim && inicio < agendamentoFim;
  }).map((agendamento) => ({
    id: agendamento.id,
    clienteNome: agendamento.clienteNome,
    telefone: agendamento.telefone,
    barbeiroId: agendamento.barbeiroId,
    barbeiroNome: BARBEIROS_EXEMPLO.find((barbeiro) => barbeiro.id === agendamento.barbeiroId)?.nome ?? "Equipe",
    inicio: agendamento.inicio,
    fim: agendamento.fim,
    status: agendamento.status,
    valorTotal: agendamento.valorTotal,
    servicos: agendamento.servicos,
  }));
}

export async function ativarAssinatura(
  barbeariaId: string,
  assinaturaId: string,
  validaAte?: string,
): Promise<void> {
  void barbeariaId;
  void assinaturaId;
  void validaAte;
}

export async function renovarAssinatura(
  barbeariaId: string,
  assinaturaId: string,
): Promise<void> {
  void barbeariaId;
  void assinaturaId;
}

export async function cancelarAssinatura(
  barbeariaId: string,
  assinaturaId: string,
): Promise<void> {
  void barbeariaId;
  void assinaturaId;
}

export async function assinaturasDaBarbearia(barbeariaId: string): Promise<AssinaturaPainel[]> {
  void barbeariaId;
  return [
    {
      id: "ass-01",
      clienteNome: "Lucas",
      planoNome: "Plano Gold",
      status: "ativa",
      validade: "2026-12-15",
      usosNoCiclo: 2,
      limiteUsos: 8,
    },
    {
      id: "ass-02",
      clienteNome: "Mateus",
      planoNome: "Plano Silver",
      status: "vencida",
      validade: "2026-09-01",
      usosNoCiclo: 0,
      limiteUsos: 4,
    },
  ];
}

export function linkWhatsAppBarbearia(a: AgendamentoResumo, whatsappBarbearia: string): string {
  const numero = normalizarTelefone(whatsappBarbearia).replace(/^\+/, "");
  const mensagem = encodeURIComponent(
    `Olá! Confirmei o agendamento para ${a.clienteNome} em ${a.inicio}. Estamos aguardando você na barbearia.`,
  );
  return `https://wa.me/${numero}?text=${mensagem}`;
}

export function linkWhatsAppCliente(a: AgendamentoPainel, tipo: "lembrete"): string {
  const numero = normalizarTelefone(a.telefone).replace(/^\+/, "");
  const mensagem = encodeURIComponent(
    tipo === "lembrete"
      ? `Olá ${a.clienteNome}! Seu atendimento está agendado para ${a.inicio}. A barbearia está te esperando.`
      : `Olá ${a.clienteNome}! Estamos com seu agendamento em andamento.`,
  );
  return `https://wa.me/${numero}?text=${mensagem}`;
}

export const contratos = {
  listarHorariosLivres,
  criarAgendamento,
  obterPorToken,
  cancelarPorToken,
  remarcarPorToken,
  solicitarAssinatura,
  agendaDoDia,
  agendaDaSemana,
  criarAgendamentoManual,
  alterarStatus,
  remarcarAgendamento,
  conflitosDoBloqueio,
  ativarAssinatura,
  renovarAssinatura,
  cancelarAssinatura,
  assinaturasDaBarbearia,
  linkWhatsAppBarbearia,
  linkWhatsAppCliente,
};
