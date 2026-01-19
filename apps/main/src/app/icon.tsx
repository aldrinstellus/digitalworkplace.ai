import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0f0f1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          fontFamily: "monospace",
          fontWeight: 500,
          position: "relative",
        }}
      >
        <span style={{ color: "#ffffff", marginRight: 2 }}>d</span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#4ade80",
            marginTop: 8,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
