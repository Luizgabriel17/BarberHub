import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
        Agendamentos para barbearias
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">BarberHub</h1>
      <p className="mt-5 max-w-xl text-lg text-stone-600">
        Uma base simples para barbearias organizarem seus agendamentos.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/cadastrar"
          className="inline-flex min-h-11 items-center rounded-lg bg-stone-900 px-5 font-semibold text-white"
        >
          Cadastrar barbearia
        </Link>
        <Link
          href="/entrar"
          className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-5 font-semibold"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
