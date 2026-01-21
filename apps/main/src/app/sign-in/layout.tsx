import { Metadata } from "next";

// PERFORMANCE: Preconnect to external resources for faster loading
export const metadata: Metadata = {
  other: {
    "link:preconnect:unsplash": "https://images.unsplash.com",
    "link:dns-prefetch:unsplash": "https://images.unsplash.com",
    "link:preconnect:wikimedia": "https://upload.wikimedia.org",
    "link:dns-prefetch:wikimedia": "https://upload.wikimedia.org",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* PERFORMANCE: Preconnect hints for external resources */}
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://upload.wikimedia.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
      <div className="fixed inset-0 z-50 bg-[#0f0f1a]">
        {children}
      </div>
    </>
  );
}
