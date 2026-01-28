"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useOrganizationList } from "@clerk/nextjs";
import { motion } from "framer-motion";

function TasksContent() {
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const { isLoaded: orgListLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !orgListLoaded) return;

    const handleRedirect = async () => {
      // If user is authenticated, try to complete the organization task
      if (userId) {
        // Check if user already has an organization membership
        if (userMemberships?.data && userMemberships.data.length > 0) {
          // Set the first organization as active
          try {
            await setActive?.({ organization: userMemberships.data[0].organization.id });
          } catch {
            // Ignore error, continue with redirect
          }
        }

        // Redirect to target URL
        const redirectUrl = searchParams.get("redirect_url");
        const target = redirectUrl ? (() => {
          try {
            return new URL(redirectUrl).pathname || "/dashboard";
          } catch {
            return "/dashboard";
          }
        })() : "/dashboard";

        window.location.href = target;
      } else {
        // Not authenticated, redirect to sign-in
        window.location.href = "/sign-in";
      }
    };

    handleRedirect().catch((err) => {
      console.error("Task redirect error:", err);
      setError("Unable to complete sign-in. Please try again.");
    });
  }, [isLoaded, orgListLoaded, userId, userMemberships, setActive, searchParams]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f0f1a]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full"
      />
      {error && (
        <p className="mt-4 text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}

export default function SignInTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#0f0f1a]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full"
          />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
