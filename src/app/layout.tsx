import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberHub",
  description: "Agendamentos simples para barbearias.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
