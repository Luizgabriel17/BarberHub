export type BarbeariaPublica = {
  id: string;
  slug: string;
  nome: string;
  whatsapp: string;
  endereco: string;
  chavePix: string;
  fusoHorario: string;
  assinaturasAtivas: boolean;
  ativa: boolean;
  janelaMaxDias: number;
};

export type ServicoPublico = {
  id: string;
  nome: string;
  preco: number;
  duracaoMin: number;
  ativo: boolean;
  descricao: string;
};

export type BarbeiroPublico = {
  id: string;
  nome: string;
  ativo: boolean;
};

export type ProdutoPublico = {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
  descricao: string;
};

export type PlanoPublico = {
  id: string;
  nome: string;
  descricao: string;
  precoMensal: number;
  limiteUsosCiclo: number | null;
  ativo: boolean;
};

export const barbeariaDemo: BarbeariaPublica = {
  id: "barbearia-navalha",
  slug: "navalha",
  nome: "Barbearia Navalha",
  whatsapp: "5511999990000",
  endereco: "São Paulo, SP",
  chavePix: "navalha@barberhub.com.br",
  fusoHorario: "America/Sao_Paulo",
  assinaturasAtivas: true,
  ativa: true,
  janelaMaxDias: 30,
};

export const servicosDemo: ServicoPublico[] = [
  {
    id: "svc-corte",
    nome: "Corte",
    preco: 45,
    duracaoMin: 30,
    ativo: true,
    descricao:
      "Corte feito na tesoura ou máquina, do jeito que combina com você.",
  },
  {
    id: "svc-barba",
    nome: "Barba",
    preco: 35,
    duracaoMin: 30,
    ativo: true,
    descricao: "Acabamento cuidadoso com toalha quente e navalha.",
  },
  {
    id: "svc-combo",
    nome: "Corte + barba",
    preco: 75,
    duracaoMin: 60,
    ativo: true,
    descricao: "Um cuidado completo para sair renovado.",
  },
];

export const barbeirosDemo: BarbeiroPublico[] = [
  { id: "barbeiro-carlos", nome: "Carlos", ativo: true },
  { id: "barbeiro-rafael", nome: "Rafael", ativo: true },
  { id: "barbeiro-mateus", nome: "Mateus", ativo: true },
];

export const produtosDemo: ProdutoPublico[] = [
  {
    id: "pomada-modeladora",
    nome: "Pomada modeladora",
    preco: 45,
    ativo: true,
    descricao: "Fixação média e acabamento natural.",
  },
  {
    id: "oleo-para-barba",
    nome: "Óleo para barba",
    preco: 38,
    ativo: true,
    descricao: "Hidratação e cuidado diário para a barba.",
  },
];

export const planosDemo: PlanoPublico[] = [
  {
    id: "plano-corte",
    nome: "Corte em dia",
    descricao: "Cortes durante o mês para manter o visual sempre alinhado.",
    precoMensal: 99,
    limiteUsosCiclo: 3,
    ativo: true,
  },
  {
    id: "plano-livre",
    nome: "Navalha livre",
    descricao: "Cuidado recorrente com uso ilimitado durante a validade.",
    precoMensal: 149,
    limiteUsosCiclo: null,
    ativo: true,
  },
];

export function buscarBarbearia(slug: string): BarbeariaPublica | null {
  if (slug.toLocaleLowerCase("pt-BR") !== barbeariaDemo.slug) {
    return null;
  }

  return barbeariaDemo;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function normalizarTelefone(telefone: string): string {
  const numero = telefone.replace(/\D/g, "");
  return numero.startsWith("55") ? numero : `55${numero}`;
}

export function linkWhatsApp(
  mensagem: string,
  telefone = barbeariaDemo.whatsapp,
): string {
  return `https://wa.me/${normalizarTelefone(telefone)}?text=${encodeURIComponent(mensagem)}`;
}
