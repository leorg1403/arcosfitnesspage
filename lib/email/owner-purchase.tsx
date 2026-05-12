import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type OwnerPurchaseProps = {
  planName: string;
  amountTotal: number; // en centavos
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  sessionId: string;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function OwnerPurchaseEmail(p: OwnerPurchaseProps) {
  return (
    <EmailLayout
      preview={`Nueva compra: ${p.planName} · ${p.customerName}`}
    >
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Nueva compra · {formatMoney(p.amountTotal, p.currency)}
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        {p.planName}
      </Heading>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Cliente
        </Text>
        <Text className="text-[#0A0A0A] text-base font-semibold mt-1 mb-3">
          {p.customerName}
        </Text>
        <Text className="text-[#0A0A0A] text-sm m-0">
          📧{" "}
          <a href={`mailto:${p.customerEmail}`} style={{ color: "#0A0A0A" }}>
            {p.customerEmail}
          </a>
        </Text>
        {p.customerPhone && (
          <Text className="text-[#0A0A0A] text-sm mt-1 mb-0">
            📱{" "}
            <a
              href={`https://wa.me/52${p.customerPhone.replace(/\D/g, "")}`}
              style={{ color: "#0A0A0A" }}
            >
              {p.customerPhone}
            </a>
          </Text>
        )}
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#8A8A88] text-xs leading-relaxed m-0">
        Stripe Session ID: {p.sessionId}
      </Text>
      <Text className="text-[#8A8A88] text-xs mt-2 mb-0 leading-relaxed">
        Activa la membresía y contacta al cliente en las próximas 24h.
      </Text>
    </EmailLayout>
  );
}
