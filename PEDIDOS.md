# Pedidos de integração

## Agente 3 — página pública e PWA

- **A3-07:** adicionar e configurar Serwist em `package.json` e `next.config.ts` para registrar o service worker e precachear a página offline. Essas alterações estão fora das pastas do Agente 3.
- **A3-07/A3-08:** ajustar `src/app/layout.tsx` para `lang="pt-BR"`; o idioma do documento é definido no layout raiz, fora das pastas do Agente 3.
- **A1-05:** publicar as interfaces dos helpers de resolver barbearia por slug, normalizar telefone e converter datas UTC/fuso, para substituir os helpers de demonstração sem duplicar regras.

## Agente 4 — painel do proprietário e fotos

- **A4-04:** adicionar a dependência `qrcode` ao projeto para gerar o QR code do link público localmente, sem enviar o link da barbearia para um serviço externo. A dependência será usada na tela Ajustes.
