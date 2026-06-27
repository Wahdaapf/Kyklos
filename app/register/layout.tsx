import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar · Kyklos",
  description: "Buat komunitas baru di Kyklos — gratis, tanpa kartu kredit.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
