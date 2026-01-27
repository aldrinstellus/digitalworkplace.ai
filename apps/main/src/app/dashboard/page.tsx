"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getUserByEmail, syncUserWithClerk, UserData } from "@/lib/userRole";

// Product URLs - local vs production
const getProductUrl = (localUrl: string, prodUrl: string) => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return localUrl;
  }
  return prodUrl;
};

// Product data - 4 core products with rich theming
const products = [
  {
    id: 1,
    name: "Support IQ",
    title: "AI Support",
    description: "Intelligent customer support automation",
    localHref: "http://localhost:3003/dsq/demo/cor",
    prodHref: "https://dsq.digitalworkplace.ai/dsq/demo/cor",
    disabled: false,
    colors: {
      primary: "#10b981",
      secondary: "#06b6d4",
      glow: "rgba(16, 185, 129, 0.4)",
    },
  },
  {
    id: 2,
    name: "Intranet IQ",
    title: "AI Intranet",
    description: "Smart internal knowledge network",
    localHref: "http://localhost:3001/diq/dashboard",
    prodHref: "https://intranet-iq.vercel.app/diq/dashboard",
    disabled: false,
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      glow: "rgba(59, 130, 246, 0.4)",
    },
  },
  {
    id: 3,
    name: "Chat Core IQ",
    title: "AI Chat Bot",
    description: "Conversational AI for your business",
    localHref: "http://localhost:3002/dcq/Home/index.html",
    prodHref: "https://chat-core-iq.vercel.app/dcq/Home/index.html",
    disabled: false,
    colors: {
      primary: "#a855f7",
      secondary: "#ec4899",
      glow: "rgba(168, 85, 247, 0.4)",
    },
  },
  {
    id: 4,
    name: "Test Pilot IQ",
    title: "AI Testing",
    description: "Automated QA & testing intelligence",
    localHref: "#",
    prodHref: "#",
    disabled: true, // Coming soon
    colors: {
      primary: "#f59e0b",
      secondary: "#ef4444",
      glow: "rgba(245, 158, 11, 0.4)",
    },
  },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    // Middleware handles auth redirect, but keep this as fallback
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    // Sync user data in background (non-blocking)
    const syncUser = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      // Sync returns the user data, no need for second call
      const data = await syncUserWithClerk(
        user.primaryEmailAddress.emailAddress,
        user.id,
        user.fullName || undefined,
        user.imageUrl || undefined
      );

      if (data) {
        setUserData(data);
      }
    };

    if (user) {
      syncUser();
    }
  }, [user, isLoaded, router]);

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" });
  };

  // Only show loading for Clerk initialization, not Supabase sync
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-green-500/20 border-t-green-500 rounded-full"
        />
      </div>
    );
  }

  // If Clerk loaded but no user, middleware should redirect (show nothing briefly)
  if (!user) {
    return null;
  }

  const isSuperAdmin = userData?.role === "super_admin";

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f1a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <span className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight">
                <span className="text-white/60">digital</span>
                <span className="text-white">workplace</span>
                <span className="text-green-400">.ai</span>
              </span>
            </motion.div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Badge - Admin or User */}
              {isSuperAdmin ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push("/admin")}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-white/5 hover:border-white/10 rounded-lg transition-all"
                >
                  <span className="text-xs">👑</span>
                  <span className="text-white/70 text-sm font-medium">Admin</span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] border border-cyan-500/20 rounded-lg"
                >
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span className="text-cyan-400/90 text-sm font-medium">ATC User</span>
                </motion.div>
              )}

              {/* User Avatar */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center p-0.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {user?.imageUrl && !avatarError ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="w-8 h-8 rounded-lg border border-white/10 object-cover"
                      onError={() => setAvatarError(true)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/70 font-medium text-sm">
                      {user?.firstName?.[0] || "U"}
                    </div>
                  )}
                </motion.button>

                {/* Dropdown Menu - Matching card style */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-52 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-white/90 font-medium text-sm truncate">{user?.fullName}</p>
                      <p className="text-white/40 text-xs truncate">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => router.push("/admin")}
                          className="w-full px-3 py-2.5 text-left text-sm text-white/60 hover:text-white/90 hover:bg-white/5 flex items-center gap-2 md:hidden transition-colors"
                        >
                          <span className="text-xs">👑</span>
                          Admin
                        </button>
                        <button
                          onClick={() => router.push("/analytics")}
                          className="w-full px-3 py-2.5 text-left text-sm text-white/60 hover:text-white/90 hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2.5 text-left text-sm text-white/60 hover:text-white/90 hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Products Page */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl sm:text-2xl font-semibold text-white">
            Welcome back, {user?.firstName || "there"}
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            Your AI-powered workspace products
          </p>
        </motion.div>

        {/* Products Grid - 4 cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} userId={user?.id} />
          ))}
        </motion.div>
      </main>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}

// Spectacular Animated Illustrations for each product - All animations loop continuously
const ProductIllustrations = {
  // AI Support - Headset with sound waves and chat bubbles
  support: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 250" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="support-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="support-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
        </linearGradient>
        <filter id="support-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background circles - always pulsing */}
      <motion.circle cx="240" cy="60" r="80" fill="url(#support-grad-2)"
        animate={{
          scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isHovered ? [0.4, 0.6, 0.4] : [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx="60" cy="200" r="50" fill="url(#support-grad-2)"
        animate={{ scale: isHovered ? [1, 1.15, 1] : [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
      />

      {/* Headset - subtle pulse */}
      <g filter={isHovered ? "url(#support-glow)" : undefined}>
        <motion.path
          d="M200 50 C200 30, 240 30, 240 50 L240 80 C240 90, 230 95, 220 95 L220 50 C220 45, 225 40, 230 40 C235 40, 240 45, 240 50"
          fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"
          animate={{
            pathLength: isHovered ? 1 : 0.85,
            opacity: isHovered ? 1 : [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse cx="205" cy="85" rx="12" ry="18" fill="#10b981"
          animate={{
            scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
            fillOpacity: isHovered ? [0.6, 0.8, 0.6] : [0.3, 0.45, 0.3]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse cx="255" cy="85" rx="12" ry="18" fill="#06b6d4"
          animate={{
            scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
            fillOpacity: isHovered ? [0.6, 0.8, 0.6] : [0.3, 0.45, 0.3]
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
        />
      </g>

      {/* Sound waves - always animating */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${270 + i * 15} 70 Q${280 + i * 15} 85, ${270 + i * 15} 100`}
          fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"
          animate={{
            pathLength: isHovered ? [0, 1, 0] : [0, 0.6, 0],
            opacity: isHovered ? [0, 0.8, 0] : [0, 0.4, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* Chat bubbles - always floating */}
      <motion.g
        animate={{ y: isHovered ? [0, -8, 0] : [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.rect x="40" y="60" width="60" height="40" rx="8" fill="#10b981"
          animate={{ fillOpacity: isHovered ? [0.4, 0.6, 0.4] : [0.15, 0.25, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="55" cy="80" r="4" fill="#fff"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.circle cx="70" cy="80" r="4" fill="#fff"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.circle cx="85" cy="80" r="4" fill="#fff"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
        <motion.polygon points="50,100 60,100 55,115" fill="#10b981"
          animate={{ fillOpacity: isHovered ? [0.4, 0.6, 0.4] : [0.15, 0.25, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.g>

      {/* Floating dots - always animating */}
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={i}
          cx={50 + i * 30}
          cy={150 + (i % 3) * 20}
          r={isHovered ? 3 : 2}
          fill="#10b981"
          animate={{
            y: isHovered ? [0, -15, 0] : [0, -8, 0],
            opacity: isHovered ? [0.3, 1, 0.3] : [0.15, 0.4, 0.15],
          }}
          transition={{ duration: 2 + i * 0.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </svg>
  ),

  // AI Intranet - Globe with connected nodes
  intranet: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 250" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="intranet-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="intranet-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
        <filter id="intranet-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background orb - always pulsing */}
      <motion.circle cx="220" cy="80" r="90" fill="url(#intranet-grad-2)"
        animate={{ scale: isHovered ? [1, 1.15, 1] : [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Globe - always rotating */}
      <g filter={isHovered ? "url(#intranet-glow)" : undefined}>
        <motion.circle cx="220" cy="80" r="50" fill="none" stroke="#3b82f6" strokeWidth="2"
          animate={{ strokeOpacity: isHovered ? [0.6, 0.9, 0.6] : [0.25, 0.4, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse cx="220" cy="80" rx="50" ry="20" fill="none" stroke="#3b82f6" strokeWidth="1.5"
          animate={{ strokeOpacity: isHovered ? [0.4, 0.7, 0.4] : [0.15, 0.3, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse cx="220" cy="80" rx="20" ry="50" fill="none" stroke="#3b82f6" strokeWidth="1.5"
          animate={{
            strokeOpacity: isHovered ? [0.4, 0.7, 0.4] : [0.15, 0.3, 0.15],
            rotate: [0, 360]
          }}
          transition={{
            strokeOpacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: isHovered ? 6 : 12, repeat: Infinity, ease: "linear" }
          }}
          style={{ originX: "220px", originY: "80px" }}
        />
        <motion.line x1="170" y1="80" x2="270" y2="80" stroke="#3b82f6" strokeWidth="1"
          animate={{ strokeOpacity: isHovered ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* Connection nodes - always pulsing */}
      {[[60, 50], [100, 120], [50, 180], [280, 160], [260, 200]].map(([x, y], i) => (
        <g key={i}>
          <motion.line
            x1={x} y1={y} x2={220} y2={80}
            stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,4"
            animate={{
              strokeOpacity: isHovered ? [0.2, 0.7, 0.2] : [0.08, 0.2, 0.08],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          />
          <motion.circle cx={x} cy={y} r={isHovered ? 8 : 5} fill="#3b82f6"
            animate={{
              scale: isHovered ? [1, 1.3, 1] : [1, 1.15, 1],
              fillOpacity: isHovered ? [0.5, 1, 0.5] : [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
          <motion.circle cx={x} cy={y} r={isHovered ? 12 : 8} fill="none" stroke="#3b82f6" strokeWidth="1"
            animate={{
              scale: [1, 1.5, 1],
              opacity: isHovered ? [0.5, 0, 0.5] : [0.2, 0, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        </g>
      ))}

      {/* Data packets flowing - always visible */}
      {[...Array(5)].map((_, i) => (
        <motion.circle
          key={i}
          r="3"
          fill="#8b5cf6"
          animate={{
            cx: [60 + i * 50, 220, 60 + i * 50],
            cy: [50 + i * 30, 80, 50 + i * 30],
            opacity: isHovered ? [0.8, 1, 0.8] : [0.3, 0.5, 0.3]
          }}
          transition={{ duration: isHovered ? 3 : 5, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
        />
      ))}
    </svg>
  ),

  // AI Testing - Clipboard with checkmarks and bugs
  testing: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 250" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="testing-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="testing-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
        </linearGradient>
        <filter id="testing-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background - always pulsing */}
      <motion.circle cx="230" cy="70" r="70" fill="url(#testing-grad-2)"
        animate={{ scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clipboard - subtle glow pulse */}
      <g filter={isHovered ? "url(#testing-glow)" : undefined}>
        <motion.rect x="180" y="30" width="80" height="110" rx="8" fill="none" stroke="#f59e0b" strokeWidth="2.5"
          animate={{ strokeOpacity: isHovered ? [0.8, 1, 0.8] : [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect x="200" y="25" width="40" height="15" rx="4" fill="#f59e0b"
          animate={{ fillOpacity: isHovered ? [0.6, 0.8, 0.6] : [0.3, 0.45, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Progress bars - always animating */}
        {[[195, 55], [195, 80], [195, 105]].map(([x, y], i) => (
          <g key={i}>
            <motion.rect x={x} y={y} height="8" rx="2" fill="#f59e0b"
              animate={{
                fillOpacity: isHovered ? [0.4, 0.7, 0.4] : [0.15, 0.3, 0.15],
                width: isHovered ? [40, 50, 40] : [35, 42, 35]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
            <motion.path
              d={`M${x + 55} ${y + 4} l5 5 l10 -10`}
              fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"
              animate={{
                pathLength: isHovered ? [0.8, 1, 0.8] : [0, 0.5, 0],
                opacity: isHovered ? 1 : [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
            />
          </g>
        ))}
      </g>

      {/* Bug - always wiggling */}
      <motion.g
        animate={{
          x: isHovered ? [0, 5, -5, 0] : [0, 2, -2, 0],
          rotate: isHovered ? [0, 8, -8, 0] : [0, 3, -3, 0]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.ellipse cx="70" cy="80" rx="20" ry="15" fill="#ef4444"
          animate={{ fillOpacity: isHovered ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="60" cy="75" r="3" fill="#fff"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.circle cx="80" cy="75" r="3" fill="#fff"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
        />
        {/* Legs - wiggling */}
        {[-1, 1].map((dir) => (
          <motion.g key={dir}
            animate={{ rotate: isHovered ? [0, dir * 5, 0] : [0, dir * 2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ originX: "70px", originY: "80px" }}
          >
            <line x1={70 + dir * 15} y1="70" x2={70 + dir * 25} y2="60" stroke="#ef4444" strokeWidth="2" />
            <line x1={70 + dir * 18} y1="80" x2={70 + dir * 30} y2="80" stroke="#ef4444" strokeWidth="2" />
            <line x1={70 + dir * 15} y1="90" x2={70 + dir * 25} y2="100" stroke="#ef4444" strokeWidth="2" />
          </motion.g>
        ))}
      </motion.g>

      {/* X mark on bug - pulsing when hovered */}
      <motion.g
        animate={{
          scale: isHovered ? [0.9, 1.1, 0.9] : 0,
          opacity: isHovered ? [0.8, 1, 0.8] : 0
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="70" cy="80" r="25" fill="#ef4444" fillOpacity={0.3} />
        <line x1="55" y1="65" x2="85" y2="95" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <line x1="85" y1="65" x2="55" y2="95" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Progress bar - always animating */}
      <rect x="40" y="180" width="100" height="8" rx="4" fill="#f59e0b" fillOpacity={0.2} />
      <motion.rect x="40" y="180" rx="4" height="8" fill="#f59e0b"
        animate={{
          width: isHovered ? [80, 100, 80] : [50, 70, 50],
          fillOpacity: isHovered ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.text x="145" y="187" fill="#f59e0b" fontSize="10" fontWeight="bold"
        animate={{ opacity: isHovered ? [0.8, 1, 0.8] : [0.4, 0.6, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {isHovered ? "100%" : "60%"}
      </motion.text>
    </svg>
  ),

  // AI Chat Bot - Speech bubbles with neural network
  chatbot: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 250" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="chat-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="chat-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
        </linearGradient>
        <filter id="chat-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background - always pulsing */}
      <motion.circle cx="230" cy="80" r="80" fill="url(#chat-grad-2)"
        animate={{ scale: isHovered ? [1, 1.15, 1] : [1, 1.08, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Robot head */}
      <g filter={isHovered ? "url(#chat-glow)" : undefined}>
        <motion.rect x="195" y="40" width="70" height="60" rx="12" fill="#a855f7"
          animate={{ fillOpacity: isHovered ? [0.6, 0.85, 0.6] : [0.35, 0.5, 0.35] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Eyes - always blinking */}
        <motion.circle cx="215" cy="65" r="8" fill="#fff"
          animate={{ scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="245" cy="65" r="8" fill="#fff"
          animate={{ scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.1, ease: "easeInOut" }}
        />
        <circle cx="215" cy="65" r="4" fill="#a855f7" />
        <circle cx="245" cy="65" r="4" fill="#a855f7" />
        {/* Antenna - always glowing */}
        <line x1="230" y1="40" x2="230" y2="25" stroke="#a855f7" strokeWidth="3" />
        <motion.circle cx="230" cy="20" r="6" fill="#ec4899"
          animate={{
            scale: isHovered ? [1, 1.5, 1] : [1, 1.25, 1],
            fillOpacity: isHovered ? [0.7, 1, 0.7] : [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Mouth - always talking */}
        <motion.rect x="210" y="82" rx="3" fill="#fff"
          animate={{
            width: isHovered ? [40, 25, 35, 40] : [40, 32, 38, 40],
            height: isHovered ? [6, 14, 8, 6] : [6, 10, 7, 6]
          }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* Chat bubbles - always floating */}
      <motion.g
        animate={{ y: isHovered ? [0, -8, 0] : [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.rect x="40" y="50" width="80" height="35" rx="10" fill="#a855f7"
          animate={{ fillOpacity: isHovered ? [0.5, 0.75, 0.5] : [0.2, 0.35, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.polygon points="110,70 120,85 100,70" fill="#a855f7"
          animate={{ fillOpacity: isHovered ? [0.5, 0.75, 0.5] : [0.2, 0.35, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Typing dots - always bouncing */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={60 + i * 15}
            cy="67"
            r="4"
            fill="#fff"
            animate={{
              y: isHovered ? [0, -6, 0] : [0, -3, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </motion.g>

      {/* Response bubble - appears more on hover but always has subtle presence */}
      <motion.g
        animate={{
          scale: isHovered ? [0.95, 1.05, 0.95] : [0.7, 0.8, 0.7],
          opacity: isHovered ? [0.8, 1, 0.8] : [0.2, 0.35, 0.2],
          y: isHovered ? [0, -5, 0] : [0, -2, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="60" y="120" width="100" height="40" rx="10" fill="#ec4899" fillOpacity={0.6} />
        <polygon points="60,140 45,150 60,150" fill="#ec4899" fillOpacity={0.6} />
        <line x1="75" y1="135" x2="145" y2="135" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="75" y1="147" x2="125" y2="147" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity={0.6} />
      </motion.g>

      {/* Neural network nodes - always pulsing */}
      {[[50, 200], [90, 190], [130, 200], [70, 220], [110, 220]].map(([x, y], i) => (
        <g key={i}>
          {i < 4 && (
            <motion.line
              x1={x} y1={y} x2={[90, 130, 70, 110][i]} y2={[190, 200, 220, 220][i]}
              stroke="#a855f7" strokeWidth="1"
              animate={{ strokeOpacity: isHovered ? [0.2, 0.7, 0.2] : [0.08, 0.2, 0.08] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          )}
          <motion.circle cx={x} cy={y} r={isHovered ? 5 : 3} fill="#a855f7"
            animate={{ fillOpacity: isHovered ? [0.5, 1, 0.5] : [0.2, 0.45, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  ),
};

// Ultra Premium Product Card
function ProductCard({
  product,
  index,
  userId,
}: {
  product: (typeof products)[0];
  index: number;
  userId?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = 'disabled' in product && product.disabled;

  const handleLaunchApp = () => {
    if (isDisabled) return;
    // Open all product apps in a new tab - they are self-contained projects
    // Use local URL when running locally, production URL otherwise
    let href = getProductUrl(product.localHref, product.prodHref);

    // For Chat Core IQ, pass session params for settings isolation
    // This ensures admin changes only affect the user's session, not global settings
    if (product.id === 3 && userId) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const separator = href.includes('?') ? '&' : '?';
      href = `${href}${separator}clerk_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionId)}`;
    }

    // Use window.open without features string to ensure full-sized new tab (not popup)
    // The rel="noopener noreferrer" is handled automatically by modern browsers for _blank targets
    window.open(href, '_blank');
  };

  // 3D Tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isDisabled) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  const IllustrationComponent = {
    1: ProductIllustrations.support,
    2: ProductIllustrations.intranet,
    3: ProductIllustrations.chatbot,
    4: ProductIllustrations.testing,
  }[product.id] || ProductIllustrations.support;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      className={`group ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        className="relative h-64 sm:h-72 rounded-3xl overflow-hidden"
        initial={{
          boxShadow: isDisabled
            ? `0 10px 40px -10px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(100,100,100,0.3)`
            : `0 10px 40px -10px rgba(0,0,0,0.5), inset 0 0 0 1px ${product.colors.primary}40`,
          borderColor: isDisabled ? `rgba(100,100,100,0.3)` : `${product.colors.primary}50`,
        }}
        animate={{
          boxShadow: isDisabled
            ? `0 10px 40px -10px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(100,100,100,0.3)`
            : isHovered
              ? `0 30px 60px -15px ${product.colors.glow}, 0 0 80px -20px ${product.colors.primary}60, inset 0 0 0 1px ${product.colors.primary}60`
              : `0 10px 40px -10px rgba(0,0,0,0.5), inset 0 0 0 1px ${product.colors.primary}40`,
          borderColor: isDisabled ? `rgba(100,100,100,0.3)` : isHovered ? `${product.colors.primary}90` : `${product.colors.primary}50`,
          filter: isDisabled ? 'grayscale(100%)' : 'grayscale(0%)',
          opacity: isDisabled ? 0.6 : 1,
        }}
        transition={{ duration: 0.4 }}
        style={{
          background: `linear-gradient(145deg, rgba(20, 20, 35, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)`,
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        {/* Animated Illustration Background - static for disabled cards */}
        <div className="absolute inset-0 overflow-hidden">
          {isDisabled ? null : <IllustrationComponent isHovered={isHovered} />}
        </div>

        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(180deg, transparent 0%, transparent 40%, rgba(10,10,20,0.8) 70%, rgba(10,10,20,0.95) 100%)`,
          }}
        />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(135deg, ${product.colors.primary}30, transparent, ${product.colors.secondary}20)`,
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: isHovered ? '100%' : '-100%',
            opacity: isHovered ? 0.1 : 0,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'skewX(-20deg)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full p-6 flex flex-col justify-end">
          {/* Brand name with animated underline */}
          <div className="relative inline-block mb-2">
            <motion.span
              className="text-xs uppercase tracking-[0.3em] font-bold"
              style={{ color: product.colors.primary }}
              animate={{
                textShadow: isHovered ? `0 0 20px ${product.colors.primary}` : 'none',
              }}
            >
              {product.name}
            </motion.span>
            <motion.div
              className="absolute -bottom-1 left-0 h-[2px] rounded-full"
              style={{ background: product.colors.primary }}
              initial={{ width: 0 }}
              animate={{ width: isHovered ? '100%' : '30%' }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Title with glow */}
          <motion.h3
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            animate={{
              textShadow: isHovered ? `0 0 30px ${product.colors.glow}` : 'none',
            }}
            style={{ transform: "translateZ(30px)" }}
          >
            {product.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-white/60 text-sm leading-relaxed mb-4"
            animate={{ color: isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}
          >
            {product.description}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isHovered || isDisabled ? 1 : 0,
              y: isHovered || isDisabled ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
          >
            {isDisabled ? (
              <div className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 bg-gray-600/50 text-gray-300">
                Coming Soon
              </div>
            ) : (
              <motion.button
                onClick={handleLaunchApp}
                className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${product.colors.primary}, ${product.colors.secondary})`,
                  color: '#fff',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch App
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
