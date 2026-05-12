import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";
import { ClientReservationEmail } from "@/lib/email/client-reservation";

export const runtime = "nodejs";

const ReservationSchema = z.object({
  classId: z.string().min(1),
  className: z.string().min(1),
  classDay: z.string().min(1),
  classTime: z.string().min(1),
  classInstructor: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ReservationSchema.parse(body);

    const ownerProps = {
      className: data.className,
      classDay: data.classDay,
      classTime: data.classTime,
      classInstructor: data.classInstructor,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone || undefined,
      customerMessage: data.message || undefined,
    };

    const clientProps = {
      customerName: data.name,
      className: data.className,
      classDay: data.classDay,
      classTime: data.classTime,
      classInstructor: data.classInstructor,
    };

    // Enviar en paralelo: al dueño + al cliente
    await Promise.all([
      sendEmail({
        to: OWNER_EMAIL,
        subject: `Nueva reserva · ${data.className} · ${data.classDay} ${data.classTime}`,
        react: OwnerReservationEmail(ownerProps),
        replyTo: data.email,
      }),
      sendEmail({
        to: data.email,
        subject: `Tu reserva en Arcos: ${data.className} · ${data.classDay}`,
        react: ClientReservationEmail(clientProps),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validación", details: err.flatten() },
        { status: 400 }
      );
    }
    // eslint-disable-next-line no-console
    console.error("[/api/reservations] error:", err);
    return NextResponse.json(
      { ok: false, error: "Error al procesar la reserva" },
      { status: 500 }
    );
  }
}
