import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PwaRegister } from "@/components/pwa/pwa-register";

import "./globals.css";

export const metadata: Metadata = {
  title: "MDB Journal",
  description: "Simple portfolio journal and investment tracker for equities, bonds, real estate, and other assets.",
  applicationName: "MDB Journal",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MDB Journal",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08111c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className="font-sans antialiased">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
