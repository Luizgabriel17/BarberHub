import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET ?? "development-secret",
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/painel")) {
        return Boolean(auth?.user?.barbeariaId);
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.barbeariaId = user.barbeariaId;
      }

      return token;
    },
    session({ session, token }) {
      if (
        session.user &&
        typeof token.sub === "string" &&
        typeof token.barbeariaId === "string"
      ) {
        session.user.id = token.sub;
        session.user.barbeariaId = token.barbeariaId;
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
