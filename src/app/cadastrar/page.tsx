import Link from "next/link";
import { cadastrarBarbearia } from "./actions";

type CadastrarPageProps = {
  searchParams: Promise<{ erro?: string }>;
};

export default async function CadastrarPage({ searchParams }: CadastrarPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm font-semibold text-stone-600">
        BarberHub
      </Link>
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Cadastre sua barbearia</h1>
      <p className="mt-2 text-stone-600">
        Crie o acesso do proprietário e escolha o link público da barbearia.
      </p>

      {params.erro && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-900">
          {params.erro === "indisponivel"
            ? "Esse link ou e-mail já está em uso. Escolha outros dados."
            : "Confira os dados. O link deve ter ao menos 3 caracteres e a senha, 8."}
        </p>
      )}

      <form action={cadastrarBarbearia} className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">
          Nome da barbearia
          <input
            name="nomeBarbearia"
            required
            minLength={2}
            maxLength={120}
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <label className="text-sm font-medium">
          Link público
          <span className="mt-2 flex min-h-11 items-center rounded-lg border border-stone-300 pl-3 text-stone-500">
            /
            <input
              name="slug"
              required
              minLength={3}
              maxLength={50}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              autoCapitalize="none"
              className="min-h-11 min-w-0 flex-1 rounded-r-lg px-2 text-base text-stone-900 outline-none"
            />
          </span>
        </label>
        <label className="text-sm font-medium">
          WhatsApp
          <input
            name="whatsapp"
            type="tel"
            required
            maxLength={20}
            placeholder="(11) 99999-0000"
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Endereço (opcional)
          <input
            name="endereco"
            maxLength={240}
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <label className="text-sm font-medium">
          Seu nome
          <input
            name="nomeProprietario"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <label className="text-sm font-medium">
          E-mail
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Senha (8 a 72 caracteres)
          <input
            name="senha"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base"
          />
        </label>
        <button className="min-h-11 rounded-lg bg-stone-900 px-4 font-semibold text-white sm:col-span-2">
          Criar barbearia
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-600">
        Já tem acesso?{" "}
        <Link href="/entrar" className="font-semibold text-stone-900 underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
