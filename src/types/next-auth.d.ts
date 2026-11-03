import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    barbeariaId: string;
  }

  interface Session {
    user: {
      id: string;
      barbeariaId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    barbeariaId?: string;
  }
}
