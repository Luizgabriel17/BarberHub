BarberHub – Especificação de Requisitos Funcionais

Sistema multi-barbearia de agendamentos (SaaS) simplificado, com PWA, banco Neon (PostgreSQL) e stack gratuita

Versão 2.0 · Novembro de 2026

1. Visão geral

O BarberHub permite que várias barbearias recebam agendamentos pelo celular, sem que o cliente precise criar conta e sem que o dono pague por nenhuma ferramenta no início. Esta versão 2.0 reduz o escopo da versão anterior para algo que uma pessoa consiga construir e manter sozinha.

1.1 Princípios de simplicidade
O cliente agenda em até 3 telas, sem cadastro e sem senha.
O proprietário gerencia tudo em um painel com 5 abas.
Todas as ferramentas têm plano gratuito. O custo mensal esperado do MVP é R$ 0.
Poucos serviços externos: apenas o banco (Neon) e a hospedagem.
Cada barbearia tem um link próprio, como app.com/navalha.
1.2 O que saiu desta versão
Removido	Como fica agora
Gateway de pagamento e cobrança recorrente	O cliente paga a assinatura por Pix direto à barbearia. O proprietário registra o pagamento no painel.
Conta e login do cliente	O cliente informa nome e telefone. Para cancelar ou remarcar, usa um link recebido na confirmação.
Login de barbeiro e convites	Barbeiros são apenas cadastros. O proprietário gerencia a agenda de todos.
E-mail, WhatsApp automático e push	Um botão abre o WhatsApp com a mensagem já escrita. É gratuito e não precisa de API.
Venda de produtos e estoque	Produtos ficam em uma vitrine com nome, foto e preço.
Relatórios, comissões e auditoria	Ficam para uma fase futura.
Categorias de serviço e jornada individual do barbeiro	Todos os barbeiros seguem o expediente da barbearia. Folgas são registradas como bloqueios.
Armazenamento externo de fotos	A foto reduzida fica no próprio banco.
2. Perfis de usuário
Perfil	Acesso	O que faz
Cliente	Sem conta	Consulta serviços, preços, barbeiros, planos e produtos. Agenda, cancela e remarca pelo link de gestão.
Proprietário	E-mail e senha	Cadastra serviços, barbeiros, produtos e planos. Gerencia a agenda, os clientes e as assinaturas.
Administrador da plataforma	Direto no console do Neon	Você. Cria e suspende barbearias no começo, antes de existir um painel próprio.
3. Navegação e telas
3.1 Página pública do cliente

A página abre direto na barbearia, com o nome no topo e uma barra de 5 opções: Agendar, Serviços, Equipe, Planos e Produtos. Planos só aparece se o proprietário ligou as assinaturas.

Tela	Conteúdo	Ação principal
Agendar, passo 1	Lista de serviços com preço e duração, e os barbeiros com foto, mais a opção Qualquer barbeiro.	Escolher e tocar em Continuar.
Agendar, passo 2	Próximos 7 dias em botões e a grade de horários livres.	Tocar no horário.
Agendar, passo 3	Resumo, nome e telefone.	Confirmar.
Confirmado	Resumo do agendamento, botão para chamar a barbearia no WhatsApp e link para cancelar ou remarcar.	Salvar o link.
Serviços	Lista com preço e duração.	Ir para Agendar.
Equipe	Cartões com foto e nome dos barbeiros.	Agendar com este barbeiro.
Planos	Planos com preço, descrição e chave Pix da barbearia.	Quero assinar.
Produtos	Vitrine com foto e preço.	Somente consulta.
3.2 Painel do proprietário

O painel usa uma barra fixa embaixo, no estilo de aplicativo, com 5 abas.

Aba	Conteúdo
Hoje	Agenda do dia por barbeiro, com botões grandes para concluir, marcar falta ou cancelar. Botão + para novo agendamento.
Agenda	Visão da semana e lista de bloqueios (folgas e fechamentos).
Cadastros	Atalhos para Serviços, Barbeiros, Produtos e Planos. Cada um é uma lista com um botão Adicionar.
Clientes	Lista com busca por nome ou telefone, histórico e assinaturas.
Ajustes	Dados da barbearia, horário de funcionamento, chave Pix, ligar ou desligar assinaturas, link público para copiar.
4. Requisitos funcionais

