import { ImageResponse } from "next/og";

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
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(14,24,38,1), rgba(7,11,18,1))",
          color: "#e8f4f7",
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          borderRadius: 32,
          border: "6px solid rgba(96, 214, 224, 0.25)",
        }}
      >
        MDB
      </div>
    ),
    size,
  );
}
