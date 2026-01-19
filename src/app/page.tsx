import { SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center p-8">
      <SignedOut>
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Digital Workplace AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Your AI-powered digital workplace solution. Sign in to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Powered by</p>
              <p className="font-semibold">Clerk + Supabase + Vercel</p>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            You&apos;re signed in to Digital Workplace AI.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                View your workspace analytics and activity
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get help from your AI-powered assistant
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Documents</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage your files and documents
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Settings</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Configure your workspace preferences
              </p>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
