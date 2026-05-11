"use client";

import { useOrganization } from "@clerk/nextjs";

/**
 * Renders the active Clerk organization name (or a generic fallback). Lives in
 * its own client component so we can call `useOrganization` strictly inside
 * a `isSignedIn`-gated branch in the parent — Clerk emits a console warning
 * when the hook is invoked without an active session, and gating the parent
 * render via this child avoids that warning entirely.
 */
function ActiveOrgName() {
  const { organization } = useOrganization();
  return <>{organization?.name || "Your Organization"}</>;
}

export function OrgNameInline({ isSignedIn }: { isSignedIn: boolean }) {
  if (!isSignedIn) return <>Your Organization</>;
  return <ActiveOrgName />;
}
