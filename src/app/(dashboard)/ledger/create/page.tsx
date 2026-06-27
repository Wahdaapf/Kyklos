import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateLedgerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Catat Transaksi Baru</h1>
        <p className="text-sm text-zinc-500 mt-1">Masukkan transaksi pemasukan atau pengeluaran baru dengan bukti foto/catatan.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/ledger">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
