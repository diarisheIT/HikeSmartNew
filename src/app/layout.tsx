import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HikeSmart - Hong Kong Trail Finder",
  description:
    "AI-powered hiking trail recommendations for Hong Kong with real-time weather data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${jakarta.variable} min-h-screen bg-forest-900 text-cream-50 antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
