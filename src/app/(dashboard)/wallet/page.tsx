import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pocket Dana Komunitas</h1>
          <p className="text-sm text-zinc-500 mt-1">Kelola pembagian kas utama, arisan, iuran bulanan, atau dana event.</p>
        </div>
        <Button asChild>
          <Link href="/wallet/create">Buat Pocket Baru</Link>
        </Button>
      </div>
    </div>
  );
}
