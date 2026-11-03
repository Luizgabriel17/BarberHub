import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { barbeiros, barbearias, produtos } from "@/db/schema";

type Foto = {
  fotoDados: Buffer | null;
  fotoTipo: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tipo: string; id: string }> },
) {
  const { tipo, id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return new NextResponse(null, { status: 404 });
  }

  let foto: Foto | undefined;
  if (tipo === "barbeiro") {
    [foto] = await db
      .select({ fotoDados: barbeiros.fotoDados, fotoTipo: barbeiros.fotoTipo })
      .from(barbeiros)
      .innerJoin(barbearias, eq(barbeiros.barbeariaId, barbearias.id))
      .where(and(eq(barbeiros.id, id), eq(barbeiros.ativo, true), eq(barbearias.ativa, true)))
      .limit(1);
  } else if (tipo === "produto") {
    [foto] = await db
      .select({ fotoDados: produtos.fotoDados, fotoTipo: produtos.fotoTipo })
      .from(produtos)
      .innerJoin(barbearias, eq(produtos.barbeariaId, barbearias.id))
      .where(and(eq(produtos.id, id), eq(produtos.ativo, true), eq(barbearias.ativa, true)))
      .limit(1);
  } else {
    return new NextResponse(null, { status: 404 });
  }

  if (!foto?.fotoDados || foto.fotoTipo !== "image/webp") {
    return new NextResponse(null, { status: 404 });
  }

  const etag = `"${createHash("sha256").update(foto.fotoDados).digest("hex")}"`;
  const headers = {
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    ETag: etag,
    "Content-Type": foto.fotoTipo,
    "Content-Length": String(foto.fotoDados.byteLength),
    "X-Content-Type-Options": "nosniff",
  };

  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  return new NextResponse(new Uint8Array(foto.fotoDados), { headers });
}
