import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Komunitas Saya</h1>
        <p className="text-sm text-zinc-500 mt-1">Gabung atau buat komunitas baru di Kyklos.</p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/community/create">Buat Komunitas Baru</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/community/join">Gabung Komunitas</Link>
        </Button>
      </div>
    </div>
  );
}
