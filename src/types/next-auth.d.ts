import "next-auth";

declare module "next-auth" {
  interface User {
    barbeariaId: string;
  }

  interface Session {
    user: {
      id: string;
      barbeariaId: string;
    } & NonNullable<Session["user"]>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    barbeariaId?: string;
  }
}
