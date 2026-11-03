import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { z } from "zod";

export const fusoHorarioSchema = z.string().min(1);

export function dataLocalParaUtc(dataHoraLocal: string, fusoHorario: string) {
  return fromZonedTime(dataHoraLocal, fusoHorario);
}

export function dataUtcParaLocal(dataUtc: Date, fusoHorario: string) {
  return toZonedTime(dataUtc, fusoHorario);
}

export function formatarDataNoFuso(dataUtc: Date, formato: string, fusoHorario: string) {
  return formatInTimeZone(dataUtc, fusoHorario, formato);
}
