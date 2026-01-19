"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Signing you in...</p>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/sign-in"
        signUpForceRedirectUrl="/sign-in"
      />
    </div>
  );
}
