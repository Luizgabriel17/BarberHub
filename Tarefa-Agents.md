BarberHub – Plano de tarefas para 4 agentes

Documento de apoio: barberhub-requisitos-v2.md (requisitos RF e RN, stack, telas e script SQL do Neon). Cada agente deve ler esse documento inteiro antes de começar e consultar os IDs citados nas tarefas.

1. Divisão do projeto
Agente	Parte do projeto	Pastas que só ele altera
Agente 1	Fundação: repositório, banco Neon, login, helpers, deploy e integração final	Raiz do projeto, db/, src/db/, src/lib/, src/app/entrar, src/app/cadastrar, middleware.ts, .github/
Agente 2	Motor de agenda: regras de negócio no servidor (horários livres, agendamento, assinaturas)	src/server/ e seus testes
Agente 3	Página pública do cliente e PWA	src/app/[slug]/, src/app/gestao/, src/app/manifest.ts, src/components/publico/, public/
Agente 4	Painel do proprietário e fotos	src/app/painel/, src/app/api/foto/, src/components/painel/
2. Regras para todos os agentes
Trabalhar na própria branch (agente-1-fundacao, agente-2-motor, agente-3-publico, agente-4-painel) e abrir pull request para main. O Agente 1 revisa e faz o merge.
Não editar pastas de outro agente. Se precisar de uma mudança lá, registrar o pedido no arquivo PEDIDOS.md na raiz, citando o ID da tarefa.
TypeScript em modo estrito, validação de toda entrada com Zod e textos da interface em português.
Toda consulta ao banco filtra por barbearia_id. O barbearia_id do painel vem da sessão. O da página pública vem do slug. Nunca do corpo da requisição.
Usar apenas as ferramentas da stack gratuita definida no documento de requisitos. Nenhuma biblioteca ou serviço novo sem pedido no PEDIDOS.md.
Segredos só em .env.local. Atualizar o .env.example quando criar uma variável.
Cada tarefa só é considerada pronta quando passa em lint, typecheck e, se houver testes, vitest.
Commits pequenos, com mensagem no formato agente-N: descrição curta.
3. Ordem de execução
Fase	Quem trabalha	Resultado
Fase 0	Agente 1 (A1-01 a A1-05) e Agente 2 (A2-01)	Projeto rodando, banco criado, login funcionando e contrato de funções publicado.
Fase 1	Agentes 2, 3 e 4 em paralelo	Cada parte pronta. Os agentes 3 e 4 usam os dados de exemplo do contrato até o Agente 2 entregar as funções reais.
Fase 2	Agente 1, com apoio de todos	Integração, testes de ponta a ponta e correções.
4. Contrato entre os agentes

O Agente 2 publica este contrato em src/server/contratos.ts na Fase 0, junto com funções que devolvem dados de exemplo. Os agentes 3 e 4 programam contra ele. Qualquer mudança exige aviso no PEDIDOS.md e aprovação do Agente 1.

ts
// Datas de entrada e saída em ISO 8601 UTC, exceto `data` (AAAA-MM-DD no fuso da barbearia).

// ---- Página pública (consumido pelo Agente 3) ----
listarHorariosLivres(i: { barbeariaId: string; servicoIds: string[]; barbeiroId?: string; data: string })
  : Promise<{ inicio: string; barbeiroId: string }[]>;

criarAgendamento(i: { slug: string; servicoIds: string[]; barbeiroId?: string; inicio: string; nome: string; telefone: string })
  : Promise<AgendamentoResumo>;          // erro: HorarioIndisponivelError

obterPorToken(token: string): Promise<AgendamentoResumo | null>;
cancelarPorToken(token: string): Promise<void>;                       // erro: ForaDoPrazoError
remarcarPorToken(token: string, novoInicio: string): Promise<AgendamentoResumo>;

solicitarAssinatura(i: { slug: string; planoId: string; nome: string; telefone: string }): Promise<void>;

// ---- Painel (consumido pelo Agente 4); barbeariaId vem sempre da sessão ----
agendaDoDia(barbeariaId: string, data: string): Promise<AgendamentoPainel[]>;
agendaDaSemana(barbeariaId: string, dataInicial: string): Promise<AgendamentoPainel[]>;
criarAgendamentoManual(barbeariaId: string, i: { servicoIds: string[]; barbeiroId: string; inicio: string; nome: string; telefone: string }): Promise<AgendamentoResumo>;
alterarStatus(barbeariaId: string, agendamentoId: string, status: 'concluido' | 'nao_compareceu' | 'cancelado', opcoes?: { usarAssinatura?: boolean }): Promise<void>;
remarcarAgendamento(barbeariaId: string, agendamentoId: string, novoInicio: string): Promise<void>;
conflitosDoBloqueio(barbeariaId: string, i: { barbeiroId?: string; inicio: string; fim: string }): Promise<AgendamentoPainel[]>;

