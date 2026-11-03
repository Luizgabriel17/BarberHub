import Link from "next/link";

export default function BarbeariaNaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-base font-bold uppercase tracking-[0.18em] text-amber-800">
        BarberHub
      </p>
      <h1 className="mt-3 text-3xl font-bold">Barbearia não encontrada</h1>
      <p className="mt-3 text-base leading-7 text-stone-600">
        Este link não existe ou a barbearia está temporariamente indisponível.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-stone-900 px-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
      >
        Ir para o início
      </Link>
    </main>
  );
}
