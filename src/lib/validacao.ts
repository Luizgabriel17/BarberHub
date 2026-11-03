import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens.");

export const telefoneSchema = z
  .string()
  .trim()
  .min(10)
  .max(20)
  .regex(/^[+\d() .-]+$/, "Informe um telefone válido.");

export const dinheiroSchema = z.coerce.number().finite().min(0);