ativarAssinatura(barbeariaId: string, assinaturaId: string, validaAte?: string): Promise<void>;
renovarAssinatura(barbeariaId: string, assinaturaId: string): Promise<void>;
cancelarAssinatura(barbeariaId: string, assinaturaId: string): Promise<void>;
assinaturasDaBarbearia(barbeariaId: string): Promise<AssinaturaPainel[]>;   // inclui o status efetivo: pendente, ativa, vencida ou cancelada

// ---- Mensagens de WhatsApp (Agentes 3 e 4) ----
linkWhatsAppBarbearia(a: AgendamentoResumo, whatsappBarbearia: string): string;
linkWhatsAppCliente(a: AgendamentoPainel, tipo: 'lembrete'): string;

Fotos: o Agente 4 entrega a rota GET /api/foto/barbeiro/{id} e GET /api/foto/produto/{id}. O Agente 3 usa essas URLs em <img> e mostra uma inicial do nome quando não houver foto.

5. Agente 1: Fundação, login e integração

Briefing. Você prepara o terreno para os outros três agentes e fecha o projeto no final. Entregue a Fase 0 o mais rápido possível, porque os outros dependem dela. Na Fase 2, você integra tudo e valida os critérios de aceite do MVP.

ID	Tarefa	Entrega e critério de pronto	Req.
A1-01	Criar o repositório e o projeto Next.js	TypeScript estrito, Tailwind, shadcn/ui, ESLint, Prettier e a estrutura de pastas da seção 6.1 do documento de requisitos. README com o passo a passo para rodar. npm run dev abre sem erros.	Stack
A1-02	Criar o banco no Neon	Projeto Neon na região São Paulo, branches main e dev. Script da seção 7.3 salvo em db/schema.sql e executado. Dados de exemplo em db/seed.sql. drizzle-kit pull gera src/db/schema.ts. src/db/index.ts conecta com o driver serverless. .env.example com DATABASE_URL e AUTH_SECRET.	7.1 a 7.4
A1-03	Autenticação do proprietário	Auth.js com Credentials e bcryptjs, sessão JWT com usuarioId e barbeariaId. Função exigirProprietario() que devolve esses dois valores ou redireciona. middleware.ts protege /painel. Bloqueio temporário após 5 tentativas erradas.	RF-03, RF-04
A1-04	Cadastro da barbearia	Página /cadastrar cria barbearia e usuário numa transação, com horário padrão de segunda a sábado, das 09:00 às 19:00. Valida o formato do slug e a unicidade. Reserva os slugs painel, api, gestao, entrar, cadastrar, _next. Página /entrar.	RF-01, RF-02, RN-01
A1-05	Helpers compartilhados e deploy	src/lib/: resolver barbearia por slug, formatação de moeda e telefone, conversão de datas entre UTC e o fuso da barbearia, esquemas Zod base. Projeto na Vercel com variáveis de ambiente e preview por branch. GitHub Actions rodando lint, typecheck e vitest.	RN-07
A1-06	Revisão e merge dos pull requests	Revisar cada PR contra o documento de requisitos, a seção 2 deste plano e o contrato. Garantir que nenhuma consulta esqueça o filtro por barbearia_id.	RF-04
A1-07	Integração e testes finais (Fase 2)	Percorrer os 8 critérios de aceite da seção 10 do documento de requisitos e registrar o resultado em QA.md. Criar um script que dispara dois agendamentos simultâneos no mesmo horário e confirma que só um é aceito.	Seção 10
A1-08	Backup e documentação	Script de pg_dump e instruções no README para exportar o banco toda semana. Documentar como criar uma nova barbearia pelo painel e como suspender uma pelo console do Neon.	Seção 8

Pronto quando: os outros agentes conseguem clonar o repositório, rodar o projeto, entrar como proprietário e acessar o banco, e o QA.md mostra os 8 critérios de aceite aprovados.

6. Agente 2: Motor de agenda

Briefing. Você é dono de toda a regra de negócio no servidor. Nada de tela. As funções devem seguir o contrato da seção 4 e ser seguras: validar entrada, usar transações e nunca confiar no que vem do navegador. A qualidade do cálculo de horários e a proteção contra conflito são a parte mais crítica do projeto.

