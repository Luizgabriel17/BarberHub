import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Defina DATABASE_URL antes de executar o Drizzle Kit.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
