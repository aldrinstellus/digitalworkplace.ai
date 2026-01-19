export default function SSOCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f1a]">
      {children}
    </div>
  );
}
