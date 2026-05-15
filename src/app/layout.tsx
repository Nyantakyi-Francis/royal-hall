import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royal Hall (Hall 1)",
  description: "MTCE Hall 1 DBMS — Royal Hall room allocation and logistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(59,130,246,0.12),transparent_50%),linear-gradient(to_bottom,rgba(255,255,255,0.96),rgba(255,255,255,0.9))] text-black">
        <SiteHeader />

        <main className="flex flex-1 flex-col">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}
