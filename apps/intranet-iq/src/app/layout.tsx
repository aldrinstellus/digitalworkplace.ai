import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { TrackingWrapper } from "@/lib/providers/TrackingWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "dIQ - Intranet IQ",
    template: "%s | dIQ",
  },
  description: "AI-powered internal knowledge network - Enterprise search, AI assistant, and knowledge management",
  icons: {
    icon: "/diq/icon",
    shortcut: "/diq/icon",
    apple: "/diq/icon",
  },
};

// Main app URL for authentication - use environment variable or default to localhost
const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3000";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl={`${mainAppUrl}/sign-in`}
      signUpUrl={`${mainAppUrl}/sign-up`}
      afterSignInUrl="/diq/dashboard"
      afterSignUpUrl="/diq/dashboard"
    >
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen bg-[#0a0a0f]">
          <QueryProvider>
            <TrackingWrapper>
              {children}
            </TrackingWrapper>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
