import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JoinCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Gabung Komunitas</h1>
        <p className="text-sm text-zinc-500 mt-1">Masukkan kode undangan untuk bergabung dengan komunitas yang sudah ada.</p>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/community">Kembali</Link>
        </Button>
      </div>
    </div>
  );
}
