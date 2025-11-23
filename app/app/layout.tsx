import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DigBase - Daily Mining Game",
  description: "Find the hidden gem on a 7x7 grid. Play once daily!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
