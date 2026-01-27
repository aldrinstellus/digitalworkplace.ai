import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TrackingWrapper } from "@/components/providers/TrackingWrapper";
import { SessionProvider } from "@/contexts/SessionContext";
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
  title: "dCQ Chatbot | Chat Core IQ",
  description: "AI-powered chatbot platform - Part of Digital Workplace AI",
  icons: {
    icon: "/dcq/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <TrackingWrapper>
            {children}
          </TrackingWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
