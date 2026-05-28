export type LeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

// TODO: conectar con base de datos real (Resend Audiences / Airtable / Supabase).
// Por ahora solo simula el envío para que la UI funcione end-to-end.
export async function submitLead(lead: LeadInput): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  console.log("[leads] placeholder submission:", lead);
}
