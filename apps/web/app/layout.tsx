import "@/styles/globals.css";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} app-shell`}>{children}</body>
    </html>
  );
}
