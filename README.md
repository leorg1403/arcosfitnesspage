This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Correo (Resend) — `info@arcosfitness.com`

El remitente oficial del cliente es **info@arcosfitness.com**. En Resend no “creas” el buzón ahí: conectas el **dominio** del correo y luego envías con esa dirección como `From`.

### Dominio que debes verificar en Resend

- En Resend → **Domains** → **Add domain**: **`arcosfitness.com`** (la parte después de `@` en `info@arcosfitness.com`).
- Cuando el dominio quede **Verified**, en `.env` / hosting puedes usar por ejemplo:
  - `FROM_EMAIL=Arcos Fitness <info@arcosfitness.com>`
  - `OWNER_EMAIL=info@arcosfitness.com` (u otra bandeja interna; ver `lib/email.ts`).

### DNS sin tener la web hosteada

Verificar el dominio en Resend **no depende** de dónde esté la página (Vercel, etc.). Los registros DKIM/SPF que pide Resend van en el **DNS del dominio** (donde estén apuntando las NS de `arcosfitness.com`: Cloudflare, GoDaddy, el registrador, etc.). Puedes hacerlo **antes** de publicar el sitio.

### Pruebas sin dominio propio verificado

Sí, con limitaciones típicas de Resend:

1. Pon `RESEND_API_KEY` en `.env.local` (clave real, no placeholder).
2. Deja el remitente por defecto del proyecto (`Arcos Fitness <onboarding@resend.dev>` en `lib/email.ts` si no defines `FROM_EMAIL`) **o** el que indique la documentación actual de Resend para entorno de prueba.
3. Resend suele permitir envíos de prueba solo hacia **correos autorizados** (por ejemplo el email de tu cuenta o direcciones que añadas como verificadas en el dashboard). Revisa en el panel de Resend la sección de límites / “sandbox” del plan gratuito.

Cuando `arcosfitness.com` esté verificado, cambia `FROM_EMAIL` a `info@arcosfitness.com` y sube las mismas variables al hosting.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
