"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isInstallPromptEvent(event: Event): event is InstallPromptEvent {
  return "prompt" in event && "userChoice" in event;
}

export function InstallPrompt() {
  const [instalacao, setInstalacao] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setInstalado(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator && navigator.standalone === true),
    );

    const onPrompt = (event: Event) => {
      if (!isInstallPromptEvent(event)) return;
      event.preventDefault();
      setInstalacao(event);
    };
    const onInstalled = () => {
      setInstalado(true);
      setInstalacao(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        setErro("Não foi possível ativar o modo offline neste navegador.");
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function instalar() {
    if (!instalacao) return;
    await instalacao.prompt();
    const escolha = await instalacao.userChoice;
    if (escolha.outcome === "accepted") setInstalado(true);
    setInstalacao(null);
  }

  if (instalado) return null;

  if (instalacao) {
    return (
      <button
        type="button"
        onClick={instalar}
        className="min-h-11 rounded-lg border border-amber-800 px-3 text-base font-semibold text-amber-900 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      >
        Instalar
      </button>
    );
  }

  if (ios) {
    return (
      <p className="max-w-48 text-right text-base leading-6 text-stone-600">
        Para instalar: toque em Compartilhar e em “Adicionar à Tela de Início”.
      </p>
    );
  }

  if (erro) {
    return (
      <p role="status" className="max-w-48 text-right text-base text-stone-600">
        {erro}
      </p>
    );
  }

  return null;
}
