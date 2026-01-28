"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
    />
  );
}