ID	Tarefa	Entrega e critério de pronto	Req.
A2-01	Publicar o contrato (Fase 0)	src/server/contratos.ts com os tipos e as assinaturas da seção 4, mais funções que devolvem dados de exemplo para destravar os agentes 3 e 4. Pronto em até um dia.	Contrato
A2-02	Cálculo de horários livres	Função pura que recebe expediente, bloqueios, agendamentos, duração, intervalo, antecedência mínima e janela máxima, e devolve os horários livres. Cobre pausa de almoço, serviço de 60 minutos, bloqueio parcial, folga do barbeiro, fechamento da barbearia, horário já passado e fuso. Pelo menos 12 testes no Vitest. Depois, a função listarHorariosLivres que busca os dados no banco e chama a função pura.	RF-22, RN-07
A2-03	Criar agendamento	Em uma transação: normaliza o telefone, cria ou reaproveita o cliente por (barbearia_id, telefone), copia nome, preço e duração dos serviços para agendamento_servicos, calcula o fim e grava com o token_gestao. Para Qualquer barbeiro, escolhe um barbeiro com o horário livre e menos atendimentos no dia. Se o banco recusar por sem_conflito_barbeiro (erro 23P01), lança HorarioIndisponivelError.	RF-21, RF-23, RF-40, RN-02, RN-03, RN-05
A2-04	Gestão pelo link	obterPorToken, cancelarPorToken e remarcarPorToken. O cancelamento e a remarcação respeitam a antecedência da barbearia (ForaDoPrazoError). A remarcação revalida o horário.	RF-25, RN-06
A2-05	Operações do painel	agendaDoDia, agendaDaSemana, criarAgendamentoManual, alterarStatus, remarcarAgendamento e conflitosDoBloqueio. Todas recebem barbeariaId e só enxergam dados dele.	RF-30 a RF-34
A2-06	Assinaturas	solicitarAssinatura cria o cliente (se preciso) e a assinatura pendente. ativarAssinatura define a validade (por padrão, hoje mais 30 dias). renovarAssinatura soma 30 dias a partir da maior entre a validade atual e hoje, e zera os usos. cancelarAssinatura. Abatimento de uso dentro de alterarStatus com usarAssinatura, só para assinatura ativa, não vencida e abaixo do limite. assinaturasDaBarbearia devolve o status efetivo, incluindo vencida.	RF-52 a RF-56, RN-08, RN-09
A2-07	Links de WhatsApp	linkWhatsAppBarbearia e linkWhatsAppCliente geram links wa.me com mensagem em português, já codificada. O número é normalizado com o código do país.	RF-24, RF-35
A2-08	Testes de concorrência e documentação	Teste que dispara dois criarAgendamento ao mesmo tempo no mesmo horário e confirma que só um passa. src/server/LEIAME.md descrevendo cada função, os erros que lança e exemplos de uso.	RF-23

Pronto quando: todas as funções do contrato estão implementadas, a suíte do Vitest passa e os agentes 3 e 4 trocam os dados de exemplo pelas funções reais sem alterar o próprio código.

7. Agente 3: Página pública e PWA

Briefing. Você constrói tudo o que o cliente vê, pensado primeiro para celular. O cliente nunca cria conta: ele agenda em 3 telas e recebe um link para cancelar ou remarcar. Use as funções do contrato (com dados de exemplo no começo) e o documento de requisitos como guia de telas. Simplicidade é o critério principal.

ID	Tarefa	Entrega e critério de pronto	Req.
A3-01	Layout da página pública	src/app/[slug]/layout: nome da barbearia no topo e barra fixa com Agendar, Serviços, Equipe, Planos e Produtos. A aba Planos só aparece se assinaturas_ativas for verdadeiro. Página amigável para slug inexistente ou barbearia inativa.	RF-02, RF-20, RF-50
A3-02	Serviços, Equipe e Produtos	Três páginas de consulta. Serviços com preço e duração. Equipe com cartões de foto e nome, usando /api/foto/barbeiro/{id} e a inicial do nome quando não houver foto. Produtos em vitrine com foto e preço. Só itens ativos.	RF-20
A3-03	Fluxo Agendar em 3 passos	Passo 1: serviços (um ou mais) e barbeiro, com a opção Qualquer barbeiro. Passo 2: próximos 7 dias respeitando a janela máxima e a grade de horários livres, com estado de carregamento e mensagem quando não há vaga. Passo 3: resumo, nome e telefone com validação. Se vier HorarioIndisponivelError, volta ao passo 2 com aviso.	RF-21, RF-22, RF-26
A3-04	Tela de confirmação	Resumo do agendamento, botão que abre o WhatsApp da barbearia com a mensagem pronta e o link de gestão visível, com botão de copiar.	RF-24
A3-05	Página de gestão	src/app/gestao/[token]: mostra o agendamento, permite cancelar (com confirmação) e remarcar (reutilizando a grade do passo 2). Quando estiver fora do prazo, explica e oferece o botão de WhatsApp.	RF-25, RN-06
A3-06	Planos	Lista de planos com preço e descrição, chave Pix da barbearia com botão de copiar e botão Quero assinar. O formulário pede nome e telefone e termina com a mensagem de que a barbearia entrará em contato.	RF-52
A3-07	PWA	manifest.ts, ícones de 192 e 512 pixels, service worker com Serwist, página offline com mensagem clara, botão Instalar quando o navegador permitir e metatags para iOS.	RF-70, RF-72
A3-08	Acessibilidade e desempenho	Áreas de toque de 44 pixels ou mais, texto de 16 pixels ou mais, contraste adequado, foco visível. Lighthouse mobile com pelo menos 90 em desempenho, acessibilidade e PWA.	RF-71, seção 8

