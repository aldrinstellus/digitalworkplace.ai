"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/integrations");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-white/50">Redirecting to Integrations Hub...</div>
    </div>
  );
}
