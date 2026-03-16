import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-sage-50 text-sage-900 antialiased`}
      >
        <header className="border-b border-sage-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <h1 className="text-xl font-bold text-sage-800">HikeSmart</h1>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