Pronto quando: um cliente completa um agendamento pelo celular em até 3 telas, cancela pelo link, instala o aplicativo na tela inicial e o Lighthouse atinge as metas.

8. Agente 4: Painel do proprietário e fotos

Briefing. Você constrói o painel que o dono da barbearia usa no dia a dia, em um celular. A barra fixa de 5 abas (Hoje, Agenda, Cadastros, Clientes, Ajustes) é a navegação inteira: nada de menus escondidos. Botões grandes, poucas escolhas por tela e confirmação antes de qualquer ação que apague ou cancele. Todas as telas exigem login via exigirProprietario().

ID	Tarefa	Entrega e critério de pronto	Req.
A4-01	Layout do painel	src/app/painel/layout com a barra inferior de 5 abas e o botão Sair. A aba Clientes mostra um contador de assinaturas pendentes.	Seção 3.2
A4-02	Fotos	Componente de upload que reduz a imagem no navegador (cerca de 300 por 300 pixels, WebP, até 100 KB). Ação de servidor que valida tipo e tamanho e grava em foto_dados e foto_tipo. Rota GET /api/foto/[tipo]/[id] (barbeiro ou produto) com Cache-Control e ETag, sem exigir login, devolvendo 404 sem foto.	RF-12
A4-03	Cadastros	Em Cadastros, quatro listas com botão Adicionar, editar e inativar (nunca excluir): Serviços (com ordem), Barbeiros (com foto), Produtos (com foto) e Planos (com limite de usos ou ilimitado). Validação com Zod.	RF-10, RF-11, RF-13, RF-51, RN-04
A4-04	Ajustes	Dados da barbearia, WhatsApp e chave Pix. Horário de funcionamento por dia, com mais de uma faixa para pausa de almoço. Intervalo da agenda e antecedência mínima. Chave liga e desliga de assinaturas. Link público com botão de copiar e QR code.	RF-05, RF-14, RF-16, RF-50
A4-05	Aba Hoje	Agenda do dia agrupada por barbeiro, com botões grandes para Concluir, Faltou e Cancelar. Ao concluir, caixa Usar assinatura quando o cliente tem uma ativa. Botão + para agendamento manual. Botão de WhatsApp com lembrete para o cliente.	RF-30, RF-32 a RF-35
A4-06	Aba Agenda	Visão da semana e remarcação. Lista de bloqueios com criar e remover (folga de barbeiro ou fechamento da barbearia). Ao criar um bloqueio, mostrar os agendamentos que ficam em conflito, usando conflitosDoBloqueio.	RF-15, RF-31, RF-34
A4-07	Aba Clientes e assinaturas	Lista com busca por nome ou telefone, histórico e campo de observações. Apagar os dados do cliente, com confirmação. Assinaturas pendentes em destaque com Ativar (data de validade editável), e botões Renovar e Cancelar nas demais. Mostra o status efetivo, inclusive Vencida.	RF-41, RF-42, RF-52 a RF-56
A4-08	Acabamento	Estados vazios com orientação (por exemplo, Cadastre seu primeiro serviço), mensagens de erro em português, confirmação em ações destrutivas e layout aceitável em tela de computador.	RF-71

Pronto quando: um proprietário novo consegue, só pelo painel, cadastrar serviços, barbeiros com foto, produtos e planos, definir o expediente, acompanhar a agenda do dia e gerenciar uma assinatura do início ao fim.

9. Quadro de dependências
Quem espera	Do quê	Para fazer
Agentes 2, 3 e 4	A1-01 a A1-05	Rodar o projeto, acessar o banco e usar login e helpers.
Agentes 3 e 4	A2-01	Programar contra o contrato.
Agente 3	A4-02	Mostrar fotos reais de barbeiros e produtos.
Agente 4	A2-05 e A2-06	Trocar os dados de exemplo da agenda e das assinaturas pelas funções reais.
Agente 1	Todos os PRs	Integração e testes finais.