import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Intelligence AI Agent",
  description: "Advanced message analysis, fraud detection, and smart response system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
