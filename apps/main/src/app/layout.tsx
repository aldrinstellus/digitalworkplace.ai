import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Workplace AI",
  description: "Your AI-powered digital workplace solution",
};

// CRITICAL: Viewport must be exported separately for responsive design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* PERFORMANCE: Preconnect to external domains for faster resource loading */}
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
          <link rel="preconnect" href="https://clerk.digitalworkplace.ai" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://clerk.digitalworkplace.ai" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
