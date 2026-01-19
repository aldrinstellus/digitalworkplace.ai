import type { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal | dCQ Chat Core IQ",
    template: "%s | Admin - Chat Core IQ",
  },
  description: "Administrative dashboard for Chat Core IQ AI Chatbot Platform",
  icons: {
    icon: "/dcq/icon",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
