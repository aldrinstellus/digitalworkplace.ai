export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Force dark background on body for sign-in page */}
      <style>{`
        html, body {
          background-color: #0f0f1a !important;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100vw;
          overflow-x: hidden;
        }
      `}</style>
      <div className="fixed inset-0 z-50 bg-[#0f0f1a] min-h-screen min-h-[100dvh] w-screen">
        {children}
      </div>
    </>
  );
}
