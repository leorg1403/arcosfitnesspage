This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Package manager

Este proyecto usa **[bun](https://bun.sh)** como gestor de paquetes y runtime. **No uses npm/yarn/pnpm.**

```bash
bun install        # instalar dependencias
bun add <paquete>  # agregar una dependencia
bun run <script>   # correr scripts de package.json
bunx <herramienta> # ejecutar binarios (equivalente a npx)
```

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Correo (Postmark) — `info@arcosfitness.com`

Los 4 correos transaccionales (compra cliente/dueño, reserva cliente/dueño) se envían con **Postmark**. Todo el transporte vive en `lib/email.ts`; los templates son React Email (`lib/email/*.tsx`).

> **¿Por qué Postmark y no Resend?** El DNS de `arcosfitness.com` está en Wix, y Wix **no permite registros MX en subdominios**. Resend exige un MX en `send.` para verificar el dominio → no es viable con DNS en Wix. Postmark verifica solo con **DKIM (TXT)** + Return-Path opcional (**CNAME → `pm.mtasv.net`**), ambos tipos de registro que Wix sí soporta.

### Variables de entorno

```
POSTMARK_API_KEY=<server token de Postmark>
FROM_EMAIL=Arcos Fitness <no-reply@arcosfitness.com>
OWNER_EMAIL=info@arcosfitness.com
```

Sin `POSTMARK_API_KEY` el proyecto corre en **modo demo**: loguea los correos a consola y no envía (útil en local).

### Verificar el dominio en Postmark

1. Postmark → **Sender Signatures / Domains** → agregar `arcosfitness.com`.
2. Copiar el **DKIM (TXT)** y el **Return-Path (CNAME → `pm.mtasv.net`)** al panel **DNS de Wix** (Manage DNS Records). No hace falta ningún MX.
3. El `From` debe ser de un dominio/sender verificado. Verificar el dominio **no depende** de dónde esté hosteada la web.
4. Cuenta nueva de Postmark suele empezar en **aprobación pendiente**: al inicio solo permite enviar a direcciones del propio dominio hasta que Postmark aprueba el envío. El build y el modo demo no se ven afectados.

### Previsualizar los templates

El HTML renderizado de cada correo está en `templates/` (abrir en el navegador). Para regenerarlos tras editar los templates:

```bash
bunx tsx scripts/render-emails.tsx
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
