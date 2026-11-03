import { barbeariaDemo } from "./dados-demo";

export function dataLocal(data: Date): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: barbeariaDemo.fusoHorario,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);
  const valores = Object.fromEntries(
    partes.map(({ type, value }) => [type, value]),
  );
  return `${valores.year}-${valores.month}-${valores.day}`;
}

export function proximosDias(): string[] {
  const [ano, mes, dia] = dataLocal(new Date()).split("-").map(Number);
  return Array.from(
    { length: Math.min(7, barbeariaDemo.janelaMaxDias) },
    (_, indice) =>
      new Date(Date.UTC(ano, mes - 1, dia + indice)).toISOString().slice(0, 10),
  );
}

export function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: barbeariaDemo.fusoHorario,
  }).format(new Date(`${data}T12:00:00Z`));
}

export function horariosDeDemonstracao(
  data: string,
  duracao: number,
): string[] {
  const hoje = dataLocal(new Date());
  const agora = Date.now();
  const diaSemana = new Date(`${data}T12:00:00Z`).getUTCDay();
  if (diaSemana === 0) return [];

  const horarios: string[] = [];
  for (let minutos = 9 * 60; minutos + duracao <= 19 * 60; minutos += 30) {
    const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
    const instante = new Date(`${data}T${hora}:00-03:00`).getTime();
    if (data !== hoje || instante >= agora + 30 * 60 * 1000)
      horarios.push(hora);
  }
  return horarios;
}

export function chaveAgendamentoDemo(token: string): string {
  return `barberhub:demo:agendamento:${token}`;
}
