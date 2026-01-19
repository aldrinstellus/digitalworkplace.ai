import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 110,
          background: "#0f0f1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          fontFamily: "monospace",
          fontWeight: 500,
          position: "relative",
        }}
      >
        <span style={{ color: "#ffffff", marginRight: 8 }}>d</span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#4ade80",
            marginTop: 45,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
