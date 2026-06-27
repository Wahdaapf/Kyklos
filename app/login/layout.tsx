import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk · Kyklos",
  description: "Masuk ke komunitas Anda di Kyklos.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
