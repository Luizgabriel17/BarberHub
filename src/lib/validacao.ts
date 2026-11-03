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
  .max(20)
  .regex(/^[+\d() .-]+$/, "Informe um telefone válido.")
  .refine((value) => {
    const quantidadeDigitos = value.replace(/\D/g, "").length;
    return quantidadeDigitos >= 10 && quantidadeDigitos <= 15;
  }, "Informe um telefone válido.");

export const dinheiroSchema = z.coerce.number().finite().min(0);

export const senhaSchema = z
  .string()
  .min(8)
  .max(72)
  .refine((senha) => new TextEncoder().encode(senha).length <= 72, "A senha deve ter até 72 bytes.");

export const senhaLoginSchema = z
  .string()
  .min(1)
  .max(72)
  .refine((senha) => new TextEncoder().encode(senha).length <= 72, "Senha inválida.");
