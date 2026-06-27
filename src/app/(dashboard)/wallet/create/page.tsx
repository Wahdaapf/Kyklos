import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Buat Pocket Baru</h1>
        <p className="text-sm text-zinc-500 mt-1">Buat pos anggaran baru untuk kas, arisan, iuran bulanan, atau event.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/wallet">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