Prioridade: M é essencial para o MVP e S vem logo depois.

4.1 Barbearia e acesso
ID	Requisito	Prior.
RF-01	O proprietário deve cadastrar a barbearia com nome, link (slug), telefone de WhatsApp e endereço.	M
RF-02	Cada barbearia deve ter uma página pública acessível pelo seu slug.	M
RF-03	O proprietário deve entrar com e-mail e senha e poder sair.	M
RF-04	Uma barbearia não pode ver nem alterar dados de outra.	M
RF-05	O painel deve mostrar o link público com botão de copiar e um QR code para imprimir.	S
4.2 Cadastros
ID	Requisito	Prior.
RF-10	O proprietário deve cadastrar, editar e inativar serviços com nome, preço e duração.	M
RF-11	O proprietário deve cadastrar, editar e inativar barbeiros com nome e foto opcional.	M
RF-12	A foto deve ser reduzida no navegador (cerca de 300 por 300 pixels, no máximo 100 KB) antes de ser enviada.	M
RF-13	O proprietário deve cadastrar, editar e inativar produtos com nome, preço e foto opcional.	M
RF-14	O proprietário deve definir o horário de funcionamento de cada dia da semana.	M
RF-15	O proprietário deve registrar bloqueios: folga de um barbeiro ou fechamento da barbearia em um período.	M
RF-16	O proprietário deve configurar o intervalo da agenda (padrão de 30 minutos) e a antecedência mínima para agendar.	S
4.3 Agendamento pelo cliente
ID	Requisito	Prior.
RF-20	O cliente deve ver serviços, preços, barbeiros, planos e produtos sem login.	M
RF-21	O cliente deve agendar escolhendo serviço, barbeiro (ou qualquer um), dia e horário, e informando nome e telefone.	M
RF-22	O sistema deve mostrar apenas horários livres, considerando expediente, bloqueios, duração do serviço e agendamentos existentes.	M
RF-23	O sistema deve impedir dois agendamentos sobrepostos para o mesmo barbeiro, mesmo em acessos simultâneos.	M
RF-24	Após confirmar, o cliente deve ver um resumo e um botão que abre o WhatsApp da barbearia com a mensagem pronta.	M
RF-25	O cliente deve poder cancelar ou remarcar pelo link de gestão, respeitando a antecedência mínima da barbearia.	M
RF-26	O cliente deve poder escolher mais de um serviço no mesmo agendamento.	S
4.4 Agenda do proprietário
ID	Requisito	Prior.
RF-30	O proprietário deve ver a agenda do dia agrupada por barbeiro.	M
RF-31	O proprietário deve ver a agenda da semana.	S
RF-32	O proprietário deve criar agendamentos manuais, para quem ligou ou chegou ao balcão.	M
RF-33	O proprietário deve marcar o agendamento como concluído, falta ou cancelado.	M
RF-34	O proprietário deve remarcar ou cancelar qualquer agendamento.	M
RF-35	O proprietário deve ter um botão que abre o WhatsApp do cliente com um lembrete pronto.	S
4.5 Clientes
ID	Requisito	Prior.
RF-40	O sistema deve criar ou reaproveitar o cadastro do cliente pelo telefone ao agendar.	M
RF-41	O proprietário deve buscar clientes, ver o histórico de atendimentos e registrar observações.	S
RF-42	O proprietário deve poder apagar os dados de um cliente que pedir a exclusão (LGPD).	S
4.6 Assinaturas (opcional por barbearia)
ID	Requisito	Prior.
RF-50	O proprietário deve poder ligar ou desligar a oferta de assinaturas. Desligada, nada de assinatura aparece ao cliente.	M
RF-51	O proprietário deve cadastrar planos com nome, descrição, preço mensal e limite de usos por ciclo (ou uso ilimitado).	M
RF-52	O cliente deve tocar em Quero assinar e enviar nome e telefone. A solicitação fica pendente e o proprietário a recebe no painel.	M
RF-53	O proprietário deve ativar a assinatura depois de receber o Pix, informando a validade (por padrão, 30 dias).	M
RF-54	Ao concluir um atendimento, o proprietário deve poder marcar Usar assinatura, que abate um uso do ciclo.	M
RF-55	A assinatura deve aparecer como vencida quando passar da validade, e o proprietário deve poder renovar com um toque.	M
RF-56	O proprietário deve poder cancelar uma assinatura.	M
4.7 PWA
ID	Requisito	Prior.
RF-70	A aplicação deve ser instalável na tela inicial do celular e do computador.	M
RF-71	A interface deve ser pensada primeiro para celular, com botões grandes e texto legível.	M
RF-72	Sem internet, o aplicativo deve abrir e mostrar uma mensagem clara, sem tela em branco.	S
5. Regras de negócio
RN-01: o slug da barbearia é único em toda a plataforma.
RN-02: um barbeiro não pode ter dois agendamentos ativos com horários sobrepostos.
RN-03: o nome e o preço do serviço são copiados para o agendamento. Mudanças posteriores no cadastro não alteram o que já foi marcado.
RN-04: serviços, barbeiros, produtos e planos nunca são apagados: são inativados.
RN-05: o telefone do cliente é único dentro de cada barbearia.
RN-06: o cliente só cancela ou remarca pelo link até a antecedência definida pela barbearia (padrão de 2 horas). Depois disso, só o proprietário.
RN-07: horários ficam salvos em UTC e aparecem no fuso da barbearia.
RN-08: assinatura pendente, vencida ou cancelada não abate usos.
RN-09: o número de usos no ciclo não pode passar do limite do plano.
6. Stack de desenvolvimento (gratuita)

