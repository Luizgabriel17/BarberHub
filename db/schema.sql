-- BarberHub 2.0 | Neon PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE status_agendamento AS ENUM ('confirmado', 'concluido', 'cancelado', 'nao_compareceu');
CREATE TYPE origem_agendamento AS ENUM ('cliente', 'equipe');
CREATE TYPE status_assinatura AS ENUM ('pendente', 'ativa', 'cancelada');

CREATE OR REPLACE FUNCTION set_atualizado_em() RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE barbearias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug citext NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text NOT NULL,
  whatsapp varchar(20),
  endereco text,
  chave_pix text,
  fuso_horario text NOT NULL DEFAULT 'America/Sao_Paulo',
  assinaturas_ativas boolean NOT NULL DEFAULT false,
  intervalo_agenda_min smallint NOT NULL DEFAULT 30 CHECK (intervalo_agenda_min IN (15, 30, 60)),
  antecedencia_min_minutos integer NOT NULL DEFAULT 30 CHECK (antecedencia_min_minutos >= 0),
  antecedencia_cancel_horas integer NOT NULL DEFAULT 2 CHECK (antecedencia_cancel_horas >= 0),
  janela_max_dias integer NOT NULL DEFAULT 30 CHECK (janela_max_dias > 0),
  ativa boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  email citext NOT NULL UNIQUE,
  nome text NOT NULL,
  senha_hash text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tentativas_login (
  email citext PRIMARY KEY,
  tentativas integer NOT NULL DEFAULT 0,
  janela_iniciada_em timestamptz NOT NULL DEFAULT now(),
  bloqueado_ate timestamptz
);

CREATE TABLE servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco numeric(10,2) NOT NULL CHECK (preco >= 0),
  duracao_min integer NOT NULL CHECK (duracao_min > 0),
  ordem smallint NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE barbeiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome text NOT NULL,
  foto_dados bytea CHECK (foto_dados IS NULL OR octet_length(foto_dados) <= 102400),
  foto_tipo text,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco numeric(10,2) NOT NULL CHECK (preco >= 0),
  foto_dados bytea CHECK (foto_dados IS NULL OR octet_length(foto_dados) <= 102400),
  foto_tipo text,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  preco_mensal numeric(10,2) NOT NULL CHECK (preco_mensal >= 0),
  limite_usos_ciclo integer CHECK (limite_usos_ciclo > 0),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE horarios_funcionamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  dia_semana smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abre time NOT NULL,
  fecha time NOT NULL,
  CHECK (fecha > abre),
  UNIQUE (barbearia_id, dia_semana, abre)
);

CREATE TABLE bloqueios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  barbeiro_id uuid REFERENCES barbeiros (id) ON DELETE CASCADE,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  motivo text,
  CHECK (fim > inicio)
);

CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome text NOT NULL,
  telefone varchar(20) NOT NULL,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (barbearia_id, telefone)
);

CREATE TABLE assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  plano_id uuid NOT NULL REFERENCES planos (id),
  status status_assinatura NOT NULL DEFAULT 'pendente',
  valida_ate date,
  usos_no_ciclo integer NOT NULL DEFAULT 0 CHECK (usos_no_ciclo >= 0),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_assinatura_aberta
  ON assinaturas (cliente_id, plano_id)
  WHERE status IN ('pendente', 'ativa');

CREATE TABLE agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  barbeiro_id uuid NOT NULL REFERENCES barbeiros (id),
  assinatura_id uuid REFERENCES assinaturas (id),
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  status status_agendamento NOT NULL DEFAULT 'confirmado',
  origem origem_agendamento NOT NULL DEFAULT 'cliente',
  valor_total numeric(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  token_gestao text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  cancelado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (fim > inicio),
  CONSTRAINT sem_conflito_barbeiro EXCLUDE USING gist (
    barbeiro_id WITH =,
    tstzrange(inicio, fim, '[)') WITH &&
  ) WHERE (status IN ('confirmado', 'concluido'))
);

CREATE TABLE agendamento_servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid NOT NULL REFERENCES agendamentos (id) ON DELETE CASCADE,
  servico_id uuid NOT NULL REFERENCES servicos (id),
  nome_servico text NOT NULL,
  preco_cobrado numeric(10,2) NOT NULL CHECK (preco_cobrado >= 0),
  duracao_min integer NOT NULL CHECK (duracao_min > 0)
);

CREATE TRIGGER trg_assinaturas_atualizado BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_agendamentos_atualizado BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE INDEX idx_servicos_barbearia ON servicos (barbearia_id) WHERE ativo;
CREATE INDEX idx_barbeiros_barbearia ON barbeiros (barbearia_id) WHERE ativo;
CREATE INDEX idx_produtos_barbearia ON produtos (barbearia_id) WHERE ativo;
CREATE INDEX idx_bloqueios_barbearia ON bloqueios (barbearia_id, inicio);
CREATE INDEX idx_clientes_nome ON clientes (barbearia_id, nome);
CREATE INDEX idx_agend_barbearia_inicio ON agendamentos (barbearia_id, inicio);
CREATE INDEX idx_agend_barbeiro_inicio ON agendamentos (barbeiro_id, inicio);
CREATE INDEX idx_agend_cliente ON agendamentos (cliente_id, inicio DESC);
CREATE INDEX idx_assinaturas_cliente ON assinaturas (cliente_id);
