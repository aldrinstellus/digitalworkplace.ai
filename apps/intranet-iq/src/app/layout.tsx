import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "dIQ - Intranet IQ",
    template: "%s | dIQ",
  },
  description: "AI-powered internal knowledge network - Enterprise search, AI assistant, and knowledge management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen bg-[#0a0a0f]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
