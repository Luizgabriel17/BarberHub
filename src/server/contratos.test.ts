import { describe, expect, it } from "vitest";
import { calcularHorariosLivres } from "./contratos";

describe("calcularHorariosLivres", () => {
  const baseInput = {
    data: "2026-11-03",
    expediente: [{ abre: "09:00", fecha: "19:00" }],
    bloqueios: [],
    agendamentos: [],
    barbeiros: ["barbeiro-1", "barbeiro-2"],
    servicoDuracaoMin: 60,
    intervaloMin: 30,
    antecedenciaMinMinutos: 30,
    janelaMaxDias: 7,
    agora: new Date("2026-11-02T08:00:00-03:00"),
    fusoHorario: "America/Sao_Paulo",
  };

  it("retorna horários dentro do expediente e respeita duracao", () => {
    const horarios = calcularHorariosLivres(baseInput);
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios[0]).toContain("2026-11-03T09:00:00-03:00");
  });

  it("descarta horários antes da antecedência mínima", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      agora: new Date("2026-11-03T09:15:00-03:00"),
    });
    expect(horarios.some((slot) => slot.includes("2026-11-03T12:30:00.000Z"))).toBe(false);
  });

  it("remove horários em bloqueios de barbeiro", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      bloqueios: [{ barbeiroId: "barbeiro-1", inicio: "2026-11-03T10:00:00-03:00", fim: "2026-11-03T11:00:00-03:00" }],
    });
    expect(horarios.some((slot) => slot.includes("2026-11-03T13:00:00.000Z"))).toBe(false);
  });

  it("remove horários em bloqueio da barbearia inteira", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      bloqueios: [{ inicio: "2026-11-03T12:00:00-03:00", fim: "2026-11-03T13:00:00-03:00" }],
    });
    expect(horarios.some((slot) => slot.includes("2026-11-03T15:30:00.000Z"))).toBe(false);
  });

  it("remove horários conflitantes com agendamentos existentes", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      agendamentos: [{ barbeiroId: "barbeiro-1", inicio: "2026-11-03T09:00:00-03:00", fim: "2026-11-03T10:00:00-03:00" }],
    });
    expect(horarios.some((slot) => slot.includes("2026-11-03T12:30:00.000Z"))).toBe(false);
  });

  it("filtra para um barbeiro específico", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      barbeiroId: "barbeiro-2",
    });
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios.every((slot) => !slot.includes("barbeiro-"))).toBe(true);
  });

  it("retorna vazio quando não há expediente", () => {
    const horarios = calcularHorariosLivres({ ...baseInput, expediente: [] });
    expect(horarios).toEqual([]);
  });

  it("não retorna horários fora da janela máxima", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      data: "2027-01-01",
      agora: new Date("2026-11-02T08:00:00-03:00"),
    });
    expect(horarios).toEqual([]);
  });

  it("respeita pausa de almoço representada por duas faixas de expediente", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      expediente: [
        { abre: "09:00", fecha: "12:00" },
        { abre: "13:00", fecha: "19:00" },
      ],
    });
    expect(horarios.some((slot) => slot.includes("2026-11-03T12:30"))).toBe(false);
    expect(horarios.some((slot) => slot.includes("2026-11-03T13:00"))).toBe(true);
  });

  it("ignora slots que não cabem no expediente final", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      servicoDuracaoMin: 90,
      expediente: [{ abre: "09:00", fecha: "09:30" }],
    });
    expect(horarios).toEqual([]);
  });

  it("respeita intervalo de 60 minutos", () => {
    const horarios = calcularHorariosLivres({
      ...baseInput,
      intervaloMin: 60,
      agora: new Date("2026-11-02T08:00:00-03:00"),
    });
    expect(horarios[0]).toContain("2026-11-03T09:00");
    expect(horarios.some((slot) => slot.includes("2026-11-03T09:30"))).toBe(false);
  });

  it("retorna horários em diferentes barbeiros sem duplicar", () => {
    const horarios = calcularHorariosLivres(baseInput);
    expect(horarios.length).toBeGreaterThan(0);
    expect(new Set(horarios).size).toBeGreaterThan(0);
  });
});
