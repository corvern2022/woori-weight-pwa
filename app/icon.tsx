import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #63A3FD, #A78BFA)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            background: "#FCD34D",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 90,
          }}>🐥</div>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            background: "#BAE6FD",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 90,
          }}>🐬</div>
        </div>
        <div style={{
          marginTop: 28,
          fontSize: 72,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: -2,
          fontFamily: "sans-serif",
        }}>오리 레인저</div>
      </div>
    ),
    size,
  );
}
