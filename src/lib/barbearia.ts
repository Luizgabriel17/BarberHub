import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { barbearias } from "@/db/schema";

export async function resolverBarbeariaPorSlug(slug: string) {
  const [barbearia] = await db
    .select()
    .from(barbearias)
    .where(eq(barbearias.slug, slug))
    .limit(1);

  return barbearia?.ativa ? barbearia : null;
}
