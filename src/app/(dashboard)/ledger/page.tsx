import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Buku Kas (Ledger)</h1>
          <p className="text-sm text-zinc-500 mt-1">Histori pencatatan pemasukan dan pengeluaran dana komunitas.</p>
        </div>
        <Button asChild>
          <Link href="/ledger/create">Catat Transaksi</Link>
        </Button>
      </div>
    </div>
  );
}
