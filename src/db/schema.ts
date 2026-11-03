import {
  boolean,
  customType,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const statusAgendamento = pgEnum("status_agendamento", [
  "confirmado",
  "concluido",
  "cancelado",
  "nao_compareceu",
]);
export const origemAgendamento = pgEnum("origem_agendamento", ["cliente", "equipe"]);
export const statusAssinatura = pgEnum("status_assinatura", ["pendente", "ativa", "cancelada"]);

export const barbearias = pgTable("barbearias", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: citext("slug").notNull().unique(),
  nome: text("nome").notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  endereco: text("endereco"),
  chavePix: text("chave_pix"),
  fusoHorario: text("fuso_horario").notNull().default("America/Sao_Paulo"),
  assinaturasAtivas: boolean("assinaturas_ativas").notNull().default(false),
  intervaloAgendaMin: smallint("intervalo_agenda_min").notNull().default(30),
  antecedenciaMinMinutos: integer("antecedencia_min_minutos").notNull().default(30),
  antecedenciaCancelHoras: integer("antecedencia_cancel_horas").notNull().default(2),
  janelaMaxDias: integer("janela_max_dias").notNull().default(30),
  ativa: boolean("ativa").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const usuarios = pgTable("usuarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
  email: citext("email").notNull().unique(),
  nome: text("nome").notNull(),
  senhaHash: text("senha_hash").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const tentativasLogin = pgTable("tentativas_login", {
  email: citext("email").primaryKey(),
  tentativas: integer("tentativas").notNull().default(0),
  janelaIniciadaEm: timestamp("janela_iniciada_em", { withTimezone: true }).notNull().defaultNow(),
  bloqueadoAte: timestamp("bloqueado_ate", { withTimezone: true }),
});

export const servicos = pgTable(
  "servicos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    preco: numeric("preco", { precision: 10, scale: 2, mode: "number" }).notNull(),
    duracaoMin: integer("duracao_min").notNull(),
    ordem: smallint("ordem").notNull().default(0),
    ativo: boolean("ativo").notNull().default(true),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_servicos_barbearia").on(table.barbeariaId).where(sql`${table.ativo}`)],
);

export const barbeiros = pgTable(
  "barbeiros",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    fotoDados: bytea("foto_dados"),
    fotoTipo: text("foto_tipo"),
    ativo: boolean("ativo").notNull().default(true),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_barbeiros_barbearia").on(table.barbeariaId).where(sql`${table.ativo}`)],
);

export const produtos = pgTable(
  "produtos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    preco: numeric("preco", { precision: 10, scale: 2, mode: "number" }).notNull(),
    fotoDados: bytea("foto_dados"),
    fotoTipo: text("foto_tipo"),
    ativo: boolean("ativo").notNull().default(true),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_produtos_barbearia").on(table.barbeariaId).where(sql`${table.ativo}`)],
);

export const planos = pgTable("planos", {
  id: uuid("id").defaultRandom().primaryKey(),
  barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  precoMensal: numeric("preco_mensal", { precision: 10, scale: 2, mode: "number" }).notNull(),
  limiteUsosCiclo: integer("limite_usos_ciclo"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const horariosFuncionamento = pgTable("horarios_funcionamento", {
  id: uuid("id").defaultRandom().primaryKey(),
  barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
  diaSemana: smallint("dia_semana").notNull(),
  abre: time("abre").notNull(),
  fecha: time("fecha").notNull(),
});

export const bloqueios = pgTable(
  "bloqueios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    barbeiroId: uuid("barbeiro_id").references(() => barbeiros.id, { onDelete: "cascade" }),
    inicio: timestamp("inicio", { withTimezone: true }).notNull(),
    fim: timestamp("fim", { withTimezone: true }).notNull(),
    motivo: text("motivo"),
  },
  (table) => [index("idx_bloqueios_barbearia").on(table.barbeariaId, table.inicio)],
);

export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    telefone: varchar("telefone", { length: 20 }).notNull(),
    observacoes: text("observacoes"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_clientes_barbearia_telefone").on(table.barbeariaId, table.telefone),
    index("idx_clientes_nome").on(table.barbeariaId, table.nome),
  ],
);

export const assinaturas = pgTable(
  "assinaturas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    clienteId: uuid("cliente_id").notNull().references(() => clientes.id),
    planoId: uuid("plano_id").notNull().references(() => planos.id),
    status: statusAssinatura("status").notNull().default("pendente"),
    validaAte: date("valida_ate"),
    usosNoCiclo: integer("usos_no_ciclo").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_assinatura_aberta")
      .on(table.clienteId, table.planoId)
      .where(sql`${table.status} IN ('pendente', 'ativa')`),
    index("idx_assinaturas_cliente").on(table.clienteId),
  ],
);

export const agendamentos = pgTable(
  "agendamentos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    barbeariaId: uuid("barbearia_id").notNull().references(() => barbearias.id, { onDelete: "cascade" }),
    clienteId: uuid("cliente_id").notNull().references(() => clientes.id),
    barbeiroId: uuid("barbeiro_id").notNull().references(() => barbeiros.id),
    assinaturaId: uuid("assinatura_id").references(() => assinaturas.id),
    inicio: timestamp("inicio", { withTimezone: true }).notNull(),
    fim: timestamp("fim", { withTimezone: true }).notNull(),
    status: statusAgendamento("status").notNull().default("confirmado"),
    origem: origemAgendamento("origem").notNull().default("cliente"),
    valorTotal: numeric("valor_total", { precision: 10, scale: 2, mode: "number" }).notNull().default(0),
    tokenGestao: text("token_gestao").notNull().unique(),
    canceladoEm: timestamp("cancelado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_agend_barbearia_inicio").on(table.barbeariaId, table.inicio),
    index("idx_agend_barbeiro_inicio").on(table.barbeiroId, table.inicio),
    index("idx_agend_cliente").on(table.clienteId, table.inicio),
  ],
);

export const agendamentoServicos = pgTable("agendamento_servicos", {
  id: uuid("id").defaultRandom().primaryKey(),
  agendamentoId: uuid("agendamento_id").notNull().references(() => agendamentos.id, { onDelete: "cascade" }),
  servicoId: uuid("servico_id").notNull().references(() => servicos.id),
  nomeServico: text("nome_servico").notNull(),
  precoCobrado: numeric("preco_cobrado", { precision: 10, scale: 2, mode: "number" }).notNull(),
  duracaoMin: integer("duracao_min").notNull(),
});
