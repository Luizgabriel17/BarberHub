# BarberHub

Base do BarberHub: aplicação Next.js com TypeScript estrito, Tailwind CSS, Neon/PostgreSQL, Drizzle ORM e Auth.js.

## Requisitos

- Node.js 20.9 ou superior
- npm
- Projeto PostgreSQL no Neon

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no Neon, de preferência na região AWS São Paulo (`sa-east-1`).
3. No SQL Editor do Neon, execute `db/schema.sql`. Para dados demonstrativos, execute também `db/seed.sql` em um banco de desenvolvimento.
4. Copie `.env.example` para `.env.local` e informe a connection string com pooling do Neon em `DATABASE_URL`. Gere um segredo para `AUTH_SECRET` com:

   ```bash
   openssl rand -base64 32
   ```

5. Inicie o projeto:

   ```bash
   npm run dev
   ```

   Abra <http://localhost:3000>. O cadastro inicial está em `/cadastrar` e a entrada do proprietário em `/entrar`.

O arquivo `.env.local` contém segredos e não deve ser versionado. `src/db/schema.ts` contém os tipos Drizzle correspondentes ao script SQL. Após criar o banco, use `npm run db:pull` para conferir/regenerar o schema conforme o banco.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação TypeScript |
| `npm test` | Testes Vitest |
| `npm run db:pull` | Importar o schema existente com Drizzle Kit |
| `npm run format:check` | Conferir formatação Prettier |

## Banco e ambientes

Crie uma branch `dev` no Neon para testes; mantenha os dados reais na branch `main`. O script de exemplo cria uma barbearia chamada `navalha`, então execute-o somente em um banco de desenvolvimento ou vazio. Cada barbearia é um tenant e consultas de negócio devem sempre restringir os dados por `barbearia_id`.

Para suspender uma barbearia pelo console do Neon:

```sql
UPDATE barbearias SET ativa = false WHERE slug = 'slug-da-barbearia';
```

Reative-a definindo `ativa = true`. O cadastro inicial do proprietário é feito em `/cadastrar`.

## Backup

Instale o cliente PostgreSQL (`pg_dump`), configure `DATABASE_URL` no ambiente local e execute semanalmente:

```bash
bash scripts/backup-database.sh
```

O script grava um dump SQL com data em `backups/`. Proteja os arquivos e não os envie ao repositório.

## Deploy

Conecte o repositório à Vercel e configure `DATABASE_URL` e `AUTH_SECRET` para Production, Preview e Development. Use uma branch de banco Neon separada nos previews. O plano Hobby da Vercel não permite uso comercial; antes de cobrar pelo serviço, escolha um plano ou hospedagem compatível com os termos de uso.
