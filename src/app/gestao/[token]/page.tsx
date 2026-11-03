import { GestaoAgendamento } from "@/components/publico/gestao-agendamento";

export default async function GestaoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-950 sm:px-6">
      <GestaoAgendamento token={token} />
    </main>
  );
}