Tudo em TypeScript, em um único projeto que serve a página, a API e o PWA. Só o banco e a hospedagem são serviços externos, e ambos têm plano gratuito.

Camada	Ferramenta	Custo	Observação
Código	GitHub	Gratuito	Versionamento e deploy automático.
Framework	Next.js com TypeScript	Gratuito	Páginas, API e renderização no servidor no mesmo projeto.
Interface	Tailwind CSS e shadcn/ui	Gratuito	Componentes prontos, mobile first.
PWA	manifest.ts do Next.js e Serwist	Gratuito	Instalação na tela inicial e aviso sem conexão.
Banco de dados	Neon, plano Free	Gratuito	Tem limite mensal de armazenamento e de uso de computação. O banco pode dormir após alguns minutos sem uso, então a primeira consulta demora um pouco mais. Confira os limites atuais no site do Neon.
Acesso a dados	Drizzle ORM e @neondatabase/serverless	Gratuito	Consultas tipadas e migrações.
Login do proprietário	Auth.js (Credentials) e bcryptjs	Gratuito	E-mail e senha, sem serviço de e-mail.
Fotos	Coluna no próprio banco	Gratuito	Imagem já reduzida no navegador. Se o volume crescer, migrar para o Cloudflare R2, que tem plano gratuito.
Validação	Zod	Gratuito	Mesma regra no formulário e na API.
Datas e fuso	date-fns e date-fns-tz	Gratuito	Horários livres no fuso da barbearia.
Testes	Vitest	Gratuito	Cobre só o cálculo de horários livres.
Mensagens	Link wa.me do WhatsApp	Gratuito	Abre o WhatsApp com texto pronto. Sem API.
Hospedagem	Vercel, plano Hobby	Gratuito	Pelos termos da Vercel, o Hobby é para uso pessoal e não comercial. Ao cobrar das barbearias, confira os termos e migre para um plano pago ou para outra hospedagem gratuita que permita uso comercial.
Endereço	Subdomínio *.vercel.app	Gratuito	Domínio próprio é opcional.

Não fazem parte do MVP: serviço de e-mail, gateway de pagamento, tarefas agendadas, armazenamento de arquivos e monitoramento pago.

