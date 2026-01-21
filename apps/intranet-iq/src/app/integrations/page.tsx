"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/integrations");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)] flex items-center justify-center">
      <div className="text-[var(--text-muted)]">Redirecting to Integrations Hub...</div>
    </div>
  );
}
