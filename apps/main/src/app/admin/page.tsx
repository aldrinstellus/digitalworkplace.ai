"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllUsers, UserData, updateUserRole, UserRole } from "@/lib/userRole";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "settings">("overview");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      // Fetch all users
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      // Find current user
      const current = allUsers.find(
        (u) => u.email === user.primaryEmailAddress?.emailAddress
      );

      if (!current || current.role !== "super_admin") {
        // Not a super admin, redirect to home
        router.push("/");
        return;
      }

      setCurrentUserData(current);
      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user, isLoaded, router]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1a1a2e]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-lg">
                <span className="text-white/75">digital</span>
                <span className="text-white">workplace</span>
                <span className="text-green-400">.ai</span>
              </span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Super Admin</span>
              </div>
              <div className="flex items-center gap-3">
                {user?.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-8 h-8 rounded-full border-2 border-green-500/30"
                  />
                )}
                <span className="text-white/70 text-sm hidden sm:block">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "Admin"}
          </h1>
          <p className="text-white/50">
            Manage your digital workplace from the super admin console.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {(["overview", "users", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Stats Cards */}
              <StatsCard
                title="Total Users"
                value={users.length.toString()}
                icon="👥"
                color="green"
              />
              <StatsCard
                title="Super Admins"
                value={users.filter((u) => u.role === "super_admin").length.toString()}
                icon="👑"
                color="yellow"
              />
              <StatsCard
                title="Admins"
                value={users.filter((u) => u.role === "admin").length.toString()}
                icon="🛡️"
                color="blue"
              />
              <StatsCard
                title="Regular Users"
                value={users.filter((u) => u.role === "user").length.toString()}
                icon="👤"
                color="purple"
              />
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold">User Management</h2>
                  <p className="text-white/50 text-sm">
                    Manage user roles and permissions
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-white/50 text-sm font-medium">
                          User
                        </th>
                        <th className="text-left p-4 text-white/50 text-sm font-medium">
                          Email
                        </th>
                        <th className="text-left p-4 text-white/50 text-sm font-medium">
                          Role
                        </th>
                        <th className="text-left p-4 text-white/50 text-sm font-medium">
                          Joined
                        </th>
                        <th className="text-left p-4 text-white/50 text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr
                          key={userData.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                                {userData.full_name?.[0] || userData.email[0].toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {userData.full_name || "No name"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-white/70">{userData.email}</td>
                          <td className="p-4">
                            <RoleBadge role={userData.role} />
                          </td>
                          <td className="p-4 text-white/50 text-sm">
                            {new Date(userData.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            {userData.email !== user?.primaryEmailAddress?.emailAddress && (
                              <select
                                value={userData.role}
                                onChange={(e) =>
                                  handleRoleChange(userData.id, e.target.value as UserRole)
                                }
                                className="bg-[#0f0f1a] border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green-500/50"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Settings</h2>
              <p className="text-white/50">
                System settings and configurations coming soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: "green" | "yellow" | "blue" | "purple";
}) {
  const colorClasses = {
    green: "from-green-500/20 to-green-600/10 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-white/50 text-sm">{title}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const roleStyles = {
    super_admin: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    admin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    user: "bg-white/10 text-white/70 border-white/20",
  };

  const roleLabels = {
    super_admin: "Super Admin",
    admin: "Admin",
    user: "User",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleStyles[role]}`}
    >
      {roleLabels[role]}
    </span>
  );
}
