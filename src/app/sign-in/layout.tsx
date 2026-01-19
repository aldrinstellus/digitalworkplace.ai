export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-50">
      {children}
    </div>
  );
}