6.1 Estrutura de pastas
barberhub/
├─ src/
│  ├─ app/
│  │  ├─ [slug]/            # página pública da barbearia e agendamento
│  │  ├─ gestao/[token]/    # cancelar ou remarcar pelo link
│  │  ├─ painel/            # painel do proprietário (5 abas)
│  │  ├─ api/               # rotas de fotos e de autenticação
│  │  └─ manifest.ts        # manifest do PWA
│  ├─ db/                   # schema.ts (gerado do banco) e conexão
│  ├─ server/               # regras: horários livres, agendar, assinaturas
│  └─ components/
├─ drizzle.config.ts
└─ .env.local               # DATABASE_URL e AUTH_SECRET
7. Banco de dados (Neon)
7.1 Como criar no Neon
Crie uma conta gratuita no Neon e um projeto novo, escolhendo a região AWS São Paulo (sa-east-1) se estiver disponível.
Abra o SQL Editor do projeto, na branch main.
Cole o script da seção 7.3 inteiro e execute uma vez.
Copie a connection string com pooling (host com -pooler) para a variável DATABASE_URL do projeto.
Crie uma branch dev a partir da main para testar sem mexer nos dados reais.
Rode npx drizzle-kit pull para gerar o schema.ts do Drizzle a partir do banco. Depois, mude o banco por migrações.
7.2 Tabelas
Tabela	Finalidade
barbearias	Cada barbearia (tenant), com slug, WhatsApp, chave Pix e configurações da agenda.
usuarios	Login do proprietário.
servicos	Serviços com preço e duração.
barbeiros	Equipe, com foto opcional.
produtos	Vitrine com preço e foto opcional.
planos	Planos de assinatura.
horarios_funcionamento	Expediente por dia da semana.
bloqueios	Folgas de barbeiro ou fechamento da barbearia.
clientes	Nome e telefone, únicos por barbearia.
assinaturas	Assinatura de um cliente a um plano, com validade e usos.
agendamentos	Reservas, com a restrição contra horários sobrepostos.
agendamento_servicos	Serviços de cada agendamento, com nome e preço congelados.

Todas as tabelas de negócio têm barbearia_id e a aplicação sempre filtra por ele. A assinatura vencida não é um status: ela é calculada quando status é ativa e valida_ate já passou.

7.3 Script SQL
sql
-- =====================================================
-- BarberHub 2.0 | Script único para o Neon (PostgreSQL)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE status_agendamento AS ENUM ('confirmado', 'concluido', 'cancelado', 'nao_compareceu');
CREATE TYPE origem_agendamento AS ENUM ('cliente', 'equipe');
CREATE TYPE status_assinatura  AS ENUM ('pendente', 'ativa', 'cancelada');

CREATE OR REPLACE FUNCTION set_atualizado_em() RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Barbearias (cada uma é um tenant)
CREATE TABLE barbearias (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                      citext NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome                      text NOT NULL,
  whatsapp                  varchar(20),
  endereco                  text,
  chave_pix                 text,
  fuso_horario              text NOT NULL DEFAULT 'America/Sao_Paulo',
  assinaturas_ativas        boolean NOT NULL DEFAULT false,
  intervalo_agenda_min      smallint NOT NULL DEFAULT 30 CHECK (intervalo_agenda_min IN (15, 30, 60)),
  antecedencia_min_minutos  integer NOT NULL DEFAULT 30 CHECK (antecedencia_min_minutos >= 0),
  antecedencia_cancel_horas integer NOT NULL DEFAULT 2 CHECK (antecedencia_cancel_horas >= 0),
  janela_max_dias           integer NOT NULL DEFAULT 30 CHECK (janela_max_dias > 0),
  ativa                     boolean NOT NULL DEFAULT true,
  criado_em                 timestamptz NOT NULL DEFAULT now()
);

