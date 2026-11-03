"use client";

import { useState, type FormEvent } from "react";
import { enviarFoto } from "@/app/painel/actions";

type Props = {
  tipo: "barbeiro" | "produto";
  id: string;
};

function criarImagem(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const imagem = new Image();
    imagem.onload = () => {
      URL.revokeObjectURL(url);
      resolve(imagem);
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível abrir esta imagem."));
    };
    imagem.src = url;
  });
}

function exportarWebp(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Não foi possível preparar a imagem."));
      },
      "image/webp",
      qualidade,
    );
  });
}

async function reduzirImagem(file: File): Promise<Blob> {
  const imagem = await criarImagem(file);
  const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
  const x = (imagem.naturalWidth - lado) / 2;
  const y = (imagem.naturalHeight - lado) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;

  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Seu navegador não conseguiu processar a imagem.");

  contexto.drawImage(imagem, x, y, lado, lado, 0, 0, 300, 300);
  for (let qualidade = 0.86; qualidade >= 0.4; qualidade -= 0.1) {
    const blob = await exportarWebp(canvas, qualidade);
    if (blob.size <= 100 * 1024) return blob;
  }

  throw new Error("A imagem ainda ficou maior que 100 KB. Escolha outra foto.");
}

export function UploadFoto({ tipo, id }: Props) {
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    const form = event.currentTarget;
    const input = form.elements.namedItem("foto");
    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) {
      setMensagem("Escolha uma imagem antes de enviar.");
      return;
    }

    setOcupado(true);
    try {
      const foto = await reduzirImagem(input.files[0]);
      const dados = new FormData();
      dados.set("id", id);
      dados.set("tipo", tipo);
      dados.set("foto", foto, "foto.webp");
      const resultado = await enviarFoto(dados);
      if (!resultado.ok) {
        setMensagem(resultado.erro);
        return;
      }

      setMensagem("Foto atualizada.");
      input.value = "";
    } catch (error) {
      setMensagem(
        error instanceof Error ? error.message : "Não foi possível enviar a foto.",
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form className="mt-3 space-y-2" onSubmit={enviar}>
      <label className="block text-sm font-medium">
        Foto (reduzida para WebP de 300 × 300, até 100 KB)
        <input
          className="mt-1 block min-h-12 w-full rounded-lg border border-stone-300 p-2 text-base"
          name="foto"
          type="file"
          accept="image/*"
          required
          disabled={ocupado}
        />
      </label>
      <button
        className="min-h-11 rounded-xl border border-stone-400 px-4 font-semibold hover:bg-stone-50 disabled:opacity-50"
        disabled={ocupado}
        type="submit"
      >
        {ocupado ? "Enviando…" : "Enviar foto"}
      </button>
      {mensagem ? (
        <p className="text-sm text-stone-700" role="status">
          {mensagem}
        </p>
      ) : null}
    </form>
  );
}
