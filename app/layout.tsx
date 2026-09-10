import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tracehire | Evidence-first Recruiting",
  description: "Review the evidence behind every application. Agentic screening, candidate comparisons, and a persistent HR workspace.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
