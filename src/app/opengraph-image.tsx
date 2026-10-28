import { ImageResponse } from "next/og";
import { site } from "@/site.config";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: 72,
          background: "linear-gradient(135deg, #1e1b4b 0%, #3730A3 60%, #4f46e5 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "white",
              color: "#3730A3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>Maa One</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Poora business,</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#F59E0B" }}>ek app mein.</div>
          <div style={{ fontSize: 30, marginTop: 28, color: "#e0e7ff", maxWidth: 900 }}>
            Every website and WhatsApp lead in one inbox. AI drafts the reply in Hindi, Punjabi or English.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#c7d2fe" }}>one.maalabs.in · A Maa Labs product · Built by NaveenCodes</div>
      </div>
    ),
    size,
  );
}
