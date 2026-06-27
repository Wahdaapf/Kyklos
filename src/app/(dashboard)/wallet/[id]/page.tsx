import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WalletDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WalletDetailPage({ params }: WalletDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Detail Pocket: {id}</h1>
        <p className="text-sm text-zinc-500 mt-1">Lihat histori transaksi dan saldo pocket ini secara transparan.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/wallet">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