-- Login do proprietário
CREATE TABLE usuarios (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  email        citext NOT NULL UNIQUE,
  nome         text NOT NULL,
  senha_hash   text NOT NULL,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE servicos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome         text NOT NULL,
  preco        numeric(10,2) NOT NULL CHECK (preco >= 0),
  duracao_min  integer NOT NULL CHECK (duracao_min > 0),
  ordem        smallint NOT NULL DEFAULT 0,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

-- A foto reduzida (até 100 KB) fica na própria linha.
-- Nas listagens, nunca selecione foto_dados: sirva a imagem por uma rota própria com cache.
CREATE TABLE barbeiros (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome         text NOT NULL,
  foto_dados   bytea CHECK (foto_dados IS NULL OR octet_length(foto_dados) <= 102400),
  foto_tipo    text,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE produtos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome         text NOT NULL,
  preco        numeric(10,2) NOT NULL CHECK (preco >= 0),
  foto_dados   bytea CHECK (foto_dados IS NULL OR octet_length(foto_dados) <= 102400),
  foto_tipo    text,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE planos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id      uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome              text NOT NULL,
  descricao         text,
  preco_mensal      numeric(10,2) NOT NULL CHECK (preco_mensal >= 0),
  limite_usos_ciclo integer CHECK (limite_usos_ciclo > 0),   -- NULL = uso ilimitado
  ativo             boolean NOT NULL DEFAULT true,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

-- Expediente. dia_semana: 0 = domingo ... 6 = sábado.
-- Dia com pausa para almoço = duas linhas no mesmo dia.
CREATE TABLE horarios_funcionamento (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  dia_semana   smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abre         time NOT NULL,
  fecha        time NOT NULL,
  CHECK (fecha > abre),
  UNIQUE (barbearia_id, dia_semana, abre)
);

-- Folga de um barbeiro ou, com barbeiro_id nulo, fechamento da barbearia inteira
CREATE TABLE bloqueios (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  barbeiro_id  uuid REFERENCES barbeiros (id) ON DELETE CASCADE,
  inicio       timestamptz NOT NULL,
  fim          timestamptz NOT NULL,
  motivo       text,
  CHECK (fim > inicio)
);

CREATE TABLE clientes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  nome         text NOT NULL,
  telefone     varchar(20) NOT NULL,
  observacoes  text,
  criado_em    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (barbearia_id, telefone)   -- RN-05
);

CREATE TABLE assinaturas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  cliente_id    uuid NOT NULL REFERENCES clientes (id),
  plano_id      uuid NOT NULL REFERENCES planos (id),
  status        status_assinatura NOT NULL DEFAULT 'pendente',
  valida_ate    date,
  usos_no_ciclo integer NOT NULL DEFAULT 0 CHECK (usos_no_ciclo >= 0),
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Um cliente não pode ter duas assinaturas abertas do mesmo plano
CREATE UNIQUE INDEX uq_assinatura_aberta
  ON assinaturas (cliente_id, plano_id)
  WHERE status IN ('pendente', 'ativa');

CREATE TABLE agendamentos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  uuid NOT NULL REFERENCES barbearias (id) ON DELETE CASCADE,
  cliente_id    uuid NOT NULL REFERENCES clientes (id),
  barbeiro_id   uuid NOT NULL REFERENCES barbeiros (id),
  assinatura_id uuid REFERENCES assinaturas (id),
  inicio        timestamptz NOT NULL,
  fim           timestamptz NOT NULL,
  status        status_agendamento NOT NULL DEFAULT 'confirmado',
  origem        origem_agendamento NOT NULL DEFAULT 'cliente',
  valor_total   numeric(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  token_gestao  text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  cancelado_em  timestamptz,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (fim > inicio),
  -- RN-02: o banco recusa horários sobrepostos do mesmo barbeiro, mesmo com acessos simultâneos
  CONSTRAINT sem_conflito_barbeiro EXCLUDE USING gist (
    barbeiro_id WITH =,
    tstzrange(inicio, fim, '[)') WITH &&
  ) WHERE (status IN ('confirmado', 'concluido'))
);

-- Nome, preço e duração congelados no momento do agendamento (RN-03)
CREATE TABLE agendamento_servicos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid NOT NULL REFERENCES agendamentos (id) ON DELETE CASCADE,
  servico_id     uuid NOT NULL REFERENCES servicos (id),
  nome_servico   text NOT NULL,
  preco_cobrado  numeric(10,2) NOT NULL CHECK (preco_cobrado >= 0),
  duracao_min    integer NOT NULL CHECK (duracao_min > 0)
);

CREATE TRIGGER trg_assinaturas_atualizado BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_agendamentos_atualizado BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- Índices
CREATE INDEX idx_servicos_barbearia     ON servicos (barbearia_id) WHERE ativo;
CREATE INDEX idx_barbeiros_barbearia    ON barbeiros (barbearia_id) WHERE ativo;
CREATE INDEX idx_produtos_barbearia     ON produtos (barbearia_id) WHERE ativo;
CREATE INDEX idx_bloqueios_barbearia    ON bloqueios (barbearia_id, inicio);
CREATE INDEX idx_clientes_nome          ON clientes (barbearia_id, nome);
CREATE INDEX idx_agend_barbearia_inicio ON agendamentos (barbearia_id, inicio);
CREATE INDEX idx_agend_barbeiro_inicio  ON agendamentos (barbeiro_id, inicio);
CREATE INDEX idx_agend_cliente          ON agendamentos (cliente_id, inicio DESC);
CREATE INDEX idx_assinaturas_cliente    ON assinaturas (cliente_id);
7.4 Dados de exemplo (opcional)
sql
INSERT INTO barbearias (slug, nome, whatsapp) VALUES ('navalha', 'Barbearia Navalha', '5511999990000');

