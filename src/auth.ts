import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db } from "./db";
import { barbearias, tentativasLogin, usuarios } from "./db/schema";
import { senhaLoginSchema } from "./lib/validacao";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: senhaLoginSchema,
});

async function registrarFalhaDeLogin(email: string) {
  const janelaExpirada = sql`${tentativasLogin.janelaIniciadaEm} < now() - interval '15 minutes'`;
  const tentativasAtualizadas = sql`CASE WHEN ${janelaExpirada} THEN 1 ELSE ${tentativasLogin.tentativas} + 1 END`;

  await db
    .insert(tentativasLogin)
    .values({ email, tentativas: 1 })
    .onConflictDoUpdate({
      target: tentativasLogin.email,
      set: {
        tentativas: tentativasAtualizadas,
        janelaIniciadaEm: sql`CASE WHEN ${janelaExpirada} THEN now() ELSE ${tentativasLogin.janelaIniciadaEm} END`,
        bloqueadoAte: sql`CASE WHEN ${tentativasAtualizadas} >= 5 THEN now() + interval '15 minutes' ELSE ${tentativasLogin.bloqueadoAte} END`,
      },
    });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const [attempt] = await db
          .select({ lockedUntil: tentativasLogin.bloqueadoAte })
          .from(tentativasLogin)
          .where(and(eq(tentativasLogin.email, email), gt(tentativasLogin.bloqueadoAte, new Date())))
          .limit(1);

        if (attempt) return null;

        const [account] = await db
          .select({
            id: usuarios.id,
            barbeariaId: usuarios.barbeariaId,
            nome: usuarios.nome,
            senhaHash: usuarios.senhaHash,
          })
          .from(usuarios)
          .innerJoin(barbearias, eq(usuarios.barbeariaId, barbearias.id))
          .where(
            and(
              eq(usuarios.email, email),
              eq(usuarios.ativo, true),
              eq(barbearias.ativa, true),
            ),
          )
          .limit(1);

        if (!account || !(await compare(parsed.data.password, account.senhaHash))) {
          await registrarFalhaDeLogin(email);
          return null;
        }

        await db.delete(tentativasLogin).where(eq(tentativasLogin.email, email));

        return {
          id: account.id,
          name: account.nome,
          email,
          barbeariaId: account.barbeariaId,
        };
      },
    }),
  ],
});
