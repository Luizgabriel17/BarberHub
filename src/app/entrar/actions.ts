"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { senhaLoginSchema } from "@/lib/validacao";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: senhaLoginSchema,
});

export async function entrar(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/entrar?erro=dados");
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/painel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/entrar?erro=credenciais");
    }

    throw error;
  }
}
