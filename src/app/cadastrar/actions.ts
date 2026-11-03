"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { barbearias, horariosFuncionamento, usuarios } from "@/db/schema";
import { telefoneSchema, slugSchema } from "@/lib/validacao";

const cadastroSchema = z.object({
  nomeBarbearia: z.string().trim().min(2).max(120),
  slug: slugSchema,
  whatsapp: telefoneSchema,
  endereco: z.string().trim().max(240),
  nomeProprietario: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  senha: z.string().min(8).max(128),
});

const slugsReservados = new Set([
  "painel",
  "api",
  "gestao",
  "entrar",
  "cadastrar",
  "_next",
]);

export async function cadastrarBarbearia(formData: FormData) {
  const parsed = cadastroSchema.safeParse({
    nomeBarbearia: formData.get("nomeBarbearia"),
    slug: formData.get("slug"),
    whatsapp: formData.get("whatsapp"),
    endereco: formData.get("endereco") ?? "",
    nomeProprietario: formData.get("nomeProprietario"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success || slugsReservados.has(parsed.data.slug)) {
    redirect("/cadastrar?erro=dados");
  }

  const dados = parsed.data;
  const senhaHash = await hash(dados.senha, 12);

  try {
    await db.transaction(async (tx) => {
      const [barbearia] = await tx
        .insert(barbearias)
        .values({
          nome: dados.nomeBarbearia,
          slug: dados.slug,
          whatsapp: dados.whatsapp,
          endereco: dados.endereco || null,
        })
        .returning({ id: barbearias.id });

      if (!barbearia) {
        throw new Error("Não foi possível criar a barbearia.");
      }

      await tx.insert(usuarios).values({
        barbeariaId: barbearia.id,
        nome: dados.nomeProprietario,
        email: dados.email.toLowerCase(),
        senhaHash,
      });

      await tx.insert(horariosFuncionamento).values(
        Array.from({ length: 6 }, (_, index) => ({
          barbeariaId: barbearia.id,
          diaSemana: index + 1,
          abre: "09:00",
          fecha: "19:00",
        })),
      );
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      redirect("/cadastrar?erro=indisponivel");
    }

    throw error;
  }

  redirect("/entrar?cadastro=sucesso");
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  if ("code" in error && error.code === "23505") return true;
  if ("cause" in error) return isUniqueViolation(error.cause);

  return false;
}
