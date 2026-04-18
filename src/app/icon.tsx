import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
            "radial-gradient(circle at top, rgba(38,121,136,0.85), rgba(7,11,18,1) 58%)",
          color: "#e8f4f7",
          fontSize: 150,
          fontWeight: 700,
          letterSpacing: "-0.05em",
        }}
      >
        MDB
      </div>
    ),
    size,
  );
}
