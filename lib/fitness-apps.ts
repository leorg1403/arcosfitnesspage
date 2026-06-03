// Apps de fitness con las que un visitante puede acceder a una clase SIN cobro
// (su pase lo cubre): TotalPass, Fitpass, Wellhub. Es OPCIONAL en una reserva —
// solo se registra cuando el cliente declara que viene de una de estas apps.
//
// Isomórfico (sin deps de servidor): lo usan el formulario (cliente), la Server
// Action (servidor) y el panel de recepción. Los `value` DEBEN coincidir uno a
// uno con el enum `FitnessApp` de prisma/schema.prisma.

export const FITNESS_APPS = [
  { value: "totalpass", label: "TotalPass" },
  { value: "fitpass", label: "Fitpass" },
  { value: "wellhub", label: "Wellhub" },
] as const;

export type FitnessAppValue = (typeof FITNESS_APPS)[number]["value"];

// Tupla de literales para `z.enum(...)` (debe tener ≥1 elemento).
export const FITNESS_APP_VALUES = ["totalpass", "fitpass", "wellhub"] as const satisfies readonly [
  FitnessAppValue,
  ...FitnessAppValue[],
];

export const FITNESS_APP_LABEL: Record<FitnessAppValue, string> = {
  totalpass: "TotalPass",
  fitpass: "Fitpass",
  wellhub: "Wellhub",
};

/** Etiqueta legible para un valor que viene de BD (puede ser null/desconocido). */
export function fitnessAppLabel(value?: string | null): string | null {
  if (!value) return null;
  return FITNESS_APP_LABEL[value as FitnessAppValue] ?? value;
}
