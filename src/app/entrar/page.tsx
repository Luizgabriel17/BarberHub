import Link from "next/link";
import { entrar } from "./actions";

type EntrarPageProps = {
  searchParams: Promise<{ erro?: string; cadastro?: string }>;
};

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-sm font-semibold text-stone-600">
        BarberHub
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Entrar no painel</h1>
      <p className="mt-2 text-stone-600">Acesse a gestão da sua barbearia.</p>

      {params.cadastro === "sucesso" && (
        <p className="mt-6 rounded-lg bg-green-50 p-4 text-green-900">
          Barbearia cadastrada. Entre com o e-mail e a senha escolhidos.
        </p>
      )}
      {params.erro && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-900">
          {params.erro === "dados"
            ? "Confira o e-mail e a senha informados."
            : "Não foi possível entrar. Verifique os dados ou tente novamente mais tarde."}
        </p>
      )}

      <form action={entrar} className="mt-8 space-y-5">
        <label className="block text-sm font-medium">
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <label className="block text-sm font-medium">
          Senha
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <button className="min-h-11 w-full rounded-lg bg-stone-900 px-4 font-semibold text-white">
          Entrar
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-600">
        Ainda não tem uma barbearia?{" "}
        <Link className="font-semibold text-stone-900 underline" href="/cadastrar">
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
