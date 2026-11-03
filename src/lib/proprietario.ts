import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function exigirProprietario() {
  const session = await auth();

  if (!session?.user?.id || !session.user.barbeariaId) {
    redirect("/entrar");
  }

  return {
    usuarioId: session.user.id,
    barbeariaId: session.user.barbeariaId,
  };
}
