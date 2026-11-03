export function formatarMoeda(valor: number, moeda = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  }).format(valor);
}

export function normalizarTelefone(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

export function formatarTelefone(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  const nacional = digitos.startsWith("55") ? digitos.slice(2) : digitos;

  if (nacional.length === 11) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 7)}-${nacional.slice(7)}`;
  }

  if (nacional.length === 10) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 6)}-${nacional.slice(6)}`;
  }

  return telefone;
}
