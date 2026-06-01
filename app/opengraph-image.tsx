import { ImageResponse } from "next/og";

export const alt = "Arcos Fitness Club — Bosques de las Lomas, CDMX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen de Open Graph para compartir en WhatsApp, Instagram, Facebook, etc.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          color: "#F5F4F0",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", letterSpacing: "0.35em", fontSize: 24, color: "#C4A572", textTransform: "uppercase" }}>
          Bosques de las Lomas · CDMX
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 110, fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.04em" }}>
            Arcos Fitness
          </div>
          <div style={{ display: "flex", fontSize: 110, fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.04em", color: "#C4A572" }}>
            Club
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 34, color: "#8A8A88" }}>
          Strength. Recovery. Belonging.
        </div>
      </div>
    ),
    { ...size }
  );
}
