/**
 * Genera el HTML de cada correo transaccional en /templates para previsualización.
 *
 *   bunx tsx scripts/render-emails.tsx
 *
 * Re-ejecutar tras editar cualquier template en lib/email/*.tsx.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { render } from "@react-email/components";

import { ClientPurchaseEmail } from "../lib/email/client-purchase";
import { OwnerPurchaseEmail } from "../lib/email/owner-purchase";
import { ClientReservationEmail } from "../lib/email/client-reservation";
import { OwnerReservationEmail } from "../lib/email/owner-reservation";
import { OwnerCancellationEmail } from "../lib/email/owner-cancellation";

const OUT_DIR = path.join(__dirname, "..", "templates");

// Datos de ejemplo representativos (mismos shapes que usan los API routes).
const samples = {
  "client-purchase.html": ClientPurchaseEmail({
    customerName: "María González",
    planName: "Membresía Anual Premium",
    amountTotal: 1499900, // centavos → $14,999.00
    currency: "mxn",
  }),
  "owner-purchase.html": OwnerPurchaseEmail({
    planName: "Membresía Anual Premium",
    amountTotal: 1499900,
    currency: "mxn",
    customerName: "María González",
    customerEmail: "maria.gonzalez@example.com",
    customerPhone: "55 9135 0325",
    sessionId: "cs_live_a1B2c3D4e5F6g7H8",
  }),
  "client-reservation.html": ClientReservationEmail({
    customerName: "Carlos Ramírez",
    className: "Hyrox Master Class",
    classDay: "Lunes 9 de junio",
    classTime: "07:00",
    classInstructor: "Coach Andrés",
  }),
  "client-reservation-paid.html": ClientReservationEmail({
    customerName: "Carlos Ramírez",
    className: "Hyrox Master Class",
    classDay: "Lunes 9 de junio",
    classTime: "07:00",
    classInstructor: "Coach Andrés",
    amountPaid: 35000, // $350.00
    currency: "mxn",
  }),
  "owner-reservation.html": OwnerReservationEmail({
    className: "Hyrox Master Class",
    classDay: "Lunes 9 de junio",
    classTime: "07:00",
    classInstructor: "Coach Andrés",
    customerName: "Carlos Ramírez",
    customerEmail: "carlos.ramirez@example.com",
    customerPhone: "55 1234 5678",
    customerMessage: "¿Hay lugar para llevar a un acompañante principiante?",
  }),
  "owner-reservation-paid.html": OwnerReservationEmail({
    className: "Hyrox Master Class",
    classDay: "Lunes 9 de junio",
    classTime: "07:00",
    classInstructor: "Coach Andrés",
    customerName: "Carlos Ramírez",
    customerEmail: "carlos.ramirez@example.com",
    customerPhone: "55 1234 5678",
    amountPaid: 35000,
    currency: "mxn",
  }),
  "client-reservation-cancelable.html": ClientReservationEmail({
    customerName: "Carlos Ramírez",
    className: "Hyrox Master Class",
    classDay: "Lunes 9 de junio",
    classTime: "07:00",
    classInstructor: "Coach Andrés",
    member: true,
    cancelUrl:
      "https://www.arcosfitness.com/clases-reservas?cancel=SAMPLE.TOKEN",
  }),
  "owner-cancellation.html": OwnerCancellationEmail({
    className: "Hyrox Master Class",
    classDay: "Lunes 9 de junio",
    classTime: "07:00",
    customerName: "Carlos Ramírez",
    customerEmail: "carlos.ramirez@example.com",
  }),
} as const;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const [file, element] of Object.entries(samples)) {
    const html = await render(element, { pretty: true });
    await writeFile(path.join(OUT_DIR, file), html, "utf8");
    // eslint-disable-next-line no-console
    console.log(`✓ templates/${file}`);
  }

  // eslint-disable-next-line no-console
  console.log(`\n${Object.keys(samples).length} templates generados en templates/`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