INSERT INTO horarios_funcionamento (barbearia_id, dia_semana, abre, fecha)
SELECT b.id, d, '09:00', '19:00'
FROM barbearias b, generate_series(1, 6) AS d
WHERE b.slug = 'navalha';

INSERT INTO servicos (barbearia_id, nome, preco, duracao_min)
SELECT b.id, s.nome, s.preco, s.dur
FROM barbearias b,
     (VALUES ('Corte', 40, 30), ('Barba', 30, 30), ('Corte + Barba', 65, 60)) AS s (nome, preco, dur)
WHERE b.slug = 'navalha';

INSERT INTO barbeiros (barbearia_id, nome)
SELECT b.id, n
FROM barbearias b, (VALUES ('Carlos'), ('Rafael')) AS x (n)
WHERE b.slug = 'navalha';
7.5 Como calcular os horários livres
Pegar o expediente da barbearia no dia da semana escolhido.
Descontar os bloqueios do barbeiro e os da barbearia inteira.
Descontar os agendamentos ativos do barbeiro (confirmado e concluido).
Gerar horários a cada intervalo_agenda_min em que a duração do serviço caiba no que sobrou.
Descartar horários passados e os que estão antes da antecedência mínima.

A restrição sem_conflito_barbeiro é a segunda barreira: mesmo que dois clientes toquem no mesmo horário ao mesmo tempo, o banco rejeita o segundo e a aplicação mostra uma mensagem pedindo outro horário.

8. Requisitos não funcionais
Categoria	Requisito
Segurança	HTTPS (já incluso na hospedagem), senha com hash bcrypt, validação com Zod em toda entrada, consultas parametrizadas pelo Drizzle e filtro por barbearia_id em todas as consultas. O link de gestão usa um token aleatório de 32 caracteres.
Privacidade	Coletar só nome e telefone do cliente e apagar os dados sob pedido (LGPD).
Desempenho	Página pública carregando em até 3 segundos em 4G. Fotos de no máximo 100 KB. O primeiro acesso após o banco dormir pode demorar um pouco mais.
Usabilidade	Agendar em até 3 telas. Áreas de toque de pelo menos 44 pixels, texto de pelo menos 16 pixels e mensagens de erro em português simples.
Backup	A janela de recuperação do plano gratuito do Neon é curta. Exportar o banco com pg_dump periodicamente, por exemplo uma vez por semana.
9. Ordem de construção
Etapa	Entregas
1. Base	Projeto Next.js, banco no Neon, login do proprietário, cadastro da barbearia, serviços, barbeiros com foto, horário de funcionamento e bloqueios.
2. Agendamento	Página pública, cálculo de horários livres, agendar em 3 passos, confirmação com WhatsApp, link de gestão, agenda do dia e agendamento manual.
3. Assinaturas e produtos	Planos, solicitação do cliente, ativação e renovação pelo proprietário, uso da assinatura e vitrine de produtos.
4. Acabamento	PWA instalável, tela sem conexão, QR code e a agenda da semana.

Depois do MVP, quando houver receita: confirmação por e-mail, login de barbeiro, relatórios, pagamento online das assinaturas, estoque e venda de produtos, e migração para uma hospedagem com plano comercial.

10. Critérios de aceite do MVP
Um cliente agenda pelo celular, sem criar conta, em até 3 telas.
Dois clientes não conseguem reservar o mesmo horário do mesmo barbeiro, nem ao mesmo tempo.
Uma barbearia nunca vê dados de outra.
O proprietário cadastra serviço, barbeiro com foto e produto, e eles aparecem na página pública na hora.
O cliente cancela ou remarca pelo link, respeitando a antecedência.
A oferta de assinaturas pode ser ligada e desligada, e o proprietário ativa, usa e renova uma assinatura pelo painel.
O sistema pode ser instalado na tela inicial como aplicativo.
O custo mensal para rodar o MVP é R$ 0.